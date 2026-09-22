import React, { useState } from 'react';
import { X, Edit3, Save, Sparkles, Loader2 } from 'lucide-react';
import { ReportSection } from '../../types/report.types';
import { Button } from '../ui/Button';

interface SectionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: ReportSection | null;
  onSave: (sectionId: string, content: string) => Promise<void>;
  onRegenerateAi?: (sectionType: any) => Promise<void>;
}

export const SectionEditorModal: React.FC<SectionEditorModalProps> = ({
  isOpen,
  onClose,
  section,
  onSave,
  onRegenerateAi,
}) => {
  if (!isOpen || !section) return null;

  const [content, setContent] = useState(section.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(section.id, content);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiRegenerate = async () => {
    if (!onRegenerateAi) return;
    setIsRegenerating(true);
    try {
      await onRegenerateAi(section.sectionType);
      onClose();
    } finally {
      setIsRegenerating(false);
    }
  };

  const canAiRegenerate =
    section.sectionType === 'executive_summary' ||
    section.sectionType === 'recommendations' ||
    section.sectionType === 'conclusion';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-bg-card border border-border-dark p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-dark">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-brand-primary" />
            <h3 className="text-base sm:text-lg font-bold text-text-primary">
              Edit Section: {section.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-bg-elevated"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        {canAiRegenerate && onRegenerateAi && (
          <div className="p-3 rounded-xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-text-secondary">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              <span>AI narrative generation is available for this section.</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isRegenerating}
              onClick={handleAiRegenerate}
              icon={<Sparkles className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />}
            >
              {isRegenerating ? 'Regenerating...' : 'Regenerate with AI'}
            </Button>
          </div>
        )}

        {/* Content Editor */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-text-secondary">
            Section Markdown Content
          </label>
          <textarea
            rows={14}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 rounded-xl bg-bg-elevated border border-border-dark text-xs sm:text-sm font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 leading-relaxed resize-y"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-dark">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isSaving}
            onClick={handleSave}
            icon={isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          >
            {isSaving ? 'Saving...' : 'Save Section'}
          </Button>
        </div>
      </div>
    </div>
  );
};
