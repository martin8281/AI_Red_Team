import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  Edit3, 
  Sparkles, 
  Download, 
  Printer 
} from 'lucide-react';
import { Report, ReportSection, SectionType } from '../types/report.types';
import { reportService } from '../services/reportService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { ReportPreviewDocument } from '../components/reports/ReportPreviewDocument';
import { SectionEditorModal } from '../components/reports/SectionEditorModal';
import { ExportOptionsModal } from '../components/reports/ExportOptionsModal';
import { Button } from '../components/ui/Button';

export const ReportPreviewPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [editingSection, setEditingSection] = useState<ReportSection | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const loadReport = async () => {
    if (!reportId) return;
    setIsLoading(true);
    try {
      const data = await reportService.getReportById(reportId);
      setReport(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const handleSaveSection = async (sectionId: string, content: string) => {
    if (!report) return;
    await reportService.updateReportSection(report.id, sectionId, content);
    await loadReport();
  };

  const handleRegenerateAiSection = async (sectionType: SectionType) => {
    if (!report) return;
    await reportService.regenerateAiSection(report.id, sectionType);
    await loadReport();
  };

  const handleVersionCreated = (newReport: Report) => {
    navigate(`/reports/${newReport.id}`);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Loading Deliverable..." subtitle="Retrieving assessment report">
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
          <span className="text-xs text-text-muted font-mono">
            Compiling report document {reportId}...
          </span>
        </div>
      </DashboardLayout>
    );
  }

  if (!report) {
    return (
      <DashboardLayout title="Deliverable Not Found" subtitle="Requested report does not exist">
        <div className="p-12 rounded-2xl bg-bg-card border border-border-dark text-center space-y-4 max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-[#EF4444] mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text-primary">Deliverable Not Found</h3>
            <p className="text-xs text-text-muted">
              The report ID "{reportId}" was not found or has been archived.
            </p>
          </div>
          <Button to="/reports" variant="primary" size="sm" icon={<ArrowLeft className="w-4 h-4" />} iconPosition="left">
            Return to Deliverables
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={report.title}
      subtitle={`Deliverable Review · ${report.reportType} (${report.version})`}
    >
      <div className="space-y-6">
        
        {/* Top Breadcrumb navigation (hidden in print) */}
        <div className="flex items-center justify-between pb-2 border-b border-border-dark print:hidden">
          <Button
            to="/reports"
            variant="outline"
            size="sm"
            icon={<ArrowLeft className="w-3.5 h-3.5" />}
            iconPosition="left"
          >
            Back to Deliverables
          </Button>

          <span className="text-xs font-mono text-text-muted">
            DELIVERABLE_REVIEW_ACTIVE
          </span>
        </div>

        {/* Report Preview Document */}
        <ReportPreviewDocument
          report={report}
          onEditSection={(sec) => setEditingSection(sec)}
          onExportClick={() => setIsExportModalOpen(true)}
        />

      </div>

      {/* Section Editor Modal */}
      <SectionEditorModal
        isOpen={editingSection !== null}
        onClose={() => setEditingSection(null)}
        section={editingSection}
        onSave={handleSaveSection}
        onRegenerateAi={handleRegenerateAiSection}
      />

      {/* Export & Versioning Modal */}
      <ExportOptionsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        report={report}
        onVersionCreated={handleVersionCreated}
      />
    </DashboardLayout>
  );
};
