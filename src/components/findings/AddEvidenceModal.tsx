import React, { useState } from 'react';
import { X, FileCode, CheckCircle2, Shield, Upload, FileText } from 'lucide-react';
import { Evidence } from '../../types/finding.types';
import { Button } from '../ui/Button';

interface AddEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (evidenceData: Omit<Evidence, 'id' | 'createdAt'>) => Promise<void>;
  findingId: string;
}

export const AddEvidenceModal: React.FC<AddEvidenceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  findingId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileReference, setFileReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Evidence title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Evidence description is required.');
    }

    setIsSubmitting(true);
    try {
      await onSave({
        findingId,
        title: title.trim(),
        description: description.trim(),
        fileReference: fileReference.trim() || undefined,
        notes: notes.trim() || undefined,
        createdBy: 'Alex Vance',
      });
      onClose();
      setTitle('');
      setDescription('');
      setFileReference('');
      setNotes('');
    } catch {
      setError('Failed to record evidence.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-bg-card border border-border-dark p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border-dark">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-brand-primary" />
            <h3 className="text-base font-bold text-text-primary">
              Attach Verification Evidence
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-bg-elevated"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <p className="p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444]">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-text-secondary">
              Evidence Title <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. HTTP Request/Response Differential Log"
              className="w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-border-dark text-xs sm:text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-text-secondary">
              Observations & Context <span className="text-[#EF4444]">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain how the proof-of-concept was verified without automated exploit tools..."
              className="w-full p-3 rounded-lg bg-bg-elevated border border-border-dark text-xs sm:text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
          </div>

          {/* File Reference */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-text-secondary">
              Artifact / File Reference Name
            </label>
            <input
              type="text"
              value={fileReference}
              onChange={(e) => setFileReference(e.target.value)}
              placeholder="e.g. poc_request_diff_v2.txt or screenshot_auth_bypass.png"
              className="w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-border-dark font-mono text-xs sm:text-sm text-brand-hover placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
          </div>

          {/* Technical Notes / Snippet */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-text-secondary">
              Technical Verification Notes / Sanitized Snippet
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Payload: test_param' OR 1=1-- returned 200 OK status with altered body length."
              className="w-full p-3 rounded-lg bg-bg-elevated border border-border-dark font-mono text-xs text-text-secondary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
          </div>

          <div className="p-2.5 rounded-lg bg-bg-surface border border-border-dark text-[11px] text-text-muted">
            Evidence is stored for audit and report generation. Do not include passwords, API keys, or raw customer secrets.
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving Evidence...' : 'Attach Evidence'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
