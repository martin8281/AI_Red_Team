import React from 'react';
import { 
  FileText, 
  Edit3, 
  Sparkles, 
  ShieldCheck, 
  Printer, 
  Download, 
  Clock, 
  FolderGit2, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert 
} from 'lucide-react';
import { Report, ReportSection } from '../../types/report.types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface ReportPreviewDocumentProps {
  report: Report;
  onEditSection: (section: ReportSection) => void;
  onExportClick: () => void;
}

export const ReportPreviewDocument: React.FC<ReportPreviewDocumentProps> = ({
  report,
  onEditSection,
  onExportClick,
}) => {
  const enabledSections = report.sections.filter((s) => s.enabled);

  return (
    <div className="space-y-6">
      
      {/* Top Action & Status Bar */}
      <div className="p-4 rounded-2xl bg-bg-card border border-border-dark flex flex-wrap items-center justify-between gap-4 shadow-card-dark print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-primary/10 border border-brand-primary/30 text-brand-primary">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-text-muted">{report.id}</span>
              <span className="font-mono text-[11px] font-bold text-brand-hover bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/30">
                {report.version}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30">
                {report.status}
              </span>
            </div>
            <h2 className="text-base font-bold text-text-primary mt-0.5">
              {report.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => window.print()}
            variant="outline"
            size="sm"
            icon={<Printer className="w-3.5 h-3.5" />}
          >
            Quick Print
          </Button>
          <Button
            onClick={onExportClick}
            variant="primary"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export Deliverable
          </Button>
        </div>
      </div>

      {/* Main Document Body (Printable Area) */}
      <div className="w-full max-w-4xl mx-auto rounded-2xl bg-[#090E17] border border-border-dark p-6 sm:p-12 shadow-2xl space-y-12 text-text-primary print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        
        {/* Document Classification Header Banner */}
        <div className="text-center pb-6 border-b border-border-dark/80 print:border-black space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-widest font-extrabold text-[#EF4444] px-3 py-1 rounded bg-[#EF4444]/10 border border-[#EF4444]/20 print:text-red-700">
            {report.configuration.classification}
          </span>
          <p className="text-[10px] text-text-muted print:text-gray-600 pt-2 font-mono">
            AUTHORIZED SECURITY ASSESSMENT DELIVERABLE · HUMAN-IN-THE-LOOP VERIFIED
          </p>
        </div>

        {/* Dynamic Sections Stream */}
        {enabledSections.map((sec) => (
          <section
            key={sec.id}
            className="space-y-4 pt-4 border-t border-border-dark/40 first:border-none first:pt-0 group relative"
          >
            {/* Section Header & Edit Button */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-text-primary print:text-black">
                  {sec.title}
                </h3>
                {sec.isAiGenerated && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-brand-hover bg-brand-primary/10 border border-brand-primary/30 print:hidden">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>AI Enhanced</span>
                  </span>
                )}
              </div>

              {/* Edit Trigger (Hidden in print) */}
              <button
                onClick={() => onEditSection(sec)}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 rounded-lg bg-bg-surface hover:bg-bg-elevated text-text-muted hover:text-text-primary border border-border-dark text-xs flex items-center gap-1 cursor-pointer print:hidden"
                title="Edit Section Content"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="text-[11px]">Edit Section</span>
              </button>
            </div>

            {/* Section Content Markdown Body */}
            <div className="text-xs sm:text-sm text-text-secondary print:text-gray-900 leading-relaxed font-sans whitespace-pre-line bg-bg-surface/40 print:bg-transparent p-5 rounded-xl border border-border-dark/60 print:border-none print:p-0">
              {sec.content}
            </div>
          </section>
        ))}

        {/* Document Footer Sign-off */}
        <div className="pt-8 border-t border-border-dark/80 print:border-black flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted print:text-gray-600 font-mono">
          <div>
            Lead Auditor: <span className="font-bold text-text-primary print:text-black">{report.configuration.leadAuditor}</span>
          </div>
          <div>
            Delivered: {new Date(report.generatedAt || report.createdAt).toLocaleDateString()}
          </div>
          <div>
            Document ID: {report.id} ({report.version})
          </div>
        </div>

      </div>

    </div>
  );
};
