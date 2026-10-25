import type { WorkflowEdge, WorkflowNode } from "../../types/workflow.types.js"

export const node = (id: string, type = "action"): WorkflowNode => ({ id, type, position: { x: 0, y: 0 }, data: {} })

export const edge = (source: string, target: string): WorkflowEdge => ({ id: `${source}-${target}`, source, target })
