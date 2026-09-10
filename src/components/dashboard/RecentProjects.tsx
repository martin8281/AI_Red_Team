import React from 'react';
import { Link } from 'react-router-dom';
import { FolderGit2, ArrowUpRight, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
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
        <Link
          to="/projects"
          className="text-xs text-brand-primary hover:text-brand-hover font-medium flex items-center gap-1 transition-colors"
        >
          <span>View All ({projects.length})</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Projects List Grid */}
      {projects.length === 0 ? (
        <div className="py-8 text-center text-xs text-text-muted">
          No active projects found. Create a new engagement to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {projects.map((proj) => (
            <Link
              key={proj.id}
              to={`/projects/${proj.id}`}
              className="p-4 rounded-xl bg-bg-elevated border border-border-dark hover:border-brand-primary/50 transition-all duration-200 flex flex-col justify-between space-y-3 group shadow-sm hover:scale-[1.01]"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-text-primary group-hover:text-brand-hover transition-colors flex items-center gap-1.5">
                      <span>{proj.name}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
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
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
};
