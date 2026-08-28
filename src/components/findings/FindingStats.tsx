import React from 'react';
import { FindingStatsData } from '../../types/finding.types';
import { Card } from '../ui/Card';

interface FindingStatsProps {
  stats: FindingStatsData;
}

export const FindingStats: React.FC<FindingStatsProps> = ({ stats }) => {
  return (
    <div className="space-y-3">
      {/* Top Row: Severity Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Findings */}
        <Card variant="default" className="p-4 bg-bg-card border-border-dark text-center space-y-1">
          <span className="text-[10px] font-mono font-semibold text-text-muted uppercase">
            Total Logged
          </span>
          <div className="text-2xl font-extrabold text-text-primary font-mono">
            {stats.total}
          </div>
          <span className="text-[10px] text-text-muted">All Scopes</span>
        </Card>

        {/* Critical */}
        <Card variant="default" className="p-4 bg-bg-card border-border-dark text-center space-y-1 hover:border-[#EF4444]/40 transition-colors">
          <span className="text-[10px] font-mono font-semibold text-[#EF4444] uppercase">
            Critical
          </span>
          <div className="text-2xl font-extrabold text-[#EF4444] font-mono">
            {stats.bySeverity.critical}
          </div>
          <span className="text-[10px] text-text-muted">P1 Immediate</span>
        </Card>

        {/* High */}
        <Card variant="default" className="p-4 bg-bg-card border-border-dark text-center space-y-1 hover:border-[#F97316]/40 transition-colors">
          <span className="text-[10px] font-mono font-semibold text-[#F97316] uppercase">
            High
          </span>
          <div className="text-2xl font-extrabold text-[#F97316] font-mono">
            {stats.bySeverity.high}
          </div>
          <span className="text-[10px] text-text-muted">P2 High Risk</span>
        </Card>

        {/* Medium */}
        <Card variant="default" className="p-4 bg-bg-card border-border-dark text-center space-y-1 hover:border-[#EAB308]/40 transition-colors">
          <span className="text-[10px] font-mono font-semibold text-[#EAB308] uppercase">
            Medium
          </span>
          <div className="text-2xl font-extrabold text-[#EAB308] font-mono">
            {stats.bySeverity.medium}
          </div>
          <span className="text-[10px] text-text-muted">P3 Moderate</span>
        </Card>

        {/* Low */}
        <Card variant="default" className="p-4 bg-bg-card border-border-dark text-center space-y-1 hover:border-[#22C55E]/40 transition-colors">
          <span className="text-[10px] font-mono font-semibold text-[#22C55E] uppercase">
            Low
          </span>
          <div className="text-2xl font-extrabold text-[#22C55E] font-mono">
            {stats.bySeverity.low}
          </div>
          <span className="text-[10px] text-text-muted">P4 Minor</span>
        </Card>

        {/* Informational */}
        <Card variant="default" className="p-4 bg-bg-card border-border-dark text-center space-y-1 hover:border-[#3B82F6]/40 transition-colors">
          <span className="text-[10px] font-mono font-semibold text-[#3B82F6] uppercase">
            Info
          </span>
          <div className="text-2xl font-extrabold text-[#3B82F6] font-mono">
            {stats.bySeverity.informational}
          </div>
          <span className="text-[10px] text-text-muted">Recon / Trace</span>
        </Card>
      </div>

      {/* Secondary Status Strip */}
      <div className="p-3 rounded-xl bg-bg-card border border-border-dark flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-[11px] font-mono uppercase text-text-muted font-semibold">
          Remediation Lifecycle:
        </span>
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#EF4444]" />
            <span className="text-text-muted">Open:</span>
            <span className="font-bold text-text-primary">{stats.byStatus.open}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#EAB308]" />
            <span className="text-text-muted">In Review:</span>
            <span className="font-bold text-text-primary">{stats.byStatus.inReview}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-brand-primary" />
            <span className="text-text-muted">Remediation:</span>
            <span className="font-bold text-text-primary">{stats.byStatus.remediation}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
            <span className="text-text-muted">Resolved:</span>
            <span className="font-bold text-text-primary">{stats.byStatus.resolved}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
