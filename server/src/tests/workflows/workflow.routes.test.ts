import { afterAll, beforeAll, describe, expect, it } from "vitest"
import request from "supertest"
import app from "../../app.js"
import { prisma } from "../../config/db.js"
import { ACCESS_COOKIE } from "../../helpers/authCookies.js"
import { signToken } from "../../helpers/tokens.js"
import { WORKFLOWS_BASE_PATH } from "../../routes/workflow.routes.js"
import { edge, node } from "./graphFixtures.js"

const EMAIL_PREFIX = `workflow-test-${Date.now()}`
const MISSING_ID = "00000000-0000-7000-8000-000000000000"
const url = (path = ""): string => `${WORKFLOWS_BASE_PATH}${path}`

const body = {
    name: "Invoice routing",
    trigger: {},
    nodes: [node("A", "trigger"), node("B")],
    edges: [edge("A", "B")],
}

let cookieA = ""
let cookieB = ""

async function cookieFor(tag: string): Promise<string> {
    const user = await prisma.user.create({ data: { name: tag, email: `${EMAIL_PREFIX}-${tag}@example.com`, passwordHash: "x" } })
    return `${ACCESS_COOKIE}=${signToken(user, "access")}`
}

async function createAs(cookie: string): Promise<{ id: string; version: number }> {
    const res = await request(app).post(url()).set("Cookie", cookie).send(body)
    return res.body.data.workflow
}

beforeAll(async () => {
    cookieA = await cookieFor("a")
    cookieB = await cookieFor("b")
})

afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { startsWith: EMAIL_PREFIX } } })
    await prisma.$disconnect()
})

describe("ownership", () => {
    it("returns 401 without a cookie", async () => {
        const res = await request(app).get(url())
        expect(res.status).toBe(401)
    })

    it("gives user B a 404 on user A's workflow for read, update, duplicate and delete", async () => {
        const { id, version } = await createAs(cookieA)

        const responses = await Promise.all([
            request(app).get(url(`/${id}`)).set("Cookie", cookieB),
            request(app).put(url(`/${id}`)).set("Cookie", cookieB).send({ version, name: "hijacked" }),
            request(app).post(url(`/${id}/duplicate`)).set("Cookie", cookieB),
            request(app).delete(url(`/${id}`)).set("Cookie", cookieB),
        ])

        expect(responses.map((r) => r.status)).toEqual([404, 404, 404, 404])
        const stillThere = await request(app).get(url(`/${id}`)).set("Cookie", cookieA)
        expect(stillThere.body.data.workflow.name).toBe(body.name)
    })

    it("gives the same 404 for an unknown id and a malformed id", async () => {
        const [unknown, malformed] = await Promise.all([
            request(app).get(url(`/${MISSING_ID}`)).set("Cookie", cookieA),
            request(app).get(url("/not-a-uuid")).set("Cookie", cookieA),
        ])
        expect([unknown.status, malformed.status]).toEqual([404, 404])
    })

    it("lists only the caller's workflows", async () => {
        await createAs(cookieA)
        const res = await request(app).get(url()).set("Cookie", cookieB)
        expect(res.body.data.total).toBe(0)
    })
})

describe("graph validation", () => {
    it("rejects a workflow with a cycle on create", async () => {
        const res = await request(app).post(url()).set("Cookie", cookieA)
            .send({ ...body, edges: [edge("A", "B"), edge("B", "A")] })
        expect(res.status).toBe(400)
    })

    it("rejects an update that adds a cycle", async () => {
        const { id, version } = await createAs(cookieA)
        const res = await request(app).put(url(`/${id}`)).set("Cookie", cookieA)
            .send({ version, edges: [edge("A", "B"), edge("B", "A")] })
        expect(res.status).toBe(400)
    })
})

describe("versioning", () => {
    it("lets exactly one of five same-version saves win", async () => {
        const { id, version } = await createAs(cookieA)

        const responses = await Promise.all([1, 2, 3, 4, 5].map((i) =>
            request(app).put(url(`/${id}`)).set("Cookie", cookieA).send({ version, name: `tab ${i}` })))

        const statuses = responses.map((r) => r.status).sort()
        expect(statuses).toEqual([200, 409, 409, 409, 409])
    })

    it("resets version to 1 and status to DRAFT on duplicate", async () => {
        const { id, version } = await createAs(cookieA)
        await request(app).put(url(`/${id}`)).set("Cookie", cookieA).send({ version, status: "ACTIVE" })

        const res = await request(app).post(url(`/${id}/duplicate`)).set("Cookie", cookieA)
        expect(res.status).toBe(201)
        expect(res.body.data.workflow).toMatchObject({ version: 1, status: "DRAFT", name: `${body.name} (copy)` })
    })
})

describe("GET /dashboard", () => {
    it("counts every status, including ones with no workflows", async () => {
        const res = await request(app).get(url("/dashboard")).set("Cookie", cookieB)
        expect(res.status).toBe(200)
        expect(res.body.data.byStatus).toEqual({ DRAFT: 0, ACTIVE: 0, PAUSED: 0, ARCHIVED: 0 })
    })
})

describe("GET / query validation", () => {
    it("returns 400 for a limit above the cap", async () => {
        const res = await request(app).get(url("?limit=500")).set("Cookie", cookieA)
        expect(res.status).toBe(400)
    })
})
