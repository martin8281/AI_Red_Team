import React, { useState } from 'react';
import { BookOpen, ExternalLink, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { SourceCitation } from '../../types/knowledge.types';

interface SourceCitationsViewProps {
  sources: SourceCitation[];
}

export const SourceCitationsView: React.FC<SourceCitationsViewProps> = ({
  sources,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="pt-3 border-t border-brand-primary/20 space-y-2 text-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-2.5 rounded-xl bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 text-left transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-hover" />
          <span className="font-mono font-bold text-brand-hover">
            Verified Knowledge Base Grounding ({sources.length} {sources.length === 1 ? 'Source' : 'Sources'})
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5 text-brand-hover" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-brand-hover" />
        )}
      </button>

      {isOpen && (
        <div className="space-y-2 pl-2">
          {sources.map((src, idx) => (
            <div
              key={`${src.documentId}-${idx}`}
              className="p-3 rounded-xl bg-bg-surface border border-border-dark space-y-1 text-[11px]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold text-text-primary">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-brand-primary/20 text-brand-hover border border-brand-primary/40">
                    {src.source}
                  </span>
                  <span>{src.title}</span>
                </div>
                {src.relevanceScore && (
                  <span className="text-[10px] font-mono text-[#22C55E] font-bold">
                    {Math.round(src.relevanceScore * 100)}% Match
                  </span>
                )}
              </div>

              {src.reference && (
                <div className="text-text-muted font-mono text-[10px]">
                  Ref: {src.reference}
                </div>
              )}

              {src.snippet && (
                <p className="text-text-secondary leading-relaxed pt-1 border-t border-border-dark/40 font-sans">
                  "{src.snippet}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
