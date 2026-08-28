import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FolderGit2, 
  Trash2, 
  Edit3, 
  ShieldAlert, 
  Clock, 
  UserCheck, 
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { Finding, FindingStatus } from '../../types/finding.types';
import { SeverityBadge } from './SeverityBadge';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface FindingHeaderProps {
  finding: Finding;
  onStatusChange: (status: FindingStatus) => Promise<void>;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export const FindingHeader: React.FC<FindingHeaderProps> = ({
  finding,
  onStatusChange,
  onEditClick,
  onDeleteClick,
}) => {
  const navigate = useNavigate();
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const statuses: FindingStatus[] = [
    'OPEN',
    'IN_REVIEW',
    'REMEDIATION',
    'RESOLVED',
    'ACCEPTED_RISK',
    'REOPENED',
  ];

  const handleSelectStatus = async (newStatus: FindingStatus) => {
    setIsChangingStatus(true);
    try {
      await onStatusChange(newStatus);
    } finally {
      setIsChangingStatus(false);
    }
  };

  const getPriorityLabel = (priority: string) => {
    return priority;
  };

  return (
    <div className="p-6 rounded-2xl bg-bg-card border border-border-dark space-y-4 shadow-card-dark relative overflow-hidden">
      {/* Top ambient highlight */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-primary via-[#A78BFA] to-brand-secondary" />

      {/* Top Navigation & Project Link */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/findings"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors py-1 px-2 rounded-lg hover:bg-bg-elevated"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Findings</span>
          </Link>
          <span className="text-text-muted text-xs">/</span>
          <Link
            to={`/projects/${finding.projectId}`}
            className="inline-flex items-center gap-1.5 text-xs text-brand-hover hover:underline transition-colors"
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>{finding.projectName || finding.projectId}</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-text-muted">{finding.id}</span>
          <SeverityBadge severity={finding.severity} size="sm" />
        </div>
      </div>

      {/* Main Title Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div className="space-y-1.5 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-text-primary tracking-tight">
            {finding.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
            <span className="px-2 py-0.5 rounded bg-bg-surface border border-border-dark font-medium text-text-primary">
              {finding.vulnerabilityType}
            </span>
            <span>·</span>
            <span>Asset: <code className="font-mono text-brand-hover">{finding.asset}</code></span>
            <span>·</span>
            <span>Discovered: {new Date(finding.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Quick Action Controls */}
        <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
          {/* Status Changer Dropdown */}
          <Button
            to={`/assistant?projectId=${finding.projectId}&contextType=finding&contextId=${finding.id}`}
            variant="primary"
            size="sm"
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Ask AI About This Finding
          </Button>

          <div className="space-y-1 text-left">
            <div className="text-[10px] text-text-muted font-mono uppercase">Finding Lifecycle</div>
            <select
              value={finding.status}
              disabled={isChangingStatus}
              onChange={(e) => handleSelectStatus(e.target.value as FindingStatus)}
              className="py-1.5 px-3 rounded-lg bg-bg-elevated border border-border-dark text-xs font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  Status: {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={onEditClick}
            variant="outline"
            size="sm"
            icon={<Edit3 className="w-3.5 h-3.5" />}
          >
            Edit
          </Button>

          <button
            onClick={onDeleteClick}
            className="p-2 rounded-lg text-text-muted hover:text-[#EF4444] hover:bg-bg-elevated border border-border-dark hover:border-[#EF4444]/40 transition-colors"
            title="Delete finding"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Meta Telemetry Bar */}
      <div className="pt-3 border-t border-border-dark/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-2.5 rounded-xl bg-bg-surface border border-border-dark">
          <span className="text-[10px] text-text-muted font-mono uppercase block">Risk Score</span>
          <span className={`text-lg font-bold font-mono ${
            finding.riskScore >= 75 ? 'text-[#EF4444]' : finding.riskScore >= 50 ? 'text-[#F97316]' : 'text-[#22C55E]'
          }`}>
            {finding.riskScore} <span className="text-[10px] text-text-muted font-normal">/100</span>
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-bg-surface border border-border-dark">
          <span className="text-[10px] text-text-muted font-mono uppercase block">Priority Level</span>
          <span className="text-sm font-bold text-text-primary mt-1 block">
            {finding.priority}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-bg-surface border border-border-dark">
          <span className="text-[10px] text-text-muted font-mono uppercase block">HTTP Method / Protocol</span>
          <code className="text-xs font-bold font-mono text-brand-hover mt-1 block">
            {finding.method}
          </code>
        </div>

        <div className="p-2.5 rounded-xl bg-bg-surface border border-border-dark">
          <span className="text-[10px] text-text-muted font-mono uppercase block">Recorded By</span>
          <div className="text-xs font-semibold text-text-primary flex items-center gap-1 mt-1">
            <UserCheck className="w-3.5 h-3.5 text-brand-primary" />
            <span>{finding.createdBy}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
