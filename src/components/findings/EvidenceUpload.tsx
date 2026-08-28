import React, { useState } from 'react';
import { Upload, FileCode, Plus, CheckCircle2 } from 'lucide-react';
import { Evidence } from '../../types/finding.types';
import { Button } from '../ui/Button';

interface EvidenceUploadProps {
  onAddEvidence: (evidence: Omit<Evidence, 'id' | 'createdAt'>) => Promise<void>;
  findingId: string;
}

export const EvidenceUpload: React.FC<EvidenceUploadProps> = ({
  onAddEvidence,
  findingId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileReference, setFileReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddEvidence({
        findingId,
        title: title.trim(),
        description: description.trim(),
        fileReference: fileReference.trim() || undefined,
        notes: notes.trim() || undefined,
        createdBy: 'Alex Vance',
      });
      setTitle('');
      setDescription('');
      setFileReference('');
      setNotes('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-bg-card border border-border-dark space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
          <Upload className="w-3.5 h-3.5 text-brand-primary" />
          <span>Quick Evidence Logger</span>
        </h4>
        {success && (
          <span className="text-[11px] text-[#22C55E] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Evidence Recorded</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Evidence Title (e.g. HTTP Request Log)"
          className="w-full px-3 py-1.5 bg-bg-elevated border border-border-dark rounded-lg text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          required
        />
        <input
          type="text"
          value={fileReference}
          onChange={(e) => setFileReference(e.target.value)}
          placeholder="Artifact File (e.g. poc_auth_trace.txt)"
          className="w-full px-3 py-1.5 bg-bg-elevated font-mono border border-border-dark rounded-lg text-xs text-brand-hover focus:outline-none focus:ring-1 focus:ring-brand-primary"
        />
      </div>

      <textarea
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Verification methodology and observed payload behavior..."
        className="w-full p-2.5 bg-bg-elevated border border-border-dark rounded-lg text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
        required
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isSubmitting || !title.trim() || !description.trim()}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          {isSubmitting ? 'Recording...' : 'Attach Evidence'}
        </Button>
      </div>
    </form>
  );
};
