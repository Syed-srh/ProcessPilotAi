import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowRight, ShieldAlert, Cpu, GitBranch, CheckCircle2, Lock, Terminal, Sparkles, BookOpen } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'sop' | 'graph' | 'rag'>('sop');

  return (
    <>
      <Head>
        <title>ProcessPilot AI — AI Decides Within Boundaries. Humans Stay In Control.</title>
      </Head>

      <div className="min-h-screen bg-[#0D1117] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Navigation Bar */}
        <header className="h-16 border-b border-[#30363D] bg-[#161B22]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-50">
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

        {/* Hero Storytelling Section */}
        <section className="px-6 py-24 max-w-6xl mx-auto text-center flex flex-col items-center justify-center relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-8">
            <Cpu className="w-4 h-4" /> Multi-Agent Process Engine v1.0
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight mb-6 text-slate-100">
            AI Decides Within Boundaries. <br />
            <span className="text-cyan-400">Humans Stay In Control.</span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg max-w-2xl font-normal leading-relaxed mb-10">
            Transform plain-text SOPs into visually inspectable, auditable multi-agent workflow graphs with automated threshold guardrails and grounded policy citations.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center justify-center gap-3 font-mono"
            >
              Start Operator Session <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-slate-300 bg-[#161B22] border border-[#30363D] hover:bg-[#21262D] transition-all flex items-center justify-center gap-2 font-mono"
            >
              View Executed Audit Logs
            </Link>
          </div>
        </section>

        {/* Interactive SOP-to-Graph Narrative Reveal */}
        <section className="px-6 py-12 max-w-5xl mx-auto w-full">
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

        {/* Feature Grid */}
        <section className="px-6 py-20 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>
    </>
  );
}
