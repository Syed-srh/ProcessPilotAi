import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AppShell } from '../../components/AppShell';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useWorkflowStore } from '../../store/workflowStore';
import { NodePalette } from '../../components/workflow/NodePalette';
import { WorkflowCanvas } from '../../components/workflow/WorkflowCanvas';
import { NodeConfigPanel } from '../../components/workflow/NodeConfigPanel';
import {
  Save,
  Play,
  ArrowLeft,
  Check,
  AlertCircle,
  GitBranch,
  Activity,
  Layers,
} from 'lucide-react';

export default function WorkflowEditorPage() {
  const router = useRouter();
  const { id } = router.query;

  const {
    currentWorkflow,
    fetchWorkflow,
    saveWorkflow,
    executeWorkflow,
    isSaving,
    isExecuting,
    executionResult,
    isLoading,
    error,
    setWorkflowStatus,
  } = useWorkflowStore();

  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [testPayload, setTestPayload] = useState(
    JSON.stringify({ orderId: 'ORD-1029', amount: 7500, customerEmail: 'test@example.com' }, null, 2)
  );

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchWorkflow(id);
    }
  }, [id, fetchWorkflow]);

  const handleManualRun = async () => {
    try {
      const parsedInputs = JSON.parse(testPayload);
      await executeWorkflow(parsedInputs);
    } catch (e) {
      alert('Invalid JSON input payload');
    }
  };

  if (isLoading || !currentWorkflow) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="h-[70vh] flex flex-col items-center justify-center font-mono text-sm text-slate-400">
            Loading workflow canvas...
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>{currentWorkflow.name} — ProcessPilot Editor</title>
      </Head>

      <div className="h-screen flex flex-col bg-background selection:bg-indigo-500 selection:text-white">
        {/* Top Editor Toolbar */}
        <header className="h-16 border-b border-border bg-card/90 backdrop-blur-md px-6 flex items-center justify-between z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/workflows')}
              className="p-2 rounded-xl bg-slate-900 border border-border hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base text-slate-100">{currentWorkflow.name}</h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-bold">
                  v{currentWorkflow.version}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Status:{' '}
                <select
                  value={currentWorkflow.status}
                  onChange={(e) => setWorkflowStatus(e.target.value as any)}
                  className="bg-transparent text-indigo-400 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PAUSED">PAUSED</option>
                </select>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowExecuteModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-border text-cyan-400 hover:text-cyan-300 text-xs font-bold transition-all flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-cyan-400" /> Test Execution
            </button>

            <button
              onClick={() => saveWorkflow()}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-primary-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? 'Saving Snapshot...' : 'Save Workflow'}
            </button>
          </div>
        </header>

        {/* Editor Main Canvas Body */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Node Palette */}
          <NodePalette />

          {/* Center React Flow Canvas */}
          <WorkflowCanvas />

          {/* Right Slide-Out Inspector Drawer */}
          <NodeConfigPanel />
        </div>

        {/* Manual Test Execution Modal */}
        {showExecuteModal && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <div className="glass-panel p-6 rounded-3xl border border-border max-w-2xl w-full max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-slate-100 text-lg">Execute Sequential Workflow Run</h3>
                </div>
                <button
                  onClick={() => setShowExecuteModal(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto flex-1 pr-1">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                    Input Payload (JSON)
                  </label>
                  <textarea
                    value={testPayload}
                    onChange={(e) => setTestPayload(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-border text-cyan-300 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  onClick={handleManualRun}
                  disabled={isExecuting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {isExecuting ? 'Running Sequential Executor...' : 'Run Sequential Execution'}
                </button>

                {/* Execution Results View */}
                {executionResult && (
                  <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase text-slate-400">
                        Status:{' '}
                        <span
                          className={
                            executionResult.status === 'COMPLETED' ? 'text-emerald-400' : 'text-rose-400'
                          }
                        >
                          {executionResult.status}
                        </span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Exec ID: {executionResult.executionId?.slice(0, 8)}
                      </span>
                    </div>

                    {/* Step Logs */}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      <div className="text-[11px] font-mono font-bold text-slate-400 uppercase">
                        Execution Timeline Logs:
                      </div>
                      {executionResult.logs?.map((log: any, i: number) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-indigo-400 font-bold">[{log.nodeType}]</span>
                            <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-slate-300">{log.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
