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
  Search,
  TrendingUp,
  MessageSquare,
  FileSpreadsheet,
  Mail,
  FileX,
  XCircle,
  Wrench,
  Map,
  ChevronDown,
  Send,
  User,
  Building,
  Phone,
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'sop' | 'graph' | 'rag'>('sop');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const faqs = [
    {
      q: 'What types of businesses do you work with?',
      a: 'We work primarily with owner-led SMBs, operations teams, e-commerce brands, and service businesses where daily manual tasks, spreadsheets, and approval delays slow down growth.',
    },
    {
      q: 'Do we need technical skills on our team?',
      a: 'No. ProcessPilot AI compiles your written plain-text SOPs automatically into executable workflow graphs. Our visual console gives non-technical managers complete control.',
    },
    {
      q: 'How does the human approval safety lock work?',
      a: 'When an AI decision step encounters high financial impact (e.g. refunds exceeding ₹5,000) or low confidence, execution automatically pauses and routes an authorization card to your Approvals Inbox.',
    },
    {
      q: 'Do you sell specific software or AI tools?',
      a: 'We are vendor-neutral. We connect directly with your existing APIs, databases, Google Workspace, and AI models (Gemini, Groq, OpenAI) without forcing proprietary lock-in.',
    },
  ];

  return (
    <>
      <Head>
        <title>ProcessPilot AI — Business Process & AI Orchestration Platform</title>
        <meta
          name="description"
          content="Transform plain-text SOPs into visually inspectable, auditable multi-agent workflow graphs with automated threshold guardrails and grounded policy citations."
        />
      </Head>

      <div className="min-h-screen bg-[#0D1117] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Fixed Top Navigation Bar */}
        <nav className="h-16 border-b border-[#30363D] bg-[#161B22]/90 backdrop-blur-md px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 p-0.5 flex items-center justify-center">
              <img src="/logo.svg" alt="ProcessPilot AI" className="w-7 h-7" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-slate-100">
              ProcessPilot<span className="text-cyan-400">.AI</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-300">
            <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">
              How It Works
            </a>
            <a href="#problem" className="hover:text-cyan-400 transition-colors">
              The Problem
            </a>
            <a href="#services" className="hover:text-cyan-400 transition-colors">
              Services
            </a>
            <a href="#faq" className="hover:text-cyan-400 transition-colors">
              FAQ
            </a>
            <a href="#contact" className="hover:text-cyan-400 transition-colors">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#21262D] transition-all font-mono"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 transition-all font-mono flex items-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              Launch Console <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </nav>

        {/* HERO SECTION (ProcessPilot AI Consulting & Orchestration) */}
        <section id="hero" className="px-6 md:px-12 py-16 md:py-24 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
              AI Business Consulting & Multi-Agent Engine
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-slate-100">
              Make your business <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">AI-ready</span> without wasting money on the wrong tools.
            </h1>

            <ul className="space-y-3 text-xs md:text-sm font-mono text-slate-300">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-500/20">
                  <Check className="w-3 h-3 text-cyan-400" />
                </span>
                <span>Workflow study before any tool recommendation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                  <Check className="w-3 h-3 text-amber-400" />
                </span>
                <span>AI opportunities identified and ranked by business impact</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                  <Check className="w-3 h-3 text-emerald-400" />
                </span>
                <span>Vendor-neutral — we recommend what fits, not what sells</span>
              </li>
            </ul>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#contact"
                className="px-8 py-4 rounded-xl text-sm font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center gap-2.5 font-mono shadow-lg shadow-cyan-500/20"
              >
                Book a Free Consultation <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#how-it-works"
                className="px-8 py-4 rounded-xl text-sm font-bold text-slate-200 bg-[#161B22] border border-[#30363D] hover:bg-[#21262D] transition-all flex items-center gap-2 font-mono"
              >
                See What We Assess
              </a>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#30363D]/60 max-w-lg text-left">
              <div>
                <p className="text-xl font-bold font-display text-slate-100">Free</p>
                <p className="mt-0.5 text-xs font-mono text-slate-400">First consultation</p>
              </div>
              <div>
                <p className="text-xl font-bold font-display text-cyan-400">End-to-end</p>
                <p className="mt-0.5 text-xs font-mono text-slate-400">Support available</p>
              </div>
              <div>
                <p className="text-xl font-bold font-display text-emerald-400">45+ yrs</p>
                <p className="mt-0.5 text-xs font-mono text-slate-400">Group experience</p>
              </div>
            </div>
          </div>

          {/* Right Floating Node Map Diagram */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="w-full max-w-md operator-card p-6 rounded-2xl space-y-4 bg-[#161B22]/90 border border-[#30363D] shadow-2xl relative z-10">
              <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>PROCESS MAP & AI OPPORTUNITIES</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Live Audit
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-400 text-[10px] uppercase font-bold">
                    <Search className="w-3 h-3" /> Process Study
                  </div>
                  <p className="text-slate-100 font-bold text-xs">47 Workflows</p>
                  <p className="text-[10px] text-slate-500">Documented & mapped</p>
                </div>

                <div className="p-3 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-400 text-[10px] uppercase font-bold">
                    <GitBranch className="w-3 h-3" /> Workflow Map
                  </div>
                  <p className="text-slate-100 font-bold text-xs">12 Bottlenecks</p>
                  <p className="text-[10px] text-slate-500">Identified & flagged</p>
                </div>

                <div className="p-3 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] uppercase font-bold">
                    <Zap className="w-3 h-3" /> AI Opportunities
                  </div>
                  <p className="text-slate-100 font-bold text-xs">9 Identified</p>
                  <p className="text-[10px] text-slate-500">Ranked by ROI</p>
                </div>

                <div className="p-3 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] uppercase font-bold">
                    <TrendingUp className="w-3 h-3" /> Dashboard Ready
                  </div>
                  <p className="text-slate-100 font-bold text-xs">Real-time KPIs</p>
                  <p className="text-[10px] text-slate-500">Full audit telemetry</p>
                </div>

                <div className="p-3 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 text-[10px] uppercase font-bold">
                    <Clock className="w-3 h-3" /> Efficiency Gain
                  </div>
                  <p className="text-amber-300 font-bold text-xs">~30–40% Saved</p>
                  <p className="text-[10px] text-slate-500">Manual effort cut</p>
                </div>

                <div className="p-3 rounded-xl guardrail-node space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 text-[10px] uppercase font-bold">
                    <Lock className="w-3 h-3" /> Human Lock
                  </div>
                  <p className="text-amber-200 font-bold text-xs">Safety Gate</p>
                  <p className="text-[10px] text-amber-400/80">Thresholds protected</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: THE REAL PROBLEM */}
        <section id="problem" className="px-6 md:px-12 py-20 bg-[#161B22]/50 border-y border-[#30363D]">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="inline-block px-4 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-bold uppercase tracking-wider">
                The Real Problem
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-slate-100">
                AI is everywhere. <br />
                <span className="text-cyan-400">Your workflow is still manual.</span>
              </h2>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                Most businesses don't have an AI problem — they have a process visibility problem. No one has mapped where the friction actually is.
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
                    <span className="text-xs font-mono text-slate-400 ml-2">Operations overview</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    8 pending
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="font-semibold text-slate-200 text-[11px]">Has the boss approved this?</p>
                        <span className="text-slate-500 text-[10px]">WhatsApp · 3 hrs ago</span>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  </div>

                  <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                      <div>
                        <p className="font-semibold text-slate-200 text-[11px]">Inventory_v7_FINAL_USE THIS.xlsx</p>
                        <span className="text-slate-500 text-[10px]">Excel · Last edited by 3 people</span>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  </div>

                  <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-rose-400" />
                      <div>
                        <p className="font-semibold text-slate-200 text-[11px]">Q4 Sales Report — OVERDUE</p>
                        <span className="text-slate-500 text-[10px]">Due: last Monday</span>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  </div>

                  <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="font-semibold text-slate-200 text-[11px]">Re: Re: Re: Invoice approval</p>
                        <span className="text-slate-500 text-[10px]">Email chain · 12 replies</span>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-slate-500 shrink-0" />
                  </div>

                  <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileX className="w-4 h-4 text-orange-400" />
                      <div>
                        <p className="font-semibold text-slate-200 text-[11px]">Purchase PO #4421 — no reply</p>
                        <span className="text-slate-500 text-[10px]">Approval pending · 4 days</span>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                  </div>

                  <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="font-semibold text-slate-200 text-[11px]">47 rows to update manually</p>
                        <span className="text-slate-500 text-[10px]">Data entry · Est. 2 hrs</span>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-500 italic text-center pt-2">
                  "This is what 'managed by WhatsApp and Excel' looks like at scale."
                </div>
              </div>

              {/* Right Common Patterns Grid */}
              <div className="lg:col-span-7 space-y-4">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  COMMON PATTERNS WE FIND:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-1">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4" /> Too much work happens manually
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Operators re-read static policy documents repeatedly for every request.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-1">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <FileSpreadsheet className="w-4 h-4" /> Excel & WhatsApp run ops
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Critical decisions live in unmonitored chat channels and loose sheets.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-1">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                      <EyeOff className="w-4 h-4" /> Owners lack real-time visibility
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      No central telemetry dashboard showing live execution progress.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-1">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                      <Clock className="w-4 h-4" /> Reports are slow and unreliable
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      End-of-month reporting rushes lead to manual input errors.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-1">
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                      <Layers className="w-4 h-4" /> Teams repeat the same work
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Multiple staff members verify the exact same data points independently.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-1">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <MessageSquare className="w-4 h-4" /> Approvals depend on follow-up
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      High-impact actions stall waiting for email approval responses.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-1">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                      <FileX className="w-4 h-4" /> Tools are disconnected
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      APIs, databases, and AI prompts lack unified workflow orchestration.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-1">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                      <HelpCircle className="w-4 h-4" /> AI feels important but unclear
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Unsure where LLMs add real value vs causing financial risk.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote Banner */}
            <div className="p-6 rounded-2xl bg-[#0D1117] border border-[#30363D] text-center max-w-4xl mx-auto">
              <p className="text-slate-200 font-display font-semibold text-lg md:text-xl leading-relaxed">
                "The problem isn't your people. It's that no one has mapped your workflows and identified where the friction actually is."
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: INTERACTIVE SOP COMPILER DEMONSTRATION */}
        <section id="how-it-works" className="px-6 md:px-12 py-20 max-w-5xl mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
            <span className="inline-block px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              HOW IT WORKS
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100">
              Interactive SOP-to-Workflow Engine Demonstration
            </h2>
          </div>

          <div className="operator-card p-6 rounded-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#30363D] pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Live Compiler & RAG Grounding Engine
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

        {/* SECTION 4: SERVICES OFFERED */}
        <section id="services" className="px-6 md:px-12 py-20 bg-[#161B22]/30 border-y border-[#30363D]">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="inline-block px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                OUR SERVICES
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-slate-100">
                End-to-End AI & Process Consulting
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="operator-card p-8 rounded-2xl space-y-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-display text-slate-100">Workflow Mapping & Assessment</h3>
                <p className="text-slate-400 text-xs leading-relaxed font-sans">
                  We study your team's day-to-day operations, identify manual bottlenecks, Excel dependencies, and map every process step before recommending any tools.
                </p>
              </div>

              <div className="operator-card p-8 rounded-2xl space-y-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-display text-slate-100">AI & Automation Roadmap</h3>
                <p className="text-slate-400 text-xs leading-relaxed font-sans">
                  Prioritised, high-ROI AI opportunity matrix. We rank implementations by impact, ease, and risk so you only invest in tools that deliver measurable time savings.
                </p>
              </div>

              <div className="operator-card p-8 rounded-2xl space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-display text-slate-100">Implementation Support</h3>
                <p className="text-slate-400 text-xs leading-relaxed font-sans">
                  Hands-on setup, visual workflow configuration, human approval safety gates, and team training. Vendor-neutral recommendations built for long-term control.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: FREQUENTLY ASKED QUESTIONS */}
        <section id="faq" className="px-6 md:px-12 py-20 max-w-4xl mx-auto w-full space-y-10">
          <div className="text-center space-y-3">
            <span className="inline-block px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              FAQ
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-slate-100">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="operator-card rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between font-display font-semibold text-slate-200 hover:text-cyan-400 transition-colors text-sm md:text-base"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180 text-cyan-400' : 'text-slate-400'}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-400 font-sans leading-relaxed border-t border-[#30363D]/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 6: FREE CONSULTATION CONTACT FORM */}
        <section id="contact" className="px-6 md:px-12 py-24 bg-[#161B22]/80 border-t border-[#30363D] relative">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-4">
              <span className="inline-block px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
                GET STARTED
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold text-slate-100">
                Ready to find out where AI can save your business time?
              </h2>
              <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto font-normal">
                Book a free 30-minute consultation. No pitch, no obligation — just an honest look at your business processes.
              </p>
            </div>

            <div className="operator-card p-8 rounded-2xl bg-[#0D1117] border border-[#30363D] shadow-2xl">
              {formSubmitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold font-display text-slate-100">Consultation Request Received!</h3>
                  <p className="text-slate-400 text-xs font-mono max-w-md mx-auto">
                    Thank you! We will review your process details and get in touch via email within 24 hours to confirm your consultation time slot.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-cyan-400" /> Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl bg-[#161B22] border border-[#30363D] text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-400 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-cyan-400" /> Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@company.com"
                        className="w-full px-4 py-3 rounded-xl bg-[#161B22] border border-[#30363D] text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-400 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-cyan-400" /> Company Name
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Acme Operations Corp"
                        className="w-full px-4 py-3 rounded-xl bg-[#161B22] border border-[#30363D] text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-400 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-cyan-400" /> Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 rounded-xl bg-[#161B22] border border-[#30363D] text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-400 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> Tell us about your main process bottlenecks
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="e.g. We process 50+ refund approvals daily over WhatsApp and update Excel manually..."
                      className="w-full px-4 py-3 rounded-xl bg-[#161B22] border border-[#30363D] text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-400 transition-all"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl text-sm font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 font-mono shadow-lg shadow-cyan-500/20"
                  >
                    Submit Consultation Request <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* FOOTER SECTION */}
        <footer className="mt-auto border-t border-[#30363D] bg-[#161B22] px-8 py-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 p-0.5 flex items-center justify-center">
                <img src="/logo.svg" alt="ProcessPilot AI" className="w-7 h-7" />
              </div>
              <div>
                <span className="font-display font-extrabold text-lg tracking-tight text-slate-100">
                  ProcessPilot<span className="text-cyan-400">.AI</span>
                </span>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  AI decides within boundaries. Workflow controls execution.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs font-mono text-slate-400">
              <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">
                How It Works
              </a>
              <a href="#problem" className="hover:text-cyan-400 transition-colors">
                Services
              </a>
              <a href="#faq" className="hover:text-cyan-400 transition-colors">
                FAQ
              </a>
              <a href="#contact" className="hover:text-cyan-400 transition-colors">
                Contact
              </a>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://www.linkedin.com/in/1syedrahilhussain/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-[#0D1117] border border-[#30363D] hover:bg-[#21262D] text-slate-300 hover:text-cyan-400 transition-all flex items-center gap-2 text-xs font-mono"
                title="ProcessPilot AI LinkedIn"
              >
                <Linkedin className="w-4 h-4 text-cyan-400" />
                <span>LinkedIn</span>
              </a>

              <a
                href="https://github.com/Syed-srh/ProcessPilotAi"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-[#0D1117] border border-[#30363D] hover:bg-[#21262D] text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-mono"
                title="ProcessPilot AI GitHub"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            </div>
          </div>

          <div className="max-w-7xl mx-auto border-t border-[#30363D]/60 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500">
            <span>&copy; {new Date().getFullYear()} ProcessPilot AI. All rights reserved.</span>
            <span className="text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> System Operational • v1.0 Production MVP
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}
