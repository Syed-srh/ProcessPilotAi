import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { AppShell } from '../components/AppShell';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuthStore } from '../store/authStore';
import { getCurrentPolicy, uploadPolicyDocument, PolicyDocument } from '../services/knowledge';
import { FileText, Upload, CheckCircle2, ShieldCheck, Database, AlertCircle, RefreshCw } from 'lucide-react';

export default function Settings() {
  const { user } = useAuthStore();
  const [policyDoc, setPolicyDoc] = useState<PolicyDocument | null>(null);
  const [policyTitle, setPolicyTitle] = useState('Standard Refund & Return Policy');
  const [policyText, setPolicyText] = useState(
    `Standard Company Refund & Return Policy:

1. Auto-Approval Threshold: Refunds for valid return requests under ₹5,000 are automatically approved upon order validation.
2. Manager Review Requirement: Any refund request exceeding ₹5,000 requires explicit human approval from an authorized manager or administrator.
3. Return Window: Refund requests submitted within 30 days of item delivery are eligible for full monetary reimbursement.
4. Non-Refundable Items: Digital downloads, customized products, and items marked 'Final Sale' are strictly non-refundable.`
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchPolicy = async () => {
    setIsLoading(true);
    try {
      const res = await getCurrentPolicy();
      if (res.active && res.document) {
        setPolicyDoc(res.document);
        setPolicyTitle(res.document.title);
        setPolicyText(res.document.content);
      }
    } catch (err: any) {
      console.error('Failed to fetch policy:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const result = await uploadPolicyDocument(policyTitle, policyText);
      setSuccessMsg(`Policy uploaded successfully! Indexed into ${result.chunkCount} vector chunks for Decision Agent RAG grounding.`);
      await fetchPolicy();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to upload policy document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <Head>
          <title>Settings & Policy RAG — ProcessPilot AI</title>
        </Head>

        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div>
            <h1 className="text-xl font-extrabold text-slate-100 font-display flex items-center gap-2.5">
              <Database className="w-5 h-5 text-cyan-400" /> System Settings & Policy Grounding (RAG)
            </h1>
            <p className="text-slate-400 text-xs font-mono mt-1">
              Configure system parameters, user profile, and active company policy documents for AI Decision Agent grounding.
            </p>
          </div>

          {/* User Profile Card */}
          <div className="operator-card p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-200 font-display flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> User Profile & Role Capabilities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D]">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">NAME</span>
                <span className="font-semibold text-slate-200">{user?.name}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D]">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">EMAIL</span>
                <span className="font-semibold text-slate-200">{user?.email}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D]">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">ROLE & PERMISSIONS</span>
                <span className="font-semibold text-cyan-400">{user?.role}</span>
                {user?.canApprove && (
                  <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Can Action Approvals
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Policy RAG Upload Section */}
          <div className="operator-card p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#30363D]">
              <div>
                <h2 className="text-sm font-bold text-slate-100 font-display flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" /> Refund Policy Document Management (RAG Grounding)
                </h2>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Upload written company policy. The Decision Agent will perform RAG vector similarity search against these clauses to ground decisions and cite policy text in execution timelines.
                </p>
              </div>

              {policyDoc && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Policy Active ({policyDoc.chunkCount} Vector Chunks)
                </div>
              )}
            </div>

            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={policyTitle}
                  onChange={(e) => setPolicyTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0D1117] border border-[#30363D] text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                  Refund Policy Plain Text / Content
                </label>
                <textarea
                  rows={8}
                  value={policyText}
                  onChange={(e) => setPolicyText(e.target.value)}
                  required
                  placeholder="Paste written company policy content here..."
                  className="w-full px-3.5 py-3 rounded-lg bg-[#0D1117] border border-[#30363D] text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  Vector Engine: <code className="text-cyan-400">Google Gemini text-embedding-004</code> + Cosine Similarity
                </span>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-mono font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Indexing Vectors...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" /> Index & Save Policy
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
