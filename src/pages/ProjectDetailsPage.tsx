import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FolderGit2, 
  Layers, 
  Sparkles, 
  ShieldAlert, 
  FileText, 
  Activity, 
  ShieldCheck, 
  ArrowLeft, 
  Loader2, 
  Clock, 
  AlertCircle,
  Plus 
} from 'lucide-react';
import { Project, ScopeAsset, ProjectActivityItem } from '../types/project.types';
import { Finding } from '../types/finding.types';
import { projectService } from '../services/projectService';
import { findingService } from '../services/findingService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { ProjectHeader } from '../components/projects/ProjectHeader';
import { ProjectStats } from '../components/projects/ProjectStats';
import { ProjectOverview } from '../components/projects/ProjectOverview';
import { ScopeManager } from '../components/projects/ScopeManager';
import { ProjectActivity } from '../components/projects/ProjectActivity';
import { FindingsTable } from '../components/findings/FindingsTable';
import { SeverityBadge } from '../components/findings/SeverityBadge';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [scopeAssets, setScopeAssets] = useState<ScopeAsset[]>([]);
  const [activities, setActivities] = useState<ProjectActivityItem[]>([]);
  const [projectFindings, setProjectFindings] = useState<Finding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const loadProjectData = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const proj = await projectService.getProjectById(projectId);
      if (proj) {
        setProject(proj);
        const [assets, acts, findings] = await Promise.all([
          projectService.getScopeAssets(projectId),
          projectService.getProjectActivities(projectId),
          findingService.getFindingsByProjectId(projectId),
        ]);
        setScopeAssets(assets);
        setActivities(acts);
        setProjectFindings(findings);
      }
    } catch {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const handleAddAsset = async (data: Omit<ScopeAsset, 'id' | 'createdAt'>) => {
    await projectService.addScopeAsset(data);
    await loadProjectData();
  };

  const handleUpdateAsset = async (id: string, updates: Partial<ScopeAsset>) => {
    await projectService.updateScopeAsset(id, updates);
    await loadProjectData();
  };

  const handleDeleteAsset = async (id: string) => {
    await projectService.deleteScopeAsset(id);
    await loadProjectData();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FolderGit2 className="w-4 h-4" /> },
    { id: 'scope', label: `Scope (${scopeAssets.length})`, icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'findings', label: `Findings (${projectFindings.length})`, icon: <Layers className="w-4 h-4" /> },
    { id: 'ai-analysis', label: 'AI Analysis', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'risk', label: 'Risk', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Loading Project..." subtitle="Retrieving engagement context">
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
          <span className="text-xs text-text-muted font-mono">Loading project {projectId}...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout title="Project Not Found" subtitle="Requested engagement does not exist">
        <div className="p-12 rounded-2xl bg-bg-card border border-border-dark text-center space-y-4 max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-[#EF4444] mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text-primary">Engagement Not Found</h3>
            <p className="text-xs text-text-muted">
              The project ID "{projectId}" was not found or has been deleted.
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
      title={project.name}
      subtitle={`Authorized Engagement · ${project.organization}`}
    >
      <div className="space-y-6">
        
        {/* Project Header */}
        <ProjectHeader project={project} />

        {/* Project Stats Summary Grid */}
        <ProjectStats project={project} />

        {/* Navigation Tabs */}
        <div className="border-b border-border-dark flex space-x-2 overflow-x-auto pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-brand-primary text-brand-hover bg-bg-card shadow-sm'
                  : 'border-transparent text-text-muted hover:text-text-primary hover:bg-bg-elevated/40'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Panels */}
        {activeTab === 'overview' && (
          <ProjectOverview
            project={project}
            scopeAssets={scopeAssets}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'scope' && (
          <ScopeManager
            projectId={project.id}
            assets={scopeAssets}
            onAddAsset={handleAddAsset}
            onUpdateAsset={handleUpdateAsset}
            onDeleteAsset={handleDeleteAsset}
          />
        )}

        {/* Findings Tab */}
        {activeTab === 'findings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-bg-card border border-border-dark">
              <div>
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-primary" />
                  <span>Project Vulnerabilities ({projectFindings.length})</span>
                </h3>
                <p className="text-xs text-text-muted">
                  Verified security findings logged under {project.name}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  to={`/findings/new?projectId=${project.id}`}
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Finding to Project
                </Button>
                <Button
                  to={`/findings`}
                  variant="outline"
                  size="sm"
                >
                  View Global Catalog
                </Button>
              </div>
            </div>

            {/* Findings Table */}
            <FindingsTable findings={projectFindings} />
          </div>
        )}

        {activeTab === 'activity' && (
          <ProjectActivity activities={activities} />
        )}

        {activeTab === 'ai-analysis' && (
          <Card variant="default" className="p-8 bg-bg-card border-border-dark text-center space-y-4 shadow-card-dark max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center mx-auto text-brand-primary">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-text-primary">
                AI Co-Pilot Engagement Workspace
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Automated CWE correlation, threat model interpretation, and contextual remediation playbooks tailored to {project.name}.
              </p>
            </div>
            <div className="pt-2">
              <Button
                to={`/assistant?projectId=${project.id}&contextType=project`}
                variant="primary"
                size="md"
                icon={<Sparkles className="w-4 h-4" />}
              >
                Launch AI Assistant for {project.name}
              </Button>
            </div>
          </Card>
        )}

        {activeTab === 'risk' && (
          <Card variant="default" className="p-8 bg-bg-card border-border-dark text-center space-y-4 shadow-card-dark max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#F97316]/10 border border-[#F97316]/30 flex items-center justify-center mx-auto text-[#F97316]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-text-primary">
                Deterministic Risk Prioritization & Threat Scoring
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Calibrate 4-factor risk ratings (Impact, Likelihood, Asset Criticality, Exploitability) and explore prioritized threat queues for {project.name}.
              </p>
            </div>
            <div className="pt-2">
              <Button
                to={`/risk-analysis`}
                variant="primary"
                size="md"
                icon={<ShieldAlert className="w-4 h-4" />}
              >
                Launch Risk Analysis Engine
              </Button>
            </div>
          </Card>
        )}

        {activeTab === 'reports' && (
          <Card variant="default" className="p-8 bg-bg-card border-border-dark text-center space-y-4 shadow-card-dark max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center mx-auto text-[#22C55E]">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-text-primary">
                Security Assessment Deliverables
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Generate executive summaries, methodology appendices, proof-of-concept evidence logs, and remediation queues for {project.name}.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                to={`/reports/new?projectId=${project.id}`}
                variant="primary"
                size="md"
                icon={<Plus className="w-4 h-4" />}
              >
                Generate Report for {project.name}
              </Button>
              <Button
                to={`/reports?projectId=${project.id}`}
                variant="outline"
                size="md"
              >
                View Deliverables
              </Button>
            </div>
          </Card>
        )}

      </div>
    </DashboardLayout>
  );
};
