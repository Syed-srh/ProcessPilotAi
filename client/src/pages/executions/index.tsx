import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { AppShell } from '../../components/AppShell';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { api } from '../../services/api';
import { PlayCircle, Clock, Cpu, ArrowRight, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function ExecutionsLibrary() {
  const [executions, setExecutions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get('/executions')
      .then((res) => {
        setExecutions(res.data.data.executions || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'AWAITING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
            <ShieldAlert className="w-3.5 h-3.5 animate-pulse" /> Paused (Approval Required)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold">
            <AlertTriangle className="w-3.5 h-3.5" /> Failed
          </span>
        );
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>Execution Audit History — ProcessPilot AI</title>
        </Head>

        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-semibold mb-2">
              <PlayCircle className="w-3.5 h-3.5" /> Execution Telemetry & Audit Log
            </div>
            <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-3">
              Execution History
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Immutable audit history of all executed workflows, multi-agent decisions, and human approval events.
            </p>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-16 text-slate-400 font-mono text-sm animate-pulse">
              Loading execution logs...
            </div>
          ) : executions.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center border border-border">
              <PlayCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-200 mb-1">No Executions Recorded</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Execute a workflow from the builder or test console to view live audit traces here.
              </p>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-slate-900/60 font-mono text-xs text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Workflow</th>
                      <th className="py-4 px-6">Execution ID</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">AI Calls</th>
                      <th className="py-4 px-6">Started At</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs font-mono">
                    {executions.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-100 font-sans text-sm">
                          {item.workflow?.name || 'Workflow Run'}
                        </td>
                        <td className="py-4 px-6 text-slate-400">
                          <code>{item.id.slice(0, 12)}...</code>
                        </td>
                        <td className="py-4 px-6">{getStatusBadge(item.status)}</td>
                        <td className="py-4 px-6 text-cyan-400 font-bold">
                          <span className="inline-flex items-center gap-1">
                            <Cpu className="w-3.5 h-3.5" /> {item.aiCallCount ?? 0} Calls
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-400">
                          {new Date(item.createdAt).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            href={`/executions/${item.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-border text-indigo-400 font-bold text-xs transition-all"
                          >
                            View Timeline <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
