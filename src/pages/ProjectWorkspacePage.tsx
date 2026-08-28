import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FolderGit2, 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  Plus, 
  ShieldAlert, 
  Sliders, 
  FileText, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ChevronRight 
} from 'lucide-react';
import { WorkspaceOverview, EngagementState, RemediationStatus, EvidenceVerificationStatus } from '../types/workspace.types';
import { Finding, Evidence } from '../types/finding.types';
import { Project } from '../types/project.types';
import { workspaceService } from '../services/workspaceService';
import { projectService } from '../services/projectService';
import { findingService } from '../services/findingService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { EngagementHeader } from '../components/workspace/EngagementHeader';
import { EngagementHealthCard } from '../components/workspace/EngagementHealthCard';
import { RecommendedNextActionCard } from '../components/workspace/RecommendedNextActionCard';
import { AssessmentChecklistCard } from '../components/workspace/AssessmentChecklistCard';
import { WorkspaceActivityFeed } from '../components/workspace/WorkspaceActivityFeed';
import { AIEngagementSummaryCard } from '../components/workspace/AIEngagementSummaryCard';
import { RemediationWorkflowModal } from '../components/workspace/RemediationWorkflowModal';
import { EvidenceReviewModal } from '../components/workspace/EvidenceReviewModal';
import { SeverityBadge } from '../components/findings/SeverityBadge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const ProjectWorkspacePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [overview, setOverview] = useState<WorkspaceOverview | null>(null);
  const [projectFindings, setProjectFindings] = useState<Finding[]>([]);
  const [allEvidence, setAllEvidence] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangingState, setIsChangingState] = useState(false);

  const [selectedFindingForRemediation, setSelectedFindingForRemediation] = useState<Finding | null>(null);
  const [selectedEvidenceForReview, setSelectedEvidenceForReview] = useState<Evidence | null>(null);

  const loadWorkspaceData = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [projectsList, wsOverview, fnds] = await Promise.all([
        projectService.getProjects(),
        workspaceService.getWorkspaceOverview(projectId),
        findingService.getFindingsByProjectId(projectId),
      ]);

      setAllProjects(projectsList);
      setOverview(wsOverview);
      setProjectFindings(fnds);

      const evidenceArr: Evidence[] = [];
      for (const f of fnds) {
        const evi = await findingService.getFindingEvidence(f.id);
        evidenceArr.push(...evi);
      }
      setAllEvidence(evidenceArr);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, [projectId]);

  const handleStateChange = async (newState: EngagementState) => {
    if (!projectId) return;
    setIsChangingState(true);
    try {
      await workspaceService.transitionEngagementState(projectId, newState);
      await loadWorkspaceData();
    } finally {
      setIsChangingState(false);
    }
  };

  const handleSaveRemediation = async (
    findingId: string,
    status: RemediationStatus,
    notes: string,
    assignedUser?: string,
    dueDate?: string
  ) => {
    await workspaceService.updateFindingRemediation(
      findingId,
      status,
      notes,
      assignedUser,
      dueDate
    );
    await loadWorkspaceData();
  };

  const handleVerifyEvidence = async (
    evidenceId: string,
    status: EvidenceVerificationStatus,
    reviewer: string
  ) => {
    const evi = allEvidence.find((e) => e.id === evidenceId);
    if (evi) {
      await workspaceService.updateEvidenceVerification(
        evi.findingId,
        evidenceId,
        status,
        reviewer
      );
      await loadWorkspaceData();
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Loading Workspace..." subtitle="Initializing engagement command center">
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
          <span className="text-xs text-text-muted font-mono">
            Synchronizing engagement state machine...
          </span>
        </div>
      </DashboardLayout>
    );
  }

  if (!overview) {
    return (
      <DashboardLayout title="Engagement Not Found" subtitle="Requested project does not exist">
        <div className="p-12 rounded-2xl bg-bg-card border border-border-dark text-center space-y-4 max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-[#EF4444] mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text-primary">Engagement Not Found</h3>
            <p className="text-xs text-text-muted">
              Project "{projectId}" could not be located in workspace records.
            </p>
          </div>
          <Button to="/projects" variant="primary" size="sm" icon={<ArrowLeft className="w-4 h-4" />} iconPosition="left">
            Return to Projects
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Engagement Intelligence Workspace"
      subtitle="Unified command center tracking scope, vulnerabilities, evidence, risk engine calibrations, and deliverables."
    >
      <div className="space-y-6">
        
        {/* Top Switcher & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-bg-card border border-border-dark shadow-card-dark">
          <div className="flex items-center gap-3">
            <Button
              to={`/projects/${projectId}`}
              variant="outline"
              size="sm"
              icon={<ArrowLeft className="w-3.5 h-3.5" />}
              iconPosition="left"
            >
              Project Overview
            </Button>
            <span className="text-text-disabled">|</span>
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-brand-primary" />
              <select
                value={projectId}
                onChange={(e) => navigate(`/projects/${e.target.value}/workspace`)}
                className="py-1 px-2.5 rounded-lg bg-bg-elevated border border-border-dark text-xs sm:text-sm font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer max-w-[240px] truncate"
              >
                {allProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.organization})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <span className="text-xs font-mono text-text-muted">
            ENGAGEMENT_LIFECYCLE_ACTIVE
          </span>
        </div>

        {/* 1. Engagement Header (State, Progress, Transitions) */}
        <EngagementHeader
          overview={overview}
          onStateChange={handleStateChange}
          isChangingState={isChangingState}
        />

        {/* 2. AI Recommended Next Action Banner */}
        <RecommendedNextActionCard action={overview.recommendedAction} />

        {/* 3. Two-Column Grid: Health & Checklist vs AI Summary & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (7 cols): Health & Assessment Checklist */}
          <div className="lg:col-span-7 space-y-6">
            <EngagementHealthCard health={overview.health} />
            <AssessmentChecklistCard checklist={overview.checklist} />
          </div>

          {/* Right Column (5 cols): AI Posture Summary & Activity Timeline */}
          <div className="lg:col-span-5 space-y-6">
            <AIEngagementSummaryCard overview={overview} />
            <WorkspaceActivityFeed activities={overview.recentActivities} />
          </div>

        </div>

        {/* 4. Active Finding Remediation Tracking Table */}
        <Card variant="default" className="p-0 bg-bg-card border-border-dark overflow-hidden shadow-card-dark">
          <div className="p-4 bg-bg-surface border-b border-border-dark flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-primary" />
              <h3 className="text-sm font-bold text-text-primary">
                Finding Remediation Lifecycle Management
              </h3>
            </div>
            <span className="text-xs font-mono text-text-muted">
              {projectFindings.length} Logged Vulnerabilities
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-bg-card border-b border-border-dark text-[11px] font-mono uppercase text-text-muted">
                  <th className="py-3 px-4 font-semibold">Finding</th>
                  <th className="py-3 px-4 font-semibold">Severity</th>
                  <th className="py-3 px-4 font-semibold">Remediation Stage</th>
                  <th className="py-3 px-4 font-semibold">Assigned To</th>
                  <th className="py-3 px-4 font-semibold">SLA Due</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark/60">
                {projectFindings.map((f) => (
                  <tr key={f.id} className="hover:bg-bg-elevated/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-text-primary max-w-[240px] truncate">
                      <Link to={`/findings/${f.id}`} className="hover:text-brand-hover hover:underline">
                        {f.title}
                      </Link>
                      <div className="text-[10px] font-mono text-text-muted mt-0.5">
                        {f.id} · {f.asset}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <SeverityBadge severity={f.severity} size="sm" />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          f.remediationStatus === 'VERIFIED'
                            ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30'
                            : f.remediationStatus === 'FIXED'
                            ? 'bg-brand-primary/10 text-brand-hover border-brand-primary/30'
                            : f.remediationStatus === 'IN_PROGRESS'
                            ? 'bg-[#EAB308]/10 text-[#EAB308] border-[#EAB308]/30'
                            : 'bg-bg-surface text-text-muted border-border-dark'
                        }`}
                      >
                        <span>{f.remediationStatus || 'NOT_STARTED'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-text-secondary">
                      {f.assignedUser || 'DevSecOps Team'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-text-muted">
                      {f.dueDate || '2026-09-15'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedFindingForRemediation(f)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-bg-surface hover:bg-brand-primary text-text-secondary hover:text-white border border-border-dark text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>Update SLA</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* Remediation Modal */}
      <RemediationWorkflowModal
        isOpen={selectedFindingForRemediation !== null}
        onClose={() => setSelectedFindingForRemediation(null)}
        finding={selectedFindingForRemediation}
        onSave={handleSaveRemediation}
      />

      {/* Evidence Review Modal */}
      <EvidenceReviewModal
        isOpen={selectedEvidenceForReview !== null}
        onClose={() => setSelectedEvidenceForReview(null)}
        evidence={selectedEvidenceForReview}
        onVerify={handleVerifyEvidence}
      />
    </DashboardLayout>
  );
};
