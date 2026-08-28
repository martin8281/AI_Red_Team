import React from 'react';
import { 
  ShieldAlert, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  UserCheck, 
  FileText, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export const SecurityPreview: React.FC = () => {
  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none">
      {/* Decorative ambient purple glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary/30 to-brand-dark/20 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition duration-1000 -z-10" />

      {/* Main Container Card */}
      <div className="rounded-2xl border border-border-dark bg-bg-card shadow-2xl overflow-hidden backdrop-blur-xl">
        
        {/* Dashboard Preview Window Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-bg-surface border-b border-border-dark">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#EF4444]/70 inline-block" />
            <span className="h-3 w-3 rounded-full bg-[#EAB308]/70 inline-block" />
            <span className="h-3 w-3 rounded-full bg-[#22C55E]/70 inline-block" />
            <span className="text-xs font-mono text-text-muted ml-2 font-medium tracking-wide">
              TARGET: <span className="text-text-secondary">auth-gateway.internal</span>
            </span>
          </div>
          <Badge variant="brand" size="sm" dot pulse>
            AI ASSISTANT ACTIVE
          </Badge>
        </div>

        {/* Header Strip */}
        <div className="p-4 sm:p-5 border-b border-border-dark/80 bg-gradient-to-r from-bg-elevated to-bg-card flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-brand-primary/10 border border-brand-primary/30 text-brand-primary">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-semibold tracking-wider text-text-muted uppercase">
                Product Preview
              </h4>
              <h3 className="text-sm sm:text-base font-bold text-text-primary">
                AI SECURITY ANALYSIS
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted bg-bg-surface px-2.5 py-1 rounded-md border border-border-dark">
            <UserCheck className="w-3.5 h-3.5 text-brand-primary" />
            <span>Human Tester in Control</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4">
          
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Risk Score Card */}
            <div className="p-3.5 rounded-xl bg-bg-elevated border border-border-dark flex flex-col justify-between">
              <span className="text-xs font-medium text-text-muted">Risk Score</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-text-primary font-mono">
                  82 <span className="text-xs font-normal text-text-muted">/ 100</span>
                </span>
                <span className="flex items-center text-[11px] font-medium text-[#EF4444]">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> High
                </span>
              </div>
              <div className="w-full bg-[#1E293B] h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-gradient-to-r from-brand-primary via-[#F97316] to-[#EF4444] h-full w-[82%] rounded-full" />
              </div>
            </div>

            {/* Severity Breakdown */}
            <div className="p-3.5 rounded-xl bg-bg-elevated border border-border-dark flex flex-col justify-between col-span-1 sm:col-span-2">
              <div className="flex items-center justify-between text-xs font-medium text-text-muted">
                <span>Finding Severity Tally</span>
                <span className="text-[11px] text-text-muted">10 Total Verified</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                <div className="bg-bg-surface rounded-lg p-1.5 border border-border-dark text-center">
                  <div className="text-[10px] font-mono text-[#EF4444] font-bold">CRIT</div>
                  <div className="text-sm font-bold text-text-primary">1</div>
                </div>
                <div className="bg-bg-surface rounded-lg p-1.5 border border-[#F97316]/30 text-center">
                  <div className="text-[10px] font-mono text-[#F97316] font-bold">HIGH</div>
                  <div className="text-sm font-bold text-[#F97316]">3</div>
                </div>
                <div className="bg-bg-surface rounded-lg p-1.5 border border-border-dark text-center">
                  <div className="text-[10px] font-mono text-[#EAB308] font-bold">MED</div>
                  <div className="text-sm font-bold text-text-primary">4</div>
                </div>
                <div className="bg-bg-surface rounded-lg p-1.5 border border-border-dark text-center">
                  <div className="text-[10px] font-mono text-[#22C55E] font-bold">LOW</div>
                  <div className="text-sm font-bold text-text-primary">2</div>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Analyzed Finding Card */}
          <div className="p-4 rounded-xl bg-bg-elevated border border-border-dark hover:border-brand-primary/40 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border-dark/60">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#F97316]" />
                <span className="text-sm font-semibold text-text-primary">
                  SQL Injection
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="high" size="sm">
                  HIGH
                </Badge>
                <Badge variant="critical" size="sm">
                  Priority P1
                </Badge>
              </div>
            </div>

            {/* AI Analysis Insight */}
            <div className="mt-3 space-y-2">
              <div className="flex items-start gap-2 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-brand-primary mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-brand-hover">AI Analysis: </span>
                  <span className="text-text-secondary">
                    Authentication bypass risk detected via boolean-based parameter payload in user authentication endpoint.
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-bg-surface border border-border-dark text-[11px] font-mono text-text-muted space-y-1">
                <div className="text-text-secondary flex items-center justify-between">
                  <span>Target Parameter: <code className="text-brand-hover">req.body.username</code></span>
                  <span className="text-[10px] text-text-muted">CWE-89</span>
                </div>
                <div className="text-[11px] text-[#22C55E] flex items-center gap-1.5 pt-0.5">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>Recommendation: Enforce parameterized queries & bind parameters.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Human-in-the-Loop Status Strip */}
          <div className="p-3 rounded-lg bg-bg-surface border border-border-dark flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-text-secondary">
              <FileText className="w-3.5 h-3.5 text-brand-primary" />
              <span className="text-xs">Security Assessment Report Ready</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-brand-hover">
              <span>Ready for Review</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

        </div>

        {/* Visual Terminal/Telemetry Footer */}
        <div className="px-4 py-2 bg-[#050A14] border-t border-border-dark flex items-center justify-between text-[11px] font-mono text-text-muted">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
            <span>AI Co-Pilot: Standby for Tester Commands</span>
          </div>
          <span className="text-text-disabled">HUMAN_OVERSIGHT_STRICT</span>
        </div>

      </div>
    </div>
  );
};
