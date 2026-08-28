import React from 'react';
import { 
  ShieldAlert, 
  Sliders, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { RiskAssessment, RiskLevel } from '../../types/risk.types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface RiskBreakdownCardProps {
  assessment: RiskAssessment;
  onEditClick: () => void;
}

export const RiskBreakdownCard: React.FC<RiskBreakdownCardProps> = ({
  assessment,
  onEditClick,
}) => {
  const getLevelColor = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return {
          text: 'text-[#EF4444]',
          bg: 'bg-[#EF4444]/10',
          border: 'border-[#EF4444]/30',
          bar: 'bg-[#EF4444]',
        };
      case 'HIGH':
        return {
          text: 'text-[#F97316]',
          bg: 'bg-[#F97316]/10',
          border: 'border-[#F97316]/30',
          bar: 'bg-[#F97316]',
        };
      case 'MODERATE':
        return {
          text: 'text-[#EAB308]',
          bg: 'bg-[#EAB308]/10',
          border: 'border-[#EAB308]/30',
          bar: 'bg-[#EAB308]',
        };
      case 'LOW':
      default:
        return {
          text: 'text-[#22C55E]',
          bg: 'bg-[#22C55E]/10',
          border: 'border-[#22C55E]/30',
          bar: 'bg-[#22C55E]',
        };
    }
  };

  const levelColor = getLevelColor(assessment.riskLevel);

  const factors = [
    { label: 'Impact', value: assessment.impact, weight: '35%' },
    { label: 'Likelihood', value: assessment.likelihood, weight: '30%' },
    { label: 'Asset Criticality', value: assessment.assetCriticality, weight: '20%' },
    { label: 'Exploitability', value: assessment.exploitability, weight: '15%' },
  ];

  return (
    <Card variant="default" className="p-6 bg-bg-card border-border-dark space-y-5 shadow-card-dark relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-dark">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${levelColor.bg} ${levelColor.border} ${levelColor.text}`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">
              Deterministic Risk Engine Assessment
            </h3>
            <p className="text-xs text-text-muted">
              Normalized scoring computed from weighted factor evaluation
            </p>
          </div>
        </div>

        <Button
          onClick={onEditClick}
          variant="outline"
          size="sm"
          icon={<Sliders className="w-3.5 h-3.5" />}
        >
          Adjust Factors
        </Button>
      </div>

      {/* Main Score & Factors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Big Score & Level */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-bg-surface border border-border-dark text-center space-y-2">
          <span className="text-[11px] font-mono uppercase text-text-muted font-semibold">
            Calculated Risk Score
          </span>
          <div className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${levelColor.text}`}>
            {assessment.riskScore}
            <span className="text-sm font-normal text-text-muted"> / 100</span>
          </div>

          <div className="pt-1">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${levelColor.bg} ${levelColor.border} ${levelColor.text}`}
            >
              <span className={`w-2 h-2 rounded-full ${levelColor.bar}`} />
              <span>{assessment.riskLevel} RISK</span>
            </span>
          </div>
        </div>

        {/* Right: 4 Factors Visual Progress Bars */}
        <div className="lg:col-span-8 space-y-3">
          {factors.map((f) => (
            <div key={f.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary">{f.label}</span>
                  <span className="text-[10px] font-mono text-text-muted">({f.weight})</span>
                </div>
                <span className="font-mono font-bold text-text-primary">
                  {f.value} <span className="text-[10px] text-text-muted">/ 5</span>
                </span>
              </div>
              <div className="w-full bg-[#1E293B] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${levelColor.bar} rounded-full transition-all duration-500`}
                  style={{ width: `${(f.value / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Recommendations Strip */}
      <div className="pt-4 border-t border-border-dark flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-text-muted">Engine Recommended:</span>
            <span className="font-mono font-bold text-brand-hover px-2 py-0.5 rounded bg-bg-surface border border-border-dark">
              {assessment.recommendedPriority}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-text-muted">Tester Final Priority:</span>
            <span className="font-mono font-bold text-text-primary px-2 py-0.5 rounded bg-brand-primary/20 border border-brand-primary/40">
              {assessment.finalPriority}
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono text-text-muted">
          Assessed by {assessment.assessedBy} · {new Date(assessment.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </Card>
  );
};
