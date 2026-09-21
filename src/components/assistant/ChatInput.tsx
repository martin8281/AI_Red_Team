import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Sparkles, 
  Loader2, 
  Trash2, 
  X, 
  FileText, 
  Terminal, 
  FileCode, 
  Archive, 
  Image as ImageIcon,
  Plus
} from 'lucide-react';
import { ForensicAttachment, QuickActionType } from '../../types/ai.types';
import { processForensicFile, bytesToReadableSize } from '../../utils/fileHelper';

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: ForensicAttachment[]) => void;
  isLoading: boolean;
  onClearConversation?: () => void;
  hasMessages?: boolean;
  onQuickAction?: (action: QuickActionType) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onClearConversation,
  hasMessages = false,
  onQuickAction,
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<ForensicAttachment[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [text]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingFile(true);
    try {
      const processed: ForensicAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        const item = await processForensicFile(files[i]);
        processed.push(item);
      }
      setAttachments((prev) => [...prev, ...processed]);
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isLoading) return;
    onSendMessage(text.trim(), attachments.length > 0 ? attachments : undefined);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleClear = () => {
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    onClearConversation?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getAttachmentIcon = (category: ForensicAttachment['category']) => {
    switch (category) {
      case 'LOG':
        return <Terminal className="w-3.5 h-3.5 text-[#3B82F6]" />;
      case 'DATA':
        return <FileCode className="w-3.5 h-3.5 text-[#8B5CF6]" />;
      case 'ARCHIVE':
        return <Archive className="w-3.5 h-3.5 text-[#EAB308]" />;
      case 'IMAGE':
        return <ImageIcon className="w-3.5 h-3.5 text-[#22C55E]" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-[#CBD5E1]" />;
    }
  };

  return (
    <div className="space-y-2.5 max-w-4xl mx-auto w-full">
      {/* Hidden universal file input accepting all file types */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="*/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Loading Status Indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 text-xs font-mono text-brand-hover animate-pulse px-3 py-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20 backdrop-blur-sm">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Qwen3 14B is correlating forensic parameters & pgvector knowledge...</span>
        </div>
      )}

      {/* Gemini-Style Main Input Container */}
      <div className="relative rounded-2xl bg-[#0B1220] border border-[#1E293B] focus-within:border-[#8B5CF6]/70 focus-within:ring-2 focus-within:ring-[#8B5CF6]/20 transition-all shadow-2xl p-3 flex flex-col gap-2 backdrop-blur-xl">
        
        {/* Attached Forensic Files Preview Bar */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-2 border-b border-[#1E293B]">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#101827] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] shadow-sm animate-in fade-in"
              >
                {getAttachmentIcon(att.category)}
                <span className="truncate max-w-[140px] font-medium">{att.name}</span>
                <span className="text-[10px] text-[#94A3B8]">({bytesToReadableSize(att.size)})</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="p-0.5 rounded-md text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#151F32] transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea Input */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          disabled={isLoading}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI Red Team Assistant or attach forensic logs, pcap, code, pdf, or archives..."
          className="w-full bg-transparent text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none resize-none max-h-40 leading-relaxed font-sans px-1"
        />

        {/* Bottom Control Actions */}
        <div className="flex items-center justify-between pt-1 border-t border-[#1E293B]/40 text-xs text-[#94A3B8]">
          {/* Left Actions: Attach File + Clear */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isProcessingFile}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#101827] hover:bg-[#151F32] text-[#CBD5E1] hover:text-white border border-[#1E293B] text-xs font-mono transition-all cursor-pointer shadow-sm hover:border-[#8B5CF6]/40"
              title="Attach any file (PDF, Word, CSV, XML, ZIP, PCAP, EVTX, Logs, Memory Dumps)"
            >
              {isProcessingFile ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8B5CF6]" />
              ) : (
                <Paperclip className="w-3.5 h-3.5 text-[#8B5CF6]" />
              )}
              <span className="hidden sm:inline">Attach Evidence</span>
            </button>

            {hasMessages && onClearConversation && (
              <button
                type="button"
                onClick={handleClear}
                className="hover:text-[#EF4444] transition-colors flex items-center gap-1 font-mono text-[11px] px-2 py-1 rounded-lg hover:bg-[#101827]"
              >
                <Trash2 className="w-3 h-3" />
                <span className="hidden sm:inline">Clear session</span>
              </button>
            )}
          </div>

          {/* Right Actions: Model Pill + Send Button */}
          <div className="flex items-center gap-2.5">
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#101827] text-[10px] font-mono text-[#94A3B8] border border-[#1E293B]">
              <Sparkles className="w-2.5 h-2.5 text-[#8B5CF6]" />
              <span>Qwen3 14B • pgvector</span>
            </span>

            <button
              onClick={handleSend}
              disabled={(!text.trim() && attachments.length === 0) || isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#A78BFA] hover:to-[#8B5CF6] disabled:from-[#151F32] disabled:to-[#151F32] disabled:text-[#64748B] text-white text-xs font-bold transition-all shadow-md shadow-[#8B5CF6]/25 cursor-pointer disabled:cursor-not-allowed"
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
    </div>
  );
};
