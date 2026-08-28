import React, { useState } from 'react';
import { 
  FileText, 
  Target, 
  ShieldAlert, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles,
  Link2,
  Terminal
} from 'lucide-react';
import { Finding } from '../../types/finding.types';
import { Card } from '../ui/Card';

interface FindingDetailsProps {
  finding: Finding;
}

export const FindingDetails: React.FC<FindingDetailsProps> = ({ finding }) => {
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(`${finding.asset}${finding.endpoint}`);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Target Specification Banner */}
      <Card variant="default" className="p-5 bg-bg-card border-border-dark space-y-3 shadow-card-dark">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-brand-primary" />
            <h3 className="text-sm font-bold text-text-primary">
              Target Vulnerability Vector
            </h3>
          </div>
          <span className="text-[10px] font-mono text-text-muted">SCOPE_VERIFIED</span>
        </div>

        <div className="p-3 rounded-xl bg-bg-elevated border border-border-dark flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="px-2 py-0.5 rounded bg-brand-primary/20 text-brand-hover font-bold border border-brand-primary/40">
              {finding.method}
            </span>
            <span className="text-text-muted">Target:</span>
            <code className="text-text-primary font-bold break-all">
              https://{finding.asset}{finding.endpoint}
            </code>
          </div>

          <button
            onClick={handleCopyEndpoint}
            className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded bg-bg-surface hover:bg-bg-card border border-border-dark text-text-secondary hover:text-text-primary transition-colors shrink-0"
          >
            {copiedEndpoint ? (
              <>
                <Check className="w-3 h-3 text-[#22C55E]" />
                <span className="text-[#22C55E]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy URL</span>
              </>
            )}
          </button>
        </div>
      </Card>

      {/* Description Panel */}
      <Card variant="default" className="p-6 bg-bg-card border-border-dark space-y-3 shadow-card-dark">
        <div className="flex items-center gap-2 pb-2 border-b border-border-dark">
          <FileText className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm font-bold text-text-primary">
            Vulnerability Description & Observations
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed bg-bg-elevated p-4 rounded-xl border border-border-dark whitespace-pre-line">
          {finding.description}
        </p>
      </Card>

      {/* Impact & Severity Breakdown */}
      <Card variant="default" className="p-6 bg-bg-card border-border-dark space-y-3 shadow-card-dark">
        <div className="flex items-center gap-2 pb-2 border-b border-border-dark">
          <ShieldAlert className="w-4 h-4 text-[#F97316]" />
          <h3 className="text-sm font-bold text-text-primary">
            Security & Business Impact Analysis
          </h3>
        </div>

        <div className="p-4 rounded-xl bg-[#F97316]/10 border border-[#F97316]/30 text-xs sm:text-sm text-text-primary leading-relaxed whitespace-pre-line">
          {finding.impact}
        </div>
      </Card>

      {/* Remediation Recommendations */}
      <Card variant="default" className="p-6 bg-bg-card border-border-dark space-y-3 shadow-card-dark">
        <div className="flex items-center gap-2 pb-2 border-b border-border-dark">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          <h3 className="text-sm font-bold text-text-primary">
            Remediation & Hardening Guidelines
          </h3>
        </div>

        <div className="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
          {finding.recommendation}
        </div>
      </Card>
    </div>
  );
};
