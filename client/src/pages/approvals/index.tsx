import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { AppShell } from '../../components/AppShell';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useApprovalStore, ApprovalItem } from '../../store/approvalStore';
import { useAuthStore } from '../../store/authStore';
import {
  CheckSquare,
  Check,
  X,
  Edit3,
  ShieldAlert,
  AlertTriangle,
  Bot,
  Sliders,
  Lock,
} from 'lucide-react';

export default function ApprovalsInbox() {
  const { user } = useAuthStore();
  const {
    approvals,
    isLoading,
    activeTab,
    fetchApprovals,
    approveRequest,
    rejectRequest,
    editAndApproveRequest,
    setActiveTab,
  } = useApprovalStore();

  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedJson, setEditedJson] = useState('{}');
  const [actionReason, setActionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchApprovals(activeTab === 'PENDING' ? 'PENDING' : undefined);
  }, [activeTab, fetchApprovals]);

  const handleApprove = async (item: ApprovalItem) => {
    setIsSubmitting(true);
    try {
      await approveRequest(item.id, 'Approved via operator console');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (item: ApprovalItem) => {
    setIsSubmitting(true);
    try {
      await rejectRequest(item.id, 'Rejected via operator console');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (item: ApprovalItem) => {
    setSelectedApproval(item);
    const initialVars = item.execution?.inputs || item.metadata?.variables || {};
    setEditedJson(JSON.stringify(initialVars, null, 2));
    setShowEditModal(true);
  };

  const handleEditAndApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApproval) return;

    setIsSubmitting(true);
    try {
      const parsed = JSON.parse(editedJson);
      await editAndApproveRequest(selectedApproval.id, parsed, actionReason || 'Approved with edited variables');
      setShowEditModal(false);
    } catch (err) {
      alert('Invalid JSON input payload');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canUserApprove = user?.role === 'ADMIN' || user?.role === 'OPERATOR' || user?.canApprove === true;

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>Human Approval Queue — ProcessPilot AI</title>
        </Head>

        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase mb-2">
                <Lock className="w-3 h-3" /> Guardrail Human Oversight Queue
              </div>
              <h1 className="text-xl font-extrabold text-slate-100 font-display flex items-center gap-2.5">
                <CheckSquare className="w-5 h-5 text-amber-400" /> Pending Approvals Inbox
              </h1>
              <p className="text-slate-400 text-xs font-mono mt-1">
                Review paused workflow executions requiring explicit operator authorization before proceeding.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center p-1 rounded-lg bg-[#161B22] border border-[#30363D]">
              <button
                onClick={() => setActiveTab('PENDING')}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                  activeTab === 'PENDING'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pending Review
              </button>
              <button
                onClick={() => setActiveTab('RESOLVED')}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                  activeTab === 'RESOLVED'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Resolved History
              </button>
            </div>
          </div>

          {!canUserApprove && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2 font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Read-only mode. Approval actions require operator authorization.</span>
            </div>
          )}

          {/* Approvals List */}
          {isLoading ? (
            <div className="text-center py-16 text-slate-400 font-mono text-xs animate-pulse">
              Loading approval requests...
            </div>
          ) : approvals.length === 0 ? (
            <div className="operator-card p-12 text-center space-y-3">
              <CheckSquare className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-200 font-display">Approval Queue Clear</h3>
              <p className="text-slate-400 text-xs max-w-md mx-auto font-sans">
                No workflow executions are currently paused waiting for human authorization.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.map((item) => (
                <div
                  key={item.id}
                  className="guardrail-node p-5 rounded-xl transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5"
                >
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-100 font-display">
                        {item.workflow?.name || 'Workflow Execution'}
                      </span>

                      {/* Trigger Reason Badge */}
                      <span
                        className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${
                          item.triggerReason === 'THRESHOLD'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {item.triggerReason === 'THRESHOLD' ? 'THRESHOLD LOCK' : 'LOW CONFIDENCE'}
                      </span>

                      <span className="text-[10px] font-mono text-slate-400">
                        ID: {item.executionId?.slice(0, 8)}
                      </span>
                    </div>

                    {/* AI Reasoning Trace */}
                    <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] text-xs font-mono space-y-1">
                      <div className="text-amber-400 font-bold text-[10px] uppercase flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5" /> Human Approval Requirement Reason:
                      </div>
                      <p className="text-slate-200 leading-relaxed">{item.reason || 'SOP threshold triggered approval requirement'}</p>
                    </div>

                    {/* Metadata & Variables */}
                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400">
                      <span>Node: <code className="text-slate-200">{item.nodeId}</code></span>
                      <span>Timestamp: {new Date(item.createdAt).toLocaleString()}</span>
                      {item.approvedBy && <span className="text-emerald-400 font-bold">Approved by: {item.approvedBy}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  {item.status === 'PENDING' && canUserApprove && (
                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        onClick={() => openEditModal(item)}
                        disabled={isSubmitting}
                        className="px-3 py-2 rounded-lg bg-[#0D1117] hover:bg-[#21262D] border border-[#30363D] text-slate-300 font-mono text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-cyan-400" /> Edit Payload
                      </button>

                      <button
                        onClick={() => handleReject(item)}
                        disabled={isSubmitting}
                        className="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>

                      <button
                        onClick={() => handleApprove(item)}
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve & Resume
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Edit & Approve Modal */}
          {showEditModal && selectedApproval && (
            <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-6">
              <div className="operator-card p-6 max-w-lg w-full space-y-4">
                <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" /> Edit Payload & Resume
                </h3>
                <p className="text-slate-400 text-xs font-sans">
                  Modify execution variables (e.g. adjust refund amount) before authorizing execution resume.
                </p>

                <form onSubmit={handleEditAndApproveSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                      Execution Variables (JSON)
                    </label>
                    <textarea
                      value={editedJson}
                      onChange={(e) => setEditedJson(e.target.value)}
                      rows={6}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#0D1117] border border-[#30363D] text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                      Reason / Note
                    </label>
                    <input
                      type="text"
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="e.g. Adjusted refund amount to ₹4,500 per policy"
                      className="w-full px-3.5 py-2 rounded-lg bg-[#0D1117] border border-[#30363D] text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-3 py-1.5 rounded text-xs font-mono text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold transition-all"
                    >
                      {isSubmitting ? 'Resuming Execution...' : 'Save & Resume Execution'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
