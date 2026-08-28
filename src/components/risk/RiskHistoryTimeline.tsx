import React from 'react';
import { History, TrendingUp, TrendingDown, Clock, UserCheck, Activity } from 'lucide-react';
import { RiskHistory } from '../../types/risk.types';
import { Card } from '../ui/Card';

interface RiskHistoryTimelineProps {
  history: RiskHistory[];
}

export const RiskHistoryTimeline: React.FC<RiskHistoryTimelineProps> = ({
  history,
}) => {
  return (
    <Card variant="default" className="p-6 bg-bg-card border-border-dark space-y-4 shadow-card-dark">
      <div className="flex items-center justify-between pb-3 border-b border-border-dark">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm sm:text-base font-bold text-text-primary">
            Risk Calibration History
          </h3>
        </div>
        <span className="text-xs font-mono text-text-muted">
          {history.length} {history.length === 1 ? 'Adjustment' : 'Adjustments'}
        </span>
      </div>

      {history.length > 0 ? (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-border-dark">
          {history.map((item) => {
            const isIncrease = item.newScore > item.previousScore;
            return (
              <div key={item.id} className="relative group text-xs">
                {/* Marker */}
                <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-bg-surface border border-border-dark flex items-center justify-center">
                  {isIncrease ? (
                    <TrendingUp className="w-2.5 h-2.5 text-[#EF4444]" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5 text-[#22C55E]" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-text-muted">{item.previousScore} / 100</span>
                      <span>→</span>
                      <span className={`font-bold ${isIncrease ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                        {item.newScore} / 100
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-text-muted">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-text-secondary leading-relaxed bg-bg-elevated p-2.5 rounded-lg border border-border-dark text-[11px]">
                    {item.reason}
                  </p>

                  <div className="flex items-center gap-1.5 text-[10px] text-text-muted pt-0.5">
                    <UserCheck className="w-3 h-3 text-brand-primary" />
                    <span>Calibrated by {item.changedBy}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-text-muted">
          No historical score calibrations logged for this assessment.
        </div>
      )}
    </Card>
  );
};
