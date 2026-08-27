import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AppShell } from '../../components/AppShell';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { api } from '../../services/api';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ProcessNode } from '../../components/workflow/customNodes/ProcessNode';
import {
  Sparkles,
  ArrowRight,
  Bot,
  Zap,
  CheckCircle,
  FileText,
  Save,
  RotateCcw,
} from 'lucide-react';

const SAMPLE_SOPS = [
  {
    title: 'Customer Refund SOP',
    text: 'When a customer submits a refund request, verify the order, check the refund policy, validate the refund amount, automatically approve refunds below ₹5,000, request manager approval for larger refunds, process the refund, and notify the customer via email.',
  },
  {
    title: 'Employee Onboarding SOP',
    text: 'When a new employee joins, create their account in the database, notify the IT team via webhook, assign onboarding tasks, validate required employee documentation, and send the employee a welcome email.',
  },
  {
    title: 'Invoice Approval SOP',
    text: 'When an invoice is submitted, validate vendor details, check invoice amount against purchase order, automatically approve invoices <= ₹10,000, require finance director approval for invoices > ₹10,000, process payment, and email confirmation.',
  },
];

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

export default function NewWorkflowPage() {
  const router = useRouter();
  const [sopText, setSopText] = useState(SAMPLE_SOPS[0].text);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [compilationResult, setCompilationResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompile = async (textToCompile = sopText) => {
    if (!textToCompile || textToCompile.length < 10) {
      setError('Please enter at least 10 characters of SOP text');
      return;
    }

    setIsCompiling(true);
    setError(null);

    try {
      const response = await api.post('/workflows/generate', { sopText: textToCompile });
      setCompilationResult(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to compile SOP into workflow');
    } finally {
      setIsCompiling(false);
    }
  };

  const handleSaveCompiledWorkflow = async () => {
    if (!compilationResult?.workflow) return;

    setIsSaving(true);
    try {
      const response = await api.post('/workflows', {
        name: compilationResult.workflow.name,
        description: compilationResult.workflow.description,
        sourceSopText: sopText,
        nodes: compilationResult.workflow.nodes,
        edges: compilationResult.workflow.edges,
        variables: compilationResult.workflow.variables,
      });

      const savedWorkflow = response.data.data.workflow;
      router.push(`/workflows/${savedWorkflow.id}`);
    } catch (err: any) {
      setError('Failed to save workflow to database');
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>AI SOP Compiler — ProcessPilot AI</title>
        </Head>

        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold font-mono mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Natural Language Workflow Compiler
              </div>
              <h1 className="text-2xl font-extrabold text-slate-100">Describe Process to Generate Workflow</h1>
              <p className="text-slate-400 text-sm mt-1">
                Paste your SOP or operational procedure in plain text. ProcessPilot AI transforms it into a visual, schema-validated executable graph.
              </p>
            </div>

            {compilationResult && (
              <button
                onClick={handleSaveCompiledWorkflow}
                disabled={isSaving}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 self-start md:self-auto"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving to Library...' : 'Save & Open in Editor'}
              </button>
            )}
          </div>

          {/* Sample SOP Selector Chips */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">Sample SOP Templates:</span>
            {SAMPLE_SOPS.map((sample) => (
              <button
                key={sample.title}
                onClick={() => {
                  setSopText(sample.text);
                  handleCompile(sample.text);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-border text-xs text-slate-300 hover:text-indigo-400 transition-all flex items-center gap-1.5 font-medium"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                {sample.title}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Prompt Input Box */}
            <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-border flex flex-col justify-between space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                  Standard Operating Procedure (SOP) Text
                </label>
                <textarea
                  value={sopText}
                  onChange={(e) => setSopText(e.target.value)}
                  rows={10}
                  placeholder="Paste your process description e.g. 'When a customer requests a refund, verify order, check policy...'"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-border text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                />

                {error && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                    {error}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleCompile()}
                disabled={isCompiling}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 via-indigo-600 to-cyan-500 hover:from-primary-500 hover:to-indigo-500 shadow-lg shadow-primary-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCompiling ? (
                  <span className="animate-pulse flex items-center gap-2">
                    <Bot className="w-4 h-4 animate-spin" /> Compiling SOP into Graph...
                  </span>
                ) : (
                  <>
                    Generate Executable Workflow <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Right Interactive Graph Preview */}
            <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-border flex flex-col min-h-[500px] relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-400" /> Compiled Graph Preview
                </h3>

                {compilationResult && (
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-400">Provider:</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-bold uppercase">
                      {compilationResult.providerUsed}
                    </span>
                    <span className="text-slate-500">({compilationResult.executionTimeMs}ms)</span>
                  </div>
                )}
              </div>

              {isCompiling ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center animate-bounce">
                    <Zap className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span>Parsing SOP & Validating Zod Graph Schema...</span>
                </div>
              ) : compilationResult?.workflow ? (
                <div className="flex-1 w-full h-[450px] relative rounded-2xl overflow-hidden border border-slate-800">
                  <ReactFlow
                    nodes={compilationResult.workflow.nodes as any}
                    edges={compilationResult.workflow.edges as any}
                    nodeTypes={nodeTypes as any}
                    fitView
                    className="bg-slate-950"
                  >
                    <Background gap={18} size={1} color="#1E293B" />
                    <Controls className="!bg-card !border-border !text-slate-300" />
                  </ReactFlow>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
                  <Bot className="w-12 h-12 mb-3 text-slate-700" />
                  <p className="text-sm font-medium">Click "Generate Executable Workflow" to see graph preview.</p>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm">
                    The compiler uses Gemini primary, Groq fallback, or deterministic builder to convert your SOP into nodes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
