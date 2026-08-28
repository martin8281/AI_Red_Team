import React from 'react';
import { RiskFactors } from '../../types/risk.types';
import { RiskEngine } from '../../services/riskEngine';

interface RiskFactorSlidersProps {
  factors: RiskFactors;
  onChange: (updated: RiskFactors) => void;
  disabled?: boolean;
}

export const RiskFactorSliders: React.FC<RiskFactorSlidersProps> = ({
  factors,
  onChange,
  disabled = false,
}) => {
  const factorConfigs: {
    key: keyof RiskFactors;
    label: string;
    description: string;
    weight: string;
  }[] = [
    {
      key: 'impact',
      label: 'Security & Business Impact',
      description: 'Severity of confidentiality, integrity, or availability breach',
      weight: '35%',
    },
    {
      key: 'likelihood',
      label: 'Exploit Likelihood',
      description: 'Probability of threat actor discovery and execution',
      weight: '30%',
    },
    {
      key: 'assetCriticality',
      label: 'Asset Criticality',
      description: 'Sensitivity and business tier of the target infrastructure',
      weight: '20%',
    },
    {
      key: 'exploitability',
      label: 'Technical Exploitability',
      description: 'Ease of execution, public tool availability, and skill barrier',
      weight: '15%',
    },
  ];

  const handleSliderChange = (key: keyof RiskFactors, val: number) => {
    const clamped = Math.max(1, Math.min(5, Math.round(val)));
    onChange({
      ...factors,
      [key]: clamped,
    });
  };

  return (
    <div className="space-y-4">
      {factorConfigs.map((cfg) => {
        const value = factors[cfg.key];
        return (
          <div
            key={cfg.key}
            className="p-3.5 rounded-xl bg-bg-elevated border border-border-dark space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="space-y-0.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">{cfg.label}</span>
                  <span className="text-[10px] font-mono text-brand-hover bg-brand-primary/10 px-1.5 py-0.5 rounded border border-brand-primary/30">
                    Weight: {cfg.weight}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted">{cfg.description}</p>
              </div>

              <span className="font-mono text-sm font-extrabold text-brand-hover bg-bg-surface px-2.5 py-1 rounded-lg border border-border-dark shrink-0">
                {value} <span className="text-[10px] text-text-muted font-normal">/ 5</span>
              </span>
            </div>

            {/* Slider & Quick Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={value}
                disabled={disabled}
                onChange={(e) => handleSliderChange(cfg.key, Number(e.target.value))}
                className="w-full h-1.5 bg-bg-surface rounded-lg appearance-none cursor-pointer accent-brand-primary"
              />
              <div className="flex items-center gap-1 shrink-0">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSliderChange(cfg.key, num)}
                    className={`w-6 h-6 rounded text-[11px] font-mono font-bold transition-all ${
                      value === num
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'bg-bg-surface text-text-muted hover:text-text-primary hover:bg-bg-hover border border-border-dark'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
