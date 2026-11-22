import type { Edge } from "@xyflow/react";
import type { WorkflowNode } from "./types";

export const initialNodes: WorkflowNode[] = [
    {
        id: "n1",
        type: "trigger",
        position: { x: 0, y: 0 },
        data: { kind: "manualTrigger", label: "Manual trigger", config: {} },
    },
    {
        id: "n2",
        type: "action",
        position: { x: 260, y: 0 },
        data: { kind: "discordMessage", label: "Discord message", config: {} },
    },
];

export const initialEdges: Edge[] = [{ id: "n1-n2", source: "n1", target: "n2" }];
