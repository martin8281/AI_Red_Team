import React from 'react';
import { FolderGit2, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';
import { Project } from '../../types/dashboard.types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface RecentProjectsProps {
  projects: Project[];
}

export const RecentProjects: React.FC<RecentProjectsProps> = ({ projects }) => {
  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'Active':
        return <Badge variant="brand" size="sm" dot pulse>Active</Badge>;
      case 'In Progress':
        return <Badge variant="info" size="sm" dot>In Progress</Badge>;
      case 'Completed':
        return <Badge variant="low" size="sm">Completed</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <Card
      variant="default"
      className="p-6 bg-bg-card border-border-dark space-y-4 shadow-card-dark"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-dark">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
            <FolderGit2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">
              Recent Projects
            </h3>
            <p className="text-xs text-text-muted">
              Active authorized security assessment scopes
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-text-muted">
          {projects.length} Total Engagements
        </span>
      </div>

      {/* Projects List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="p-4 rounded-xl bg-bg-elevated border border-border-dark hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-text-primary">
                    {proj.name}
                  </h4>
                  <span className="text-[11px] font-mono text-text-muted">
                    {proj.type} · {proj.id}
                  </span>
                </div>
                {getStatusBadge(proj.status)}
              </div>

              {/* Progress Bar */}
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-muted">Engagement Progress</span>
                  <span className="font-mono font-bold text-text-primary">{proj.progress}%</span>
                </div>
                <div className="w-full bg-[#1E293B] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-primary rounded-full transition-all duration-500"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Project Footer Meta */}
            <div className="pt-2 border-t border-border-dark/50 flex items-center justify-between text-[11px] text-text-muted">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-text-muted" />
                <span>{proj.lastUpdated}</span>
              </div>
              <div className="flex items-center gap-1 text-text-secondary">
                <ShieldCheck className="w-3 h-3 text-brand-primary" />
                <span>Lead: {proj.leadTester}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
