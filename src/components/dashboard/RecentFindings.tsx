import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ShieldAlert, 
  ExternalLink, 
  SlidersHorizontal,
  ChevronRight,
  Layers
} from 'lucide-react';
import { Finding, SeverityLevel, FindingStatus } from '../../types/dashboard.types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { FindingDetailModal } from './FindingDetailModal';

interface RecentFindingsProps {
  findings: Finding[];
}

export const RecentFindings: React.FC<RecentFindingsProps> = ({ findings }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  const getSeverityBadgeVariant = (severity: SeverityLevel) => {
    switch (severity) {
      case 'Critical':
        return 'critical' as const;
      case 'High':
        return 'high' as const;
      case 'Medium':
        return 'medium' as const;
      case 'Low':
        return 'low' as const;
      default:
        return 'info' as const;
    }
  };

  const getStatusBadge = (status: FindingStatus) => {
    switch (status) {
      case 'Open':
        return <Badge variant="critical" size="sm" dot>Open</Badge>;
      case 'Reviewing':
        return <Badge variant="medium" size="sm" dot>Reviewing</Badge>;
      case 'Resolved':
        return <Badge variant="low" size="sm" dot>Resolved</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      const matchesSearch =
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.cwe.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity =
        severityFilter === 'ALL' || f.severity.toUpperCase() === severityFilter;

      const matchesStatus =
        statusFilter === 'ALL' || f.status.toUpperCase() === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [findings, searchQuery, severityFilter, statusFilter]);

  return (
    <>
      <Card
        variant="default"
        className="p-6 bg-bg-card border-border-dark space-y-4 shadow-card-dark"
      >
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-dark">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Recent Findings
              </h3>
              <p className="text-xs text-text-muted">
                Authorized security vulnerability catalog
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[180px] sm:min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search findings, project, CWE..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-bg-elevated border border-border-dark text-xs text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-all"
              />
            </div>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg bg-bg-elevated border border-border-dark text-xs text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg bg-bg-elevated border border-border-dark text-xs text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="REVIEWING">Reviewing</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        {/* Findings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-dark text-[11px] font-mono uppercase text-text-muted">
                <th className="pb-3 font-semibold">Finding</th>
                <th className="pb-3 font-semibold">Project</th>
                <th className="pb-3 font-semibold">Severity</th>
                <th className="pb-3 font-semibold">Risk Score</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark/60">
              {filteredFindings.length > 0 ? (
                filteredFindings.map((f) => (
                  <tr
                    key={f.id}
                    className="hover:bg-bg-elevated/70 transition-colors group"
                  >
                    <td className="py-3.5 pr-4">
                      <div className="font-semibold text-text-primary group-hover:text-white flex items-center gap-1.5">
                        <span>{f.title}</span>
                      </div>
                      <div className="text-[11px] font-mono text-text-muted mt-0.5">
                        {f.cwe} · {f.id}
                      </div>
                    </td>

                    <td className="py-3.5 pr-4 text-text-secondary">
                      {f.project}
                    </td>

                    <td className="py-3.5 pr-4">
                      <Badge variant={getSeverityBadgeVariant(f.severity)} size="sm">
                        {f.severity}
                      </Badge>
                    </td>

                    <td className="py-3.5 pr-4 font-mono font-bold">
                      <span className={f.riskScore >= 75 ? 'text-[#EF4444]' : f.riskScore >= 50 ? 'text-[#F97316]' : 'text-text-primary'}>
                        {f.riskScore}
                      </span>
                      <span className="text-[10px] text-text-muted font-normal"> / 100</span>
                    </td>

                    <td className="py-3.5 pr-4">
                      {getStatusBadge(f.status)}
                    </td>

                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => setSelectedFinding(f)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-bg-surface hover:bg-brand-primary/20 border border-border-dark hover:border-brand-primary/40 text-text-secondary hover:text-brand-hover text-[11px] font-medium transition-all"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    No findings match the selected search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="pt-3 border-t border-border-dark/60 flex items-center justify-between text-xs text-text-muted">
          <span>
            Showing <strong className="text-text-primary">{filteredFindings.length}</strong> of {findings.length} findings
          </span>
          <span className="font-mono text-[11px]">
            HUMAN_VERIFIED_ONLY
          </span>
        </div>
      </Card>

      {/* Finding Detail Inspection Modal */}
      <FindingDetailModal
        finding={selectedFinding}
        onClose={() => setSelectedFinding(null)}
      />
    </>
  );
};
