import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AppShell } from '../../components/AppShell';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { api } from '../../services/api';
import { Workflow } from '../../types/workflow';
import {
  GitFork,
  Plus,
  Search,
  Copy,
  Trash2,
  Sparkles,
} from 'lucide-react';

export default function WorkflowsLibrary() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDesc, setNewWorkflowDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchWorkflows = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/workflows');
      setWorkflows(response.data.data.workflows);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkflowName) return;

    setIsCreating(true);
    try {
      const response = await api.post('/workflows', {
        name: newWorkflowName,
        description: newWorkflowDesc,
      });
      const newWorkflow = response.data.data.workflow;
      setShowCreateModal(false);
      router.push(`/workflows/${newWorkflow.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.post(`/workflows/${id}/duplicate`);
      fetchWorkflows();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await api.delete(`/workflows/${id}`);
      fetchWorkflows();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredWorkflows = workflows.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>Workflows Library — ProcessPilot AI</title>
        </Head>

        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-100 font-display flex items-center gap-2.5">
                <GitFork className="w-5 h-5 text-cyan-400" /> Workflows Library
              </h1>
              <p className="text-slate-400 text-xs font-mono mt-1">
                Manage, design, and execute your compiled business process automation graphs.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/workflows/new"
                className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-mono text-xs font-bold transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Generate from SOP
              </Link>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-lg bg-[#161B22] hover:bg-[#21262D] text-slate-200 border border-[#30363D] font-mono text-xs font-bold transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> New Blank Workflow
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-4 bg-[#161B22] p-2.5 rounded-xl border border-[#30363D]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search workflows by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#0D1117] border border-[#30363D] text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Workflows Grid */}
          {isLoading ? (
            <div className="text-center py-16 text-slate-400 font-mono text-xs animate-pulse">
              Loading workflow library...
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="operator-card p-12 text-center space-y-4">
              <GitFork className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-200 font-display">No Workflows Found</h3>
              <p className="text-slate-400 text-xs max-w-md mx-auto font-sans">
                Create a blank workflow or compile an SOP text prompt into an executable workflow.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-mono font-bold transition-colors"
              >
                Create First Workflow
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  onClick={() => router.push(`/workflows/${workflow.id}`)}
                  className="operator-card p-5 cursor-pointer flex flex-col justify-between group transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        v{workflow.version} {workflow.status}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleDuplicate(workflow.id, e)}
                          title="Duplicate"
                          className="p-1 rounded hover:bg-[#21262D] text-slate-400 hover:text-white"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(workflow.id, e)}
                          title="Delete"
                          className="p-1 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-400 transition-colors font-display mb-1.5">
                      {workflow.name}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed font-sans mb-4">
                      {workflow.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#30363D] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3.5 h-3.5 text-slate-500" />
                      {(workflow.nodes as any[])?.length || 0} Nodes
                    </span>
                    <span>Updated {new Date(workflow.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="operator-card p-6 max-w-md w-full space-y-4">
                <h3 className="text-base font-bold text-slate-100 font-display">Create New Workflow</h3>
                <form onSubmit={handleCreateWorkflow} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                      Workflow Name
                    </label>
                    <input
                      type="text"
                      value={newWorkflowName}
                      onChange={(e) => setNewWorkflowName(e.target.value)}
                      placeholder="e.g. Customer Refund Automation"
                      required
                      className="w-full px-3.5 py-2 rounded-lg bg-[#0D1117] border border-[#30363D] text-slate-100 focus:outline-none focus:border-cyan-500 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                      Description
                    </label>
                    <textarea
                      value={newWorkflowDesc}
                      onChange={(e) => setNewWorkflowDesc(e.target.value)}
                      placeholder="Brief summary of workflow objective..."
                      rows={3}
                      className="w-full px-3.5 py-2 rounded-lg bg-[#0D1117] border border-[#30363D] text-slate-100 focus:outline-none focus:border-cyan-500 text-xs font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-mono font-bold transition-all"
                    >
                      {isCreating ? 'Creating...' : 'Create & Open Canvas'}
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
