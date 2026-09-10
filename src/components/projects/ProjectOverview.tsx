import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  Clock, 
  FolderGit2, 
  UserCheck, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Terminal,
  FileCode,
  FileText
} from 'lucide-react';
import { Project, ScopeAsset } from '../../types/project.types';
import { ProjectFile } from '../../types/projectFile.types';
import { projectFileService } from '../../services/projectFileService';
import { bytesToReadableSize } from '../../utils/fileHelper';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ProjectOverviewProps {
  project: Project;
  scopeAssets: ScopeAsset[];
  onNavigateToTab: (tab: string) => void;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  project,
  scopeAssets,
  onNavigateToTab,
}) => {
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);

  useEffect(() => {
    projectFileService.getProjectFiles(project.id).then(setProjectFiles);
  }, [project.id]);

  const inScopeCount = scopeAssets.filter((a) => a.scopeStatus === 'IN_SCOPE').length;
  const outOfScopeCount = scopeAssets.filter((a) => a.scopeStatus === 'OUT_OF_SCOPE').length;

  return (
    <div className="space-y-6">
      {/* Top Narrative Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Scope & Objectives Summary */}
        <div className="lg:col-span-8 space-y-6">
          <Card variant="default" className="p-6 bg-bg-card border-border-dark space-y-4 shadow-card-dark">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-brand-primary" />
              <span>Assessment Scope & Objectives</span>
            </h3>

            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed bg-bg-elevated p-4 rounded-xl border border-border-dark">
              {project.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-bg-surface border border-border-dark space-y-1">
                <span className="text-[10px] text-text-muted font-mono uppercase">Client Organization</span>
                <div className="text-sm font-bold text-text-primary">{project.organization}</div>
              </div>
              <div className="p-3 rounded-xl bg-bg-surface border border-border-dark space-y-1">
                <span className="text-[10px] text-text-muted font-mono uppercase">Assessment Framework</span>
                <div className="text-sm font-bold text-text-primary">{project.projectType}</div>
              </div>
            </div>
          </Card>

          {/* Attached Evidence Files Card */}
          <Card variant="default" className="p-6 bg-bg-card border-border-dark space-y-4 shadow-card-dark">
            <div className="flex items-center justify-between pb-3 border-b border-border-dark">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-brand-primary" />
                <h3 className="text-base font-bold text-text-primary">
                  Project Attached Files & Forensic Evidence
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateToTab('files')}
              >
                Manage Files ({projectFiles.length})
              </Button>
            </div>

            {projectFiles.length === 0 ? (
              <div className="p-4 rounded-xl bg-bg-elevated border border-border-dark text-center text-xs text-text-muted">
                No files attached yet. Upload logs, PCAP traces, or pentest deliverables for AI correlation.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projectFiles.slice(0, 4).map((f) => (
                  <div
                    key={f.id}
                    onClick={() => onNavigateToTab('files')}
                    className="p-3 rounded-xl bg-bg-elevated border border-border-dark hover:border-brand-primary/40 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-bg-surface border border-border-dark text-brand-primary">
                        {f.category === 'LOG' ? <Terminal className="w-3.5 h-3.5 text-[#3B82F6]" /> :
                         f.category === 'DATA' ? <FileCode className="w-3.5 h-3.5 text-[#8B5CF6]" /> :
                         <FileText className="w-3.5 h-3.5 text-[#22C55E]" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-text-primary truncate group-hover:text-brand-hover">
                          {f.name}
                        </p>
                        <p className="text-[10px] font-mono text-text-muted">
                          {bytesToReadableSize(f.size)} · .{f.extension.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="brand" size="sm">{f.category}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Scope Asset Quick Highlights */}
          <Card variant="default" className="p-6 bg-bg-card border-border-dark space-y-4 shadow-card-dark">
            <div className="flex items-center justify-between pb-3 border-b border-border-dark">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-primary" />
                <h3 className="text-base font-bold text-text-primary">
                  Target Boundary Highlights
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateToTab('scope')}
              >
                Manage Scope ({scopeAssets.length})
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-bg-elevated border border-border-dark flex items-center justify-between">
                <div>
                  <span className="text-xs text-text-muted">In-Scope Target Assets</span>
                  <div className="text-2xl font-extrabold text-[#22C55E] font-mono mt-0.5">
                    {inScopeCount}
                  </div>
                </div>
                <Badge variant="low" size="sm">AUTHORIZED</Badge>
              </div>

              <div className="p-4 rounded-xl bg-bg-elevated border border-border-dark flex items-center justify-between">
                <div>
                  <span className="text-xs text-text-muted">Out-of-Scope (Excluded)</span>
                  <div className="text-2xl font-extrabold text-[#EF4444] font-mono mt-0.5">
                    {outOfScopeCount}
                  </div>
                </div>
                <Badge variant="critical" size="sm">OFF LIMITS</Badge>
              </div>
            </div>

            {scopeAssets.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-mono text-text-muted uppercase">Sample Active Scope:</span>
                <div className="flex flex-wrap gap-2">
                  {scopeAssets.slice(0, 4).map((a) => (
                    <span
                      key={a.id}
                      className="px-2.5 py-1 rounded-md bg-bg-surface border border-border-dark font-mono text-[11px] text-text-secondary"
                    >
                      {a.value}
                    </span>
                  ))}
                  {scopeAssets.length > 4 && (
                    <span className="px-2 py-1 text-xs text-brand-hover">
                      +{scopeAssets.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: AI Co-Pilot Context & Engagement Meta */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Co-Pilot Card */}
          <Card variant="default" className="p-6 bg-gradient-to-br from-bg-card via-bg-elevated to-bg-card border border-brand-primary/30 space-y-4 shadow-card-dark">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-brand-primary/20 text-brand-primary border border-brand-primary/40">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-text-primary">
                AI Context Engine
              </h3>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              This project container provides the baseline context for AI vulnerability correlation, risk scoring calculation, and report generation in upcoming phases.
            </p>

            <div className="p-3 rounded-lg bg-bg-surface border border-border-dark text-[11px] space-y-1.5 text-text-muted">
              <div className="flex items-center gap-1.5 text-brand-hover font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Scope Context & Files Loaded</span>
              </div>
              <p>AI automatically examines all attached files ({projectFiles.length}) before answering questions.</p>
            </div>

            <Button
              to={`/assistant?projectId=${project.id}&contextType=project`}
              variant="primary"
              size="sm"
              className="w-full justify-center"
              icon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Analyze Project with AI
            </Button>
          </Card>

          {/* Governance & Engagement Metadata */}
          <Card variant="default" className="p-6 bg-bg-card border-border-dark space-y-3.5 shadow-card-dark text-xs">
            <h3 className="text-xs font-bold text-text-muted uppercase font-mono tracking-wider">
              Engagement Governance
            </h3>

            <div className="space-y-2.5 divide-y divide-border-dark/60">
              <div className="pt-2 flex items-center justify-between">
                <span className="text-text-muted">Lead Security Tester:</span>
                <span className="font-semibold text-text-primary">{project.leadTester || 'Alex Vance'}</span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-text-muted">Engagement Start:</span>
                <span className="font-mono text-text-primary">{project.startDate}</span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-text-muted">Engagement End:</span>
                <span className="font-mono text-text-primary">{project.endDate}</span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-text-muted">Created Timestamp:</span>
                <span className="font-mono text-text-muted">{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};
