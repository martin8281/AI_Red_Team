import React from 'react';
import { ShieldAlert, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { RiskScoreData } from '../../types/dashboard.types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface RiskScoreCardProps {
  data: RiskScoreData;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ data }) => {
  const getStatusBadge = () => {
    if (data.score >= 75) {
      return { variant: 'critical' as const, label: 'CRITICAL RISK', color: '#EF4444' };
    }
    if (data.score >= 50) {
      return { variant: 'high' as const, label: 'HIGH RISK', color: '#F97316' };
    }
    if (data.score >= 30) {
      return { variant: 'medium' as const, label: 'MODERATE RISK', color: '#EAB308' };
    }
    return { variant: 'low' as const, label: 'LOW RISK', color: '#22C55E' };
  };

  const statusInfo = getStatusBadge();

  // SVG Circular Gauge calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.score / data.maxScore) * circumference;

  return (
    <Card
      variant="default"
      className="p-6 bg-bg-card border-border-dark flex flex-col justify-between h-full relative overflow-hidden shadow-card-dark"
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-border-dark/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#F97316]/10 border border-[#F97316]/30 text-[#F97316]">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Overall Risk Score
              </h3>
              <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
                Real-Time Scope Aggregate
              </span>
            </div>
          </div>
          <Badge variant={statusInfo.variant} size="sm" dot>
            {statusInfo.label}
          </Badge>
        </div>

        {/* Circular Meter & Primary Score */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-center gap-6">
          <div className="relative flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 130 130">
              {/* Background circle */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                className="text-[#1E293B]"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke={statusInfo.color}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold font-mono text-text-primary">
                {data.score}
              </span>
              <span className="text-[11px] text-text-muted font-medium">/ {data.maxScore}</span>
            </div>
          </div>

          {/* Key Metric Takeaway */}
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-[#EF4444] font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{data.changeFromLastMonth} pts since last sprint</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Risk score elevated primarily due to 3 unverified High/Critical injection vectors in public auth surfaces.
            </p>
            <div className="text-[11px] font-mono text-text-muted flex items-center justify-center sm:justify-start gap-1">
              <AlertTriangle className="w-3 h-3 text-[#F97316]" />
              <span>Human verification required for P1 items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Breakdown Bars */}
      <div className="pt-4 border-t border-border-dark/60 space-y-2.5">
        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block font-mono">
          Risk Vector Breakdown
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.breakdown.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-secondary truncate">{item.label}</span>
                <span className="font-mono font-bold text-text-primary">{item.value}%</span>
              </div>
              <div className="w-full bg-[#1E293B] h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.value}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
