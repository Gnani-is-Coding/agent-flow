import { z } from "zod"
import { prisma } from "../config/db.js"
import { HttpError } from "../helpers/errorHelpers.js"
import { validateGraph } from "../helpers/validateGraph.js"
import { WorkflowStatus } from "../generated/prisma/enums.js"
import { Prisma, type Workflow } from "../generated/prisma/client.js"
import {
    edgeSchema,
    nodeSchema,
    type CreateWorkflowPayload,
    type ListWorkflowsQuery,
    type PaginatedWorkflows,
    type UpdateWorkflowPayload,
    type WorkflowDashboard,
} from "../types/workflow.types.js"

const NOT_FOUND = "Workflow not found"
const RECORD_NOT_FOUND = "P2025"

async function list(userId: string, { page, limit, status, search, sort, order }: ListWorkflowsQuery): Promise<PaginatedWorkflows> {
    const where: Prisma.WorkflowWhereInput = {
        userId,
        ...(status && { status }),
        ...(search && { name: { contains: search, mode: "insensitive" } }),
    }

    const [items, total] = await prisma.$transaction([
        prisma.workflow.findMany({ where, orderBy: { [sort]: order }, skip: (page - 1) * limit, take: limit }),
        prisma.workflow.count({ where }),
    ])

    return { items, page, limit, total, totalPages: Math.ceil(total / limit) }
}

async function getById(userId: string, id: string): Promise<Workflow> {
    const data = await prisma.workflow.findFirst({ where: { id, userId } })
    if (!data) throw new HttpError(404, NOT_FOUND)
    return data
}

async function create(userId: string, body: CreateWorkflowPayload): Promise<Workflow> {
    validateGraph(body.nodes, body.edges)
    return prisma.workflow.create({ data: { ...body, userId } })
}

async function update(userId: string, id: string, { version, ...changes }: UpdateWorkflowPayload): Promise<Workflow> {
    const current = await getById(userId, id)

    if (changes.nodes || changes.edges) {
        validateGraph(
            changes.nodes ?? z.array(nodeSchema).parse(current.nodes),
            changes.edges ?? z.array(edgeSchema).parse(current.edges),
        )
    }

    try {
        // version in the where clause: if someone saved since this client loaded it, nothing matches
        return await prisma.workflow.update({
            where: { id, userId, version },
            data: { ...changes, version: { increment: 1 } },
        })
    } catch (e: unknown) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === RECORD_NOT_FOUND) {
            throw new HttpError(409, "Workflow was changed by someone else, reload it")
        }
        throw e
    }
}

async function duplicate(userId: string, id: string): Promise<Workflow> {
    const { name, description, trigger, nodes, edges, tags } = await getById(userId, id)
    return prisma.workflow.create({
        data: { userId, name: `${name} (copy)`, description, trigger: trigger ?? {}, nodes: nodes ?? [], edges: edges ?? [], tags },
    })
}

async function remove(userId: string, id: string): Promise<void> {
    const { count } = await prisma.workflow.deleteMany({ where: { id, userId } })
    if (count === 0) throw new HttpError(404, NOT_FOUND)
}

async function dashboard(userId: string): Promise<WorkflowDashboard> {
    const groups = await prisma.workflow.groupBy({ by: ["status"], where: { userId }, _count: { _all: true } })

    const byStatus = Object.fromEntries(Object.values(WorkflowStatus).map((status) => [status, 0])) as Record<WorkflowStatus, number>
    for (const { status, _count } of groups) byStatus[status] = _count._all

    const total = groups.reduce((sum, { _count }) => sum + _count._all, 0)
    // execution numbers arrive with M8
    return { total, byStatus, executions: { total: 0, successRate: 0 } }
}

export const workflow = {
    list,
    getById,
    create,
    update,
    duplicate,
    remove,
    dashboard,
}
