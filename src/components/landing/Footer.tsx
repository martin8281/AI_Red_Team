import React from 'react';
import { ShieldLogo } from '../../assets/logo/ShieldLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-bg-surface border-t border-border-dark py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand Info */}
          <div className="flex items-center gap-3">
            <ShieldLogo size={26} />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider">
                <span className="text-brand-primary">AI</span> <span className="text-[#e00000]">RED</span> <span className="text-white">TEAM ASSISTANT</span>
              </span>
              <span className="text-[11px] text-text-muted font-mono tracking-wider">
                Authorized Security Testing
              </span>
            </div>
          </div>

          {/* Quick links matching landing navigation */}
          <div className="flex items-center gap-6 text-xs text-text-muted">
            <a href="#features" className="hover:text-text-primary transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-text-primary transition-colors">
              How It Works
            </a>
            <a href="#security" className="hover:text-text-primary transition-colors">
              Security
            </a>
          </div>

          {/* Copyright notice */}
          <div className="text-xs text-text-muted font-mono">
            © 2026 AI Red Team Assistant
          </div>

        </div>
      </div>
    </footer>
  );
};
