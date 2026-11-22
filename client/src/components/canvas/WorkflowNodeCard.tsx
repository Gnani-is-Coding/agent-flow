import { Handle, Position, type NodeProps, type NodeTypes } from "@xyflow/react";
import { getCatalogEntry } from "@/lib/nodeCatalog/catalog";
import type { NodeCategory, WorkflowNode } from "@/lib/nodeCatalog/types";

const CATEGORY_STYLES: Record<NodeCategory, string> = {
    trigger: "border-l-emerald-500",
    action: "border-l-indigo-500",
    ai: "border-l-fuchsia-500",
    logic: "border-l-amber-500",
};

export function WorkflowNodeCard({ type, data, selected }: NodeProps<WorkflowNode>) {
    const entry = getCatalogEntry(data.kind);

    return (
        <div
            className={`w-52 rounded-lg border border-l-4 border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-900 ${CATEGORY_STYLES[type]} ${selected ? "ring-2 ring-indigo-500" : ""}`}
        >
            {type !== "trigger" && <Handle type="target" position={Position.Left} />}
            <p className="text-xs uppercase tracking-wide text-zinc-500">{type}</p>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{data.label}</p>
            {entry ? (
                <p className="truncate text-xs text-zinc-500">{entry.description}</p>
            ) : (
                <p className="text-xs text-red-500">Unknown node kind: {data.kind}</p>
            )}
            <Handle type="source" position={Position.Right} />
        </div>
    );
}

export const nodeTypes = {
    trigger: WorkflowNodeCard,
    action: WorkflowNodeCard,
    ai: WorkflowNodeCard,
    logic: WorkflowNodeCard,
} satisfies NodeTypes;
