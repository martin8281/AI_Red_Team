import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Database, Search } from 'lucide-react';
import { KnowledgeChunk } from '../types/knowledge.types';
import { knowledgeService } from '../services/knowledgeService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { KnowledgeSearchBar } from '../components/knowledge/KnowledgeSearchBar';
import { SearchResultsList } from '../components/knowledge/SearchResultsList';
import { Button } from '../components/ui/Button';

export const KnowledgeSearchPage: React.FC = () => {
  const [query, setQuery] = useState('SQL injection prepared statements');
  const [sourceType, setSourceType] = useState('ALL');
  const [results, setResults] = useState<KnowledgeChunk[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const executeSearch = async () => {
    setIsLoading(true);
    try {
      const data = await knowledgeService.searchChunks(query, {
        sourceType,
        limit: 8,
        threshold: 0.2,
      });
      setResults(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, [sourceType]);

  return (
    <DashboardLayout
      title="Semantic Knowledge Search"
      subtitle="Query embedded vectors using pgvector cosine similarity ranking."
    >
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-2 border-b border-border-dark">
          <Button
            to="/knowledge"
            variant="outline"
            size="sm"
            icon={<ArrowLeft className="w-3.5 h-3.5" />}
            iconPosition="left"
          >
            Back to Knowledge Base
          </Button>

          <span className="text-xs font-mono text-text-muted">
            PGVECTOR_SEMANTIC_SEARCH
          </span>
        </div>

        {/* Search Bar */}
        <KnowledgeSearchBar
          query={query}
          onQueryChange={setQuery}
          sourceType={sourceType}
          onSourceTypeChange={setSourceType}
          onSearch={executeSearch}
          isLoading={isLoading}
        />

        {/* Results List */}
        <SearchResultsList results={results} isLoading={isLoading} />

      </div>
    </DashboardLayout>
  );
};
