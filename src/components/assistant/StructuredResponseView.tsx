import React, { useState } from 'react';
import { 
  StructuredAIResponse 
} from '../../types/ai.types';
import { 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  Copy, 
  Check, 
  Sparkles,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { SeverityBadge } from '../findings/SeverityBadge';

interface StructuredResponseViewProps {
  structured: StructuredAIResponse;
}

export const StructuredResponseView: React.FC<StructuredResponseViewProps> = ({
  structured,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = `Summary: ${structured.summary}
${structured.risk ? `Risk: ${structured.risk.level} (${structured.risk.score}/100) - ${structured.risk.text}` : ''}
Reasoning: ${structured.reasoning}
Impact: ${structured.impact}
Recommendation: ${structured.recommendation}
${structured.suggestedValidation ? `Validation: ${structured.suggestedValidation}` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-3.5 text-xs">
      {/* Header Summary & Copy */}
      <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-brand-primary/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-brand-primary/20 text-brand-primary">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <h4 className="text-sm font-bold text-text-primary tracking-tight">
              {structured.summary}
            </h4>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-[11px] text-text-muted hover:text-text-primary px-2 py-1 rounded bg-bg-surface hover:bg-bg-elevated border border-border-dark transition-colors shrink-0"
          title="Copy structured response"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[#22C55E]" />
              <span className="text-[#22C55E]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* Risk Badge Bar (if provided) */}
      {structured.risk && (
        <div className="p-3 rounded-xl bg-bg-surface border border-border-dark flex flex-wrap items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted uppercase">Risk Rating:</span>
            <SeverityBadge severity={structured.risk.level} size="sm" />
            <span className="text-xs font-bold text-text-primary">
              {structured.risk.score} <span className="text-[10px] text-text-muted font-normal">/ 100</span>
            </span>
          </div>
          <p className="text-[11px] text-text-secondary font-sans">
            {structured.risk.text}
          </p>
        </div>
      )}

      {/* Technical Reasoning */}
      {structured.reasoning && (
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-hover font-semibold">
            Technical Reasoning & Mechanism
          </span>
          <p className="p-3 rounded-xl bg-bg-elevated border border-border-dark text-text-secondary leading-relaxed whitespace-pre-line">
            {structured.reasoning}
          </p>
        </div>
      )}

      {/* Impact */}
      {structured.impact && (
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#F97316] font-semibold flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            <span>Threat Impact</span>
          </span>
          <p className="p-3 rounded-xl bg-[#F97316]/10 border border-[#F97316]/25 text-text-secondary leading-relaxed whitespace-pre-line">
            {structured.impact}
          </p>
        </div>
      )}

      {/* Recommendation */}
      {structured.recommendation && (
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#22C55E] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Remediation & Hardening</span>
          </span>
          <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/25 text-text-secondary leading-relaxed whitespace-pre-line">
            {structured.recommendation}
          </div>
        </div>
      )}

      {/* Suggested Validation */}
      {structured.suggestedValidation && (
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-hover font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Validation / Re-Test Methodology</span>
          </span>
          <p className="p-2.5 rounded-lg bg-bg-surface border border-border-dark text-[11px] text-text-muted leading-relaxed">
            {structured.suggestedValidation}
          </p>
        </div>
      )}

      {/* Footer Confidence */}
      <div className="pt-2 border-t border-border-dark/50 flex items-center justify-between text-[10px] text-text-muted font-mono">
        <span>HUMAN_IN_THE_LOOP_VERIFIED</span>
        <span className="flex items-center gap-1">
          Confidence: <strong className="text-brand-hover">{structured.confidence}</strong>
        </span>
      </div>
    </div>
  );
};
