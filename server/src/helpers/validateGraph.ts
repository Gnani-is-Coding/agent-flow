import { HttpError } from "./errorHelpers.js"
import type { WorkflowEdge, WorkflowNode } from "../types/workflow.types.js"

export const TRIGGER_TYPE = "trigger"

type Mark = "visiting" | "done"

function assertEdgesPointToNodes(nodeIds: Set<string>, edges: WorkflowEdge[]): void {
    for (const { id, source, target } of edges) {
        const missing = [source, target].find((nodeId) => !nodeIds.has(nodeId))
        if (missing) throw new HttpError(400, `Edge ${id} points to missing node ${missing}`)
    }
}

function assertSingleTrigger(nodes: WorkflowNode[]): void {
    const triggers = nodes.filter((node) => node.type === TRIGGER_TYPE).length
    if (triggers !== 1) throw new HttpError(400, `Workflow needs exactly one trigger, found ${triggers}`)
}

function assertNoCycle(nodeIds: Set<string>, edges: WorkflowEdge[]): void {
    const next = new Map<string, string[]>()
    for (const { source, target } of edges) next.set(source, [...(next.get(source) ?? []), target])

    const marks = new Map<string, Mark>()
    const visit = (id: string): void => {
        if (marks.get(id) === "visiting") throw new HttpError(400, `Workflow has a cycle through node ${id}`)
        if (marks.get(id) === "done") return
        marks.set(id, "visiting")
        for (const target of next.get(id) ?? []) visit(target)
        marks.set(id, "done")
    }

    for (const id of nodeIds) visit(id)
}

export function validateGraph(nodes: WorkflowNode[], edges: WorkflowEdge[]): void {
    const nodeIds = new Set(nodes.map((node) => node.id))
    assertEdgesPointToNodes(nodeIds, edges)
    assertSingleTrigger(nodes)
    assertNoCycle(nodeIds, edges)
}
