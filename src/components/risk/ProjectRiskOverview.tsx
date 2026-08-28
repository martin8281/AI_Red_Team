import React from 'react';
import { 
  ShieldAlert, 
  Layers, 
  TrendingUp, 
  Flame, 
  CheckCircle2, 
  FolderGit2 
} from 'lucide-react';
import { ProjectRiskSummary } from '../../types/risk.types';
import { Card } from '../ui/Card';

interface ProjectRiskOverviewProps {
  summary: ProjectRiskSummary;
}

export const ProjectRiskOverview: React.FC<ProjectRiskOverviewProps> = ({
  summary,
}) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30';
      case 'HIGH':
        return 'text-[#F97316] bg-[#F97316]/10 border-[#F97316]/30';
      case 'MODERATE':
        return 'text-[#EAB308] bg-[#EAB308]/10 border-[#EAB308]/30';
      case 'LOW':
      default:
        return 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
      {/* Overall Score Card */}
      <Card variant="default" className="md:col-span-4 p-6 bg-bg-card border-border-dark flex flex-col justify-between space-y-4 shadow-card-dark text-center">
        <div className="space-y-1">
          <span className="text-[11px] font-mono uppercase text-text-muted font-semibold">
            Overall Engagement Risk
          </span>
          <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-text-primary">
            {summary.overallScore}
            <span className="text-base font-normal text-text-muted"> / 100</span>
          </div>
        </div>

        <div className="space-y-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${getLevelColor(
              summary.riskLevel
            )}`}
          >
            <span>{summary.riskLevel} POSTURE</span>
          </span>
          <p className="text-[11px] text-text-muted">
            Derived deterministically from {summary.totalFindings} verified findings
          </p>
        </div>
      </Card>

      {/* Highest Finding & Severity Breakdown */}
      <Card variant="default" className="md:col-span-8 p-6 bg-bg-card border-border-dark flex flex-col justify-between space-y-4 shadow-card-dark">
        {/* Top highest finding highlight */}
        <div className="p-3.5 rounded-xl bg-bg-elevated border border-border-dark space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-[#EF4444] flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              <span>Highest Impact Threat</span>
            </span>
            <span className="text-xs font-mono font-bold text-[#EF4444]">
              Score: {summary.highestFindingScore} / 100
            </span>
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-text-primary truncate">
            {summary.highestFindingTitle}
          </h4>
        </div>

        {/* 4 Severity Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-bg-surface border border-border-dark">
            <span className="text-[10px] font-mono text-[#EF4444] uppercase font-semibold">
              Critical
            </span>
            <div className="text-xl font-bold font-mono text-[#EF4444] mt-0.5">
              {summary.criticalCount}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-bg-surface border border-border-dark">
            <span className="text-[10px] font-mono text-[#F97316] uppercase font-semibold">
              High
            </span>
            <div className="text-xl font-bold font-mono text-[#F97316] mt-0.5">
              {summary.highCount}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-bg-surface border border-border-dark">
            <span className="text-[10px] font-mono text-[#EAB308] uppercase font-semibold">
              Medium
            </span>
            <div className="text-xl font-bold font-mono text-[#EAB308] mt-0.5">
              {summary.mediumCount}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-bg-surface border border-border-dark">
            <span className="text-[10px] font-mono text-[#22C55E] uppercase font-semibold">
              Low
            </span>
            <div className="text-xl font-bold font-mono text-[#22C55E] mt-0.5">
              {summary.lowCount}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
