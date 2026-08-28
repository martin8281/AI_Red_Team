import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  Layers, 
  FileText, 
  ArrowRight,
  Database
} from 'lucide-react';
import { SourceType, IngestionJob } from '../../types/knowledge.types';
import { Button } from '../ui/Button';

interface IngestionWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngest: (job: IngestionJob) => Promise<void>;
}

export const IngestionWizardModal: React.FC<IngestionWizardModalProps> = ({
  isOpen,
  onClose,
  onIngest,
}) => {
  if (!isOpen) return null;

  const [sourceName, setSourceName] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('METHODOLOGY');
  const [version, setVersion] = useState('1.0');
  const [sourceUrl, setSourceUrl] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [chunkSize, setChunkSize] = useState(500);
  const [chunkOverlap, setChunkOverlap] = useState(50);

  const [step, setStep] = useState<'INPUT' | 'PROCESSING' | 'COMPLETED'>('INPUT');
  const [currentProcessStep, setCurrentProcessStep] = useState(0);

  const processSteps = [
    'Validating Document Structure & SHA-256 Hash...',
    'Extracting & Cleaning Text Stream...',
    'Chunking into Semantic Paragraphs (500 tokens / 50 overlap)...',
    'Generating Embeddings via Ollama nomic-embed-text...',
    'Indexing Vectors in PostgreSQL pgvector Table...',
    'Knowledge Source Active & Ready for RAG Retrieval.',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceName.trim() || !rawContent.trim()) return;

    setStep('PROCESSING');
    setCurrentProcessStep(0);

    // Simulate real pipeline stages
    for (let i = 0; i < processSteps.length - 1; i++) {
      await new Promise((r) => setTimeout(r, 450));
      setCurrentProcessStep(i + 1);
    }

    await onIngest({
      sourceName: sourceName.trim(),
      sourceType,
      version: version.trim(),
      sourceUrl: sourceUrl.trim() || undefined,
      rawContent: rawContent.trim(),
      chunkSize,
      chunkOverlap,
    });

    setStep('COMPLETED');
  };

  const handleReset = () => {
    setSourceName('');
    setRawContent('');
    setStep('INPUT');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-bg-card border border-border-dark p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-dark">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-primary" />
            <h3 className="text-base sm:text-lg font-bold text-text-primary">
              Ingest Security Knowledge Document
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-bg-elevated"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'INPUT' && (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-secondary">
                  Source / Document Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Container Security Playbook"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-elevated text-xs sm:text-sm text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-secondary">
                  Knowledge Source Type
                </label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as SourceType)}
                  className="w-full px-3 py-2 bg-bg-elevated text-xs sm:text-sm font-semibold text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
                >
                  <option value="METHODOLOGY">Methodology / Playbook</option>
                  <option value="STANDARD">Security Standard</option>
                  <option value="GUIDANCE">Technical Guidance</option>
                  <option value="VULNERABILITY_DATABASE">Weakness Database</option>
                  <option value="INTERNAL_DOCUMENT">Internal Document</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-secondary">
                  Version
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-elevated text-xs sm:text-sm text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-secondary">
                  Reference Documentation URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-elevated text-xs sm:text-sm text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50 placeholder:text-text-disabled"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary">
                Document Raw Content (Markdown or Text)
              </label>
              <textarea
                required
                rows={8}
                placeholder="Paste the security guidance, OWASP recommendation, or methodology instructions to chunk and embed..."
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-bg-elevated border border-border-dark text-xs sm:text-sm font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 placeholder:text-text-disabled leading-relaxed"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-bg-surface border border-border-dark flex items-center justify-between text-xs font-mono text-text-muted">
              <span>Embedding Engine: Ollama / nomic-embed-text</span>
              <span>Chunk Size: {chunkSize} | Overlap: {chunkOverlap}</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-dark">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Start Ingestion Pipeline
              </Button>
            </div>
          </form>
        )}

        {step === 'PROCESSING' && (
          <div className="py-8 space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center mx-auto text-brand-primary">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-text-primary">
                Ingesting into pgvector Knowledge Base
              </h4>
              <p className="text-xs font-mono text-brand-hover">
                {processSteps[currentProcessStep]}
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-2 text-left text-xs font-mono">
              {processSteps.map((s, idx) => (
                <div
                  key={s}
                  className={`flex items-center gap-2 transition-opacity ${
                    idx <= currentProcessStep ? 'text-text-primary' : 'text-text-disabled opacity-40'
                  }`}
                >
                  {idx < currentProcessStep ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                  ) : idx === currentProcessStep ? (
                    <Loader2 className="w-3.5 h-3.5 text-brand-primary animate-spin" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-border-dark" />
                  )}
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'COMPLETED' && (
          <div className="py-8 space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center mx-auto text-[#22C55E]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-text-primary">
                Document Successfully Ingested & Embedded
              </h4>
              <p className="text-xs text-text-muted">
                "{sourceName}" is now active in pgvector and ready to ground Qwen3 14B responses.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleReset}
            >
              Done
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};
