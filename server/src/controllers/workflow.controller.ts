import type { Request, Response } from "express"
import { z } from "zod"
import { Services } from "../services/index.js"
import { HttpError } from "../helpers/errorHelpers.js"
import { parseInput } from "../middlewares/validate.js"
import { listQuerySchema } from "../types/workflow.types.js"

function userIdOf(req: Request): string {
    if (!req.user) throw new HttpError(401, "Unauthorised")
    return req.user.id
}

// a malformed id can't belong to anyone, so it gets the same 404 as someone else's id
function workflowIdOf(req: Request): string {
    const result = z.uuid().safeParse(req.params.id)
    if (!result.success) throw new HttpError(404, "Workflow not found")
    return result.data
}

async function list(req: Request, res: Response): Promise<void> {
    const data = await Services.workflow.list(userIdOf(req), parseInput(listQuerySchema, req.query))
    res.status(200).send({ success: true, data })
}

async function dashboard(req: Request, res: Response): Promise<void> {
    const data = await Services.workflow.dashboard(userIdOf(req))
    res.status(200).send({ success: true, data })
}

async function getById(req: Request, res: Response): Promise<void> {
    const workflow = await Services.workflow.getById(userIdOf(req), workflowIdOf(req))
    res.status(200).send({ success: true, data: { workflow } })
}

async function create(req: Request, res: Response): Promise<void> {
    const workflow = await Services.workflow.create(userIdOf(req), req.body)
    res.status(201).send({ success: true, data: { workflow } })
}

async function update(req: Request, res: Response): Promise<void> {
    const workflow = await Services.workflow.update(userIdOf(req), workflowIdOf(req), req.body)
    res.status(200).send({ success: true, data: { workflow } })
}

async function duplicate(req: Request, res: Response): Promise<void> {
    const workflow = await Services.workflow.duplicate(userIdOf(req), workflowIdOf(req))
    res.status(201).send({ success: true, data: { workflow } })
}

async function remove(req: Request, res: Response): Promise<void> {
    await Services.workflow.remove(userIdOf(req), workflowIdOf(req))
    res.status(204).end()
}

export const WorkflowController = {
    list,
    dashboard,
    getById,
    create,
    update,
    duplicate,
    remove,
}
