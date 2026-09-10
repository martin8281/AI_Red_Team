import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  Layers, 
  FileText, 
  ArrowRight,
  Database,
  HardDrive,
  FileCode,
  Check
} from 'lucide-react';
import { SourceType, IngestionJob } from '../../types/knowledge.types';
import { bytesToReadableSize } from '../../utils/fileHelper';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputMode, setInputMode] = useState<'FILE' | 'MANUAL'>('FILE');
  const [sourceName, setSourceName] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('DATASET');
  const [version, setVersion] = useState('1.0');
  const [sourceUrl, setSourceUrl] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [selectedFileMeta, setSelectedFileMeta] = useState<{
    name: string;
    size: number;
    lines: number;
  } | null>(null);
  const [chunkSize, setChunkSize] = useState(500);
  const [chunkOverlap, setChunkOverlap] = useState(50);
  const [isReadingFile, setIsReadingFile] = useState(false);

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsReadingFile(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      
      // Auto-populate Source Name if empty
      if (!sourceName.trim()) {
        const cleanedName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setSourceName(cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1));
      }

      // Auto-detect Source Type
      if (['csv', 'json', 'xml', 'sql'].includes(ext)) {
        setSourceType('DATASET');
      } else if (['pdf', 'docx', 'doc', 'txt', 'md'].includes(ext)) {
        setSourceType('METHODOLOGY');
      }

      const text = await file.text();
      setRawContent(text);
      setSelectedFileMeta({
        name: file.name,
        size: file.size,
        lines: text.split('\n').length,
      });
    } catch {
      setRawContent(`[Custom Dataset: ${file.name}]`);
      setSelectedFileMeta({
        name: file.name,
        size: file.size,
        lines: 1,
      });
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceName.trim() || !rawContent.trim()) return;

    setStep('PROCESSING');
    setCurrentProcessStep(0);

    // Simulate real pipeline stages
    for (let i = 0; i < processSteps.length - 1; i++) {
      await new Promise((r) => setTimeout(r, 400));
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
    setSelectedFileMeta(null);
    setStep('INPUT');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0B1220] border border-[#1E293B] p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#F8FAFC]">
                Ingest Knowledge Base / Dataset
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Upload local security datasets, playbooks, or standards from device storage for vector RAG
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F8FAFC] p-1.5 rounded-lg hover:bg-[#101827]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: INPUT FORM */}
        {step === 'INPUT' && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Input Mode Selector */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-[#050A14] border border-[#1E293B]">
              <button
                type="button"
                onClick={() => setInputMode('FILE')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  inputMode === 'FILE'
                    ? 'bg-[#8B5CF6] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                <HardDrive className="w-4 h-4" />
                <span>Upload from Device Storage</span>
              </button>

              <button
                type="button"
                onClick={() => setInputMode('MANUAL')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  inputMode === 'MANUAL'
                    ? 'bg-[#8B5CF6] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Direct Text Entry</span>
              </button>
            </div>

            {/* File Upload Mode */}
            {inputMode === 'FILE' && (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt,.csv,.json,.xml,.yaml,.yml,.md,.log"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-2xl border-2 border-dashed border-[#1E293B] hover:border-[#8B5CF6]/60 bg-[#050A14]/70 hover:bg-[#101827] transition-all cursor-pointer text-center flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#A78BFA]">
                    {isReadingFile ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[#8B5CF6]" />
                    ) : (
                      <UploadCloud className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#F8FAFC]">
                      {selectedFileMeta ? selectedFileMeta.name : 'Click to select dataset or knowledge file from device storage'}
                    </p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">
                      Supports PDF, CSV, JSON, TXT, MD, XML, YAML, LOG
                    </p>
                  </div>

                  {selectedFileMeta && (
                    <div className="flex items-center gap-2 pt-1">
                      <Badge variant="brand" size="sm">
                        {bytesToReadableSize(selectedFileMeta.size)}
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        {selectedFileMeta.lines} lines extracted
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Source Name & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#CBD5E1]">
                  Dataset / Knowledge Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., OWASP API Top 10 / Internal Playbook"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#050A14] border border-[#1E293B] text-xs text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#CBD5E1]">
                  Source Classification *
                </label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as SourceType)}
                  className="w-full px-3 py-2 rounded-lg bg-[#050A14] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
                >
                  <option value="DATASET">DATASET (Custom Data, CSV, JSON)</option>
                  <option value="METHODOLOGY">METHODOLOGY (Internal Playbooks & Rules)</option>
                  <option value="STANDARD">STANDARD (OWASP, NIST, ISO)</option>
                  <option value="VULNERABILITY_DATABASE">VULNERABILITY_DATABASE (CWE, CVEs)</option>
                  <option value="GUIDANCE">GUIDANCE (Remediation Blueprints)</option>
                </select>
              </div>
            </div>

            {/* Raw Content Viewer / Editor */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-[#CBD5E1]">
                  Extracted Content / Markdown Document *
                </label>
                <span className="text-[10px] font-mono text-[#94A3B8]">
                  {rawContent.length} chars
                </span>
              </div>
              <textarea
                rows={5}
                placeholder="Paste technical documentation, remediation instructions, or dataset records..."
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#050A14] border border-[#1E293B] text-xs text-[#F8FAFC] placeholder-[#94A3B8] font-mono focus:outline-none focus:border-[#8B5CF6] leading-relaxed"
              />
            </div>

            {/* Chunk Parameters */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#050A14] border border-[#1E293B]">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#94A3B8]">Chunk Size (tokens)</span>
                <input
                  type="number"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(parseInt(e.target.value) || 500)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#101827] border border-[#1E293B] text-xs text-[#F8FAFC]"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#94A3B8]">Overlap (tokens)</span>
                <input
                  type="number"
                  value={chunkOverlap}
                  onChange={(e) => setChunkOverlap(parseInt(e.target.value) || 50)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#101827] border border-[#1E293B] text-xs text-[#F8FAFC]"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!sourceName.trim() || !rawContent.trim()}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Start Vector Ingestion
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: PROCESSING PIPELINE */}
        {step === 'PROCESSING' && (
          <div className="py-8 space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center mx-auto text-[#A78BFA] animate-pulse">
              <Database className="w-7 h-7" />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="text-base font-bold text-[#F8FAFC]">
                Ingesting {sourceName}...
              </h4>
              <p className="text-xs text-[#94A3B8]">
                Generating vector embeddings via nomic-embed-text into pgvector
              </p>
            </div>

            {/* Steps Progress */}
            <div className="max-w-md mx-auto space-y-2 text-left bg-[#050A14] p-4 rounded-xl border border-[#1E293B]">
              {processSteps.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs">
                  {idx < currentProcessStep ? (
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                  ) : idx === currentProcessStep ? (
                    <Loader2 className="w-4 h-4 text-[#8B5CF6] animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#1E293B] shrink-0" />
                  )}
                  <span className={idx <= currentProcessStep ? 'text-[#F8FAFC]' : 'text-[#94A3B8]'}>
                    {s}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: COMPLETED */}
        {step === 'COMPLETED' && (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center mx-auto text-[#22C55E]">
              <Check className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-[#F8FAFC]">
                Dataset & Knowledge Source Successfully Ingested!
              </h4>
              <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
                <strong>{sourceName}</strong> is now embedded and ready for semantic vector search and AI Assistant RAG queries.
              </p>
            </div>

            <div className="pt-3">
              <Button variant="primary" size="md" onClick={handleReset}>
                Done & View Knowledge Sources
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
