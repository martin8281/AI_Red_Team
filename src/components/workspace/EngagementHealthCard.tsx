import React from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Layers, 
  FileText, 
  ShieldCheck 
} from 'lucide-react';
import { EngagementHealth, HealthStatus } from '../../types/workspace.types';
import { Card } from '../ui/Card';

interface EngagementHealthCardProps {
  health: EngagementHealth;
}

export const EngagementHealthCard: React.FC<EngagementHealthCardProps> = ({
  health,
}) => {
  const getStatusPill = (status: HealthStatus) => {
    switch (status) {
      case 'GOOD':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>GOOD</span>
          </span>
        );
      case 'ATTENTION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/30">
            <AlertTriangle className="w-3 h-3" />
            <span>ATTENTION</span>
          </span>
        );
      case 'BLOCKED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30">
            <ShieldAlert className="w-3 h-3" />
            <span>BLOCKED</span>
          </span>
        );
    }
  };

  const dimensions = [
    { label: 'Scope Boundary Health', status: health.scopeHealth, message: health.details.scopeMessage },
    { label: 'Vulnerability Finding Health', status: health.findingHealth, message: health.details.findingMessage },
    { label: 'Risk Calibration Health', status: health.riskHealth, message: health.details.riskMessage },
    { label: 'PoC Technical Evidence Health', status: health.evidenceHealth, message: health.details.evidenceMessage },
    { label: 'Reporting Deliverable Health', status: health.reportingHealth, message: health.details.reportingMessage },
  ];

  return (
    <Card variant="default" className="p-6 bg-bg-card border-border-dark space-y-4 shadow-card-dark">
      <div className="flex items-center justify-between pb-3 border-b border-border-dark">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm sm:text-base font-bold text-text-primary">
            5-Dimension Engagement Health Monitor
          </h3>
        </div>
        <div>
          {getStatusPill(health.overall)}
        </div>
      </div>

      <div className="space-y-3">
        {dimensions.map((dim) => (
          <div
            key={dim.label}
            className="p-3 rounded-xl bg-bg-surface border border-border-dark flex items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-0.5 text-left">
              <span className="font-bold text-text-primary block">{dim.label}</span>
              <p className="text-[11px] text-text-muted">{dim.message}</p>
            </div>
            <div className="shrink-0">
              {getStatusPill(dim.status)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
