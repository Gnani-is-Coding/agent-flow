import { create } from "zustand";
import {
    addEdge,
    type Edge,
    type OnConnect,
    type OnEdgesChange,
    type OnNodesChange,
} from "@xyflow/react";
import { initialEdges, initialNodes } from "@/lib/nodeCatalog/constants";
import type { WorkflowNode } from "@/lib/nodeCatalog/types";

interface WorkflowState {
    nodes: WorkflowNode[];
    edges: Edge[];
    onNodesChange: OnNodesChange<WorkflowNode>;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    setNodes: (nodes: WorkflowNode[]) => void;
    setEdges: (edges: Edge[]) => void;
}

const useWorkflowStore = create<WorkflowState>((set, get) => ({
    nodes: initialNodes,
    edges: initialEdges,
    onNodesChange: (changes) => set({ nodes: changes.applyTo(get().nodes) }),
    onEdgesChange: (changes) => set({ edges: changes.applyTo(get().edges) }),
    onConnect: (connection) => set({ edges: addEdge(connection, get().edges) }),
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),
}));

export default useWorkflowStore;
