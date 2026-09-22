import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  title?: string;
  subtitle?: string;
  noPadding?: boolean;
  hideHeader?: boolean;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  subtitle,
  noPadding = false,
  hideHeader = false,
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
      <div className="flex-1 flex flex-col md:pl-64 print:pl-0 print:m-0 print:w-full min-w-0 transition-all duration-200">
        {!hideHeader && (
          <Header
            title={title}
            subtitle={subtitle}
            onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          />
        )}

        <main className={noPadding ? "flex-1 w-full min-w-0 print:p-0 print:m-0 print:w-full print:max-w-none" : "flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 print:p-0 print:m-0 print:w-full print:max-w-none"}>
          {children}
        </main>

        {/* Minimal Dashboard Footer */}
        {!noPadding && (
          <footer className="border-t border-border-dark/60 bg-bg-surface py-4 px-6 text-center text-xs text-text-muted print:hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
              <span><span className="text-brand-primary font-semibold">AI</span> <span className="text-[#e00000] font-semibold">RED</span> <span className="text-white font-semibold">TEAM ASSISTANT</span> — Authorized Human-in-the-Loop Cybersecurity Platform</span>
              <span className="font-mono">© 2026 AI Red Team Assistant</span>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};
