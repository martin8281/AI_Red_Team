import React, { useState } from 'react';
import { 
  FolderGit2, 
  Sparkles, 
  Plus, 
  FileText, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  RotateCw 
} from 'lucide-react';
import { EngagementState, WorkspaceOverview } from '../../types/workspace.types';
import { VALID_TRANSITIONS } from '../../services/workspaceService';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface EngagementHeaderProps {
  overview: WorkspaceOverview;
  onStateChange: (newState: EngagementState) => Promise<void>;
  isChangingState?: boolean;
}

export const EngagementHeader: React.FC<EngagementHeaderProps> = ({
  overview,
  onStateChange,
  isChangingState = false,
}) => {
  const { project, progress, engagementState, findingStats } = overview;
  const allowedNext = VALID_TRANSITIONS[engagementState] || [];

  const getStateBadge = (state: EngagementState) => {
    switch (state) {
      case 'COMPLETED':
        return <Badge variant="low" size="md" dot>COMPLETED</Badge>;
      case 'ASSESSMENT':
      case 'ANALYSIS':
        return <Badge variant="brand" size="md" dot pulse>{state}</Badge>;
      case 'REMEDIATION':
        return <Badge variant="high" size="md" dot>{state}</Badge>;
      case 'REPORTING':
        return <Badge variant="medium" size="md" dot>{state}</Badge>;
      case 'ARCHIVED':
        return <Badge variant="outline" size="md">ARCHIVED</Badge>;
      default:
        return <Badge variant="neutral" size="md">{state}</Badge>;
    }
  };

  return (
    <Card variant="default" className="p-6 bg-bg-card border-border-dark space-y-5 shadow-card-dark relative overflow-hidden">
      
      {/* Top Banner: Project Title, State & Transition Dropdown */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border-dark">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xs text-text-muted">{project.id}</span>
            {getStateBadge(engagementState)}
            <span className="text-xs font-mono text-text-muted">
              Framework: {project.projectType}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
            {project.name}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
            <span>Client: <strong className="text-text-primary">{project.organization}</strong></span>
            <span>·</span>
            <span>Lead Tester: <strong className="text-text-primary">{project.leadTester || 'Alex Vance'}</strong></span>
            <span>·</span>
            <span>Period: {project.startDate} to {project.endDate}</span>
          </div>
        </div>

        {/* State Transition Control */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-bg-surface p-3 rounded-xl border border-border-dark">
          <div className="text-left space-y-0.5">
            <span className="text-[10px] font-mono text-text-muted uppercase block">
              Controlled State Machine
            </span>
            <span className="text-xs font-bold text-text-primary">
              Current: {engagementState}
            </span>
          </div>

          {allowedNext.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                disabled={isChangingState}
                onChange={(e) => onStateChange(e.target.value as EngagementState)}
                value=""
                className="px-2.5 py-1.5 rounded-lg bg-bg-elevated border border-border-dark text-xs font-bold text-brand-hover focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer disabled:opacity-50"
              >
                <option value="" disabled>
                  Transition to...
                </option>
                {allowedNext.map((st) => (
                  <option key={st} value={st}>
                    → {st}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Progress Metric & Fast Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        
        {/* Progress Bar */}
        <div className="lg:col-span-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-text-muted uppercase font-semibold">
              Engagement Progress Pipeline
            </span>
            <span className="font-mono font-bold text-brand-hover">
              {progress}% <span className="text-text-muted font-normal">Completed</span>
            </span>
          </div>

          <div className="w-full bg-[#1E293B] h-3 rounded-full overflow-hidden p-0.5 border border-border-dark/60">
            <div
              className="h-full bg-gradient-to-r from-brand-primary via-brand-hover to-[#22C55E] rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-text-muted pt-0.5">
            <span>PLANNING</span>
            <span>SCOPING</span>
            <span>ASSESSMENT</span>
            <span>ANALYSIS</span>
            <span>REPORTING</span>
          </div>
        </div>

        {/* Telemetry Stats Strip */}
        <div className="lg:col-span-6 grid grid-cols-4 gap-2 text-center font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-bg-surface border border-border-dark">
            <span className="text-[10px] text-text-muted uppercase block">Findings</span>
            <span className="font-bold text-text-primary text-sm mt-0.5 block">
              {findingStats.total}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-bg-surface border border-border-dark">
            <span className="text-[10px] text-[#EF4444] uppercase block">Critical</span>
            <span className="font-bold text-[#EF4444] text-sm mt-0.5 block">
              {findingStats.critical}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-bg-surface border border-border-dark">
            <span className="text-[10px] text-[#22C55E] uppercase block">Verified</span>
            <span className="font-bold text-[#22C55E] text-sm mt-0.5 block">
              {findingStats.verifiedCount}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-bg-surface border border-border-dark">
            <span className="text-[10px] text-brand-hover uppercase block">Risk Score</span>
            <span className="font-bold text-brand-hover text-sm mt-0.5 block">
              {project.riskScore}/100
            </span>
          </div>
        </div>

      </div>

      {/* Quick Action Buttons Toolbar */}
      <div className="pt-3 border-t border-border-dark/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            to={`/findings/new?projectId=${project.id}`}
            variant="outline"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Finding
          </Button>

          <Button
            to={`/risk-analysis`}
            variant="outline"
            size="sm"
            icon={<ShieldAlert className="w-3.5 h-3.5" />}
          >
            Risk Engine
          </Button>

          <Button
            to={`/reports/new?projectId=${project.id}`}
            variant="outline"
            size="sm"
            icon={<FileText className="w-3.5 h-3.5" />}
          >
            Generate Report
          </Button>
        </div>

        <Button
          to={`/assistant?projectId=${project.id}&contextType=project`}
          variant="primary"
          size="sm"
          icon={<Sparkles className="w-3.5 h-3.5" />}
        >
          Ask Co-Pilot About Engagement
        </Button>
      </div>

    </Card>
  );
};
