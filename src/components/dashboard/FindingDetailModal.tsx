import React from 'react';
import { 
  X, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  Clock, 
  UserCheck, 
  Target, 
  FileCode 
} from 'lucide-react';
import { Finding } from '../../types/dashboard.types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface FindingDetailModalProps {
  finding: Finding | null;
  onClose: () => void;
}

export const FindingDetailModal: React.FC<FindingDetailModalProps> = ({ finding, onClose }) => {
  if (!finding) return null;

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'critical' as const;
      case 'high':
        return 'high' as const;
      case 'medium':
        return 'medium' as const;
      case 'low':
        return 'low' as const;
      default:
        return 'info' as const;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-bg-card border border-border-dark shadow-2xl p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-border-dark">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-text-muted">{finding.id}</span>
              <Badge variant={getSeverityBadgeVariant(finding.severity)} size="sm">
                {finding.severity}
              </Badge>
              <Badge variant="neutral" size="sm">
                {finding.cwe}
              </Badge>
              <span className="text-xs font-mono font-bold text-[#F97316]">
                Risk Score: {finding.riskScore}/100
              </span>
            </div>
            <h2 className="text-xl font-bold text-text-primary">
              {finding.title}
            </h2>
            <p className="text-xs text-text-muted">
              Project: <span className="text-text-secondary font-medium">{finding.project}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target & Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-bg-surface border border-border-dark text-xs">
          <div className="space-y-1">
            <span className="text-text-muted flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-brand-primary" />
              Target Endpoint:
            </span>
            <code className="block p-1.5 rounded bg-bg-elevated text-brand-hover font-mono text-[11px] break-all">
              {finding.target}
            </code>
          </div>
          <div className="space-y-1">
            <span className="text-text-muted flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-primary" />
              Discovery Timestamp:
            </span>
            <div className="p-1.5 font-mono text-text-secondary text-[11px]">
              {new Date(finding.discoveredAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider font-mono">
            Vulnerability Description
          </h4>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed bg-bg-elevated p-3.5 rounded-xl border border-border-dark">
            {finding.description}
          </p>
        </div>

        {/* AI Analysis Insight */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-hover uppercase tracking-wider font-mono">
            <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
            <span>AI Co-Pilot Risk Interpretation</span>
          </div>
          <div className="p-3.5 rounded-xl bg-brand-primary/10 border border-brand-primary/30 text-xs sm:text-sm text-text-primary leading-relaxed">
            {finding.aiAnalysis}
          </div>
        </div>

        {/* Recommendation */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#22C55E] uppercase tracking-wider font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Remediation Recommendation</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-xs sm:text-sm text-text-secondary leading-relaxed">
            {finding.recommendation}
          </div>
        </div>

        {/* Human-in-the-Loop Footer Notice */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border-dark text-xs">
          <div className="flex items-center gap-1.5 text-text-muted">
            <UserCheck className="w-4 h-4 text-brand-primary" />
            <span>Tester approval required before dispatch</span>
          </div>
          <Button variant="primary" size="sm" onClick={onClose}>
            Close Inspection
          </Button>
        </div>

      </div>
    </div>
  );
};
