import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  ChevronRight, 
  Tag, 
  AlertTriangle,
  Info,
  Layers,
  FileText
} from 'lucide-react';
import { ProposedFinding } from '../../types/ai.types';

interface FindingCardProps {
  finding: ProposedFinding;
  onAccept?: (findingId: string) => void;
  onReject?: (findingId: string, reason: string, comment: string) => void;
  onInspectEvidence?: (evidenceId: string) => void;
}

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  onAccept,
  onReject,
  onInspectEvidence,
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('FALSE_POSITIVE');
  const [rejectComment, setRejectComment] = useState('');

  const severityStyles: Record<string, { badge: string; text: string }> = {
    CRITICAL: {
      badge: 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]',
      text: 'text-[#EF4444]',
    },
    HIGH: {
      badge: 'bg-[#F97316]/15 border-[#F97316]/40 text-[#F97316]',
      text: 'text-[#F97316]',
    },
    MEDIUM: {
      badge: 'bg-[#F59E0B]/15 border-[#F59E0B]/40 text-[#F59E0B]',
      text: 'text-[#F59E0B]',
    },
    LOW: {
      badge: 'bg-[#3B82F6]/15 border-[#3B82F6]/40 text-[#3B82F6]',
      text: 'text-[#3B82F6]',
    },
    INFORMATIONAL: {
      badge: 'bg-slate-500/15 border-slate-500/40 text-slate-400',
      text: 'text-slate-400',
    },
  };

  const confidenceStyles: Record<string, { badge: string; dot: string }> = {
    HIGH: {
      badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      dot: 'bg-emerald-400',
    },
    MEDIUM: {
      badge: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      dot: 'bg-amber-400',
    },
    LOW: {
      badge: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
      dot: 'bg-rose-400',
    },
  };

  const currentSev = severityStyles[finding.severity] || severityStyles.HIGH;
  const currentConf = confidenceStyles[finding.confidence] || confidenceStyles.HIGH;

  const handleConfirmReject = () => {
    if (onReject) {
      onReject(finding.id, rejectReason, rejectComment || 'Marked as false positive by analyst');
    }
    setShowRejectModal(false);
  };

  return (
    <div className={`relative rounded-xl border transition-all duration-200 shadow-md ${
      finding.status === 'accepted' 
        ? 'bg-emerald-950/15 border-emerald-800/40' 
        : finding.status === 'rejected'
        ? 'bg-rose-950/15 border-rose-900/40 opacity-70'
        : 'bg-bg-elevated/90 border-border-dark hover:border-border-subtle'
    } p-3.5 my-2.5`}>
      {/* Card Header: IDs & Status Badges */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-xs font-bold text-text-primary bg-bg-surface px-2 py-0.5 rounded border border-border-dark">
            {finding.id}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border tracking-wider uppercase ${currentSev.badge}`}>
            {finding.severity}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border flex items-center gap-1 ${currentConf.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${currentConf.dot}`} />
            {finding.confidence} CONFIDENCE
          </span>
          {finding.mitre_technique && (
            <span className="text-[10px] font-mono bg-brand-primary/10 text-brand-hover px-1.5 py-0.5 rounded border border-brand-primary/30">
              {finding.mitre_technique}
            </span>
          )}
        </div>

        <div className="text-right">
          <span className="text-[11px] font-mono text-text-muted bg-bg-surface/80 px-2 py-0.5 rounded border border-border-dark truncate inline-block max-w-[160px]">
            {finding.affected_asset}
          </span>
        </div>
      </div>

      {/* Finding Category Title */}
      <div className="mb-1.5 flex items-center gap-1.5">
        <ShieldAlert className={`w-3.5 h-3.5 shrink-0 ${currentSev.text}`} />
        <h5 className="text-xs font-bold text-text-primary tracking-tight">
          {finding.category}
        </h5>
      </div>

      {/* Concise 1-2 line description */}
      <p className="text-xs text-text-secondary leading-relaxed mb-2.5">
        {finding.description}
      </p>

      {/* Confidence Calibration Detail */}
      <div className="text-[11px] text-text-muted bg-bg-surface/90 p-2 rounded-lg border border-border-dark/80 mb-2.5 space-y-1">
        <div className="flex items-start gap-1">
          <Info className="w-3.5 h-3.5 text-brand-hover shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-text-primary">Calibration Rationale: </span>
            <span>{finding.confidence_justification}</span>
          </div>
        </div>
        {finding.severity_rationale && (
          <div className="text-[10px] text-text-muted pl-4">
            <span className="font-medium text-text-secondary">Severity Impact: </span>
            {finding.severity_rationale}
          </div>
        )}
      </div>

      {/* Immutable Evidence Pills */}
      {finding.evidence_refs && finding.evidence_refs.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mb-3 pt-1 border-t border-border-dark/40">
          <span className="text-[10px] font-mono text-text-muted uppercase flex items-center gap-1">
            <FileText className="w-3 h-3 text-text-muted" />
            Immutable Evidence:
          </span>
          {finding.evidence_refs.map((evId) => (
            <button
              key={evId}
              type="button"
              onClick={() => onInspectEvidence && onInspectEvidence(evId)}
              className="inline-flex items-center gap-1 text-[10px] font-mono bg-bg-surface hover:bg-bg-elevated text-brand-hover hover:text-text-primary px-2 py-0.5 rounded border border-border-dark hover:border-brand-primary/40 transition-colors"
              title={`Inspect immutable evidence record ${evId}`}
            >
              <span>{evId}</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
            </button>
          ))}
        </div>
      )}

      {/* Human-in-the-Loop Action Controls */}
      {finding.status === 'proposed' && (
        <div className="flex items-center justify-between pt-2 border-t border-border-dark/60 gap-2">
          <span className="text-[10px] font-mono text-text-muted italic">
            Human Approval Required
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowRejectModal(true)}
              className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-rose-400 px-2.5 py-1 rounded bg-bg-surface hover:bg-rose-950/20 border border-border-dark hover:border-rose-800/40 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject (False Positive)</span>
            </button>
            <button
              type="button"
              onClick={() => onAccept && onAccept(finding.id)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 px-3 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/50 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Accept Finding</span>
            </button>
          </div>
        </div>
      )}

      {finding.status === 'accepted' && (
        <div className="flex items-center gap-1.5 pt-2 border-t border-emerald-800/30 text-xs font-semibold text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>ACCEPTED BY ANALYST — Staged for Executive Deliverable</span>
        </div>
      )}

      {finding.status === 'rejected' && (
        <div className="flex items-center justify-between pt-2 border-t border-rose-900/30 text-xs text-rose-400">
          <div className="flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            <span>REJECTED (False Positive Pattern Learned)</span>
          </div>
          {finding.rejection_reason && (
            <span className="text-[10px] font-mono bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-900/40">
              {finding.rejection_reason}
            </span>
          )}
        </div>
      )}

      {/* Reject False Positive Feedback Modal */}
      {showRejectModal && (
        <div className="mt-3 p-3 rounded-lg bg-bg-surface border border-rose-800/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-300 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Record False Positive Feedback
            </span>
            <button
              onClick={() => setShowRejectModal(false)}
              className="text-text-muted hover:text-text-primary text-xs"
            >
              ✕
            </button>
          </div>

          <p className="text-[11px] text-text-secondary">
            Recording this rejection stores a pattern signature to automatically suppress similar false alerts for this project.
          </p>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-text-muted uppercase">Reason Category</label>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full text-xs bg-bg-elevated border border-border-dark rounded p-1.5 text-text-primary focus:border-brand-primary outline-none"
            >
              <option value="FALSE_POSITIVE">False Positive (Misidentified Behavior)</option>
              <option value="INTENDED_BEHAVIOR">Intended Architecture / Benign Design</option>
              <option value="KNOWN_TEST_ACTIVITY">Known Testing Activity / Internal Scanner</option>
              <option value="INSUFFICIENT_EVIDENCE">Insufficient Evidence / Unverifiable</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-text-muted uppercase">Analyst Rationale / Comment</label>
            <input
              type="text"
              placeholder="e.g. Authorized load balancer probe with known source IP..."
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              className="w-full text-xs bg-bg-elevated border border-border-dark rounded p-1.5 text-text-primary placeholder:text-text-muted focus:border-brand-primary outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowRejectModal(false)}
              className="text-xs text-text-muted hover:text-text-primary px-2.5 py-1 rounded bg-bg-elevated border border-border-dark"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReject}
              className="text-xs font-semibold text-rose-300 px-3 py-1 rounded bg-rose-950/60 hover:bg-rose-900/80 border border-rose-700/50"
            >
              Confirm Rejection & Suppress Pattern
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
