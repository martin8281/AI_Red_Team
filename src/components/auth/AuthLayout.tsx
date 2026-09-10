import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import { ShieldLogo } from '../../assets/logo/ShieldLogo';
import { Badge } from '../ui/Badge';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footerText?: string;
  footerLink?: {
    text: string;
    to: string;
  };
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  footerText,
  footerLink,
}) => {
  return (
    <div className="min-h-screen bg-bg-main flex flex-col justify-between items-center px-4 py-8 sm:py-12 relative overflow-hidden bg-grid-pattern selection:bg-brand-primary selection:text-white">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* Top Header / Back Navigation */}
      <div className="w-full max-w-md flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors py-1 px-2 rounded-lg hover:bg-bg-elevated"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <Badge variant="brand" size="sm" dot>
          Authorized Access Only
        </Badge>
      </div>

      {/* Center Auth Card */}
      <div className="w-full max-w-md my-auto py-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3 mb-6">
          <Link to="/" className="inline-flex items-center justify-center transition-transform hover:scale-105">
            <ShieldLogo size={44} />
          </Link>
          <div>
            <span className="text-xs font-mono font-bold tracking-widest uppercase block">
              <span className="text-brand-primary">AI</span> <span className="text-[#e00000]">RED</span> <span className="text-white">TEAM ASSISTANT</span>
            </span>
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight mt-1">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-text-secondary mt-1 max-w-xs mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Main Card Container */}
        <div className="p-6 sm:p-8 rounded-2xl bg-bg-card border border-border-dark shadow-2xl backdrop-blur-xl relative">
          {/* Subtle top border gradient */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent rounded-t-2xl" />

          {children}

          {footerText && footerLink && (
            <div className="mt-6 pt-5 border-t border-border-dark/80 text-center text-xs text-text-muted">
              <span>{footerText} </span>
              <Link
                to={footerLink.to}
                className="text-brand-hover font-semibold hover:underline focus:outline-none focus:ring-1 focus:ring-brand-primary rounded"
              >
                {footerLink.text}
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* Bottom Footer Security Status */}
      <div className="w-full max-w-md pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-text-muted">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>Human-in-the-Loop Security</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-brand-primary" />
          <span>Encrypted Session Management</span>
        </div>
      </div>

    </div>
  );
};
