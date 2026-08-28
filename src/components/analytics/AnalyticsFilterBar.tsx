import React from 'react';
import { Filter, Download, Printer, RotateCcw, Calendar } from 'lucide-react';
import { AnalyticsFilters, DateRangeOption } from '../../types/analytics.types';
import { Project } from '../../types/project.types';
import { Button } from '../ui/Button';

interface AnalyticsFilterBarProps {
  filters: AnalyticsFilters;
  onFilterChange: (newFilters: AnalyticsFilters) => void;
  projects: Project[];
  onExportCSV: () => void;
  onReset: () => void;
}

export const AnalyticsFilterBar: React.FC<AnalyticsFilterBarProps> = ({
  filters,
  onFilterChange,
  projects,
  onExportCSV,
  onReset,
}) => {
  const dateRanges: { id: DateRangeOption; label: string }[] = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: 'ALL', label: 'All Time' },
  ];

  return (
    <div className="p-4 rounded-2xl bg-bg-card border border-border-dark space-y-3 shadow-card-dark text-left">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Left: Project Selector & Date Range */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Project Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-semibold">Project:</span>
            <select
              value={filters.projectId}
              onChange={(e) => onFilterChange({ ...filters, projectId: e.target.value })}
              className="py-1.5 px-3 rounded-lg bg-bg-elevated border border-border-dark text-xs font-semibold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer max-w-[200px] truncate"
            >
              <option value="ALL">All Projects (Portfolio)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Tabs */}
          <div className="flex items-center gap-1 bg-bg-surface p-1 rounded-lg border border-border-dark">
            <Calendar className="w-3.5 h-3.5 text-text-muted ml-1.5 mr-0.5" />
            {dateRanges.map((dr) => (
              <button
                key={dr.id}
                type="button"
                onClick={() => onFilterChange({ ...filters, dateRange: dr.id })}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  filters.dateRange === dr.id
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {dr.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Secondary Filters & Export Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Severity Filter */}
          <select
            value={filters.severity}
            onChange={(e) => onFilterChange({ ...filters, severity: e.target.value })}
            className="py-1.5 px-2.5 rounded-lg bg-bg-elevated border border-border-dark text-xs text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
            <option value="LOW">Low Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="py-1.5 px-2.5 rounded-lg bg-bg-elevated border border-border-dark text-xs text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open Only</option>
            <option value="REMEDIATION">In Remediation</option>
            <option value="RESOLVED">Resolved Only</option>
          </select>

          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            icon={<RotateCcw className="w-3 h-3" />}
          >
            Reset
          </Button>

          <Button
            onClick={onExportCSV}
            variant="primary"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>
        </div>

      </div>
    </div>
  );
};
