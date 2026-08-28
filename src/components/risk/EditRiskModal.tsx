import React, { useState } from 'react';
import { X, Sliders, Shield, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { RiskAssessment, RiskFactors } from '../../types/risk.types';
import { Priority } from '../../types/finding.types';
import { RiskEngine } from '../../services/riskEngine';
import { RiskFactorSliders } from './RiskFactorSliders';
import { Button } from '../ui/Button';

interface EditRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: RiskAssessment;
  onSave: (
    factors: RiskFactors,
    finalPriority: Priority,
    reason: string
  ) => Promise<void>;
}

export const EditRiskModal: React.FC<EditRiskModalProps> = ({
  isOpen,
  onClose,
  assessment,
  onSave,
}) => {
  const [factors, setFactors] = useState<RiskFactors>({
    impact: assessment.impact,
    likelihood: assessment.likelihood,
    assetCriticality: assessment.assetCriticality,
    exploitability: assessment.exploitability,
  });

  const [finalPriority, setFinalPriority] = useState<Priority>(
    assessment.finalPriority || assessment.recommendedPriority
  );
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time calculation preview
  const preview = RiskEngine.evaluate(factors);

  const priorities: Priority[] = [
    'P1 — Immediate',
    'P2 — High',
    'P3 — Normal',
    'P4 — Low',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(factors, finalPriority, reason.trim());
      onClose();
    } catch {
      setError('Failed to update risk assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-bg-card border border-border-dark p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-dark">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-primary" />
            <h3 className="text-base sm:text-lg font-bold text-text-primary">
              Calibrate Risk Factors & Priority
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-bg-elevated"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <p className="p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444]">
            {error}
          </p>
        )}

        {/* Real-time Calculation Summary Bar */}
        <div className="p-4 rounded-xl bg-bg-surface border border-brand-primary/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] font-mono text-text-muted uppercase block">
              Recalculated Score
            </span>
            <div className="text-2xl font-black font-mono text-brand-hover">
              {preview.score} <span className="text-xs font-normal text-text-muted">/ 100</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono text-text-muted uppercase block">
              Risk Level
            </span>
            <span className="font-mono font-bold text-text-primary text-sm mt-0.5 block">
              {preview.level}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-text-muted uppercase block">
              Engine Recommendation
            </span>
            <span className="font-mono font-bold text-brand-primary text-sm mt-0.5 block">
              {preview.recommendedPriority}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Factor Sliders */}
          <RiskFactorSliders
            factors={factors}
            onChange={(updated) => setFactors(updated)}
            disabled={isSubmitting}
          />

          {/* Priority Override & Rationale */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-text-secondary">
                Tester Final Priority Override
              </label>
              <select
                value={finalPriority}
                onChange={(e) => setFinalPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 bg-bg-elevated text-xs font-semibold text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-text-secondary">
                Calibration Reason / Rationale
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Accounted for active WAF rate limiting on target"
                className="w-full px-3 py-2 bg-bg-elevated text-xs text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50 placeholder:text-text-disabled"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-dark">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              icon={isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
            >
              {isSubmitting ? 'Saving Assessment...' : 'Update Risk Assessment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
