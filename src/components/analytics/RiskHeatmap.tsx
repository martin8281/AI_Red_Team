import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Grid, ShieldAlert, ChevronRight, Layers } from 'lucide-react';
import { RiskHeatmapPlot, HeatmapFindingItem } from '../../types/analytics.types';
import { Card } from '../ui/Card';
import { SeverityBadge } from '../findings/SeverityBadge';

interface RiskHeatmapProps {
  data: RiskHeatmapPlot[];
}

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ data }) => {
  const [selectedCell, setSelectedCell] = useState<RiskHeatmapPlot | null>(null);

  const getCellData = (impact: number, likelihood: number): RiskHeatmapPlot => {
    return (
      data.find((d) => d.impact === impact && d.likelihood === likelihood) || {
        impact,
        likelihood,
        findings: [],
      }
    );
  };

  const getCellColor = (impact: number, likelihood: number, count: number) => {
    const score = impact * likelihood;
    if (score >= 20) return count > 0 ? 'bg-[#EF4444]/30 border-[#EF4444]/60 text-[#EF4444]' : 'bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]/50';
    if (score >= 12) return count > 0 ? 'bg-[#F97316]/30 border-[#F97316]/60 text-[#F97316]' : 'bg-[#F97316]/10 border-[#F97316]/20 text-[#F97316]/50';
    if (score >= 6) return count > 0 ? 'bg-[#EAB308]/30 border-[#EAB308]/60 text-[#EAB308]' : 'bg-[#EAB308]/10 border-[#EAB308]/20 text-[#EAB308]/50';
    return count > 0 ? 'bg-[#22C55E]/30 border-[#22C55E]/60 text-[#22C55E]' : 'bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]/50';
  };

  return (
    <Card variant="default" className="p-6 bg-bg-card border-border-dark space-y-4 shadow-card-dark text-left">
      <div className="flex items-center justify-between pb-3 border-b border-border-dark">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-brand-primary" />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-text-primary">
              5x5 Threat Risk Heatmap Matrix
            </h3>
            <p className="text-xs text-text-muted">
              Plotted from calibrated Impact (1–5) vs Likelihood (1–5) deterministic vectors
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-text-muted">
          SELECT_CELL_TO_INSPECT
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: 5x5 Matrix (7 cols) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-text-muted px-8">
            <span>← Lower Likelihood</span>
            <span>Higher Likelihood →</span>
          </div>

          <div className="flex items-stretch gap-2">
            {/* Y-Axis Label (Impact) */}
            <div className="flex flex-col justify-between py-2 text-[11px] font-mono text-text-muted writing-mode-vertical rotate-180 text-center">
              <span>Impact (1–5)</span>
            </div>

            {/* Matrix Grid */}
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((impact) => (
                <div key={impact} className="flex items-center gap-1.5">
                  <span className="w-4 text-[10px] font-mono text-text-muted text-right">
                    {impact}
                  </span>

                  <div className="grid grid-cols-5 gap-1.5 flex-1">
                    {[1, 2, 3, 4, 5].map((likelihood) => {
                      const cell = getCellData(impact, likelihood);
                      const isSelected = selectedCell?.impact === impact && selectedCell?.likelihood === likelihood;
                      return (
                        <button
                          key={likelihood}
                          type="button"
                          onClick={() => setSelectedCell(cell)}
                          className={`h-11 sm:h-12 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer relative ${getCellColor(
                            impact,
                            likelihood,
                            cell.findings.length
                          )} ${isSelected ? 'ring-2 ring-brand-primary scale-105 z-10' : 'hover:scale-102'}`}
                        >
                          <span className="text-xs sm:text-sm font-black font-mono">
                            {cell.findings.length > 0 ? cell.findings.length : ''}
                          </span>
                          <span className="text-[9px] font-mono opacity-60">
                            {impact * likelihood}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* X-Axis Numbers */}
              <div className="flex items-center gap-1.5 pt-1 pl-5">
                {[1, 2, 3, 4, 5].map((lik) => (
                  <div key={lik} className="flex-1 text-center text-[10px] font-mono text-text-muted">
                    {lik}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Plotted Findings Inspector (5 cols) */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-bg-surface border border-border-dark space-y-3 min-h-[260px]">
          {selectedCell ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border-dark">
                <span className="text-xs font-bold text-text-primary">
                  Cell ({selectedCell.impact} Impact × {selectedCell.likelihood} Likelihood)
                </span>
                <span className="text-xs font-mono text-brand-hover font-bold">
                  {selectedCell.findings.length} Findings Plotted
                </span>
              </div>

              {selectedCell.findings.length > 0 ? (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {selectedCell.findings.map((f) => (
                    <div
                      key={f.id}
                      className="p-2.5 rounded-lg bg-bg-elevated border border-border-dark space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          to={`/findings/${f.id}`}
                          className="font-bold text-text-primary hover:text-brand-hover hover:underline truncate"
                        >
                          {f.title}
                        </Link>
                        <span className="text-[10px] font-mono text-[#EF4444] font-bold shrink-0">
                          {f.riskScore}/100
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                        <span>{f.id} · {f.asset}</span>
                        <SeverityBadge severity={f.severity} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-text-muted">
                  No active findings in this risk matrix cell.
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center space-y-2 text-text-muted">
              <Layers className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-xs">
                Click any heatmap cell to inspect individual threat vectors.
              </p>
            </div>
          )}
        </div>

      </div>
    </Card>
  );
};
