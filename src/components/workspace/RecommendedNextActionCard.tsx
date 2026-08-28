import React from 'react';
import { Sparkles, ArrowRight, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { RecommendedAction } from '../../types/workspace.types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface RecommendedNextActionCardProps {
  action: RecommendedAction;
}

export const RecommendedNextActionCard: React.FC<RecommendedNextActionCardProps> = ({
  action,
}) => {
  const getUrgencyPill = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30';
      case 'HIGH':
        return 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30';
      case 'MEDIUM':
        return 'bg-[#EAB308]/10 text-[#EAB308] border-[#EAB308]/30';
      default:
        return 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30';
    }
  };

  return (
    <Card
      variant="default"
      className="p-6 bg-gradient-to-br from-bg-card via-bg-elevated to-bg-card border border-brand-primary/30 space-y-4 shadow-card-dark relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-primary/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-primary/20 text-brand-primary border border-brand-primary/40">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-text-primary">
              AI Recommended Next Milestone Action
            </h3>
            <p className="text-xs text-text-muted">
              Synthesized from active engagement blockers, scope inventory, and pending finding triage
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${getUrgencyPill(
            action.urgency
          )} shrink-0`}
        >
          {action.urgency} PRIORITY
        </span>
      </div>

      <div className="p-4 rounded-xl bg-bg-surface border border-border-dark space-y-2 text-left">
        <h4 className="text-sm font-bold text-text-primary">
          {action.title}
        </h4>
        <p className="text-xs text-text-secondary leading-relaxed">
          {action.reason}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1 text-xs">
        <span className="text-[10px] font-mono text-text-muted">
          HUMAN_CONFIRMATION_REQUIRED
        </span>

        <Button
          to={action.actionUrl}
          variant="primary"
          size="sm"
          icon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          {action.actionLabel}
        </Button>
      </div>
    </Card>
  );
};
