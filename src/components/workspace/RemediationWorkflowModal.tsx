import React, { useState } from 'react';
import { X, CheckCircle2, Sliders, ArrowRight, Loader2, UserCheck, Calendar } from 'lucide-react';
import { Finding } from '../../types/finding.types';
import { RemediationStatus } from '../../types/workspace.types';
import { Button } from '../ui/Button';

interface RemediationWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  finding: Finding | null;
  onSave: (
    findingId: string,
    status: RemediationStatus,
    notes: string,
    assignedUser?: string,
    dueDate?: string
  ) => Promise<void>;
}

export const RemediationWorkflowModal: React.FC<RemediationWorkflowModalProps> = ({
  isOpen,
  onClose,
  finding,
  onSave,
}) => {
  if (!isOpen || !finding) return null;

  const [remediationStatus, setRemediationStatus] = useState<RemediationStatus>(
    finding.remediationStatus || 'NOT_STARTED'
  );
  const [resolutionNotes, setResolutionNotes] = useState(finding.resolutionNotes || '');
  const [assignedUser, setAssignedUser] = useState(finding.assignedUser || 'DevSecOps Team');
  const [dueDate, setDueDate] = useState(finding.dueDate || '2026-09-15');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(
        finding.id,
        remediationStatus,
        resolutionNotes.trim(),
        assignedUser.trim(),
        dueDate
      );
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-bg-card border border-border-dark p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-dark">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-primary" />
            <h3 className="text-base font-bold text-text-primary">
              Update Finding Remediation Lifecycle
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-bg-elevated"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-bg-surface border border-border-dark space-y-1 text-xs">
          <span className="text-[10px] font-mono text-text-muted">{finding.id}</span>
          <h4 className="font-bold text-text-primary truncate">{finding.title}</h4>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Remediation Status */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-secondary">
              Remediation Lifecycle Stage
            </label>
            <select
              value={remediationStatus}
              onChange={(e) => setRemediationStatus(e.target.value as RemediationStatus)}
              className="w-full px-3 py-2 bg-bg-elevated text-xs font-semibold text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
            >
              <option value="NOT_STARTED">NOT_STARTED — Pending Developer Triage</option>
              <option value="IN_PROGRESS">IN_PROGRESS — Engineering Fix Active</option>
              <option value="FIXED">FIXED — Code Patched in Staging</option>
              <option value="VERIFIED">VERIFIED — Tester Verified in Staging</option>
              <option value="REJECTED">REJECTED — False Positive / Compensating Control</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary">
                Assigned Team / Engineer
              </label>
              <input
                type="text"
                value={assignedUser}
                onChange={(e) => setAssignedUser(e.target.value)}
                className="w-full px-3 py-2 bg-bg-elevated text-xs text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary">
                SLA Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-bg-elevated text-xs text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              />
            </div>
          </div>

          {/* Resolution Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-secondary">
              Remediation Notes / Verification Sign-off
            </label>
            <textarea
              rows={4}
              placeholder="e.g. Parameterized queries implemented on auth controller. Re-tested with non-destructive differential boundary payloads."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full p-3 rounded-lg bg-bg-elevated border border-border-dark text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-dark">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSaving}
              icon={isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
            >
              {isSaving ? 'Saving...' : 'Update Remediation'}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};
