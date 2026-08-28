import React from 'react';
import { 
  ShieldAlert, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Sparkles,
  Flame
} from 'lucide-react';
import { AnalyticsOverview } from '../../types/analytics.types';
import { Card } from '../ui/Card';

interface AnalyticsOverviewCardsProps {
  overview: AnalyticsOverview;
}

export const AnalyticsOverviewCards: React.FC<AnalyticsOverviewCardsProps> = ({
  overview,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* 1. Overall Portfolio Risk */}
      <Card variant="default" className="p-4 bg-bg-card border-border-dark space-y-1.5 shadow-card-dark text-left">
        <div className="flex items-center justify-between text-text-muted">
          <span className="text-[10px] font-mono uppercase font-semibold">Portfolio Risk</span>
          <ShieldAlert className="w-3.5 h-3.5 text-brand-hover" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black font-mono text-brand-hover">
            {overview.overallRiskScore}
          </span>
          <span className="text-xs font-mono text-text-muted">/100</span>
        </div>
        <span className="text-[10px] font-mono text-text-muted block">
          Max Severity: {overview.maxRiskScore}/100
        </span>
      </Card>

      {/* 2. Total Findings */}
      <Card variant="default" className="p-4 bg-bg-card border-border-dark space-y-1.5 shadow-card-dark text-left">
        <div className="flex items-center justify-between text-text-muted">
          <span className="text-[10px] font-mono uppercase font-semibold">Total Findings</span>
          <Layers className="w-3.5 h-3.5 text-text-secondary" />
        </div>
        <div className="text-2xl font-black font-mono text-text-primary">
          {overview.totalFindings}
        </div>
        <span className="text-[10px] font-mono text-text-muted block">
          Tracked vulnerabilities
        </span>
      </Card>

      {/* 3. Critical Threat Vectors */}
      <Card variant="default" className="p-4 bg-bg-card border-border-dark space-y-1.5 shadow-card-dark text-left">
        <div className="flex items-center justify-between text-[#EF4444]">
          <span className="text-[10px] font-mono uppercase font-semibold">Critical Threat</span>
          <Flame className="w-3.5 h-3.5 text-[#EF4444]" />
        </div>
        <div className="text-2xl font-black font-mono text-[#EF4444]">
          {overview.criticalCount}
        </div>
        <span className="text-[10px] font-mono text-text-muted block">
          High: {overview.highCount} · Med: {overview.mediumCount}
        </span>
      </Card>

      {/* 4. Open / In Triage */}
      <Card variant="default" className="p-4 bg-bg-card border-border-dark space-y-1.5 shadow-card-dark text-left">
        <div className="flex items-center justify-between text-[#F97316]">
          <span className="text-[10px] font-mono uppercase font-semibold">Open Findings</span>
          <AlertTriangle className="w-3.5 h-3.5 text-[#F97316]" />
        </div>
        <div className="text-2xl font-black font-mono text-[#F97316]">
          {overview.openCount + overview.inProgressCount}
        </div>
        <span className="text-[10px] font-mono text-text-muted block">
          {overview.inProgressCount} in developer remediation
        </span>
      </Card>

      {/* 5. Verified Resolved */}
      <Card variant="default" className="p-4 bg-bg-card border-border-dark space-y-1.5 shadow-card-dark text-left">
        <div className="flex items-center justify-between text-[#22C55E]">
          <span className="text-[10px] font-mono uppercase font-semibold">Resolved / Verified</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
        </div>
        <div className="text-2xl font-black font-mono text-[#22C55E]">
          {overview.resolvedCount}
        </div>
        <span className="text-[10px] font-mono text-text-muted block">
          Verified by red team testers
        </span>
      </Card>

      {/* 6. Remediation Rate */}
      <Card variant="default" className="p-4 bg-bg-card border-border-dark space-y-1.5 shadow-card-dark text-left">
        <div className="flex items-center justify-between text-brand-primary">
          <span className="text-[10px] font-mono uppercase font-semibold">Remediation Rate</span>
          <TrendingUp className="w-3.5 h-3.5 text-brand-primary" />
        </div>
        <div className="text-2xl font-black font-mono text-brand-hover">
          {overview.remediationRate}%
        </div>
        <span className="text-[10px] font-mono text-text-muted block">
          Avg SLA: {overview.averageRemediationDays} days
        </span>
      </Card>
    </div>
  );
};
