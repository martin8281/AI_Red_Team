import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  FileCode, 
  Layers, 
  Clock 
} from 'lucide-react';
import { AIRecommendationBundle } from '../../types/risk.types';
import { riskService } from '../../services/riskService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface AIRecommendationsCardProps {
  findingId: string;
}

export const AIRecommendationsCard: React.FC<AIRecommendationsCardProps> = ({
  findingId,
}) => {
  const [bundle, setBundle] = useState<AIRecommendationBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const data = await riskService.generateAIRecommendations(findingId);
      setBundle(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [findingId]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const data = await riskService.generateAIRecommendations(findingId);
      setBundle(data);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Card variant="default" className="p-6 bg-gradient-to-br from-bg-card via-bg-elevated to-bg-card border border-brand-primary/30 space-y-4 shadow-card-dark relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-primary/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-primary/20 text-brand-primary border border-brand-primary/40">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-text-primary">
              AI Contextual Recommendations & Impact Reasoning
            </h3>
            <p className="text-xs text-text-muted">
              Remediation playbooks and validation guidance contextualized on engine risk metrics
            </p>
          </div>
        </div>

        <Button
          onClick={handleRegenerate}
          disabled={isLoading || isRegenerating}
          variant="outline"
          size="sm"
          icon={<RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />}
        >
          {isRegenerating ? 'Analyzing...' : 'Regenerate'}
        </Button>
      </div>

      {isLoading || !bundle ? (
        <div className="py-8 text-center space-y-2">
          <RotateCw className="w-5 h-5 text-brand-primary animate-spin mx-auto" />
          <p className="text-xs text-text-muted font-mono">
            Correlating vulnerability telemetry with OWASP remediation standards...
          </p>
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          {/* Technical Recommendation */}
          <div className="space-y-1.5">
            <span className="font-mono text-[10px] uppercase font-bold text-[#22C55E] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Technical Remediation Strategy</span>
            </span>
            <div className="p-3.5 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/25 text-text-secondary leading-relaxed whitespace-pre-line">
              {bundle.technicalRecommendation}
            </div>
          </div>

          {/* Business Impact */}
          <div className="space-y-1.5">
            <span className="font-mono text-[10px] uppercase font-bold text-[#F97316] flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Business & Enterprise Threat Impact</span>
            </span>
            <div className="p-3.5 rounded-xl bg-[#F97316]/10 border border-[#F97316]/25 text-text-secondary leading-relaxed">
              {bundle.businessImpact}
            </div>
          </div>

          {/* Validation & Priority Reasoning Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-bg-surface border border-border-dark space-y-1">
              <span className="font-mono text-[10px] uppercase font-bold text-brand-hover flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Validation Methodology</span>
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                {bundle.validationRecommendation}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-bg-surface border border-border-dark space-y-1">
              <span className="font-mono text-[10px] uppercase font-bold text-text-primary flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-brand-primary" />
                <span>Priority Calibration Reasoning</span>
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                {bundle.priorityReasoning}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-border-dark/60 flex items-center justify-between text-[10px] text-text-muted font-mono">
            <span>HUMAN_VALIDATION_ACTIVE</span>
            <span>Generated: {new Date(bundle.generatedAt).toLocaleTimeString()}</span>
          </div>
        </div>
      )}
    </Card>
  );
};
