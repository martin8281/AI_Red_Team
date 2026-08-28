import React from 'react';
import { 
  BookOpen, 
  ExternalLink, 
  Layers, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck 
} from 'lucide-react';
import { KnowledgeSource, SourceType, SourceStatus } from '../../types/knowledge.types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface KnowledgeSourceCardProps {
  source: KnowledgeSource;
  onDelete?: (id: string) => void;
}

export const KnowledgeSourceCard: React.FC<KnowledgeSourceCardProps> = ({
  source,
  onDelete,
}) => {
  const getTypeBadge = (type: SourceType) => {
    switch (type) {
      case 'STANDARD':
        return <Badge variant="brand" size="sm">STANDARD</Badge>;
      case 'VULNERABILITY_DATABASE':
        return <Badge variant="critical" size="sm">VULN_DB</Badge>;
      case 'GUIDANCE':
        return <Badge variant="high" size="sm">GUIDANCE</Badge>;
      case 'METHODOLOGY':
        return <Badge variant="low" size="sm">METHODOLOGY</Badge>;
      case 'INTERNAL_DOCUMENT':
      default:
        return <Badge variant="neutral" size="sm">INTERNAL</Badge>;
    }
  };

  const getStatusBadge = (status: SourceStatus) => {
    switch (status) {
      case 'INDEXED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded border border-[#22C55E]/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>INDEXED</span>
          </span>
        );
      case 'INDEXING':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-brand-hover bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/30 animate-pulse">
            <span>INDEXING</span>
          </span>
        );
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <Card
      variant="default"
      hoverEffect
      className="p-6 bg-bg-card border-border-dark flex flex-col justify-between space-y-4 shadow-card-dark relative group transition-all duration-200"
    >
      <div className="space-y-3">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {getTypeBadge(source.sourceType)}
            <span className="text-[11px] font-mono font-bold text-text-muted bg-bg-surface px-2 py-0.5 rounded border border-border-dark">
              v{source.version}
            </span>
          </div>
          {getStatusBadge(source.status)}
        </div>

        {/* Source Title & Description */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-text-primary group-hover:text-brand-hover transition-colors">
            {source.name}
          </h3>
          <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
            {source.description}
          </p>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-bg-surface border border-border-dark text-center font-mono text-xs">
          <div>
            <span className="text-[10px] text-text-muted uppercase block">Documents</span>
            <span className="font-bold text-text-primary text-sm mt-0.5 block">
              {source.documentsCount}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-text-muted uppercase block">Vector Chunks</span>
            <span className="font-bold text-brand-hover text-sm mt-0.5 block">
              {source.chunksCount}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-border-dark/60 flex items-center justify-between gap-2 text-xs">
        <span className="text-[10px] font-mono text-text-muted">
          Updated: {new Date(source.updatedAt).toLocaleDateString()}
        </span>

        {source.sourceUrl && (
          <a
            href={source.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-brand-hover hover:underline"
          >
            <span>Documentation</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </Card>
  );
};
