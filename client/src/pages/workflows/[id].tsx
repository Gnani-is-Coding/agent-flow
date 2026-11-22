import useWorkflowStore from "@/store/workflowStore";
import { Background, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useShallow } from "zustand/react/shallow";
import { nodeTypes } from "@/components/canvas/WorkflowNodeCard";
import Palette from "@/components/canvas/Palette";

export default function WorkflowEditor() {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useWorkflowStore(
        useShallow((s) => ({
            nodes: s.nodes,
            edges: s.edges,
            onNodesChange: s.onNodesChange,
            onEdgesChange: s.onEdgesChange,
            onConnect: s.onConnect,
        })),
    );

    return (
        <div className="flex flex-row">
            <Palette />

            <div className="h-screen w-full">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                >
                    <Background />
                </ReactFlow>
            </div>
        </div>
    );
}
