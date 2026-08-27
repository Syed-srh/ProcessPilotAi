import { create } from 'zustand';
import { api } from '../services/api';

export interface ApprovalItem {
  id: string;
  executionId: string;
  workflowId: string;
  nodeId: string;
  requestedBy?: string;
  approvedBy?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  triggerReason: 'THRESHOLD' | 'LOW_CONFIDENCE';
  reason?: string;
  metadata?: any;
  createdAt: string;
  resolvedAt?: string;
  workflow?: { id: string; name: string };
  execution?: { id: string; status: string; inputs?: any; outputs?: any };
}

interface ApprovalStore {
  approvals: ApprovalItem[];
  isLoading: boolean;
  error: string | null;
  activeTab: 'PENDING' | 'RESOLVED';

  fetchApprovals: (status?: string) => Promise<void>;
  approveRequest: (id: string, reason?: string) => Promise<void>;
  rejectRequest: (id: string, reason?: string) => Promise<void>;
  editAndApproveRequest: (id: string, editedVariables: Record<string, any>, reason?: string) => Promise<void>;
  setActiveTab: (tab: 'PENDING' | 'RESOLVED') => void;
}

export const useApprovalStore = create<ApprovalStore>((set, get) => ({
  approvals: [],
  isLoading: false,
  error: null,
  activeTab: 'PENDING',

  fetchApprovals: async (status) => {
    set({ isLoading: true, error: null });
    try {
      const url = status ? `/approvals?status=${status}` : '/approvals';
      const response = await api.get(url);
      set({ approvals: response.data.data.approvals, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error?.message || 'Failed to fetch approval queue', isLoading: false });
    }
  },

  approveRequest: async (id, reason) => {
    try {
      await api.post(`/approvals/${id}/approve`, { reason });
      await get().fetchApprovals(get().activeTab === 'PENDING' ? 'PENDING' : undefined);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to approve request';
      set({ error: msg });
      throw new Error(msg);
    }
  },

  rejectRequest: async (id, reason) => {
    try {
      await api.post(`/approvals/${id}/reject`, { reason });
      await get().fetchApprovals(get().activeTab === 'PENDING' ? 'PENDING' : undefined);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to reject request';
      set({ error: msg });
      throw new Error(msg);
    }
  },

  editAndApproveRequest: async (id, editedVariables, reason) => {
    try {
      await api.post(`/approvals/${id}/edit-approve`, { editedVariables, reason });
      await get().fetchApprovals(get().activeTab === 'PENDING' ? 'PENDING' : undefined);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to edit and approve request';
      set({ error: msg });
      throw new Error(msg);
    }
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
    get().fetchApprovals(tab === 'PENDING' ? 'PENDING' : undefined);
  },
}));
