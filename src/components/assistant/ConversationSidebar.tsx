import React, { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Search, 
  FolderGit2, 
  Clock, 
  ChevronRight 
} from 'lucide-react';
import { Conversation } from '../../types/ai.types';
import { Button } from '../ui/Button';

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId?: string;
  selectedProjectId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  activeConversationId,
  selectedProjectId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}) => {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'current' | 'all'>('current');

  const filtered = conversations.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    if (filterMode === 'current' && selectedProjectId) {
      return matchesSearch && (c.projectId === selectedProjectId || (selectedProjectId === 'general' && c.contextType === 'general'));
    }
    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-bg-card border-r border-border-dark w-full lg:w-72 shrink-0 p-4 space-y-3">
      {/* Top Action */}
      <Button
        onClick={onNewConversation}
        variant="primary"
        size="sm"
        className="w-full justify-center"
        icon={<Plus className="w-4 h-4" />}
      >
        New AI Session
      </Button>

      {/* Search */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter sessions..."
          className="w-full pl-8 pr-3 py-1.5 bg-bg-elevated border border-border-dark rounded-lg text-xs text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-1 focus:ring-brand-primary"
        />
      </div>

      {/* Filter Mode Toggle */}
      <div className="flex items-center rounded-lg bg-[#101827] border border-[#1E293B] p-0.5 text-[11px] font-mono">
        <button
          type="button"
          onClick={() => setFilterMode('current')}
          className={`flex-1 py-1 rounded-md transition-all text-center ${
            filterMode === 'current'
              ? 'bg-[#8B5CF6] text-white font-bold shadow-sm'
              : 'text-[#94A3B8] hover:text-[#CBD5E1]'
          }`}
        >
          Scope Filter
        </button>
        <button
          type="button"
          onClick={() => setFilterMode('all')}
          className={`flex-1 py-1 rounded-md transition-all text-center ${
            filterMode === 'all'
              ? 'bg-[#8B5CF6] text-white font-bold shadow-sm'
              : 'text-[#94A3B8] hover:text-[#CBD5E1]'
          }`}
        >
          All Sessions
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        <div className="text-[10px] font-mono text-text-muted uppercase px-1 pb-1">
          Recent Sessions ({filtered.length})
        </div>

        {filtered.length > 0 ? (
          filtered.map((conv) => {
            const isActive = conv.id === activeConversationId;
            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer group flex items-start justify-between gap-2 ${
                  isActive
                    ? 'bg-brand-primary/15 border-brand-primary/40 text-brand-hover shadow-sm'
                    : 'bg-bg-elevated/60 hover:bg-bg-elevated border-border-dark text-text-secondary hover:text-text-primary'
                }`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 text-brand-primary" />
                    <span className="text-xs font-semibold truncate">
                      {conv.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-text-muted font-mono">
                    <span className="uppercase">{conv.contextType}</span>
                    <span>·</span>
                    <span>{new Date(conv.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-[#EF4444] transition-opacity"
                  title="Delete session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-xs text-text-muted">
            No active AI sessions found.
          </div>
        )}
      </div>
    </div>
  );
};
