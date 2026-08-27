import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AppShell } from '../../../components/AppShell';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { api } from '../../../services/api';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ProcessNode } from '../../../components/workflow/customNodes/ProcessNode';
import {
  Play,
  ArrowLeft,
  Bot,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileCode,
} from 'lucide-react';

const nodeTypes = {
  MANUAL_TRIGGER: ProcessNode,
  AI_DECISION: ProcessNode,
  CONDITION: ProcessNode,
  HUMAN_APPROVAL: ProcessNode,
  HTTP_REQUEST: ProcessNode,
  SEND_EMAIL: ProcessNode,
  SCHEMA_VALIDATION: ProcessNode,
  DATABASE_QUERY: ProcessNode,
};

export default function WorkflowSimulationPage() {
  const router = useRouter();
  const { id } = router.query;

  const [workflow, setWorkflow] = useState<any | null>(null);
  const [inputPayload, setInputPayload] = useState(
    JSON.stringify({ orderId: 'ORD-1029', amount: 7500, customerEmail: 'test@example.com' }, null, 2)
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === 'string') {
      api.get(`/workflows/${id}`).then((res) => {
        setWorkflow(res.data.data.workflow);
      }).catch(console.error);
    }
  }, [id]);

  const handleRunSimulation = async () => {
    if (!id || typeof id !== 'string') return;

    setIsSimulating(true);
    setError(null);

    try {
      const parsedInputs = JSON.parse(inputPayload);
      const response = await api.post(`/workflows/${id}/simulate`, { inputs: parsedInputs });
      setSimulationResult(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid JSON payload');
    } finally {
      setIsSimulating(false);
    }
  };

  if (!workflow) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="h-[70vh] flex flex-col items-center justify-center font-mono text-sm text-slate-400">
            Loading simulation environment...
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Simulation Mode — {workflow.name}</title>
      </Head>

      <div className="h-screen flex flex-col bg-background selection:bg-indigo-500 selection:text-white">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card/90 backdrop-blur-md px-6 flex items-center justify-between z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/workflows/${workflow.id}`)}
              className="p-2 rounded-xl bg-slate-900 border border-border hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base text-slate-100">{workflow.name}</h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
                  Simulation Dry-Run Mode
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Structurally incapable of real side effects • Mocked integration layer
              </p>
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            {isSimulating ? 'Simulating Dry-Run...' : 'Run Simulation'}
          </button>
        </header>

        {/* Body Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left JSON Editor */}
          <div className="w-80 border-r border-border bg-card/60 backdrop-blur-md p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border text-xs font-mono font-bold text-slate-300">
                <FileCode className="w-4 h-4 text-cyan-400" /> Simulation Input Payload
              </div>
              <textarea
                value={inputPayload}
                onChange={(e) => setInputPayload(e.target.value)}
                rows={12}
                className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-border text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
              {error && (
                <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
                  {error}
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-border text-[11px] text-slate-400 font-mono italic">
              "Simulation mode executes condition logic and AI decisions, but NEVER performs external HTTP calls or email sends."
            </div>
          </div>

          {/* Center Canvas */}
          <div className="flex-1 h-full relative">
            <ReactFlow
              nodes={workflow.nodes as any}
              edges={workflow.edges as any}
              nodeTypes={nodeTypes as any}
              fitView
              className="bg-background"
            >
              <Background gap={20} size={1} color="#1E293B" />
              <Controls className="!bg-card !border-border !text-slate-300" />
            </ReactFlow>
          </div>

          {/* Right Simulation Execution Timeline */}
          <div className="w-96 border-l border-border bg-card/95 backdrop-blur-xl p-5 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-slate-100 text-sm">Simulation Timeline</h3>
                </div>
                {simulationResult && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                    {simulationResult.status}
                  </span>
                )}
              </div>

              {simulationResult ? (
                <div className="space-y-3 font-mono text-xs">
                  {simulationResult.logs?.map((log: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-cyan-400 font-bold">[{log.agent}]</span>
                        <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{log.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-slate-500 font-mono text-xs">
                  Click "Run Simulation" to execute dry-run timeline.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
