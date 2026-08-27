import { create } from 'zustand';
import { Workflow, WorkflowNode, WorkflowEdge, V1NodeType, V1_NODE_CATALOG } from '../types/workflow';
import { api } from '../services/api';
import { addEdge, Connection, EdgeChange, NodeChange, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';

interface WorkflowStore {
  currentWorkflow: Workflow | null;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  isExecuting: boolean;
  error: string | null;
  executionResult: any | null;

  // Actions
  fetchWorkflow: (id: string) => Promise<void>;
  saveWorkflow: () => Promise<void>;
  executeWorkflow: (inputs?: Record<string, any>) => Promise<void>;
  addNode: (type: V1NodeType, position?: { x: number; y: number }) => void;
  updateNodeConfig: (nodeId: string, label: string, config: Record<string, any>) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setWorkflowStatus: (status: Workflow['status']) => Promise<void>;
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  currentWorkflow: null,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isLoading: false,
  isSaving: false,
  isExecuting: false,
  error: null,
  executionResult: null,

  fetchWorkflow: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/workflows/${id}`);
      const workflow: Workflow = response.data.data.workflow;
      set({
        currentWorkflow: workflow,
        nodes: (workflow.nodes as any[]) || [],
        edges: (workflow.edges as any[]) || [],
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.error?.message || 'Failed to load workflow', isLoading: false });
    }
  },

  saveWorkflow: async () => {
    const { currentWorkflow, nodes, edges } = get();
    if (!currentWorkflow) return;

    set({ isSaving: true, error: null });
    try {
      const response = await api.put(`/workflows/${currentWorkflow.id}`, {
        nodes,
        edges,
      });
      const updated: Workflow = response.data.data.workflow;
      set({ currentWorkflow: updated, isSaving: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error?.message || 'Failed to save workflow', isSaving: false });
    }
  },

  executeWorkflow: async (inputs = {}) => {
    const { currentWorkflow } = get();
    if (!currentWorkflow) return;

    set({ isExecuting: true, executionResult: null, error: null });
    try {
      const response = await api.post(`/workflows/${currentWorkflow.id}/execute`, { inputs });
      set({ executionResult: response.data.data, isExecuting: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error?.message || 'Execution failed', isExecuting: false });
    }
  },

  addNode: (type: V1NodeType, position = { x: 300, y: 200 }) => {
    const { nodes } = get();
    const meta = V1_NODE_CATALOG.find((n) => n.type === type);
    const newNodeId = `${type.toLowerCase()}-${Date.now()}`;

    const newNode: WorkflowNode = {
      id: newNodeId,
      type,
      position,
      data: {
        label: meta ? meta.label : type,
        config: meta ? { ...meta.defaultConfig } : {},
      },
    };

    set({ nodes: [...nodes, newNode], selectedNodeId: newNodeId });
  },

  updateNodeConfig: (nodeId: string, label: string, config: Record<string, any>) => {
    const { nodes } = get();
    set({
      nodes: nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              label,
              config,
            },
          };
        }
        return node;
      }),
    });
  },

  deleteNode: (nodeId: string) => {
    const { nodes, edges, selectedNodeId } = get();
    set({
      nodes: nodes.filter((n) => n.id !== nodeId),
      edges: edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: selectedNodeId === nodeId ? null : selectedNodeId,
    });
  },

  setSelectedNodeId: (id: string | null) => set({ selectedNodeId: id }),

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes as any) as any,
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges as any) as any,
    });
  },

  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges as any) as any,
    });
  },

  setWorkflowStatus: async (status) => {
    const { currentWorkflow } = get();
    if (!currentWorkflow) return;

    try {
      const response = await api.put(`/workflows/${currentWorkflow.id}`, { status });
      set({ currentWorkflow: response.data.data.workflow });
    } catch (err: any) {
      set({ error: 'Failed to update status' });
    }
  },
}));
