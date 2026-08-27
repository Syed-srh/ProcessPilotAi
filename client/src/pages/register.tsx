import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import { Bot, UserPlus, AlertCircle } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('OPERATOR');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name || !email || !password) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    try {
      await register(name, email, password, role);
      router.push('/dashboard');
    } catch (err: any) {
      setFormError(err.message || 'Registration failed');
    }
  };

  return (
    <>
      <Head>
        <title>Create Account — ProcessPilot AI</title>
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
            <h1 className="text-xl font-bold text-slate-100 mt-4">Create your account</h1>
            <p className="text-slate-400 text-sm mt-1">Get started with AI-driven business process automation</p>
          </div>

          {/* Register Card */}
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
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Connor"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-border text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                  Work Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@company.com"
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
                  placeholder="At least 6 characters"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-border text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-border text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                >
                  <option value="OPERATOR">OPERATOR (Create, edit, execute workflows)</option>
                  <option value="ADMIN">ADMIN (Full access + approval authority)</option>
                  <option value="VIEWER">VIEWER (Read-only access)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 shadow-lg shadow-primary-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="animate-pulse">Creating Account...</span>
                ) : (
                  <>
                    Create Account <UserPlus className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border/60 text-center">
              <p className="text-sm text-slate-400">
                Already have an account?{' '}
                <Link href="/login" className="text-indigo-400 font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
