import React, { useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '../../store/workflowStore';
import { ProcessNode } from './customNodes/ProcessNode';

export const WorkflowCanvas: React.FC = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNodeId,
  } = useWorkflowStore();

  const nodeTypes = useMemo(
    () => ({
      MANUAL_TRIGGER: ProcessNode,
      AI_DECISION: ProcessNode,
      CONDITION: ProcessNode,
      HUMAN_APPROVAL: ProcessNode,
      HTTP_REQUEST: ProcessNode,
      SEND_EMAIL: ProcessNode,
      SCHEMA_VALIDATION: ProcessNode,
      DATABASE_QUERY: ProcessNode,
    }),
    []
  );

  return (
    <div className="flex-1 h-full bg-background relative overflow-hidden">
      <ReactFlow
        nodes={nodes as any}
        edges={edges as any}
        nodeTypes={nodeTypes as any}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        fitView
        className="bg-background"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1E293B" />
        <Controls className="!bg-card !border-border !text-slate-300 !rounded-xl overflow-hidden shadow-xl" />
        <MiniMap
          nodeColor="#6366F1"
          maskColor="rgba(9, 13, 22, 0.8)"
          className="!bg-card !border-border !rounded-xl shadow-xl overflow-hidden hidden md:block"
        />
      </ReactFlow>
    </div>
  );
};
