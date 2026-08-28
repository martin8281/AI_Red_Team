import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Loader2, 
  FolderGit2, 
  Download, 
  Sparkles, 
  Archive 
} from 'lucide-react';
import { Report } from '../types/report.types';
import { Project } from '../types/project.types';
import { reportService } from '../services/reportService';
import { projectService } from '../services/projectService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { ReportCard } from '../components/reports/ReportCard';
import { ReportFilters } from '../components/reports/ReportFilters';
import { Button } from '../components/ui/Button';

export const ReportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialProjectId = searchParams.get('projectId') || 'ALL';

  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [projectId, setProjectId] = useState(initialProjectId);
  const [reportType, setReportType] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projList, reportList] = await Promise.all([
        projectService.getProjects(),
        reportService.getReports({
          search: searchQuery,
          projectId,
          reportType,
          status,
        }),
      ]);
      setProjects(projList);
      setReports(reportList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, projectId, reportType, status]);

  const handleArchive = async (id: string) => {
    await reportService.archiveReport(id);
    loadData();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setProjectId('ALL');
    setReportType('ALL');
    setStatus('ALL');
  };

  return (
    <DashboardLayout
      title="Report Generation & Documentation"
      subtitle="Compile audit-compliant security deliverables dynamically from engagement findings and telemetry."
    >
      <div className="space-y-6">
        
        {/* Top Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              Security Assessment Deliverables
            </h2>
            <p className="text-xs text-text-muted">
              Generated reports are assembled from real project scope, verified findings, and deterministic risk metrics.
            </p>
          </div>

          <Button
            to="/reports/new"
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
          >
            Create New Report
          </Button>
        </div>

        {/* Filter Controls */}
        <ReportFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          projectId={projectId}
          onProjectChange={setProjectId}
          reportType={reportType}
          onReportTypeChange={setReportType}
          status={status}
          onStatusChange={setStatus}
          projects={projects}
          totalCount={reports.length}
          onReset={handleResetFilters}
        />

        {/* Reports Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
            <span className="text-xs text-text-muted font-mono">
              Loading security deliverables...
            </span>
          </div>
        ) : reports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onArchive={handleArchive}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-2xl bg-bg-card border border-border-dark text-center space-y-4 shadow-card-dark max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/30 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-text-primary">
                No Deliverables Found
              </h3>
              <p className="text-xs text-text-muted">
                No reports matched your search filters. Create a new report deliverable using verified project telemetry.
              </p>
            </div>
            <Button to="/reports/new" variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
              Create New Report
            </Button>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
