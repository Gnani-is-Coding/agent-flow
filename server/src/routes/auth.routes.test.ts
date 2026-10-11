import { afterAll, describe, expect, it } from "vitest"
import request from "supertest"
import app from "../app.js"
import { prisma } from "../config/db.js"
import { AUTH_BASE_PATH } from "../helpers/authCookies.js"

const EMAIL_PREFIX = `auth-test-${Date.now()}`
const PASSWORD = "password123"
const newEmail = (tag: string): string => `${EMAIL_PREFIX}-${tag}@example.com`
const url = (path: string): string => `${AUTH_BASE_PATH}${path}`

function cookieValue(res: request.Response, name: string): string {
    const raw = ([] as string[]).concat(res.headers["set-cookie"] ?? []).find((c) => c.startsWith(`${name}=`))
    if (!raw) throw new Error(`cookie ${name} not set`)
    return raw.split(";")[0]!.slice(name.length + 1)
}

afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { startsWith: EMAIL_PREFIX } } })
    await prisma.$disconnect()
})

describe("POST /register", () => {
    it("creates an OPERATOR, sets httpOnly cookies, never returns the hash or tokens", async () => {
        const res = await request(app).post(url("/register")).send({ name: "T", email: newEmail("reg"), password: PASSWORD })

        expect(res.status).toBe(201)
        expect(res.body.data.user.role).toBe("OPERATOR")
        expect(res.body.data.user).not.toHaveProperty("passwordHash")
        expect(JSON.stringify(res.body)).not.toMatch(/eyJ/)
        expect(res.headers["set-cookie"]).toEqual(expect.arrayContaining([
            expect.stringMatching(/^accessToken=.*HttpOnly/),
            expect.stringMatching(/^refreshToken=.*Path=\/api\/v1\/auth.*HttpOnly/),
        ]))
    })

    it("ignores a role sent in the body", async () => {
        const res = await request(app).post(url("/register")).send({ name: "T", email: newEmail("role"), password: PASSWORD, role: "ADMIN" })
        expect(res.body.data.user.role).toBe("OPERATOR")
    })

    it("returns 409 for a duplicate email, case-insensitively", async () => {
        const email = newEmail("dup")
        await request(app).post(url("/register")).send({ name: "T", email, password: PASSWORD })
        const res = await request(app).post(url("/register")).send({ name: "T", email: email.toUpperCase(), password: PASSWORD })
        expect(res.status).toBe(409)
    })

    it("returns 400 for an invalid body", async () => {
        const res = await request(app).post(url("/register")).send({ name: "T", email: "nope", password: "short" })
        expect(res.status).toBe(400)
    })
})

describe("POST /login", () => {
    const email = newEmail("login")

    it("returns the same 401 for a wrong password and an unknown email", async () => {
        await request(app).post(url("/register")).send({ name: "T", email, password: PASSWORD })

        const wrongPassword = await request(app).post(url("/login")).send({ email, password: "wrong-password" })
        const unknownEmail = await request(app).post(url("/login")).send({ email: newEmail("ghost"), password: PASSWORD })

        expect(wrongPassword.status).toBe(401)
        expect(unknownEmail.status).toBe(401)
        expect(wrongPassword.body).toEqual(unknownEmail.body)
    })

    it("logs in and sets lastLoginAt", async () => {
        const res = await request(app).post(url("/login")).send({ email, password: PASSWORD })
        expect(res.status).toBe(200)
        expect(res.body.data.user.lastLoginAt).not.toBeNull()
    })
})

describe("session: /me, /rotate, /logout", () => {
    it("runs the full cookie lifecycle", async () => {
        const agent = request.agent(app)
        await agent.post(url("/register")).send({ name: "T", email: newEmail("session"), password: PASSWORD })

        expect((await agent.get(url("/me"))).status).toBe(200)

        const rotated = await agent.post(url("/rotate"))
        expect(rotated.status).toBe(200)
        expect(cookieValue(rotated, "accessToken")).toBeTruthy()

        expect((await agent.post(url("/logout"))).status).toBe(204)
        expect((await agent.get(url("/me"))).status).toBe(401)
        expect((await agent.post(url("/rotate"))).status).toBe(401)
    })

    it("rejects /me without a cookie", async () => {
        expect((await request(app).get(url("/me"))).status).toBe(401)
    })

    it("rejects tokens used as the wrong type", async () => {
        const res = await request(app).post(url("/register")).send({ name: "T", email: newEmail("swap"), password: PASSWORD })
        const access = cookieValue(res, "accessToken")
        const refresh = cookieValue(res, "refreshToken")

        expect((await request(app).get(url("/me")).set("Cookie", `accessToken=${refresh}`)).status).toBe(401)
        expect((await request(app).post(url("/rotate")).set("Cookie", `refreshToken=${access}`)).status).toBe(401)
    })

    it("ignores a forged body on /rotate", async () => {
        const res = await request(app).post(url("/rotate")).send({ id: "anyone", role: "ADMIN" })
        expect(res.status).toBe(401)
    })
})
