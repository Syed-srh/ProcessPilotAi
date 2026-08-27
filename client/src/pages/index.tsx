import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Bot, ArrowRight, ShieldCheck, Cpu, GitBranch, PlayCircle, Eye } from 'lucide-react';

export default function Home() {
  return (
    <>
      <Head>
        <title>ProcessPilot AI — Intelligent Business Process Automation</title>
      </Head>

      <div className="min-h-screen bg-background text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
        {/* Navigation Bar */}
        <header className="h-20 border-b border-border/80 px-8 flex items-center justify-between backdrop-blur-md bg-card/40 sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-gradient">ProcessPilot AI</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 shadow-lg shadow-primary-600/30 transition-all flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="px-6 py-20 max-w-6xl mx-auto text-center flex flex-col items-center justify-center relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-8 font-mono">
            <Cpu className="w-4 h-4" /> AI-Native Process Operating System
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight mb-6">
            Turn Business Processes into <br />
            <span className="text-gradient">Intelligent, Executable Workflows</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl font-normal leading-relaxed mb-10">
            Describe SOPs and operational procedures in natural language. ProcessPilot AI compiles them into visually inspectable, controllable agentic automations with human-in-the-loop approvals.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-primary-600 via-indigo-600 to-cyan-500 hover:scale-105 transition-all shadow-xl shadow-primary-600/30 flex items-center justify-center gap-3"
            >
              Launch Pilot Console <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-slate-300 bg-card border border-border hover:bg-slate-800/80 transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-5 h-5 text-indigo-400" /> Sign In to Workspace
            </Link>
          </div>

          {/* Thesis Statement Banner */}
          <div className="mt-16 p-6 rounded-2xl glass-panel max-w-3xl border border-indigo-500/20 shadow-2xl">
            <div className="text-xs uppercase font-mono tracking-widest text-indigo-400 font-bold mb-2">
              Core Product Principle
            </div>
            <blockquote className="text-base md:text-lg font-medium text-slate-200 italic">
              "AI decides within boundaries. The workflow engine controls execution. Humans remain in control of high-risk actions."
            </blockquote>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="px-6 py-16 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Natural Language Compiler</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Transform unstructured SOP text into structured, Zod schema-validated visual workflow graphs powered by Gemini and Groq AI models.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Human Approval Gate</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Automatic execution pausing based on configurable business thresholds or low AI confidence scores, enforcing explicit human oversight.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
              <PlayCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Simulation & Audit Trail</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Run safe dry-runs with zero side-effects and review complete, immutable timelines with reasoning traces for every agent decision.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
