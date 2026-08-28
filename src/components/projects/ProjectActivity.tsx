import React from 'react';
import { 
  Activity, 
  Cpu, 
  FolderPlus, 
  Layers, 
  ShieldCheck, 
  Sparkles,
  UserCheck
} from 'lucide-react';
import { ProjectActivityItem } from '../../types/project.types';
import { Card } from '../ui/Card';

interface ProjectActivityProps {
  activities: ProjectActivityItem[];
}

export const ProjectActivity: React.FC<ProjectActivityProps> = ({ activities }) => {
  const getActivityIcon = (type: ProjectActivityItem['type']) => {
    switch (type) {
      case 'creation':
        return <FolderPlus className="w-3.5 h-3.5 text-brand-primary" />;
      case 'scope':
        return <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />;
      case 'finding':
        return <Layers className="w-3.5 h-3.5 text-[#F97316]" />;
      case 'ai':
        return <Sparkles className="w-3.5 h-3.5 text-brand-hover" />;
      case 'status':
        return <Activity className="w-3.5 h-3.5 text-brand-primary" />;
      default:
        return <UserCheck className="w-3.5 h-3.5 text-text-muted" />;
    }
  };

  return (
    <Card variant="default" className="p-6 bg-bg-card border-border-dark space-y-4 shadow-card-dark">
      <div className="flex items-center justify-between pb-3 border-b border-border-dark">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-primary" />
          <h3 className="text-base font-bold text-text-primary">
            Engagement Activity Stream
          </h3>
        </div>
        <span className="text-xs font-mono text-text-muted">
          {activities.length} Events Logged
        </span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-border-dark">
        {activities.map((act) => (
          <div key={act.id} className="relative group">
            {/* Marker */}
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
