import type { Node } from "@xyflow/react";

// trigger must stay "trigger": the server checks node.type === "trigger"
export type NodeCategory = "trigger" | "action" | "ai" | "logic";

export type FieldType = "text" | "textarea" | "number" | "url" | "select";

export type ConfigValue = string | number;

export interface ConfigField {
    key: string;
    label: string;
    type: FieldType;
    required?: boolean;
    placeholder?: string;
    options?: readonly string[];
    defaultValue?: ConfigValue;
}

export interface CatalogEntry {
    category: NodeCategory;
    label: string;
    description: string;
    fields: readonly ConfigField[];
}

export interface WorkflowNodeData extends Record<string, unknown> {
    kind: string;
    label: string;
    config: Record<string, ConfigValue>;
}

export type WorkflowNode = Node<WorkflowNodeData, NodeCategory>;
