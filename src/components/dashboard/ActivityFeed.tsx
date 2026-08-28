import React from 'react';
import { 
  Activity, 
  Cpu, 
  ShieldAlert, 
  FolderGit2, 
  FileText, 
  UserCheck 
} from 'lucide-react';
import { ActivityItem } from '../../types/dashboard.types';
import { Card } from '../ui/Card';

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'ai':
        return <Cpu className="w-3.5 h-3.5 text-brand-primary" />;
      case 'finding':
        return <ShieldAlert className="w-3.5 h-3.5 text-[#F97316]" />;
      case 'project':
        return <FolderGit2 className="w-3.5 h-3.5 text-brand-hover" />;
      case 'report':
        return <FileText className="w-3.5 h-3.5 text-[#22C55E]" />;
      default:
        return <UserCheck className="w-3.5 h-3.5 text-text-muted" />;
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
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">
              Activity Feed
            </h3>
            <p className="text-xs text-text-muted">
              Live engagement log & AI events
            </p>
          </div>
        </div>
        <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" title="Live stream active" />
      </div>

      {/* Timeline */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-border-dark">
        {activities.map((act) => (
          <div key={act.id} className="relative group">
            {/* Timeline Marker */}
            <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-bg-surface border border-border-dark flex items-center justify-center group-hover:border-brand-primary/60 transition-colors">
              {getActivityIcon(act.type)}
            </div>

            {/* Content */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-semibold text-text-primary group-hover:text-white transition-colors">
                  {act.title}
                </h4>
                <span className="text-[10px] font-mono text-text-muted shrink-0">
                  {act.timestamp}
                </span>
              </div>
              {act.description && (
                <p className="text-[11px] text-text-muted leading-relaxed">
                  {act.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
