import React, { useState } from 'react';
import { Sparkles, RotateCw, ShieldAlert, CheckCircle2, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { AISecurityInsightBundle } from '../../types/analytics.types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface AISecurityInsightsCardProps {
  insights: AISecurityInsightBundle;
  onRegenerate: () => Promise<void>;
  isLoading?: boolean;
}

export const AISecurityInsightsCard: React.FC<AISecurityInsightsCardProps> = ({
  insights,
  onRegenerate,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'CONCERN' | 'REMEDIATION' | 'TRENDS'>('SUMMARY');

  const prompts = [
    { label: 'What is the biggest security concern?', tab: 'CONCERN' as const },
    { label: 'Which findings should I address first?', tab: 'REMEDIATION' as const },
    { label: 'Why has the risk trend shifted?', tab: 'TRENDS' as const },
  ];

  return (
    <Card
      variant="default"
      className="p-6 bg-gradient-to-br from-bg-card via-bg-elevated to-bg-card border border-brand-primary/30 space-y-4 shadow-card-dark text-left relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-primary/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-primary/20 text-brand-primary border border-brand-primary/40">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-text-primary">
              AI Security Posture & Trend Reasoning
            </h3>
            <p className="text-xs text-text-muted">
              Grounded analytical synthesis powered by Qwen3 14B over actual project telemetry
            </p>
          </div>
        </div>

        <Button
          onClick={onRegenerate}
          disabled={isLoading}
          variant="outline"
          size="sm"
          icon={<RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          {isLoading ? 'Synthesizing...' : 'Regenerate'}
        </Button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] font-mono text-text-muted">Prompt Queries:</span>
        {prompts.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setActiveTab(p.tab)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              activeTab === p.tab
                ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                : 'bg-bg-surface hover:bg-bg-elevated text-text-secondary border-border-dark'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Narrative Body */}
      <div className="p-4 rounded-xl bg-bg-surface border border-border-dark text-xs sm:text-sm text-text-secondary leading-relaxed font-sans space-y-3">
        {activeTab === 'SUMMARY' && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-text-primary uppercase font-mono tracking-wider">
              Executive Security Posture Overview
            </h4>
            <p className="whitespace-pre-line">{insights.postureSummary}</p>
          </div>
        )}

        {activeTab === 'CONCERN' && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#EF4444] uppercase font-mono tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Primary Threat Vector Concern</span>
            </h4>
            <p className="whitespace-pre-line">{insights.biggestConcern}</p>
          </div>
        )}

        {activeTab === 'REMEDIATION' && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#22C55E] uppercase font-mono tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Priority Remediation Strategy</span>
            </h4>
            <p className="whitespace-pre-line">{insights.priorityRemediation}</p>
          </div>
        )}

        {activeTab === 'TRENDS' && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-brand-hover uppercase font-mono tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Risk Velocity & Timeline Insight</span>
            </h4>
            <p className="whitespace-pre-line">{insights.trendExplanation}</p>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-border-dark/60 flex items-center justify-between text-[10px] font-mono text-text-muted">
        <span>VERIFIED_ANALYTICS_CONTEXT</span>
        <span>Generated: {new Date(insights.generatedAt).toLocaleTimeString()}</span>
      </div>
    </Card>
  );
};
