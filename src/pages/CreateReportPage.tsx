import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, FileText, AlertCircle } from 'lucide-react';
import { Project } from '../types/project.types';
import { ReportType, ReportConfiguration } from '../types/report.types';
import { projectService } from '../services/projectService';
import { reportService } from '../services/reportService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { ReportConfigForm } from '../components/reports/ReportConfigForm';
import { Button } from '../components/ui/Button';

export const CreateReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProjectId = searchParams.get('projectId') || undefined;

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const list = await projectService.getProjects();
        setProjects(list);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleSubmit = async (
    projectId: string,
    title: string,
    reportType: ReportType,
    config: ReportConfiguration
  ) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await reportService.createReport(projectId, title, reportType, config);
      navigate(`/reports/${created.id}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate assessment report.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Create Report" subtitle="Configuring assessment deliverable">
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
          <span className="text-xs text-text-muted font-mono">
            Loading active engagements...
          </span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Create Security Report"
      subtitle="Assemble an audit-compliant deliverable dynamically from project scope, findings, and risk metrics."
    >
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-2 border-b border-border-dark">
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
            REPORT_CONFIG_WIZARD
          </span>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Wizard Form */}
        <ReportConfigForm
          projects={projects}
          initialProjectId={preselectedProjectId}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />

      </div>
    </DashboardLayout>
  );
};
