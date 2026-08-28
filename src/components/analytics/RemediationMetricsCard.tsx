import React from 'react';
import { CheckCircle2, Clock, Sliders, AlertTriangle } from 'lucide-react';
import { AnalyticsOverview } from '../../types/analytics.types';
import { Card } from '../ui/Card';

interface RemediationMetricsCardProps {
  overview: AnalyticsOverview;
}

export const RemediationMetricsCard: React.FC<RemediationMetricsCardProps> = ({
  overview,
}) => {
  return (
    <Card variant="default" className="p-6 bg-bg-card border-border-dark space-y-5 shadow-card-dark text-left">
      <div className="flex items-center justify-between pb-3 border-b border-border-dark">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm sm:text-base font-bold text-text-primary">
            Remediation & SLA Resolution Velocity
          </h3>
        </div>
        <span className="text-xs font-mono text-brand-hover font-bold">
          {overview.remediationRate}% Resolved
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>Overall Portfolio Patch Rate</span>
          <span>{overview.resolvedCount} of {overview.totalFindings} Verified Fixed</span>
        </div>
        <div className="w-full bg-[#1E293B] h-3 rounded-full overflow-hidden p-0.5 border border-border-dark/60">
          <div
            className="h-full bg-gradient-to-r from-brand-primary to-[#22C55E] rounded-full transition-all duration-500"
            style={{ width: `${overview.remediationRate}%` }}
          />
        </div>
      </div>

      {/* SLA Triage Breakdown Cards */}
      <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
        <div className="p-3 rounded-xl bg-bg-surface border border-border-dark">
          <span className="text-[10px] text-text-muted uppercase block">Open / Untriaged</span>
          <span className="text-base font-bold text-[#F97316] mt-0.5 block">
            {overview.openCount}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-bg-surface border border-border-dark">
          <span className="text-[10px] text-text-muted uppercase block">In Engineering Fix</span>
          <span className="text-base font-bold text-brand-hover mt-0.5 block">
            {overview.inProgressCount}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-bg-surface border border-border-dark">
          <span className="text-[10px] text-text-muted uppercase block">Verified in Staging</span>
          <span className="text-base font-bold text-[#22C55E] mt-0.5 block">
            {overview.resolvedCount}
          </span>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-bg-surface border border-border-dark flex items-center justify-between text-xs font-mono text-text-muted">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-brand-primary" />
          <span>Average Remediation Turnaround:</span>
        </div>
        <span className="font-bold text-text-primary">
          {overview.averageRemediationDays} Days
        </span>
      </div>
    </Card>
  );
};
