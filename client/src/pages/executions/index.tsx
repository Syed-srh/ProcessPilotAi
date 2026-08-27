import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { AppShell } from '../../components/AppShell';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { api } from '../../services/api';
import { PlayCircle, Cpu, ArrowRight, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
            <CheckCircle2 className="w-3 h-3" /> COMPLETED
          </span>
        );
      case 'AWAITING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold">
            <ShieldAlert className="w-3 h-3" /> AWAITING APPROVAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold">
            <AlertTriangle className="w-3 h-3" /> FAILED
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold uppercase mb-2">
              <PlayCircle className="w-3 h-3" /> Execution Telemetry & Audit Stream
            </div>
            <h1 className="text-xl font-extrabold text-slate-100 font-display flex items-center gap-2.5">
              Execution History
            </h1>
            <p className="text-slate-400 text-xs font-mono mt-1">
              Immutable audit history of all executed workflows, multi-agent decisions, and human approval events.
            </p>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-16 text-slate-400 font-mono text-xs animate-pulse">
              Loading execution telemetry...
            </div>
          ) : executions.length === 0 ? (
            <div className="operator-card p-12 text-center space-y-3">
              <PlayCircle className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-200 font-display">No Executions Recorded</h3>
              <p className="text-slate-400 text-xs max-w-md mx-auto font-sans">
                Execute a workflow from the builder or test console to view live audit traces here.
              </p>
            </div>
          ) : (
            <div className="operator-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#30363D] bg-[#0D1117] font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-5">Workflow</th>
                      <th className="py-3 px-5">Execution ID</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5">AI Budget</th>
                      <th className="py-3 px-5">Started At</th>
                      <th className="py-3 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363D] text-xs font-mono">
                    {executions.map((item) => (
                      <tr key={item.id} className="hover:bg-[#21262D] transition-colors">
                        <td className="py-3 px-5 font-bold text-slate-100 font-display text-xs">
                          {item.workflow?.name || 'Workflow Run'}
                        </td>
                        <td className="py-3 px-5 text-slate-400">
                          <code>{item.id.slice(0, 12)}...</code>
                        </td>
                        <td className="py-3 px-5">{getStatusBadge(item.status)}</td>
                        <td className="py-3 px-5 text-cyan-400 font-bold">
                          <span className="inline-flex items-center gap-1">
                            <Cpu className="w-3.5 h-3.5" /> {item.aiCallCount ?? 0} Calls
                          </span>
                        </td>
                        <td className="py-3 px-5 text-slate-400">
                          {new Date(item.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-5 text-right">
                          <Link
                            href={`/executions/${item.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#0D1117] hover:bg-[#21262D] border border-[#30363D] text-cyan-400 font-mono font-bold text-[11px] transition-all"
                          >
                            View Timeline <ArrowRight className="w-3 h-3" />
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
