import React, { useState } from 'react';
import { 
  FileCode, 
  Plus, 
  Trash2, 
  FileText, 
  Copy, 
  Check, 
  Clock, 
  UserCheck, 
  ShieldCheck,
  Info
} from 'lucide-react';
import { Evidence } from '../../types/finding.types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AddEvidenceModal } from './AddEvidenceModal';

interface EvidenceListProps {
  findingId: string;
  evidence: Evidence[];
  onAddEvidence: (evidenceData: Omit<Evidence, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteEvidence: (id: string) => Promise<void>;
}

export const EvidenceList: React.FC<EvidenceListProps> = ({
  findingId,
  evidence,
  onAddEvidence,
  onDeleteEvidence,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyNotes = (notes: string, id: string) => {
    navigator.clipboard.writeText(notes);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <FileCode className="w-4 h-4 text-brand-primary" />
            <span>Attached Proof-of-Concept & Evidence</span>
          </h3>
          <p className="text-xs text-text-muted">
            Technical observations and sanitized verification artifacts
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Evidence
        </Button>
      </div>

      {/* Evidence Items */}
      {evidence.length > 0 ? (
        <div className="space-y-3">
          {evidence.map((item) => (
            <Card
              key={item.id}
              variant="default"
              className="p-5 bg-bg-card border-border-dark space-y-3 shadow-card-dark relative group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-text-muted">{item.id}</span>
                    <h4 className="text-sm font-bold text-text-primary">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <button
                  onClick={() => onDeleteEvidence(item.id)}
                  className="text-text-muted hover:text-[#EF4444] p-1.5 rounded-lg hover:bg-bg-elevated transition-colors shrink-0"
                  title="Delete evidence"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Artifact Reference and Technical Notes */}
              {(item.fileReference || item.notes) && (
                <div className="p-3 rounded-xl bg-bg-elevated border border-border-dark space-y-2 text-xs">
                  {item.fileReference && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-text-muted font-mono">Reference:</span>
                      <span className="px-2 py-0.5 rounded bg-bg-surface border border-border-dark font-mono text-[11px] text-brand-hover">
                        {item.fileReference}
                      </span>
                    </div>
                  )}

                  {item.notes && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-text-muted font-mono">Sanitized Payload / Log Trace:</span>
                        <button
                          onClick={() => handleCopyNotes(item.notes!, item.id)}
                          className="inline-flex items-center gap-1 text-[10px] text-text-muted hover:text-text-primary"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#22C55E]" />
                              <span className="text-[#22C55E]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-2.5 rounded-lg bg-bg-surface border border-border-dark text-[11px] font-mono text-text-secondary overflow-x-auto whitespace-pre-wrap">
                        {item.notes}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Meta */}
              <div className="pt-2 border-t border-border-dark/50 flex items-center justify-between text-[11px] text-text-muted">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3 h-3 text-brand-primary" />
                  <span>Recorded by {item.createdBy}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card variant="default" className="p-8 bg-bg-card border border-dashed border-border-dark text-center space-y-3">
          <Info className="w-6 h-6 text-text-muted mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-text-primary">No Evidence Attached</h4>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              Attach technical verification artifacts, sanitized payloads, or reproduction notes to support this security finding.
            </p>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            variant="outline"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Attach First Evidence
          </Button>
        </Card>
      )}

      {/* Modal */}
      <AddEvidenceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onAddEvidence}
        findingId={findingId}
      />
    </div>
  );
};
