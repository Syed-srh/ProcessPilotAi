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
  ArrowUpRight,
  ShieldCheck,
  Bot,
  Activity,
  Clock,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();

  const metrics = [
    {
      title: 'Total Workflows',
      value: '12',
      change: '+3 this week',
      icon: GitFork,
      color: 'from-indigo-500/20 to-indigo-600/10 text-indigo-400 border-indigo-500/20',
    },
    {
      title: 'Active Executions',
      value: '4',
      change: '2 running now',
      icon: PlayCircle,
      color: 'from-cyan-500/20 to-cyan-600/10 text-cyan-400 border-cyan-500/20',
    },
    {
      title: 'Pending Approvals',
      value: '2',
      change: '1 requires high risk review',
      icon: CheckSquare,
      color: 'from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/20',
    },
    {
      title: 'Automation Success Rate',
      value: '98.4%',
      change: '1.6% escalated to humans',
      icon: TrendingUp,
      color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/20',
    },
  ];

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>Dashboard — ProcessPilot AI</title>
        </Head>

        <div className="space-y-8 max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-card via-card to-indigo-950/20 p-6 rounded-3xl border border-border">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
                Welcome back, {user?.name} 👋
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                ProcessPilot AI engine is active. All fallback providers (Gemini → Groq) are ready.
              </p>
            </div>

            <Link
              href="/workflows/new"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-primary-600/25 transition-all flex items-center gap-2 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" /> Generate Workflow from SOP
            </Link>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.title}
                  className="glass-card p-5 rounded-2xl border flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                      {metric.title}
                    </span>
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br border ${metric.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-slate-100 mb-1 font-mono tracking-tight">
                      {metric.value}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                      <span>{metric.change}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* System Status & SOP Spotlight */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Demo SOP Spotlight Card */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-indigo-500/20 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">Featured SOP Demo: Customer Refund Processing</h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                  v1 Ready
                </span>
              </div>

              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                "When a customer requests a refund, verify the order, check refund policy, auto-approve refunds ≤ ₹5,000, request manager approval for larger refunds, process refund, and send confirmation."
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-border">
                  <span className="text-slate-400 block mb-1">Auto Approval Threshold</span>
                  <span className="text-emerald-400 font-bold">≤ ₹5,000</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-border">
                  <span className="text-slate-400 block mb-1">Approval Trigger Rule</span>
                  <span className="text-indigo-400 font-bold">Threshold OR Conf &lt; Min</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-border">
                  <span className="text-slate-400 block mb-1">Simulation Mode</span>
                  <span className="text-cyan-400 font-bold">Mocked Side Effects</span>
                </div>
              </div>
            </div>

            {/* Quick Activity Timeline */}
            <div className="glass-panel p-6 rounded-3xl border border-border flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" /> Recent Execution Stream
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Live Sync</span>
              </div>

              <div className="space-y-4 flex-1">
                <div className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-200">Customer Refund #RF-1049 Executed</p>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" /> 2 minutes ago • Auto-approved (₹3,200)
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-200">Approval Required #RF-1050</p>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" /> 14 minutes ago • Amount ₹7,500 &gt; Threshold
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-200">SOP Generated: Refund Policy v1</p>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" /> 1 hour ago • Validated by Zod Schema
                    </span>
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
