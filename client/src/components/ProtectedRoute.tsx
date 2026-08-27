import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import { Bot } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireApprovalCapability?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireApprovalCapability,
}) => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center animate-bounce">
          <Bot className="w-6 h-6 text-indigo-400" />
        </div>
        <p className="text-sm font-medium text-slate-400 animate-pulse">Initializing ProcessPilot Session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/20">
          <span className="text-2xl font-bold">403</span>
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">Access Restricted</h2>
        <p className="text-slate-400 text-sm max-w-md mb-6">
          Your role <code className="text-indigo-400">{user.role}</code> does not have permission to access this page.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (requireApprovalCapability && user.role !== 'ADMIN' && !user.canApprove) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-xl font-bold text-slate-100 mb-2">Approval Authorization Required</h2>
        <p className="text-slate-400 text-sm max-w-md mb-6">
          Acting on approval queues requires explicit approval authorization on your user account.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
