import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  FolderGit2, 
  Layers, 
  Cpu, 
  ShieldAlert, 
  FileText, 
  Sliders, 
  Settings, 
  HelpCircle, 
  LogOut, 
  X,
  UserCheck,
  Database,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { ShieldLogo } from '../../assets/logo/ShieldLogo';
import { Badge } from '../ui/Badge';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onCloseMobile }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Projects', path: '/projects', icon: <FolderGit2 className="w-4 h-4" /> },
    { label: 'Findings', path: '/findings', icon: <Layers className="w-4 h-4" /> },
    { label: 'AI Assistant', path: '/assistant', icon: <Cpu className="w-4 h-4" /> },
    { label: 'Risk Analysis', path: '/risk-analysis', icon: <ShieldAlert className="w-4 h-4" /> },
    { label: 'Analytics', path: '/analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Reports', path: '/reports', icon: <FileText className="w-4 h-4" /> },
    { label: 'Knowledge Base', path: '/knowledge', icon: <Database className="w-4 h-4" /> },
    { label: 'Recommendations', path: '/recommendations', icon: <Sliders className="w-4 h-4" /> },
  ];

  const bottomItems = [
    { label: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const displayName = user?.name || 'Martin';
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
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <ShieldLogo size={30} />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider text-text-primary group-hover:text-white">
                <span className="text-brand-primary">AI</span> RED TEAM
              </span>
              <span className="text-[10px] text-text-muted font-mono tracking-widest uppercase">
                ASSISTANT
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
            Workspace
          </span>
          <nav className="space-y-1 pt-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-primary/15 text-brand-hover border border-brand-primary/30 font-semibold shadow-purple-subtle'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/70 border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-brand-primary' : 'text-text-muted'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
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
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                }`}
              >
                <span className="text-text-muted">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Card */}
        <div className="p-3 rounded-xl bg-bg-card border border-border-dark flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-brand-hover font-mono text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-text-primary truncate">
                {displayName}
              </div>
              <div className="text-[10px] text-text-muted truncate">
                {displayRole}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="text-text-muted hover:text-[#EF4444] p-1.5 rounded-lg hover:bg-bg-elevated transition-colors shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Always Visible) */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
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
