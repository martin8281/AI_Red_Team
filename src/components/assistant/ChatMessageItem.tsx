import React from 'react';
import { User, Sparkles, Bot, Clock } from 'lucide-react';
import { ChatMessage } from '../../types/ai.types';
import { StructuredResponseView } from './StructuredResponseView';
import { SourceCitationsView } from '../knowledge/SourceCitationsView';

interface ChatMessageItemProps {
  message: ChatMessage;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const citations = message.sources || message.structured?.sources || [];

  return (
    <div
      className={`flex items-start gap-3.5 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      } animate-in fade-in duration-200`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
          isUser
            ? 'bg-bg-elevated border-border-dark text-text-secondary'
            : 'bg-brand-primary/20 border-brand-primary/40 text-brand-hover shadow-glow-brand'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      {/* Message Bubble Container */}
      <div
        className={`max-w-3xl rounded-2xl p-4 sm:p-5 border space-y-2 ${
          isUser
            ? 'bg-bg-elevated/90 border-border-dark text-text-primary shadow-sm'
            : 'bg-gradient-to-br from-bg-card via-bg-elevated to-bg-card border-brand-primary/30 shadow-card-dark'
        }`}
      >
        {/* Top Header Row */}
        <div
          className={`flex items-center gap-2 text-[11px] font-mono text-text-muted ${
            isUser ? 'justify-end' : 'justify-between'
          }`}
        >
          {!isUser && (
            <span className="text-brand-hover font-bold flex items-center gap-1">
              <span>AI Red Team Co-Pilot (Qwen3 14B Grounded)</span>
            </span>
          )}
          <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Content */}
        {message.structured ? (
          <StructuredResponseView structured={message.structured} />
        ) : (
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        )}

        {/* Verified RAG Source Citations */}
        {!isUser && citations.length > 0 && (
          <SourceCitationsView sources={citations} />
        )}
      </div>
    </div>
  );
};
