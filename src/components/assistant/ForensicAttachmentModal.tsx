import React from 'react';
import { X, FileText, Download, FileCode, Archive, Image as ImageIcon, Terminal, Shield, CheckCircle2 } from 'lucide-react';
import { ForensicAttachment } from '../../types/ai.types';
import { bytesToReadableSize } from '../../utils/fileHelper';
import { Badge } from '../ui/Badge';

interface ForensicAttachmentModalProps {
  attachment: ForensicAttachment | null;
  onClose: () => void;
}

export const ForensicAttachmentModal: React.FC<ForensicAttachmentModalProps> = ({
  attachment,
  onClose,
}) => {
  if (!attachment) return null;

  const getIcon = () => {
    switch (attachment.category) {
      case 'LOG':
        return <Terminal className="w-5 h-5 text-[#3B82F6]" />;
      case 'DATA':
        return <FileCode className="w-5 h-5 text-[#8B5CF6]" />;
      case 'ARCHIVE':
        return <Archive className="w-5 h-5 text-[#EAB308]" />;
      case 'IMAGE':
        return <ImageIcon className="w-5 h-5 text-[#22C55E]" />;
      default:
        return <FileText className="w-5 h-5 text-[#CBD5E1]" />;
    }
  };

  const handleDownload = () => {
    if (attachment.dataUrl) {
      const a = document.createElement('a');
      a.href = attachment.dataUrl;
      a.download = attachment.name;
      a.click();
    } else if (attachment.contentSnippet) {
      const blob = new Blob([attachment.contentSnippet], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#0B1220] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1E293B] bg-[#101827]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#151F32] border border-[#1E293B]">
              {getIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#F8FAFC] truncate max-w-md">
                  {attachment.name}
                </h3>
                <Badge variant="brand" size="sm">
                  .{attachment.extension.toUpperCase()}
                </Badge>
              </div>
              <p className="text-[11px] font-mono text-[#94A3B8]">
                {bytesToReadableSize(attachment.size)} • Category: {attachment.category} • Attached: {new Date(attachment.uploadedAt).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Image Preview */}
          {attachment.category === 'IMAGE' && attachment.dataUrl && (
            <div className="rounded-xl overflow-hidden border border-[#1E293B] bg-black/40 flex items-center justify-center p-2">
              <img src={attachment.dataUrl} alt={attachment.name} className="max-h-72 object-contain rounded-lg" />
            </div>
          )}

          {/* Extracted Text Content / Log Preview */}
          {attachment.contentSnippet ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>Extracted Forensic Stream for AI Analysis</span>
                </span>
                <span className="text-[#22C55E] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Injected in Qwen3 Context</span>
                </span>
              </div>
              <pre className="p-3.5 rounded-xl bg-[#050A14] border border-[#1E293B] text-[11px] font-mono text-[#CBD5E1] overflow-x-auto max-h-72 whitespace-pre-wrap leading-relaxed selection:bg-[#8B5CF6] selection:text-white">
                {attachment.contentSnippet}
              </pre>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-[#101827] border border-[#1E293B] text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-[#151F32] text-[#8B5CF6] mb-1">
                {getIcon()}
              </div>
              <p className="text-sm font-medium text-[#F8FAFC]">Binary Forensic Evidence Package</p>
              <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
                This binary artifact is indexed in the engagement evidence repository and its metadata has been provided to the AI Co-Pilot for correlation.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-[#1E293B] bg-[#101827]">
          <span className="text-[11px] font-mono text-[#94A3B8]">
            Evidence ID: <span className="text-[#CBD5E1]">{attachment.id}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#151F32] hover:bg-[#1E293B] text-[#F8FAFC] border border-[#1E293B] text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#A78BFA] text-white text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
