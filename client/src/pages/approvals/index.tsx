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
  Clock,
  User,
  Bot,
  Sliders,
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
      await approveRequest(item.id, 'Approved via inbox console');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (item: ApprovalItem) => {
    setIsSubmitting(true);
    try {
      await rejectRequest(item.id, 'Rejected via inbox console');
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-semibold mb-2">
                <ShieldAlert className="w-3.5 h-3.5" /> Human-in-the-Loop Approval Queue
              </div>
              <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-3">
                <CheckSquare className="w-6 h-6 text-indigo-400" /> Pending Approvals Inbox
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Review paused workflow executions requiring explicit operator authorization before proceeding.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-card border border-border">
              <button
                onClick={() => setActiveTab('PENDING')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'PENDING'
                    ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pending Review
              </button>
              <button
                onClick={() => setActiveTab('RESOLVED')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'RESOLVED'
                    ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Resolved History
              </button>
            </div>
          </div>

          {!canUserApprove && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-3 font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>You are viewing in read-only mode. Approval actions require explicit approval capability.</span>
            </div>
          )}

          {/* Approvals List */}
          {isLoading ? (
            <div className="text-center py-16 text-slate-400 font-mono text-sm animate-pulse">
              Loading approval requests...
            </div>
          ) : approvals.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center border border-border">
              <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-200 mb-1">Queue Clear</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                No approval requests currently match your selected status tab.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.map((item) => (
                <div
                  key={item.id}
                  className="glass-panel p-6 rounded-3xl border border-border hover:border-indigo-500/30 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-base text-slate-100">
                        {item.workflow?.name || 'Workflow Execution'}
                      </span>

                      {/* Trigger Reason Badge */}
                      <span
                        className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${
                          item.triggerReason === 'THRESHOLD'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {item.triggerReason === 'THRESHOLD' ? 'Threshold Exceeded' : 'Low AI Confidence'}
                      </span>

                      <span className="text-[10px] font-mono text-slate-500">
                        Exec ID: {item.executionId?.slice(0, 8)}
                      </span>
                    </div>

                    {/* AI Reasoning Trace */}
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono space-y-1">
                      <div className="text-indigo-400 font-bold flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5" /> Reasoning Trace:
                      </div>
                      <p className="text-slate-300 leading-relaxed">{item.reason || 'SOP threshold triggered approval requirement'}</p>
                    </div>

                    {/* Metadata & Variables */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                      <span>Node ID: <code className="text-slate-200">{item.nodeId}</code></span>
                      <span>Requested: {new Date(item.createdAt).toLocaleString()}</span>
                      {item.approvedBy && <span className="text-emerald-400">Resolved by: {item.approvedBy}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  {item.status === 'PENDING' && canUserApprove && (
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => openEditModal(item)}
                        disabled={isSubmitting}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-border text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-400" /> Edit & Approve
                      </button>

                      <button
                        onClick={() => handleReject(item)}
                        disabled={isSubmitting}
                        className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>

                      <button
                        onClick={() => handleApprove(item)}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
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
            <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-6">
              <div className="glass-panel p-6 rounded-3xl border border-border max-w-lg w-full">
                <h3 className="text-lg font-bold text-slate-100 mb-2 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-400" /> Edit Variables & Approve
                </h3>
                <p className="text-slate-400 text-xs mb-4">
                  Modify execution variables (e.g. adjust refund amount) before resuming the workflow.
                </p>

                <form onSubmit={handleEditAndApproveSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                      Execution Variables (JSON)
                    </label>
                    <textarea
                      value={editedJson}
                      onChange={(e) => setEditedJson(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-border text-cyan-300 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                      Reason / Note
                    </label>
                    <input
                      type="text"
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="e.g. Reduced refund amount to ₹4,500 per policy"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-border text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold transition-all"
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
