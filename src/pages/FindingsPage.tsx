import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Layers, Loader2, ShieldCheck } from 'lucide-react';
import { 
  Finding, 
  FindingSortOption, 
  FindingStatsData 
} from '../types/finding.types';
import { Project } from '../types/project.types';
import { findingService } from '../services/findingService';
import { projectService } from '../services/projectService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { FindingStats } from '../components/findings/FindingStats';
import { FindingFilters } from '../components/findings/FindingFilters';
import { FindingsTable } from '../components/findings/FindingsTable';
import { Button } from '../components/ui/Button';

export const FindingsPage: React.FC = () => {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<FindingStatsData>({
    total: 0,
    bySeverity: { critical: 0, high: 0, medium: 0, low: 0, informational: 0 },
    byStatus: { open: 0, inReview: 0, remediation: 0, resolved: 0, acceptedRisk: 0, reopened: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [projectId, setProjectId] = useState('ALL');
  const [severity, setSeverity] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [sort, setSort] = useState<FindingSortOption>('recently_updated');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [findingsData, projectsData, statsData] = await Promise.all([
        findingService.getFindings({
          search: searchQuery,
          projectId,
          severity,
          status,
          priority,
          sort,
        }),
        projectService.getProjects(),
        findingService.getFindingStats(projectId),
      ]);
      setFindings(findingsData);
      setProjects(projectsData);
      setStats(statsData);
    } catch {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, projectId, severity, status, priority, sort]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setProjectId('ALL');
    setSeverity('ALL');
    setStatus('ALL');
    setPriority('ALL');
    setSort('recently_updated');
  };

  return (
    <DashboardLayout
      title="Findings Management"
      subtitle="Record, classify, review, and prioritize verified security findings across authorized engagements."
    >
      <div className="space-y-6">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
              Security Findings Repository
            </h2>
            <p className="text-xs text-text-muted">
              Centralized catalog of verified vulnerabilities and proof-of-concept evidence.
            </p>
          </div>

          <Button
            to="/findings/new"
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
          >
            Add Finding
          </Button>
        </div>

        {/* Finding Statistics Bar */}
        <FindingStats stats={stats} />

        {/* Finding Filters */}
        <FindingFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          projectId={projectId}
          onProjectChange={setProjectId}
          severity={severity}
          onSeverityChange={setSeverity}
          status={status}
          onStatusChange={setStatus}
          priority={priority}
          onPriorityChange={setPriority}
          sort={sort}
          onSortChange={setSort}
          projects={projects}
          totalCount={findings.length}
          onReset={handleResetFilters}
        />

        {/* Findings Table */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-7 h-7 text-brand-primary animate-spin" />
            <span className="text-xs text-text-muted font-mono">Loading Security Findings...</span>
          </div>
        ) : (
          <FindingsTable findings={findings} />
        )}

      </div>
    </DashboardLayout>
  );
};
