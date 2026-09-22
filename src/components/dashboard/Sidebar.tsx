import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  FolderGit2, 
  Layers, 
  Cpu, 
  ShieldAlert, 
  FileText, 
  Database, 
  Sliders, 
  Settings, 
  LogOut, 
  X,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { ShieldLogo } from '../../assets/logo/ShieldLogo';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onCloseMobile }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'AI Security Co-Pilot', path: '/assistant', icon: <Sparkles className="w-4 h-4 text-[#A78BFA]" />, isPrimary: true },
    { label: 'Dashboard', path: '/dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Projects & Scope', path: '/projects', icon: <FolderGit2 className="w-4 h-4" /> },
    { label: 'Findings & Evidence', path: '/findings', icon: <Layers className="w-4 h-4" /> },
    { label: 'Risk Analysis', path: '/risk-analysis', icon: <ShieldAlert className="w-4 h-4" /> },
    { label: 'Analytics & Heatmap', path: '/analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Reports', path: '/reports', icon: <FileText className="w-4 h-4" /> },
    { label: 'Knowledge Base (RAG)', path: '/knowledge', icon: <Database className="w-4 h-4" /> },
  ];

  const bottomItems = [
    { label: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const displayName = user?.name || 'Alex Vance';
  const displayRole = user?.role || 'Security Tester';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-bg-surface border-r border-border-dark w-64 p-4 selection:bg-brand-primary selection:text-white">
      
      {/* Top Brand / Logo */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2 pt-2">
          <Link to="/assistant" className="flex items-center gap-2.5 group">
            <ShieldLogo size={32} />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider group-hover:text-white">
                <span className="text-brand-primary">AI</span> <span className="text-[#e00000]">RED</span> <span className="text-white">TEAM</span>
              </span>
              <span className="text-[10px] text-text-muted font-mono tracking-widest uppercase">
                CO-PILOT
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-bg-elevated"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <span className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-text-muted">
            Workspace Modules
          </span>
          <nav className="space-y-1.5 pt-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-primary/20 to-brand-primary/10 text-brand-hover border border-brand-primary/40 font-semibold shadow-purple-subtle'
                      : item.isPrimary
                      ? 'bg-[#101827] text-[#F8FAFC] hover:bg-[#151F32] border border-[#8B5CF6]/30 hover:border-[#8B5CF6]/60'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-brand-primary' : 'text-text-muted'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.isPrimary && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30">
                      MAIN
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section: Settings, Help, Profile, Logout */}
      <div className="space-y-3 pt-4 border-t border-border-dark/80">
        
        {/* Secondary Links */}
        <div className="space-y-1">
          {bottomItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-primary/15 text-brand-hover border border-brand-primary/30'
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated/50'
                }`}
              >
                <span className={isActive ? 'text-brand-primary' : 'text-text-muted'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Card Profile & Logout */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-bg-elevated/60 border border-border-dark/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-brand-hover text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-text-primary truncate">
                {displayName}
              </span>
              <span className="text-[10px] text-text-muted truncate font-mono">
                {displayRole}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="text-text-muted hover:text-[#EF4444] p-1.5 rounded-lg hover:bg-bg-card transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block fixed inset-y-0 left-0 w-64 h-screen z-30 print:hidden">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Modal/Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
