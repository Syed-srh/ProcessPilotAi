import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { AppShell } from '../components/AppShell';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuthStore } from '../store/authStore';
import {
  GitFork,
  PlayCircle,
  CheckSquare,
  TrendingUp,
  Plus,
  Bot,
  Activity,
  Clock,
  BookOpen,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();

  const metrics = [
    {
      title: 'Total Workflows',
      value: '12',
      change: '+3 active this week',
      icon: GitFork,
      color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    },
    {
      title: 'Active Executions',
      value: '4',
      change: '2 running telemetry traces',
      icon: PlayCircle,
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    },
    {
      title: 'Pending Approvals',
      value: '2',
      change: 'Threshold locks requiring human review',
      icon: CheckSquare,
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    },
    {
      title: 'Automation Success Rate',
      value: '98.4%',
      change: '1.6% safely escalated to human operator',
      icon: TrendingUp,
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    },
  ];

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>Operator Console — ProcessPilot AI</title>
        </Head>

        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-[#161B22] border border-[#30363D]">
            <div>
              <h1 className="text-xl font-extrabold text-slate-100 font-display flex items-center gap-2">
                Operator Dashboard — {user?.name}
              </h1>
              <p className="text-slate-400 text-xs mt-1 font-mono">
                Multi-Agent Engine Status: <span className="text-emerald-400 font-bold">OPERATIONAL</span> • Fallback Chain: Gemini 1.5 &rarr; Groq Llama-3
              </p>
            </div>

            <Link
              href="/workflows/new"
              className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-mono text-xs font-bold transition-all flex items-center gap-2 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" /> Generate SOP Workflow
            </Link>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.title}
                  className="operator-card p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      {metric.title}
                    </span>
                    <div className={`p-2 rounded-md border ${metric.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-100 font-mono tracking-tight">
                      {metric.value}
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                      {metric.change}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* System Telemetry Spotlight */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* SOP Spotlight */}
            <div className="lg:col-span-2 operator-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 font-display">Featured Automation: Customer Refund SOP</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  RAG Grounded Active
                </span>
              </div>

              <p className="text-slate-300 text-xs font-mono leading-relaxed bg-[#0D1117] p-3 rounded-lg border border-[#30363D]">
                "Validate order refund eligibility. Auto-approve refunds ≤ ₹5,000. Require human manager approval for larger refunds. Ground decisions against active Company Refund Policy."
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-[#0D1117] border border-[#30363D]">
                  <span className="text-slate-400 text-[10px] block mb-1">AUTO APPROVAL LIMIT</span>
                  <span className="text-emerald-400 font-bold">≤ ₹5,000</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0D1117] border border-[#30363D]">
                  <span className="text-slate-400 text-[10px] block mb-1">HUMAN LOCK TRIGGER</span>
                  <span className="text-amber-400 font-bold">Threshold Exceeded</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0D1117] border border-[#30363D]">
                  <span className="text-slate-400 text-[10px] block mb-1">VECTOR GROUNDING</span>
                  <span className="text-cyan-400 font-bold">Gemini Embeddings</span>
                </div>
              </div>
            </div>

            {/* Live Activity Telemetry */}
            <div className="operator-card p-5 space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
                <h3 className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" /> Multi-Agent Stream
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Live</span>
              </div>

              <div className="space-y-3 font-mono text-xs flex-1">
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-200 text-[11px]">Execution #7f8486f Executed</p>
                    <span className="text-slate-500 text-[10px]">2m ago • Auto-approved (₹3,200)</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-200 text-[11px]">Approval Lock #c5aec98</p>
                    <span className="text-slate-500 text-[10px]">14m ago • Amount ₹7,500 &gt; Limit</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-200 text-[11px]">RAG Document Indexed</p>
                    <span className="text-slate-500 text-[10px]">1h ago • 3 Vector Chunks Stored</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
