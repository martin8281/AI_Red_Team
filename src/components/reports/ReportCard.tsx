import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  ChevronRight, 
  FolderGit2, 
  Download, 
  Eye, 
  Archive, 
  Clock, 
  ShieldAlert, 
  CheckCircle2,
  Layers
} from 'lucide-react';
import { Report, ReportStatus } from '../../types/report.types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ReportCardProps {
  report: Report;
  onArchive?: (id: string) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onArchive,
}) => {
  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'READY':
        return <Badge variant="low" size="sm" dot>READY</Badge>;
      case 'DRAFT':
        return <Badge variant="neutral" size="sm">DRAFT</Badge>;
      case 'GENERATING':
        return <Badge variant="brand" size="sm" dot pulse>GENERATING</Badge>;
      case 'FAILED':
        return <Badge variant="critical" size="sm">FAILED</Badge>;
      case 'ARCHIVED':
        return <Badge variant="outline" size="sm">ARCHIVED</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <Card
      variant="default"
      hoverEffect
      className="p-6 bg-bg-card border-border-dark flex flex-col justify-between space-y-5 shadow-card-dark relative group transition-all duration-200"
    >
      <div className="space-y-3.5">
        {/* Header with Title & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-text-muted">{report.id}</span>
              <span className="font-mono text-[11px] font-bold text-brand-hover bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/30">
                {report.version}
              </span>
              {getStatusBadge(report.status)}
            </div>
            <Link
              to={`/reports/${report.id}`}
              className="text-base font-bold text-text-primary group-hover:text-brand-hover hover:underline transition-colors block line-clamp-1"
            >
              {report.title}
            </Link>
          </div>
        </div>

        {/* Project & Organization */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
          <div className="flex items-center gap-1.5">
            <FolderGit2 className="w-3.5 h-3.5 text-brand-primary" />
            <span className="font-medium text-text-primary">{report.projectName || report.projectId}</span>
          </div>
          <span>·</span>
          <span className="px-2 py-0.5 rounded bg-bg-surface border border-border-dark text-[11px]">
            {report.reportType}
          </span>
        </div>

        {/* Telemetry Metrics Bar */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-bg-surface border border-border-dark text-center font-mono text-xs">
          <div>
            <span className="text-[10px] text-text-muted uppercase block">Findings</span>
            <span className="font-bold text-text-primary text-sm mt-0.5 block">
              {report.findingsCount}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-text-muted uppercase block">Critical</span>
            <span className="font-bold text-[#EF4444] text-sm mt-0.5 block">
              {report.criticalCount}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-text-muted uppercase block">Risk Score</span>
            <span className="font-bold text-brand-hover text-sm mt-0.5 block">
              {report.overallRiskScore} <span className="text-[10px] text-text-muted font-normal">/100</span>
            </span>
          </div>
        </div>
      </div>

      {/* Footer & Actions */}
      <div className="pt-3 border-t border-border-dark/60 flex items-center justify-between gap-3 text-xs">
        <span className="text-[11px] font-mono text-text-muted">
          {new Date(report.generatedAt || report.createdAt).toLocaleDateString()}
        </span>

        <div className="flex items-center gap-2">
          {onArchive && report.status !== 'ARCHIVED' && (
            <button
              onClick={() => onArchive(report.id)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
              title="Archive Report"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
          )}

          <Button
            to={`/reports/${report.id}`}
            variant="primary"
            size="sm"
            icon={<Eye className="w-3.5 h-3.5" />}
          >
            Preview & Export
          </Button>
        </div>
      </div>
    </Card>
  );
};
