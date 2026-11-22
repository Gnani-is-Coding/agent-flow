import type { CatalogEntry, NodeCategory } from "./types";

export const NODE_CATALOG = {
    manualTrigger: {
        category: "trigger",
        label: "Manual trigger",
        description: "Run the workflow by hand",
        fields: [],
    },
    webhookTrigger: {
        category: "trigger",
        label: "Webhook",
        description: "Run when a URL is called",
        fields: [{ key: "path", label: "Path", type: "text", required: true, placeholder: "/my-hook" }],
    },
    scheduleTrigger: {
        category: "trigger",
        label: "Schedule",
        description: "Run on a cron schedule",
        fields: [{ key: "cron", label: "Cron expression", type: "text", required: true, placeholder: "0 9 * * *" }],
    },
    discordMessage: {
        category: "action",
        label: "Discord message",
        description: "Post a message to a Discord channel",
        fields: [
            { key: "webhookUrl", label: "Webhook URL", type: "url", required: true },
            { key: "message", label: "Message", type: "textarea", required: true },
        ],
    },
    httpRequest: {
        category: "action",
        label: "HTTP request",
        description: "Call any API",
        fields: [
            { key: "url", label: "URL", type: "url", required: true },
            { key: "method", label: "Method", type: "select", options: ["GET", "POST", "PUT", "DELETE"], defaultValue: "GET" },
            { key: "body", label: "Body (JSON)", type: "textarea" },
        ],
    },
    llmPrompt: {
        category: "ai",
        label: "LLM prompt",
        description: "Send a prompt to a model",
        fields: [
            { key: "prompt", label: "Prompt", type: "textarea", required: true },
            { key: "temperature", label: "Temperature", type: "number", defaultValue: 0.7 },
        ],
    },
    condition: {
        category: "logic",
        label: "Condition",
        description: "Continue only if a check passes",
        fields: [{ key: "expression", label: "Expression", type: "text", required: true, placeholder: "input.status === 200" }],
    },
    delay: {
        category: "logic",
        label: "Delay",
        description: "Wait before the next step",
        fields: [{ key: "seconds", label: "Seconds", type: "number", required: true, defaultValue: 5 }],
    },
} as const satisfies Record<string, CatalogEntry>;

export type NodeKind = keyof typeof NODE_CATALOG;

export const CATEGORY_ORDER: readonly NodeCategory[] = ["trigger", "action", "ai", "logic"];

export const CATEGORY_LABELS: Record<NodeCategory, string> = {
    trigger: "Triggers",
    action: "Actions",
    ai: "AI",
    logic: "Logic",
};

export function isNodeKind(kind: string): kind is NodeKind {
    return kind in NODE_CATALOG;
}

export function getCatalogEntry(kind: string): CatalogEntry | undefined {
    return isNodeKind(kind) ? NODE_CATALOG[kind] : undefined;
}
