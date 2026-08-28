import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Database, 
  Search, 
  Plus, 
  Layers, 
  FileText, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { KnowledgeSource, IngestionJob } from '../types/knowledge.types';
import { knowledgeService } from '../services/knowledgeService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { KnowledgeSourceCard } from '../components/knowledge/KnowledgeSourceCard';
import { IngestionWizardModal } from '../components/knowledge/IngestionWizardModal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const KnowledgePage: React.FC = () => {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [stats, setStats] = useState<{
    totalSources: number;
    totalDocs: number;
    totalChunks: number;
    embeddingModel: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [srcs, st] = await Promise.all([
        knowledgeService.getSources(),
        knowledgeService.getStats(),
      ]);
      setSources(srcs);
      setStats(st);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIngest = async (job: IngestionJob) => {
    await knowledgeService.ingestDocument(job);
    await loadData();
  };

  return (
    <DashboardLayout
      title="Security Knowledge Base & RAG"
      subtitle="Authoritative standards (OWASP, CWE, NIST, CVSS) and internal methodology embedded in PostgreSQL pgvector."
    >
      <div className="space-y-6">
        
        {/* Top Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              Vector Knowledge Sources & Taxonomy
            </h2>
            <p className="text-xs text-text-muted">
              RAG grounding enables Qwen3 14B to provide verified citations and defense-in-depth guidance without hallucinations.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              to="/knowledge/search"
              variant="outline"
              size="md"
              icon={<Search className="w-4 h-4" />}
            >
              Semantic Vector Search
            </Button>

            <Button
              onClick={() => setIsIngestModalOpen(true)}
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
            >
              + Ingest Document
            </Button>
          </div>
        </div>

        {/* Telemetry Stats Bar */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card variant="default" className="p-4 bg-bg-card border-border-dark space-y-1 text-center shadow-card-dark">
              <span className="text-[10px] font-mono uppercase text-text-muted">
                Knowledge Sources
              </span>
              <div className="text-2xl font-black font-mono text-text-primary">
                {stats.totalSources}
              </div>
            </Card>

            <Card variant="default" className="p-4 bg-bg-card border-border-dark space-y-1 text-center shadow-card-dark">
              <span className="text-[10px] font-mono uppercase text-text-muted">
                Indexed Documents
              </span>
              <div className="text-2xl font-black font-mono text-brand-hover">
                {stats.totalDocs}
              </div>
            </Card>

            <Card variant="default" className="p-4 bg-bg-card border-border-dark space-y-1 text-center shadow-card-dark">
              <span className="text-[10px] font-mono uppercase text-text-muted">
                pgvector Chunks
              </span>
              <div className="text-2xl font-black font-mono text-[#22C55E]">
                {stats.totalChunks}
              </div>
            </Card>

            <Card variant="default" className="p-4 bg-bg-card border-border-dark space-y-1 text-center shadow-card-dark">
              <span className="text-[10px] font-mono uppercase text-text-muted">
                Embedding Model
              </span>
              <div className="text-xs font-mono font-bold text-brand-primary truncate pt-1">
                nomic-embed-text
              </div>
            </Card>
          </div>
        )}

        {/* Sources Catalog Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
            <span className="text-xs text-text-muted font-mono">
              Loading PostgreSQL pgvector knowledge sources...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sources.map((source) => (
              <KnowledgeSourceCard key={source.id} source={source} />
            ))}
          </div>
        )}

      </div>

      {/* Ingestion Wizard Modal */}
      <IngestionWizardModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onIngest={handleIngest}
      />
    </DashboardLayout>
  );
};
