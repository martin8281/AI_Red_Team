import React from 'react';
import { Search, Filter, FolderGit2, X } from 'lucide-react';
import { Project } from '../../types/project.types';

interface ReportFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  projectId: string;
  onProjectChange: (val: string) => void;
  reportType: string;
  onReportTypeChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  projects: Project[];
  totalCount: number;
  onReset?: () => void;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  searchQuery,
  onSearchChange,
  projectId,
  onProjectChange,
  reportType,
  onReportTypeChange,
  status,
  onStatusChange,
  projects,
  totalCount,
  onReset,
}) => {
  const hasActive =
    searchQuery ||
    projectId !== 'ALL' ||
    reportType !== 'ALL' ||
    status !== 'ALL';

  return (
    <div className="p-4 rounded-xl bg-bg-card border border-border-dark space-y-3 shadow-card-dark">
      {/* Search */}
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search reports by title, engagement name, or deliverable type..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-bg-elevated border border-border-dark text-xs sm:text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
        />
      </div>

      {/* Dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Project */}
          <select
            value={projectId}
            onChange={(e) => onProjectChange(e.target.value)}
            className="py-1.5 px-2.5 rounded-lg bg-bg-elevated border border-border-dark text-xs text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer max-w-[180px] truncate"
          >
            <option value="ALL">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Report Type */}
          <select
            value={reportType}
            onChange={(e) => onReportTypeChange(e.target.value)}
            className="py-1.5 px-2.5 rounded-lg bg-bg-elevated border border-border-dark text-xs text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
          >
            <option value="ALL">All Report Types</option>
            <option value="Penetration Testing Report">Penetration Testing Report</option>
            <option value="Security Assessment Report">Security Assessment Report</option>
            <option value="Vulnerability Assessment Report">Vulnerability Assessment Report</option>
            <option value="Executive Security Report">Executive Security Report</option>
            <option value="Technical Security Report">Technical Security Report</option>
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="py-1.5 px-2.5 rounded-lg bg-bg-elevated border border-border-dark text-xs text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="READY">Ready</option>
            <option value="DRAFT">Draft</option>
            <option value="GENERATING">Generating</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {/* Counter and Reset */}
        <div className="flex items-center gap-3">
          {hasActive && onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary px-2 py-1 rounded hover:bg-bg-elevated transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
          <span className="text-xs font-mono text-text-muted">
            {totalCount} {totalCount === 1 ? 'Report' : 'Reports'}
          </span>
        </div>
      </div>
    </div>
  );
};
