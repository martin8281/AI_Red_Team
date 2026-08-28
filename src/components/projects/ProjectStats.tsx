import React from 'react';
import { ShieldAlert, Layers, TrendingUp, AlertTriangle } from 'lucide-react';
import { Project } from '../../types/project.types';
import { Card } from '../ui/Card';

interface ProjectStatsProps {
  project: Project;
}

export const ProjectStats: React.FC<ProjectStatsProps> = ({ project }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Total Findings */}
      <Card variant="default" className="p-4 bg-bg-card border-border-dark text-center space-y-1">
        <span className="text-[10px] font-mono font-semibold text-text-muted uppercase">
          Total Findings
        </span>
        <div className="text-2xl font-extrabold text-text-primary font-mono">
          {project.findingCount}
        </div>
        <span className="text-[10px] text-text-muted">Verified In Scope</span>
      </Card>

      {/* Critical */}
      <Card variant="default" className="p-4 bg-bg-card border-border-dark text-center space-y-1 hover:border-[#EF4444]/40">
        <span className="text-[10px] font-mono font-semibold text-[#EF4444] uppercase">
          Critical (P1)
        </span>
        <div className="text-2xl font-extrabold text-[#EF4444] font-mono">
          {project.criticalFindingCount}
        </div>
        <span className="text-[10px] text-text-muted">Immediate Action</span>
      </Card>

      {/* High */}
      <Card variant="default" className="p-4 bg-bg-card border-border-dark text-center space-y-1 hover:border-[#F97316]/40">
        <span className="text-[10px] font-mono font-semibold text-[#F97316] uppercase">
          High (P2)
        </span>
        <div className="text-2xl font-extrabold text-[#F97316] font-mono">
          {project.highFindingCount || 0}
        </div>
        <span className="text-[10px] text-text-muted">High Exploitability</span>
      </Card>

      {/* Medium */}
      <Card variant="default" className="p-4 bg-bg-card border-border-dark text-center space-y-1 hover:border-[#EAB308]/40">
        <span className="text-[10px] font-mono font-semibold text-[#EAB308] uppercase">
          Medium (P3)
        </span>
        <div className="text-2xl font-extrabold text-[#EAB308] font-mono">
          {project.mediumFindingCount || 0}
        </div>
        <span className="text-[10px] text-text-muted">Moderate Impact</span>
      </Card>

      {/* Low */}
      <Card variant="default" className="p-4 bg-bg-card border-border-dark text-center space-y-1 hover:border-[#22C55E]/40">
        <span className="text-[10px] font-mono font-semibold text-[#22C55E] uppercase">
          Low (P4)
        </span>
        <div className="text-2xl font-extrabold text-[#22C55E] font-mono">
          {project.lowFindingCount || 0}
        </div>
        <span className="text-[10px] text-text-muted">Hardening Items</span>
      </Card>

      {/* Risk Score */}
      <Card variant="default" className="p-4 bg-bg-card border-border-dark text-center space-y-1">
        <span className="text-[10px] font-mono font-semibold text-brand-hover uppercase">
          Risk Score
        </span>
        <div className={`text-2xl font-extrabold font-mono ${
          project.riskScore >= 75 ? 'text-[#EF4444]' : project.riskScore >= 50 ? 'text-[#F97316]' : 'text-brand-primary'
        }`}>
          {project.riskScore} <span className="text-xs font-normal text-text-muted">/100</span>
        </div>
        <span className="text-[10px] text-text-muted">Aggregate Impact</span>
      </Card>
    </div>
  );
};
