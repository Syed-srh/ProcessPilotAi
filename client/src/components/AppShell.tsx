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
  ShieldAlert,
  Cpu,
  Linkedin,
  Github,
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
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'OPERATOR':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-slate-100 flex flex-col font-sans">
      {/* Top Header Navigation */}
      <header className="h-14 border-b border-[#30363D] bg-[#161B22] sticky top-0 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 flex items-center justify-center">
              <img src="/logo.svg" alt="ProcessPilot AI" className="w-7 h-7" />
            </div>
            <span className="font-display font-extrabold text-base tracking-tight text-slate-100">
              ProcessPilot<span className="text-cyan-400">.AI</span>
            </span>
          </Link>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Console v1.0
          </span>
        </div>

        {/* Right User Actions */}
        <div className="flex items-center gap-4">
          <NotificationDrawer />

          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#0D1117] border border-[#30363D] text-xs font-mono text-cyan-400">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Gemini Primary</span>
          </div>

          {user && (
            <div className="flex items-center gap-3 border-l border-[#30363D] pl-4">
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-slate-200">{user.name}</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[9px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.2 rounded border ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                  {user.canApprove && (
                    <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1 rounded flex items-center gap-0.5">
                      <ShieldAlert className="w-2.5 h-2.5" /> Approver
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 rounded-md hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left Sidebar Nav */}
        <aside className="w-60 border-r border-[#30363D] bg-[#161B22]/60 p-4 flex flex-col justify-between hidden md:flex">
          <nav className="space-y-1">
            <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
              Operator Console
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href || (item.href !== '/dashboard' && router.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-xs transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#21262D]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* SOP Core Thesis Box & Footer Links */}
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-1">
              <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Control Thesis
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed italic font-mono">
                "AI decides within boundaries. Workflow controls execution. Humans control high-risk actions."
              </p>
            </div>

            <div className="flex items-center justify-between px-1 text-[11px] font-mono text-slate-400">
              <a
                href="https://www.linkedin.com/in/1syedrahilhussain/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-400 flex items-center gap-1 transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5 text-cyan-400" /> LinkedIn
              </a>
              <a
                href="https://github.com/Syed-srh/ProcessPilotAi"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white flex items-center gap-1 transition-colors"
              >
                <Github className="w-3.5 h-3.5" /> GitHub
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
          <div>{children}</div>

          {/* Console Footer */}
          <footer className="mt-12 pt-6 border-t border-[#30363D]/60 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-2">
            <span>&copy; {new Date().getFullYear()} ProcessPilot AI • Multi-Agent Operator Console</span>
            <div className="flex items-center gap-4">
              <a href="https://www.linkedin.com/in/1syedrahilhussain/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">
                LinkedIn
              </a>
              <a href="https://github.com/Syed-srh/ProcessPilotAi" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300">
                GitHub
              </a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
