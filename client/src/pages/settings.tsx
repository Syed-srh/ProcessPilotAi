import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { AppShell } from '../components/AppShell';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuthStore } from '../store/authStore';
import { getCurrentPolicy, uploadPolicyDocument, PolicyDocument } from '../services/knowledge';
import { FileText, Upload, CheckCircle2, ShieldCheck, Database, FileCode, AlertCircle, RefreshCw } from 'lucide-react';

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

        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              <Database className="w-7 h-7 text-indigo-400" /> System Settings & Policy Grounding (RAG)
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Configure system parameters, user profile, and active company policy documents for AI Decision Agent grounding.
            </p>
          </div>

          {/* User Profile Card */}
          <div className="glass-panel p-6 rounded-2xl border border-border">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> User Profile & Role Capabilities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-border">
                <span className="text-xs text-slate-400 uppercase font-mono block mb-1">Name</span>
                <span className="font-semibold text-slate-200">{user?.name}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-border">
                <span className="text-xs text-slate-400 uppercase font-mono block mb-1">Email</span>
                <span className="font-semibold text-slate-200">{user?.email}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-border">
                <span className="text-xs text-slate-400 uppercase font-mono block mb-1">Role & Permissions</span>
                <span className="font-semibold text-indigo-400">{user?.role}</span>
                {user?.canApprove && (
                  <span className="ml-2 px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Can Action Approvals
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Policy RAG Upload Section */}
          <div className="glass-panel p-6 rounded-2xl border border-border space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" /> Refund Policy Document Management (RAG Grounding)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Upload written company policy. The Decision Agent will perform RAG vector similarity search against these clauses to ground decisions and cite policy text in execution timelines.
                </p>
              </div>

              {policyDoc && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold shrink-0">
                  <CheckCircle2 className="w-4 h-4" /> Policy Active ({policyDoc.chunkCount} Vector Chunks)
                </div>
              )}
            </div>

            {successMsg && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                  Document Title
                </label>
                <input
                  type="text"
                  value={policyTitle}
                  onChange={(e) => setPolicyTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-border text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                  Refund Policy Plain Text / Content
                </label>
                <textarea
                  rows={8}
                  value={policyText}
                  onChange={(e) => setPolicyText(e.target.value)}
                  required
                  placeholder="Paste written company policy content here..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-border text-slate-100 placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  Vector Engine: <code className="text-indigo-400 font-mono">Google Gemini text-embedding-004</code> + Cosine Similarity
                </span>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-primary-600 hover:from-indigo-500 hover:to-primary-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Indexing Vectors...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" /> Index & Save Policy
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
