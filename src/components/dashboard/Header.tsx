import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Menu, 
  ChevronDown, 
  User as UserIcon, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { Badge } from '../ui/Badge';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Dashboard',
  subtitle = 'Overview of your security testing activity',
  onOpenMobileMenu,
}) => {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setNotifMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.name || 'Martin';
  const displayRole = user?.role || 'Security Tester';
  const displayEmail = user?.email || 'tester@redteam.local';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const notifications = [
    {
      id: 'n1',
      title: 'AI Analysis Completed',
      desc: 'SQL Injection in /api/v1/auth/token categorized as CWE-89.',
      time: '12m ago',
      unread: true,
    },
    {
      id: 'n2',
      title: 'New High Severity Logged',
      desc: 'IDOR vulnerability verified in Order History endpoint.',
      time: '45m ago',
      unread: true,
    },
    {
      id: 'n3',
      title: 'Project Scope Synchronized',
      desc: 'Target scope auth-api.v2 updated with 4 new subdomains.',
      time: '2h ago',
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 z-20 bg-bg-surface/95 border-b border-border-dark backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 print:hidden">
      <div className="flex items-center justify-between">
        
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated border border-border-dark"
            aria-label="Open Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
              {title}
            </h1>
            <p className="text-xs text-text-muted hidden sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: Notifications & User Avatar Dropdown */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Notification Bell */}
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => {
                setNotifMenuOpen(!notifMenuOpen);
                setUserMenuOpen(false);
              }}
              className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated border border-border-dark transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
            </button>

            {/* Notification Dropdown */}
            {notifMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-bg-card border border-border-dark shadow-2xl p-4 space-y-3 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-border-dark">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                    <span className="text-xs font-bold text-text-primary">Notifications</span>
                  </div>
                  <Badge variant="brand" size="sm">2 New</Badge>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-2.5 rounded-lg border text-xs space-y-0.5 transition-colors ${
                        notif.unread
                          ? 'bg-bg-elevated border-brand-primary/30'
                          : 'bg-bg-surface border-border-dark text-text-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-text-primary">{notif.title}</span>
                        <span className="text-[10px] font-mono text-text-muted">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-text-secondary leading-snug">{notif.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                setNotifMenuOpen(false);
              }}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-bg-elevated border border-transparent hover:border-border-dark transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-brand-hover font-mono text-xs font-bold shrink-0">
                {initials}
              </div>

              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-text-primary leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] text-text-muted font-mono leading-tight">
                  {displayRole}
                </span>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-text-muted hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-bg-card border border-border-dark shadow-2xl p-2 space-y-1 z-50 animate-in fade-in duration-150">
                <div className="p-2.5 border-b border-border-dark/80">
                  <div className="text-xs font-bold text-text-primary">{displayName}</div>
                  <div className="text-[10px] font-mono text-text-muted truncate">{displayEmail}</div>
                  <div className="mt-1.5">
                    <Badge variant="brand" size="sm" dot>
                      {displayRole}
                    </Badge>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-text-muted" />
                    <span>Profile Details</span>
                  </button>
                  <button
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-text-muted" />
                    <span>Workspace Settings</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-border-dark/80">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
