import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  GitFork,
  CheckSquare,
  PlayCircle,
  Settings,
  LogOut,
  User as UserIcon,
  ShieldAlert,
  Bot,
  Zap,
} from 'lucide-react';

import { NotificationDrawer } from './NotificationDrawer';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Workflows', href: '/workflows', icon: GitFork },
    { name: 'Approvals', href: '/approvals', icon: CheckSquare },
    { name: 'Executions', href: '/executions', icon: PlayCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'OPERATOR':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gradient">
              ProcessPilot AI
            </span>
          </Link>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
            v1.0 MVP
          </span>
        </div>

        {/* Right User Actions */}
        <div className="flex items-center gap-4">
          <NotificationDrawer />

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-border">
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs text-slate-400 font-mono">AI Provider: Gemini Primary</span>
          </div>

          {user && (
            <div className="flex items-center gap-3 border-l border-border pl-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-200">{user.name}</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded border ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                  {user.canApprove && (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1 rounded flex items-center gap-0.5">
                      <ShieldAlert className="w-2.5 h-2.5" /> Approver
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-border bg-card/40 backdrop-blur-sm p-4 flex flex-col justify-between hidden md:flex">
          <nav className="space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 font-mono">
              Core Operations
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md shadow-primary-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* SOP Thesis Banner */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-border/80">
            <div className="text-xs font-semibold text-indigo-400 mb-1 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" /> Core Thesis
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              "AI decides within boundaries. Workflow controls execution. Humans control high-risk actions."
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
