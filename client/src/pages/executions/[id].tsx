import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AppShell } from '../../components/AppShell';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { api } from '../../services/api';
import { getSocket } from '../../services/socket';
import {
  PlayCircle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Cpu,
  Clock,
  Terminal,
  FileCode,
} from 'lucide-react';

export default function ExecutionTimelinePage() {
  const router = useRouter();
  const { id } = router.query;

  const [execution, setExecution] = useState<any | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExecutionDetail = async () => {
    if (!id || typeof id !== 'string') return;
    try {
      const res = await api.get(`/executions/${id}`);
      setExecution(res.data.data.execution);
      setLogs(res.data.data.execution.executionLogs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutionDetail();

    if (id && typeof id === 'string') {
      const socket = getSocket();
      socket.emit('subscribe:execution', id);

      socket.on('execution:log', (newLog) => {
        setLogs((prev) => [...prev, newLog]);
      });

      return () => {
        socket.off('execution:log');
      };
    }
  }, [id]);

  if (isLoading || !execution) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="h-[70vh] flex flex-col items-center justify-center font-mono text-sm text-slate-400">
            Loading execution audit telemetry...
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  const getAgentBadge = (agent: string) => {
    const colors: Record<string, string> = {
      PLANNER: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      DECISION: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      EXECUTION: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      VALIDATION: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      RECOVERY: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      MONITORING: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    };

    return (
      <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${colors[agent] || 'bg-slate-800 text-slate-300'}`}>
        [{agent} AGENT]
      </span>
    );
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>Execution Audit Timeline — {id}</title>
        </Head>

        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/executions')}
                className="p-2.5 rounded-xl bg-slate-900 border border-border hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-extrabold text-slate-100">
                    {execution.workflow?.name || 'Workflow Execution Audit'}
                  </h1>
                  <span
                    className={`text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                      execution.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : execution.status === 'AWAITING_APPROVAL'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {execution.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Execution ID: <code>{execution.id}</code> • Started: {new Date(execution.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-border text-xs font-mono text-cyan-400">
              <Cpu className="w-4 h-4" /> AI Calls Used: {execution.aiCallCount ?? 0}
            </div>
          </div>

          {/* Input / Output Variables Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-5 rounded-3xl border border-border space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
                <FileCode className="w-4 h-4 text-indigo-400" /> Input Payload
              </div>
              <pre className="p-3 rounded-2xl bg-slate-950 border border-border text-cyan-300 font-mono text-xs overflow-x-auto">
                {JSON.stringify(execution.inputs || {}, null, 2)}
              </pre>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-border space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
                <FileCode className="w-4 h-4 text-emerald-400" /> Output State
              </div>
              <pre className="p-3 rounded-2xl bg-slate-950 border border-border text-emerald-300 font-mono text-xs overflow-x-auto">
                {JSON.stringify(execution.outputs || {}, null, 2)}
              </pre>
            </div>
          </div>

          {/* Human Approval Record if present */}
          {execution.approvals && execution.approvals.length > 0 && (
            <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 bg-amber-500/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
                  <ShieldAlert className="w-4 h-4" /> Human Approval Record
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  {execution.approvals[0].triggerReason} TRIGGER
                </span>
              </div>
              <p className="text-slate-300 text-xs font-mono">{execution.approvals[0].reason}</p>
            </div>
          )}

          {/* Agent Timeline */}
          <div className="glass-panel p-6 rounded-3xl border border-border space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-200 border-b border-border pb-3">
              <Terminal className="w-4 h-4 text-indigo-400" /> Multi-Agent Execution Telemetry Log
            </div>

            <div className="space-y-3 font-mono text-xs">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-slate-500">No agent logs recorded.</div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={log.id || index}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-border hover:border-indigo-500/30 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getAgentBadge(log.agent)}
                        {log.confidenceScore !== undefined && log.confidenceScore !== null && (
                          <span className="text-[10px] text-cyan-400 font-bold">
                            Confidence: {(log.confidenceScore * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-slate-200 font-semibold leading-relaxed">{log.message}</p>

                    {log.reasoningTrace && (
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 italic">
                        "{log.reasoningTrace}"
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
