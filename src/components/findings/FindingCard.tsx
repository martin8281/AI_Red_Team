import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, FolderGit2, Calendar, Target } from 'lucide-react';
import { Finding, FindingStatus } from '../../types/finding.types';
import { SeverityBadge } from './SeverityBadge';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

interface FindingCardProps {
  finding: Finding;
}

export const FindingCard: React.FC<FindingCardProps> = ({ finding }) => {
  const getStatusBadge = (status: FindingStatus) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="critical" size="sm" dot>OPEN</Badge>;
      case 'IN_REVIEW':
        return <Badge variant="medium" size="sm" dot>IN REVIEW</Badge>;
      case 'REMEDIATION':
        return <Badge variant="brand" size="sm" dot>REMEDIATION</Badge>;
      case 'RESOLVED':
        return <Badge variant="low" size="sm" dot>RESOLVED</Badge>;
      case 'ACCEPTED_RISK':
        return <Badge variant="neutral" size="sm">ACCEPTED RISK</Badge>;
      case 'REOPENED':
        return <Badge variant="high" size="sm" dot pulse>REOPENED</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <Card
      variant="default"
      hoverEffect
      className="p-5 bg-bg-card border-border-dark flex flex-col justify-between space-y-4 shadow-card-dark relative group transition-all duration-200"
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="font-mono text-[10px] text-text-muted">{finding.id}</span>
            <h4 className="text-sm font-bold text-text-primary group-hover:text-brand-hover transition-colors line-clamp-1">
              {finding.title}
            </h4>
          </div>
          <SeverityBadge severity={finding.severity} size="sm" />
        </div>

        {/* Project & Classification */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
          <div className="flex items-center gap-1">
            <FolderGit2 className="w-3.5 h-3.5 text-brand-primary shrink-0" />
            <span className="truncate max-w-[140px]">{finding.projectName || finding.projectId}</span>
          </div>
          <span>·</span>
          <span className="px-2 py-0.5 rounded bg-bg-surface border border-border-dark text-[11px] font-medium text-text-muted">
            {finding.vulnerabilityType}
          </span>
        </div>

        {/* Target Endpoint */}
        <div className="p-2.5 rounded-lg bg-bg-surface border border-border-dark font-mono text-[11px] text-text-secondary flex items-center gap-1.5 truncate">
          <Target className="w-3.5 h-3.5 text-brand-primary shrink-0" />
          <span className="px-1 py-0.5 rounded bg-bg-elevated text-brand-hover text-[10px] font-bold">
            {finding.method}
          </span>
          <span className="truncate">{finding.endpoint}</span>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
          {finding.description}
        </p>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-border-dark/60 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {getStatusBadge(finding.status)}
          <span className="font-mono font-bold text-text-primary text-[11px]">
            Risk: {finding.riskScore}
          </span>
        </div>

        <Link
          to={`/findings/${finding.id}`}
          className="inline-flex items-center gap-1 text-xs text-brand-hover hover:underline font-semibold"
        >
          <span>Inspect</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
};
