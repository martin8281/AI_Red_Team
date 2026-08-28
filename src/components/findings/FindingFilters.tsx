import React from 'react';
import { Search, Filter, ArrowUpDown, FolderGit2, X } from 'lucide-react';
import { FindingSortOption } from '../../types/finding.types';
import { Project } from '../../types/project.types';

interface FindingFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  projectId: string;
  onProjectChange: (value: string) => void;
  severity: string;
  onSeverityChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  priority: string;
  onPriorityChange: (value: string) => void;
  sort: FindingSortOption;
  onSortChange: (value: FindingSortOption) => void;
  projects: Project[];
  totalCount: number;
  onReset?: () => void;
}

export const FindingFilters: React.FC<FindingFiltersProps> = ({
  searchQuery,
  onSearchChange,
  projectId,
  onProjectChange,
  severity,
  onSeverityChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  sort,
  onSortChange,
  projects,
  totalCount,
  onReset,
}) => {
  const hasActiveFilters =
    searchQuery ||
    projectId !== 'ALL' ||
    severity !== 'ALL' ||
    status !== 'ALL' ||
    priority !== 'ALL';

  return (
    <div className="p-4 rounded-xl bg-bg-card border border-border-dark space-y-3 shadow-card-dark">
      {/* Top Search Bar */}
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search findings by title, vulnerability type, asset, or endpoint..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-bg-elevated border border-border-dark text-xs sm:text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all"
        />
      </div>

      {/* Filter Dropdowns Grid */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Project Filter */}
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

          {/* Severity Filter */}
          <select
            value={severity}
            onChange={(e) => onSeverityChange(e.target.value)}
            className="py-1.5 px-2.5 rounded-lg bg-bg-elevated border border-border-dark text-xs text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
            <option value="INFORMATIONAL">Informational</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="py-1.5 px-2.5 rounded-lg bg-bg-elevated border border-border-dark text-xs text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="REMEDIATION">Remediation</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ACCEPTED_RISK">Accepted Risk</option>
            <option value="REOPENED">Reopened</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="py-1.5 px-2.5 rounded-lg bg-bg-elevated border border-border-dark text-xs text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="P1">P1 — Immediate</option>
            <option value="P2">P2 — High</option>
            <option value="P3">P3 — Normal</option>
            <option value="P4">P4 — Low</option>
          </select>

          {/* Sort Selector */}
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value as FindingSortOption)}
              className="py-1.5 px-2.5 rounded-lg bg-bg-elevated border border-border-dark text-xs font-medium text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
            >
              <option value="recently_updated">Recently Updated</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest_risk">Highest Risk Score</option>
              <option value="severity">Severity Rank</option>
            </select>
          </div>
        </div>

        {/* Counter and Reset */}
        <div className="flex items-center gap-3">
          {hasActiveFilters && onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary px-2 py-1 rounded hover:bg-bg-elevated transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
          <span className="text-xs font-mono text-text-muted">
            {totalCount} {totalCount === 1 ? 'Finding' : 'Findings'}
          </span>
        </div>
      </div>
    </div>
  );
};
