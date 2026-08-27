import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { Bot, LogIn, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      const redirect = (router.query.redirect as string) || '/dashboard';
      router.push(redirect);
    } catch (err: any) {
      setFormError(err.message || 'Login failed');
    }
  };

  return (
    <>
      <Head>
        <title>Sign In — ProcessPilot AI</title>
      </Head>

      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 selection:bg-indigo-500 selection:text-white">
        <div className="w-full max-w-md">
          {/* Header Branding */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:scale-105 transition-transform">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-gradient">ProcessPilot AI</span>
            </Link>
            <h1 className="text-xl font-bold text-slate-100 mt-4">Welcome back</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to access your business process workspace</p>
          </div>

          {/* Login Card */}
          <div className="glass-panel p-8 rounded-3xl border border-border shadow-2xl">
            {(formError || error) && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{formError || error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@processpilot.ai"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-border text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-border text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 shadow-lg shadow-primary-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="animate-pulse">Authenticating...</span>
                ) : (
                  <>
                    Sign In <LogIn className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border/60 text-center">
              <p className="text-sm text-slate-400">
                Don't have an account?{' '}
                <Link href="/register" className="text-indigo-400 font-semibold hover:underline">
                  Create an operator account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
