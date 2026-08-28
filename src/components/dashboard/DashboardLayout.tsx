import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  subtitle,
  children,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-main text-text-primary flex selection:bg-brand-primary selection:text-white">
      {/* Fixed Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 transition-all duration-200">
        <Header
          title={title}
          subtitle={subtitle}
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

        {/* Minimal Dashboard Footer */}
        <footer className="border-t border-border-dark/60 bg-bg-surface py-4 px-6 text-center text-xs text-text-muted">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <span>AI RED TEAM ASSISTANT — Authorized Human-in-the-Loop Cybersecurity Platform</span>
            <span className="font-mono">© 2026 AI Red Team Assistant</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
