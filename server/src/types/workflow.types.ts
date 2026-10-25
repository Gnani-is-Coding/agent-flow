import { z } from "zod"
import { WorkflowStatus } from "../generated/prisma/enums.js"
import type { Workflow } from "../generated/prisma/client.js"

export const MAX_PAGE_SIZE = 50
export const DEFAULT_PAGE_SIZE = 10
export const SORT_FIELDS = ["name", "createdAt", "updatedAt"] as const
export const SORT_ORDERS = ["asc", "desc"] as const

const idSchema = z.string().trim().min(1)

export const nodeSchema = z.object({
    id: idSchema,
    type: idSchema,
    position: z.object({ x: z.number(), y: z.number() }),
    data: z.record(z.string(), z.json()),
})

export const edgeSchema = z.object({
    id: idSchema,
    source: idSchema,
    target: idSchema,
})

const workflowFields = z.object({
    name: z.string().trim().min(1).max(100),
    description: z.string().trim().max(500).optional(),
    status: z.enum(WorkflowStatus),
    trigger: z.record(z.string(), z.json()),
    nodes: z.array(nodeSchema),
    edges: z.array(edgeSchema),
    tags: z.array(z.string().trim().min(1).max(30)).max(20),
})

export const createWorkflowSchema = workflowFields.extend({
    status: workflowFields.shape.status.optional(),
    tags: workflowFields.shape.tags.default([]),
})

// no defaults here: a missing field must leave the stored value alone
export const updateWorkflowSchema = workflowFields.partial().extend({
    version: z.number().int().positive(),
})

export const listQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
    status: z.enum(WorkflowStatus).optional(),
    search: z.string().trim().min(1).max(100).optional(),
    sort: z.enum(SORT_FIELDS).default("updatedAt"),
    order: z.enum(SORT_ORDERS).default("desc"),
})

export type WorkflowNode = z.infer<typeof nodeSchema>
export type WorkflowEdge = z.infer<typeof edgeSchema>
export type CreateWorkflowPayload = z.infer<typeof createWorkflowSchema>
export type UpdateWorkflowPayload = z.infer<typeof updateWorkflowSchema>
export type ListWorkflowsQuery = z.infer<typeof listQuerySchema>

export interface WorkflowDashboard {
    total: number
    byStatus: Record<WorkflowStatus, number>
    executions: { total: number; successRate: number }
}

export interface PaginatedWorkflows {
    items: Workflow[]
    page: number
    limit: number
    total: number
    totalPages: number
}
