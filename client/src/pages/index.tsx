import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldAlert,
  Cpu,
  GitBranch,
  CheckCircle2,
  Lock,
  Terminal,
  Sparkles,
  BookOpen,
  Linkedin,
  Github,
  Check,
  AlertTriangle,
  FileText,
  Clock,
  Zap,
  Activity,
  Layers,
  Database,
  EyeOff,
  RefreshCw,
  Link2Off,
  HelpCircle,
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'sop' | 'graph' | 'rag'>('sop');

  return (
    <>
      <Head>
        <title>ProcessPilot AI — AI Decides Within Boundaries. Humans Stay In Control.</title>
      </Head>

      <div className="min-h-screen bg-[#0D1117] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Fixed Top Navigation Bar */}
        <header className="h-16 border-b border-[#30363D] bg-[#161B22]/90 backdrop-blur-md px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="ProcessPilot AI" className="w-8 h-8" />
            <span className="font-display font-extrabold text-xl tracking-tight text-slate-100">
              ProcessPilot<span className="text-cyan-400">.AI</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#21262D] transition-all font-mono"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 transition-all font-mono flex items-center gap-2"
            >
              Launch Console <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* HERO SECTION (Adapted from Storytelling Layout with Floating Node Map) */}
        <section className="px-6 md:px-12 py-16 md:py-24 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Cpu className="w-4 h-4" /> Multi-Agent Process Engine v1.0
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-100">
              Make your business <br />
              <span className="text-cyan-400">AI-ready</span> with visual workflow control.
            </h1>

            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-xl font-normal">
              Transform plain-text SOPs into visually inspectable, auditable multi-agent workflow graphs with automated threshold guardrails and grounded policy citations.
            </p>

            <ul className="space-y-2.5 text-xs font-mono text-slate-300">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Automatic SOP compilation into executable workflow graphs</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Autonomous 6-agent orchestration with human approval locks</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Grounding against written policy documents via RAG vector search</span>
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center justify-center gap-2.5 font-mono shadow-lg shadow-cyan-500/20"
              >
                Start Operator Session <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-xs font-bold text-slate-300 bg-[#161B22] border border-[#30363D] hover:bg-[#21262D] transition-all flex items-center justify-center gap-2 font-mono"
              >
                View Executed Audit Logs
              </Link>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#30363D]/60 max-w-lg text-left">
              <div>
                <div className="text-lg font-bold font-display text-slate-100">100%</div>
                <div className="text-[11px] font-mono text-slate-400">Auditable Telemetry</div>
              </div>
              <div>
                <div className="text-lg font-bold font-display text-amber-400">Human-in-Loop</div>
                <div className="text-[11px] font-mono text-slate-400">Safety Guardrails</div>
              </div>
              <div>
                <div className="text-lg font-bold font-display text-emerald-400">768-dim</div>
                <div className="text-[11px] font-mono text-slate-400">RAG Vector Grounding</div>
              </div>
            </div>
          </div>

          {/* Right Floating Workflow Node Map Visual */}
          <div className="lg:col-span-5 relative">
            <div className="operator-card p-6 rounded-2xl space-y-4 bg-[#161B22]/90 border border-[#30363D] shadow-2xl relative z-10">
              <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>PROCESS STUDY & GRAPH MAP</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  6 Agents Active
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {/* Node 1 */}
                <div className="p-3 rounded-xl bg-[#0D1117] border border-[#30363D] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                    <div>
                      <div className="text-slate-200 font-semibold text-[11px]">1. PROCESS STUDY</div>
                      <div className="text-slate-500 text-[10px]">Planner Agent • Topo Sort</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                    Compiled
                  </span>
                </div>

                {/* Node 2 */}
                <div className="p-3 rounded-xl bg-[#0D1117] border border-[#30363D] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <div>
                      <div className="text-slate-200 font-semibold text-[11px]">2. WORKFLOW CONDITION</div>
                      <div className="text-slate-500 text-[10px]">Amount &le; ₹5,000 Check</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                    Evaluating
                  </span>
                </div>

                {/* Node 3 - Guardrail */}
                <div className="p-3 rounded-xl guardrail-node flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <div>
                      <div className="text-amber-200 font-semibold text-[11px] flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-amber-400" /> 3. HUMAN APPROVAL LOCK
                      </div>
                      <div className="text-amber-400/80 text-[10px]">Threshold ₹7,500 &gt; Limit ₹5,000</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40 font-bold">
                    PAUSED
                  </span>
                </div>

                {/* Node 4 - Policy Grounding */}
                <div className="p-3 rounded-xl bg-[#0D1117] border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div>
                      <div className="text-slate-200 font-semibold text-[11px]">4. RAG POLICY CITATION</div>
                      <div className="text-slate-500 text-[10px]">Clause B • Vector Cosine Similarity</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    Grounded
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: THE REAL PROBLEM (Full Storytelling Layout from Image2) */}
        <section className="px-6 md:px-12 py-20 bg-[#161B22]/40 border-y border-[#30363D]">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-bold uppercase tracking-wider">
                THE REAL PROBLEM
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-slate-100">
                AI is everywhere. <br />
                <span className="text-cyan-400">Your workflow is still manual.</span>
              </h2>
              <p className="text-slate-400 text-sm md:text-base font-normal leading-relaxed">
                Most businesses don't have an AI problem — they have a process execution & safety problem. SOPs live in static documents while execution relies on manual follow-ups and unconstrained scripts.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Mac Window Preview (Friction Points) */}
              <div className="lg:col-span-5 operator-card p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono text-slate-400 ml-2">Operation Overview</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    Pending Friction
                  </span>
                </div>

                <div className="space-y-2.5 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-200 text-[11px]">Has the boss approved this refund?</p>
                      <span className="text-slate-500 text-[10px]">WhatsApp • 10 mins ago</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                  </div>

                  <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-200 text-[11px]">Inventory_v2_FINAL_FINAL.xlsx</p>
                      <span className="text-slate-500 text-[10px]">Excel • Last edited by 2 officers</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  </div>

                  <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-200 text-[11px]">Q4 Refund Report — OVERDUE</p>
                      <span className="text-slate-500 text-[10px]">Due 2 days ago</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                  </div>

                  <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-200 text-[11px]">Re: Re: Invoice approval #4421</p>
                      <span className="text-slate-500 text-[10px]">Email thread • 12 messages</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  </div>

                  <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-200 text-[11px]">47 rows to update manually</p>
                      <span className="text-slate-500 text-[10px]">Database sync pending</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-500 italic text-center pt-2">
                  "This is what 'managed by WhatsApp and Excel' looks like at scale."
                </div>
              </div>

              {/* Right Common Patterns Grid */}
              <div className="lg:col-span-7 space-y-4">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  COMMON PATTERNS WE FIND & SOLVE:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-1.5">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                      <Clock className="w-4 h-4" /> Too much work happens manually
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      Operators re-read static policy documents repeatedly for every ticket.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <FileText className="w-4 h-4" /> Spreadsheets run critical ops
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      Data scattered across loose Excel sheets and unmonitored chat channels.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-1.5">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                      <EyeOff className="w-4 h-4" /> Teams lack real-time visibility
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      No unified telemetry stream showing which agent executed which step.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-1.5">
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                      <RefreshCw className="w-4 h-4" /> Approvals depend on follow-up
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      High-risk decisions stall waiting for email authorization threads.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-1.5">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                      <Link2Off className="w-4 h-4" /> Tools are disconnected
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      API webhooks, databases, and LLM prompts lack single-pane orchestration.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4" /> Unconstrained AI causes risk
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      Autonomous LLMs executing payment APIs without human threshold locks.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Quote Banner */}
            <div className="p-6 rounded-2xl bg-[#0D1117] border border-[#30363D] text-center max-w-4xl mx-auto space-y-2">
              <p className="text-slate-200 font-display font-semibold text-base md:text-lg">
                "The problem isn't your people. It's that static SOP documents lack executable visual guardrails and real-time human authorization locks."
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: INTERACTIVE COMPILER DEMONSTRATION */}
        <section className="px-6 md:px-12 py-16 max-w-5xl mx-auto w-full">
          <div className="operator-card p-6 rounded-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#30363D] pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Interactive Compiler & Grounding Demonstration
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('sop')}
                  className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                    activeTab === 'sop'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  1. Natural SOP
                </button>
                <button
                  onClick={() => setActiveTab('graph')}
                  className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                    activeTab === 'graph'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  2. Compiled Graph
                </button>
                <button
                  onClick={() => setActiveTab('rag')}
                  className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                    activeTab === 'rag'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  3. RAG Policy Citation
                </button>
              </div>
            </div>

            {/* Tab 1: SOP Text */}
            {activeTab === 'sop' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="text-slate-400">INPUT NATURAL LANGUAGE SOP PROMPT:</div>
                <pre className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D] text-cyan-300 overflow-x-auto leading-relaxed">
{`Validate order refund eligibility.
If refund amount is under ₹5,000, auto-approve the request.
If refund amount exceeds ₹5,000, require human manager authorization.
Ground decision against active Company Refund Policy document.`}
                </pre>
              </div>
            )}

            {/* Tab 2: Compiled Graph */}
            {activeTab === 'graph' && (
              <div className="space-y-4 font-mono text-xs">
                <div className="text-slate-400">COMPILED GRAPH ARCHITECTURE WITH SAFETY BOUNDARIES:</div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D]">
                    <span className="text-[10px] text-purple-400 font-bold">1. TRIGGER</span>
                    <p className="text-slate-200 font-sans text-xs mt-1">Manual Input Payload</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D]">
                    <span className="text-[10px] text-cyan-400 font-bold">2. CONDITION</span>
                    <p className="text-slate-200 font-sans text-xs mt-1">Amount &le; ₹5,000 Check</p>
                  </div>
                  <div className="p-3 rounded-lg guardrail-node">
                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> 3. HUMAN LOCK
                    </span>
                    <p className="text-slate-200 font-sans text-xs mt-1">Threshold Exceeded Gate</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D]">
                    <span className="text-[10px] text-emerald-400 font-bold">4. EXECUTION</span>
                    <p className="text-slate-200 font-sans text-xs mt-1">Send Email Notification</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: RAG Citation */}
            {activeTab === 'rag' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <BookOpen className="w-4 h-4" /> RAG GROUNDED AUDIT TELEMETRY:
                </div>
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-emerald-400">Cited Policy Clause:</div>
                  <div>"Clause B: Refund requests exceeding ₹5,000 threshold limit require explicit human manager approval."</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 4: CAPABILITY CARDS */}
        <section className="px-6 md:px-12 py-16 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="operator-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-display text-slate-100">SOP Graph Compiler</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Compiles complex operational text into Zod-schema validated execution graphs with deterministic fallbacks.
            </p>
          </div>

          <div className="operator-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-display text-slate-100">Human Approval Lock</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Execution automatically pauses when business thresholds are exceeded, transferring control to human operators.
            </p>
          </div>

          <div className="operator-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-display text-slate-100">RAG Policy Grounding</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Decision agents perform cosine vector similarity search against active company policy chunks and record cited clauses in audit trails.
            </p>
          </div>
        </section>

        {/* Footer Section */}
        <footer className="mt-auto border-t border-[#30363D] bg-[#161B22] px-8 py-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="ProcessPilot AI" className="w-7 h-7" />
              <div>
                <span className="font-display font-extrabold text-base tracking-tight text-slate-100">
                  ProcessPilot<span className="text-cyan-400">.AI</span>
                </span>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  AI decides within boundaries. Workflow controls execution.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://www.linkedin.com/in/1syedrahilhussain/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-[#0D1117] border border-[#30363D] hover:bg-[#21262D] text-slate-300 hover:text-cyan-400 transition-all flex items-center gap-1.5 text-xs font-mono"
                title="ProcessPilot AI LinkedIn"
              >
                <Linkedin className="w-4 h-4 text-cyan-400" />
                <span>LinkedIn</span>
              </a>

              <a
                href="https://github.com/Syed-srh/ProcessPilotAi"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-[#0D1117] border border-[#30363D] hover:bg-[#21262D] text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-mono"
                title="ProcessPilot AI GitHub"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            </div>
          </div>

          <div className="max-w-6xl mx-auto border-t border-[#30363D]/60 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500">
            <span>&copy; {new Date().getFullYear()} ProcessPilot AI. All rights reserved.</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> System Operational • v1.0 Production MVP
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}
