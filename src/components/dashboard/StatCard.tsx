import React from 'react';
import { 
  FolderGit2, 
  Target, 
  Layers, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react';
import { StatCardData } from '../../types/dashboard.types';
import { Card } from '../ui/Card';

interface StatCardProps {
  data: StatCardData;
}

export const StatCard: React.FC<StatCardProps> = ({ data }) => {
  const getIcon = () => {
    switch (data.iconName) {
      case 'projects':
        return <FolderGit2 className="w-5 h-5 text-brand-primary" />;
      case 'engagements':
        return <Target className="w-5 h-5 text-brand-primary" />;
      case 'findings':
        return <Layers className="w-5 h-5 text-[#F97316]" />;
      case 'critical':
        return <ShieldAlert className="w-5 h-5 text-[#EF4444]" />;
      default:
        return <Layers className="w-5 h-5 text-brand-primary" />;
    }
  };

  const isCritical = data.id === 'stat-critical';

  return (
    <Card
      variant="default"
      hoverEffect
      className={`p-5 bg-bg-card border-border-dark flex flex-col justify-between relative overflow-hidden transition-all duration-200 ${
        isCritical ? 'hover:border-[#EF4444]/40' : 'hover:border-brand-primary/40'
      }`}
    >
      {/* Subtle top indicator */}
      {isCritical && (
        <div className="absolute top-0 inset-x-0 h-0.5 bg-[#EF4444]/80" />
      )}

      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text-muted tracking-wide">
            {data.label}
          </span>
          <div className={`p-2 rounded-lg border ${
            isCritical 
              ? 'bg-[#EF4444]/10 border-[#EF4444]/30' 
              : 'bg-brand-primary/10 border-brand-primary/20'
          }`}>
            {getIcon()}
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-text-primary font-mono tracking-tight">
            {data.value}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border-dark/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          {data.isPositive ? (
            <span className="flex items-center font-semibold text-[#22C55E]">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              {data.change}
            </span>
          ) : (
            <span className={`flex items-center font-semibold ${isCritical ? 'text-[#EF4444]' : 'text-[#F97316]'}`}>
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
              {data.change}
            </span>
          )}
          <span className="text-text-muted text-[11px] ml-1">{data.trendText}</span>
        </div>
      </div>
    </Card>
  );
};
