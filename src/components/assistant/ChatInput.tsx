import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onClearConversation?: () => void;
  hasMessages?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onClearConversation,
  hasMessages = false,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (!text.trim() || isLoading) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-2">
      {/* Loading Status Indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 text-xs font-mono text-brand-hover animate-pulse p-2 rounded-lg bg-brand-primary/10 border border-brand-primary/20">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>AI is analyzing engagement context & correlating vulnerability parameters...</span>
        </div>
      )}

      {/* Input Box */}
      <div className="p-3 rounded-2xl bg-bg-card border border-border-dark focus-within:border-brand-primary/50 focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all shadow-card-dark flex flex-col gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          disabled={isLoading}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI Red Team Assistant about vulnerability vectors, CVSS impact, or remediation..."
          className="w-full bg-transparent text-xs sm:text-sm text-text-primary placeholder:text-text-disabled focus:outline-none resize-none max-h-36 leading-relaxed"
        />

        <div className="flex items-center justify-between pt-1 border-t border-border-dark/40 text-[11px] text-text-muted">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline font-mono">Press [Enter] to send, [Shift+Enter] for line break</span>
            {hasMessages && onClearConversation && (
              <button
                type="button"
                onClick={onClearConversation}
                className="hover:text-[#EF4444] transition-colors flex items-center gap-1 font-mono"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear session</span>
              </button>
            )}
          </div>

          <button
            onClick={handleSend}
            disabled={!text.trim() || isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-hover disabled:bg-bg-elevated disabled:text-text-disabled text-white text-xs font-bold transition-all shadow-md shadow-brand-primary/20 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
