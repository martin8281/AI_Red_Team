import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ChevronRight, ExternalLink } from 'lucide-react';
import { Finding } from '../../types/finding.types';
import { SeverityBadge } from '../findings/SeverityBadge';
import { Card } from '../ui/Card';

interface TopRiskFindingsTableProps {
  findings: Finding[];
}

export const TopRiskFindingsTable: React.FC<TopRiskFindingsTableProps> = ({
  findings,
}) => {
  return (
    <Card variant="default" className="p-0 bg-bg-card border-border-dark overflow-hidden shadow-card-dark text-left">
      <div className="p-4 bg-bg-surface border-b border-border-dark flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
          <h3 className="text-sm font-bold text-text-primary">
            Highest-Risk Unresolved Threat Vectors
          </h3>
        </div>
        <span className="text-xs font-mono text-text-muted">
          RANKED_BY_DETERMINISTIC_RISK
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-bg-card border-b border-border-dark text-[11px] font-mono uppercase text-text-muted">
              <th className="py-3 px-4 font-semibold">Threat Vector</th>
              <th className="py-3 px-4 font-semibold">Severity</th>
              <th className="py-3 px-4 font-semibold">Deterministic Risk</th>
              <th className="py-3 px-4 font-semibold">Priority</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark/60">
            {findings.map((f) => (
              <tr key={f.id} className="hover:bg-bg-elevated/70 transition-colors">
                <td className="py-3 px-4 max-w-[260px] truncate font-bold text-text-primary">
                  <Link to={`/findings/${f.id}`} className="hover:text-brand-hover hover:underline">
                    {f.title}
                  </Link>
                  <div className="text-[10px] font-mono text-text-muted mt-0.5">
                    {f.id} · {f.asset}
                  </div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <SeverityBadge severity={f.severity} size="sm" />
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="font-mono font-bold text-base text-[#EF4444]">
                    {f.riskScore}
                  </span>
                  <span className="text-[10px] font-mono text-text-muted">/100</span>
                </td>
                <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-text-secondary">
                  {f.priority}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30">
                    {f.remediationStatus || f.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <Link
                    to={`/findings/${f.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-brand-hover hover:underline"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
