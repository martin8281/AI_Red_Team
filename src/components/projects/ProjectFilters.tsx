import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { ProjectSortOption } from '../../types/project.types';

interface ProjectFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  sortBy: ProjectSortOption;
  onSortChange: (sort: ProjectSortOption) => void;
  totalCount: number;
}

export const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
  totalCount,
}) => {
  const statusOptions = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'On Hold', value: 'ON HOLD' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Archived', value: 'ARCHIVED' },
  ];

  const sortOptions: { label: string; value: ProjectSortOption }[] = [
    { label: 'Recently Updated', value: 'recently_updated' },
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Highest Risk Score', value: 'risk_score' },
    { label: 'Most Findings', value: 'finding_count' },
  ];

  return (
    <div className="p-4 rounded-xl bg-bg-card border border-border-dark flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 shadow-card-dark">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by project name, client, or type..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-bg-elevated border border-border-dark text-xs sm:text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all"
        />
      </div>

      {/* Filter and Sort Dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Status Selector */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-text-muted hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="py-2 px-3 rounded-lg bg-bg-elevated border border-border-dark text-xs font-medium text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-text-muted hidden sm:block" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as ProjectSortOption)}
            className="py-2 px-3 rounded-lg bg-bg-elevated border border-border-dark text-xs font-medium text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Total Results Count */}
        <span className="text-xs text-text-muted font-mono pl-2 border-l border-border-dark hidden lg:inline-block">
          {totalCount} {totalCount === 1 ? 'Project' : 'Projects'}
        </span>
      </div>
    </div>
  );
};
