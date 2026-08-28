import React from 'react';
import { Search, Filter, Sparkles, X } from 'lucide-react';
import { SourceType } from '../../types/knowledge.types';

interface KnowledgeSearchBarProps {
  query: string;
  onQueryChange: (val: string) => void;
  sourceType: string;
  onSourceTypeChange: (val: string) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

export const KnowledgeSearchBar: React.FC<KnowledgeSearchBarProps> = ({
  query,
  onQueryChange,
  sourceType,
  onSourceTypeChange,
  onSearch,
  isLoading = false,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-bg-card border border-border-dark space-y-3 shadow-card-dark">
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Semantic search across OWASP, CWE, NIST, CVSS, and red team playbooks..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full pl-10 pr-28 py-2.5 rounded-xl bg-bg-elevated border border-border-dark text-xs sm:text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary font-sans"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-text-muted">Filter Source:</span>
          <select
            value={sourceType}
            onChange={(e) => onSourceTypeChange(e.target.value)}
            className="py-1 px-2.5 rounded-lg bg-bg-elevated border border-border-dark text-xs text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
          >
            <option value="ALL">All Knowledge Types</option>
            <option value="STANDARD">Standards (OWASP, CVSS)</option>
            <option value="VULNERABILITY_DATABASE">Taxonomy (CWE)</option>
            <option value="GUIDANCE">Technical Guidance (NIST)</option>
            <option value="METHODOLOGY">Internal Playbooks</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted">
          <Sparkles className="w-3 h-3 text-brand-primary" />
          <span>Vector Similarity Index: nomic-embed-text</span>
        </div>
      </div>
    </form>
  );
};
