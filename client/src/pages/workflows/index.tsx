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
  Play,
  CheckCircle,
  Clock,
  FileText,
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
              <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-3">
                <GitFork className="w-6 h-6 text-indigo-400" /> Workflows Library
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Manage, design, and execute your compiled business process automation graphs.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/workflows/new"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-sm font-bold shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" /> Generate from SOP
              </Link>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-border text-sm font-bold transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> New Blank Workflow
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-4 bg-card p-3 rounded-2xl border border-border">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search workflows by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-border text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Workflows Grid */}
          {isLoading ? (
            <div className="text-center py-16 text-slate-400 font-mono text-sm animate-pulse">
              Loading workflow library...
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center border border-border">
              <GitFork className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-200 mb-1">No Workflows Found</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                Create a blank workflow or compile an SOP text prompt into an executable workflow.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition-colors"
              >
                Create First Workflow
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  onClick={() => router.push(`/workflows/${workflow.id}`)}
                  className="glass-card p-6 rounded-3xl border border-border hover:border-indigo-500/40 cursor-pointer flex flex-col justify-between group transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                        v{workflow.version} {workflow.status}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleDuplicate(workflow.id, e)}
                          title="Duplicate"
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(workflow.id, e)}
                          title="Delete"
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors mb-2">
                      {workflow.name}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed mb-4">
                      {workflow.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-slate-400 font-mono">
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
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-panel p-6 rounded-3xl border border-border max-w-md w-full">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Create New Workflow</h3>
                <form onSubmit={handleCreateWorkflow} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                      Workflow Name
                    </label>
                    <input
                      type="text"
                      value={newWorkflowName}
                      onChange={(e) => setNewWorkflowName(e.target.value)}
                      placeholder="e.g. Customer Refund Automation"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-border text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                      Description
                    </label>
                    <textarea
                      value={newWorkflowDesc}
                      onChange={(e) => setNewWorkflowDesc(e.target.value)}
                      placeholder="Brief summary of workflow objective..."
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-border text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold transition-all"
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
