import React from 'react';
import { Link } from 'react-router-dom';
import { FolderGit2, ChevronRight, TrendingUp, Layers } from 'lucide-react';
import { ProjectBenchmark } from '../../types/analytics.types';
import { Card } from '../ui/Card';

interface ProjectComparisonTableProps {
  benchmarks: ProjectBenchmark[];
}

export const ProjectComparisonTable: React.FC<ProjectComparisonTableProps> = ({
  benchmarks,
}) => {
  return (
    <Card variant="default" className="p-0 bg-bg-card border-border-dark overflow-hidden shadow-card-dark text-left">
      <div className="p-4 bg-bg-surface border-b border-border-dark flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm font-bold text-text-primary">
            Cross-Engagement Security Posture Benchmarks
          </h3>
        </div>
        <span className="text-xs font-mono text-text-muted">
          {benchmarks.length} Accessible Engagements
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-bg-card border-b border-border-dark text-[11px] font-mono uppercase text-text-muted">
              <th className="py-3 px-4 font-semibold">Engagement</th>
              <th className="py-3 px-4 font-semibold">Organization</th>
              <th className="py-3 px-4 font-semibold">Overall Risk</th>
              <th className="py-3 px-4 font-semibold">Findings</th>
              <th className="py-3 px-4 font-semibold">Critical</th>
              <th className="py-3 px-4 font-semibold">Patch Rate</th>
              <th className="py-3 px-4 font-semibold text-right">Workspace</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark/60">
            {benchmarks.map((b) => (
              <tr key={b.projectId} className="hover:bg-bg-elevated/70 transition-colors">
                <td className="py-3 px-4 font-bold text-text-primary">
                  <Link to={`/projects/${b.projectId}`} className="hover:text-brand-hover hover:underline">
                    {b.projectName}
                  </Link>
                  <div className="text-[10px] font-mono text-text-muted">{b.projectId}</div>
                </td>
                <td className="py-3 px-4 text-text-secondary whitespace-nowrap">
                  {b.organization}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="font-mono font-bold text-brand-hover">
                    {b.overallRisk}/100
                  </span>
                </td>
                <td className="py-3 px-4 whitespace-nowrap font-mono text-text-primary">
                  {b.totalFindings}
                </td>
                <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-[#EF4444]">
                  {b.criticalCount}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="font-mono font-bold text-[#22C55E]">
                    {b.remediationRate}%
                  </span>
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <Link
                    to={`/projects/${b.projectId}/workspace`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-bg-surface hover:bg-brand-primary text-text-secondary hover:text-white border border-border-dark text-[11px] font-semibold transition-colors"
                  >
                    <span>Launch</span>
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
