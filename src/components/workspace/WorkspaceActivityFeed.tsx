import React from 'react';
import { History, ShieldAlert, FileText, CheckCircle2, UserCheck, Layers, FolderGit2 } from 'lucide-react';
import { WorkspaceActivity } from '../../types/workspace.types';
import { Card } from '../ui/Card';

interface WorkspaceActivityFeedProps {
  activities: WorkspaceActivity[];
}

export const WorkspaceActivityFeed: React.FC<WorkspaceActivityFeedProps> = ({
  activities,
}) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'FINDING_CREATED':
      case 'FINDING_UPDATED':
        return <ShieldAlert className="w-3 h-3 text-[#EF4444]" />;
      case 'REPORT_GENERATED':
        return <FileText className="w-3 h-3 text-[#22C55E]" />;
      case 'EVIDENCE_VERIFIED':
        return <CheckCircle2 className="w-3 h-3 text-brand-primary" />;
      case 'PROJECT_STATUS_CHANGED':
        return <FolderGit2 className="w-3 h-3 text-brand-hover" />;
      default:
        return <History className="w-3 h-3 text-text-muted" />;
    }
  };

  return (
    <Card variant="default" className="p-6 bg-bg-card border-border-dark space-y-4 shadow-card-dark">
      <div className="flex items-center justify-between pb-3 border-b border-border-dark">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm sm:text-base font-bold text-text-primary">
            Engagement Audit Activity Stream
          </h3>
        </div>
        <span className="text-xs font-mono text-text-muted">
          {activities.length} Recorded Events
        </span>
      </div>

      {activities.length > 0 ? (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-border-dark">
          {activities.map((act) => (
            <div key={act.id} className="relative group text-xs text-left">
              {/* Icon Marker */}
              <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-bg-surface border border-border-dark flex items-center justify-center">
                {getActionIcon(act.action)}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-text-primary text-[11px]">
                    {act.action}
                  </span>
                  <span className="text-[10px] font-mono text-text-muted">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-text-secondary leading-relaxed text-[11px]">
                  {act.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-text-muted">
          No audit activities recorded yet.
        </div>
      )}
    </Card>
  );
};
