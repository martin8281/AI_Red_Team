import React from 'react';
import { BookOpen, ExternalLink, Sparkles, CheckCircle2, Shield } from 'lucide-react';
import { KnowledgeChunk } from '../../types/knowledge.types';
import { Card } from '../ui/Card';

interface SearchResultsListProps {
  results: KnowledgeChunk[];
  isLoading?: boolean;
}

export const SearchResultsList: React.FC<SearchResultsListProps> = ({
  results,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="py-16 text-center space-y-3">
        <Sparkles className="w-6 h-6 text-brand-primary animate-spin mx-auto" />
        <p className="text-xs text-text-muted font-mono">
          Executing pgvector cosine similarity ranking...
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-bg-card border border-border-dark text-center space-y-3 shadow-card-dark max-w-lg mx-auto">
        <BookOpen className="w-8 h-8 text-text-muted mx-auto opacity-50" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-text-primary">No Matching Chunks</h4>
          <p className="text-xs text-text-muted">
            Try adjusting your search terms or expanding source type filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-mono text-text-muted px-1">
        <span>TOP_K_RELEVANCE_RESULTS</span>
        <span>{results.length} Chunks Retrieved</span>
      </div>

      {results.map((chunk) => {
        const scorePct = Math.round((chunk.similarityScore || 0.8) * 100);
        return (
          <Card
            key={chunk.id}
            variant="default"
            className="p-5 bg-bg-card border-border-dark space-y-3 shadow-card-dark hover:border-brand-primary/40 transition-colors"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-primary/10 text-brand-hover border border-brand-primary/30">
                  {chunk.sourceName}
                </span>
                <span className="text-xs font-bold text-text-primary">
                  {chunk.title}
                </span>
              </div>

              {/* Similarity Score Pill */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono text-text-muted">Cosine Match:</span>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                    scorePct >= 75
                      ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30'
                      : 'bg-brand-primary/10 text-brand-hover border-brand-primary/30'
                  }`}
                >
                  {scorePct}%
                </span>
              </div>
            </div>

            {/* Section */}
            <div className="text-[11px] font-mono text-text-muted flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-brand-primary" />
              <span>Section: {chunk.section}</span>
            </div>

            {/* Content Text */}
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans bg-bg-surface p-3.5 rounded-xl border border-border-dark">
              {chunk.content}
            </p>

            {/* Metadata Tags */}
            {chunk.metadata && (
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-text-muted pt-1">
                {Object.entries(chunk.metadata).map(([k, v]) => (
                  <span key={k} className="px-2 py-0.5 rounded bg-bg-elevated border border-border-dark">
                    {k}: {String(v)}
                  </span>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};
