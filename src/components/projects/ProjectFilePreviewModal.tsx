import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Terminal, 
  FileCode, 
  Archive, 
  Copy, 
  Check, 
  Sparkles, 
  Calendar, 
  HardDrive, 
  User, 
  Tag,
  Download
} from 'lucide-react';
import { ProjectFile } from '../../types/projectFile.types';
import { bytesToReadableSize } from '../../utils/fileHelper';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface ProjectFilePreviewModalProps {
  file: ProjectFile | null;
  onClose: () => void;
}

export const ProjectFilePreviewModal: React.FC<ProjectFilePreviewModalProps> = ({ file, onClose }) => {
  if (!file) return null;
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(file.fullContent || file.contentSnippet || file.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAskAI = () => {
    onClose();
    navigate(`/assistant?projectId=${file.projectId}&contextType=project&file=${encodeURIComponent(file.name)}`);
  };

  const getFileIcon = () => {
    switch (file.category) {
      case 'LOG':
        return <Terminal className="w-5 h-5 text-[#3B82F6]" />;
      case 'DATA':
        return <FileCode className="w-5 h-5 text-[#8B5CF6]" />;
      case 'ARCHIVE':
        return <Archive className="w-5 h-5 text-[#EAB308]" />;
      case 'DOCUMENT':
        return <FileText className="w-5 h-5 text-[#22C55E]" />;
      default:
        return <FileText className="w-5 h-5 text-[#CBD5E1]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[88vh] rounded-2xl bg-[#0B1220] border border-[#1E293B] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1E293B] flex items-center justify-between bg-[#101827]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-[#050A14] border border-[#1E293B]">
              {getFileIcon()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] truncate">
                  {file.name}
                </h3>
                <Badge variant="brand" size="sm">.{file.extension.toUpperCase()}</Badge>
                <Badge variant="neutral" size="sm">{file.category}</Badge>
              </div>
              <p className="text-[11px] font-mono text-[#94A3B8]">
                {bytesToReadableSize(file.size)} {file.lineCount ? `· ${file.lineCount} lines` : ''} · Uploaded {new Date(file.uploadedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151F32] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Metadata Strip */}
        <div className="px-6 py-2.5 bg-[#050A14] border-b border-[#1E293B] flex flex-wrap items-center justify-between gap-3 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#8B5CF6]" />
              {file.uploadedBy || 'Security Analyst'}
            </span>
            {file.tags && file.tags.length > 0 && (
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#3B82F6]" />
                {file.tags.join(', ')}
              </span>
            )}
          </div>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-xs text-[#A78BFA] hover:text-white px-2.5 py-1 rounded bg-[#101827] border border-[#1E293B] hover:border-[#8B5CF6]/40 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Content'}</span>
          </button>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#050A14]">
          {file.description && (
            <div className="mb-4 p-3 rounded-xl bg-[#101827] border border-[#1E293B] text-xs text-[#CBD5E1]">
              <span className="font-semibold text-[#8B5CF6]">Objective / Context: </span>
              {file.description}
            </div>
          )}

          <div className="relative">
            <pre className="font-mono text-xs text-[#CBD5E1] bg-[#0A0F1D] p-4 rounded-xl border border-[#1E293B] overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {file.fullContent || file.contentSnippet || 'No textual content available for this binary format.'}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-[#1E293B] bg-[#101827] flex items-center justify-between gap-3">
          <span className="text-xs text-[#94A3B8]">
            Attached to project <strong className="text-[#F8FAFC]">{file.projectId}</strong>
          </span>

          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close Preview
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAskAI}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Analyze in AI Assistant
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
