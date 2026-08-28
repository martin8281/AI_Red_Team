import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Evidence } from '../../types/finding.types';
import { EvidenceVerificationStatus } from '../../types/workspace.types';
import { Button } from '../ui/Button';

interface EvidenceReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: Evidence | null;
  onVerify: (
    evidenceId: string,
    status: EvidenceVerificationStatus,
    reviewer: string
  ) => Promise<void>;
}

export const EvidenceReviewModal: React.FC<EvidenceReviewModalProps> = ({
  isOpen,
  onClose,
  evidence,
  onVerify,
}) => {
  if (!isOpen || !evidence) return null;

  const [status, setStatus] = useState<EvidenceVerificationStatus>(
    evidence.verificationStatus || 'VERIFIED'
  );
  const [reviewer, setReviewer] = useState('Alex Vance');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onVerify(evidence.id, status, reviewer.trim());
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-bg-card border border-border-dark p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-dark">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-primary" />
            <h3 className="text-base font-bold text-text-primary">
              Verify Proof-of-Concept Technical Evidence
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-bg-elevated"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-bg-surface border border-border-dark space-y-1 text-xs text-left">
          <span className="font-mono text-text-muted">{evidence.id}</span>
          <h4 className="font-bold text-text-primary">{evidence.title}</h4>
          <p className="text-[11px] text-text-muted font-mono">{evidence.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-secondary">
              Verification Decision
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as EvidenceVerificationStatus)}
              className="w-full px-3 py-2 bg-bg-elevated text-xs font-semibold text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
            >
              <option value="VERIFIED">VERIFIED — Technical PoC Confirmed Valid</option>
              <option value="REVIEWED">REVIEWED — Inspected Without Full Execution</option>
              <option value="REJECTED">REJECTED — Invalid Trace / Insufficient Artifact</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-secondary">
              Lead Reviewer Signature
            </label>
            <input
              type="text"
              required
              value={reviewer}
              onChange={(e) => setReviewer(e.target.value)}
              className="w-full px-3 py-2 bg-bg-elevated text-xs text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-dark">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              icon={isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            >
              {isSubmitting ? 'Saving...' : 'Sign-Off Evidence'}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};
