import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ExternalLink, ShieldAlert, FolderGit2 } from 'lucide-react';
import { Finding, FindingStatus } from '../../types/finding.types';
import { SeverityBadge } from './SeverityBadge';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

interface FindingsTableProps {
  findings: Finding[];
}

export const FindingsTable: React.FC<FindingsTableProps> = ({ findings }) => {
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

  const getPriorityBadge = (priority: string) => {
    if (priority.startsWith('P1')) return <span className="text-[11px] font-mono font-bold text-[#EF4444] bg-[#EF4444]/10 px-1.5 py-0.5 rounded border border-[#EF4444]/30">P1</span>;
    if (priority.startsWith('P2')) return <span className="text-[11px] font-mono font-bold text-[#F97316] bg-[#F97316]/10 px-1.5 py-0.5 rounded border border-[#F97316]/30">P2</span>;
    if (priority.startsWith('P3')) return <span className="text-[11px] font-mono font-medium text-[#EAB308] bg-[#EAB308]/10 px-1.5 py-0.5 rounded border border-[#EAB308]/30">P3</span>;
    return <span className="text-[11px] font-mono text-text-muted bg-bg-surface px-1.5 py-0.5 rounded border border-border-dark">P4</span>;
  };

  return (
    <Card variant="default" className="p-0 bg-bg-card border-border-dark overflow-hidden shadow-card-dark">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-bg-surface border-b border-border-dark text-[11px] font-mono uppercase text-text-muted">
              <th className="py-3.5 px-4 font-semibold">Finding Title</th>
              <th className="py-3.5 px-4 font-semibold">Project</th>
              <th className="py-3.5 px-4 font-semibold">Vulnerability Type</th>
              <th className="py-3.5 px-4 font-semibold">Severity</th>
              <th className="py-3.5 px-4 font-semibold">Risk</th>
              <th className="py-3.5 px-4 font-semibold">Priority</th>
              <th className="py-3.5 px-4 font-semibold">Status</th>
              <th className="py-3.5 px-4 font-semibold">Updated</th>
              <th className="py-3.5 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark/60">
            {findings.length > 0 ? (
              findings.map((f) => (
                <tr
                  key={f.id}
                  className="hover:bg-bg-elevated/70 transition-colors group"
                >
                  {/* Finding Title & ID */}
                  <td className="py-3.5 px-4 max-w-[240px]">
                    <Link
                      to={`/findings/${f.id}`}
                      className="font-bold text-text-primary group-hover:text-brand-hover hover:underline line-clamp-1 block transition-colors"
                    >
                      {f.title}
                    </Link>
                    <div className="text-[10px] font-mono text-text-muted mt-0.5">
                      {f.id} · <span className="text-text-secondary">{f.asset}</span>
                    </div>
                  </td>

                  {/* Project */}
                  <td className="py-3.5 px-4 text-text-secondary whitespace-nowrap">
                    <Link
                      to={`/projects/${f.projectId}`}
                      className="hover:text-brand-hover hover:underline transition-colors flex items-center gap-1"
                    >
                      <FolderGit2 className="w-3 h-3 text-brand-primary shrink-0" />
                      <span className="truncate max-w-[140px]">{f.projectName || f.projectId}</span>
                    </Link>
                  </td>

                  {/* Vulnerability Type */}
                  <td className="py-3.5 px-4 text-text-secondary whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-bg-surface border border-border-dark text-[11px] font-medium">
                      {f.vulnerabilityType}
                    </span>
                  </td>

                  {/* Severity */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <SeverityBadge severity={f.severity} size="sm" />
                  </td>

                  {/* Risk Score */}
                  <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                    <span
                      className={
                        f.riskScore >= 75
                          ? 'text-[#EF4444]'
                          : f.riskScore >= 50
                          ? 'text-[#F97316]'
                          : 'text-[#22C55E]'
                      }
                    >
                      {f.riskScore}
                    </span>
                    <span className="text-[10px] text-text-muted font-normal"> / 100</span>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getPriorityBadge(f.priority)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(f.status)}
                  </td>

                  {/* Updated */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-text-muted whitespace-nowrap">
                    {new Date(f.updatedAt).toLocaleDateString()}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <Link
                      to={`/findings/${f.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-bg-surface hover:bg-brand-primary text-text-secondary hover:text-white border border-border-dark hover:border-brand-primary text-[11px] font-semibold transition-all duration-150"
                    >
                      <span>View</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-12 text-center text-text-muted">
                  No security findings match the current filter or search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="py-3 px-4 bg-bg-surface border-t border-border-dark flex items-center justify-between text-xs text-text-muted">
        <span>
          Displaying <strong className="text-text-primary">{findings.length}</strong> findings
        </span>
        <span className="font-mono text-[11px]">
          AUTHORIZED_SCOPE_VERIFIED
        </span>
      </div>
    </Card>
  );
};
