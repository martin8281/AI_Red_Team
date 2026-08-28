import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  FileText, 
  FileCode, 
  GitBranch, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { Report } from '../../types/report.types';
import { reportService } from '../../services/reportService';
import { Button } from '../ui/Button';

interface ExportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report;
  onVersionCreated?: (newReport: Report) => void;
}

export const ExportOptionsModal: React.FC<ExportOptionsModalProps> = ({
  isOpen,
  onClose,
  report,
  onVersionCreated,
}) => {
  if (!isOpen) return null;

  const [versionTag, setVersionTag] = useState('');
  const [isVersioning, setIsVersioning] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handlePrintPdf = () => {
    window.print();
    onClose();
  };

  const handleDownloadMarkdown = () => {
    const md = reportService.exportReportAsMarkdown(report);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.id}_${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess('Markdown file downloaded successfully.');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadJson = () => {
    const json = reportService.exportReportAsJson(report);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.id}_deliverable.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess('JSON deliverable exported successfully.');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionTag.trim()) return;
    setIsVersioning(true);
    try {
      const newVersion = await reportService.createReportVersion(report.id, versionTag.trim());
      if (onVersionCreated) onVersionCreated(newVersion);
      onClose();
    } finally {
      setIsVersioning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-bg-card border border-border-dark p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-dark">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-brand-primary" />
            <h3 className="text-base sm:text-lg font-bold text-text-primary">
              Export & Version Assessment Report
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-bg-elevated"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {downloadSuccess && (
          <div className="p-3 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 text-xs text-[#22C55E] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* 1. Export Formats Grid */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase text-text-muted font-bold block">
            Select Deliverable Output Format
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* PDF Print */}
            <button
              type="button"
              onClick={handlePrintPdf}
              className="p-4 rounded-xl bg-bg-elevated border border-border-dark hover:border-brand-primary/50 hover:bg-bg-hover text-center space-y-2 transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/30 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                <Printer className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-text-primary block">Print / PDF</span>
                <span className="text-[10px] text-text-muted">High-res vector layout</span>
              </div>
            </button>

            {/* Markdown */}
            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="p-4 rounded-xl bg-bg-elevated border border-border-dark hover:border-brand-primary/50 hover:bg-bg-hover text-center space-y-2 transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/30 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-text-primary block">Markdown</span>
                <span className="text-[10px] text-text-muted">Raw formatted text (.md)</span>
              </div>
            </button>

            {/* JSON Deliverable */}
            <button
              type="button"
              onClick={handleDownloadJson}
              className="p-4 rounded-xl bg-bg-elevated border border-border-dark hover:border-brand-primary/50 hover:bg-bg-hover text-center space-y-2 transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/30 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                <FileCode className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-text-primary block">JSON Schema</span>
                <span className="text-[10px] text-text-muted">Structured data export</span>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Versioning Section */}
        <form onSubmit={handleCreateVersion} className="pt-4 border-t border-border-dark space-y-3 text-left">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-brand-primary" />
            <span className="text-xs font-bold text-text-primary">
              Create New Revision / Version Snapshot
            </span>
          </div>

          <p className="text-[11px] text-text-muted">
            Preserve the current deliverable as an immutable record and create a branch for subsequent re-testing notes.
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. v1.1 (Post-Remediation Re-Test)"
              value={versionTag}
              onChange={(e) => setVersionTag(e.target.value)}
              className="flex-1 px-3 py-2 bg-bg-elevated text-xs text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50 placeholder:text-text-disabled"
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={isVersioning || !versionTag.trim()}
              icon={isVersioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
            >
              {isVersioning ? 'Versioning...' : 'Branch Version'}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-border-dark">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
