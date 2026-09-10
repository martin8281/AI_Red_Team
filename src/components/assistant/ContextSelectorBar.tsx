import React, { useState, useEffect } from 'react';
import { 
  FolderGit2, 
  Layers, 
  ShieldCheck, 
  ShieldAlert, 
  FileCode, 
  Sparkles,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { ContextType, QuickActionType } from '../../types/ai.types';
import { Project, ScopeAsset } from '../../types/project.types';
import { Finding } from '../../types/finding.types';
import { ProjectFile } from '../../types/projectFile.types';
import { projectService } from '../../services/projectService';
import { projectFileService } from '../../services/projectFileService';

interface ContextSelectorBarProps {
  projects: Project[];
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
  contextType: ContextType;
  onContextTypeChange: (type: ContextType) => void;
  findings: Finding[];
  selectedFindingId?: string;
  onFindingChange: (findingId: string) => void;
  onExecuteAction?: (action: QuickActionType | string, customPrompt?: string) => void;
}

export const ContextSelectorBar: React.FC<ContextSelectorBarProps> = ({
  projects,
  selectedProjectId,
  onProjectChange,
  contextType,
  onContextTypeChange,
  findings,
  selectedFindingId,
  onFindingChange,
  onExecuteAction,
}) => {
  const [scopeAssets, setScopeAssets] = useState<ScopeAsset[]>([]);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);

  // Active project
  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Strict boundary filtering: only findings belonging to the selected project
  const projectFindings = findings.filter((f) => f.projectId === selectedProjectId);
  const activeFinding = projectFindings.find((f) => f.id === selectedFindingId) || projectFindings[0];

  // Load scope assets & project files whenever selectedProjectId changes
  useEffect(() => {
    let isMounted = true;
    const loadContextData = async () => {
      if (!selectedProjectId) return;
      try {
        const [assets, files] = await Promise.all([
          projectService.getScopeAssets(selectedProjectId),
          projectFileService.getProjectFiles(selectedProjectId),
        ]);
        if (isMounted) {
          setScopeAssets(assets);
          setProjectFiles(files);
        }
      } catch (err) {
        console.error('Error loading context assets:', err);
      }
    };
    loadContextData();
    return () => {
      isMounted = false;
    };
  }, [selectedProjectId]);

  const inScopeAssets = scopeAssets.filter((a) => a.scopeStatus === 'IN_SCOPE');
  const outOfScopeAssets = scopeAssets.filter((a) => a.scopeStatus === 'OUT_OF_SCOPE');

  const contextTypes: { id: ContextType; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'general', label: 'General Chat', icon: <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" /> },
    { id: 'project', label: 'Entire Project', icon: <FolderGit2 className="w-3.5 h-3.5" /> },
    { id: 'finding', label: `Finding (${projectFindings.length})`, icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'scope', label: `Scope Boundary (${inScopeAssets.length})`, icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'risk', label: 'Risk Profile', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
    { id: 'evidence', label: `Evidence Artifacts (${projectFiles.length})`, icon: <FileCode className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="p-3 sm:p-4 rounded-2xl bg-[#0B1220] border border-[#1E293B] space-y-3 shadow-lg shadow-black/40">
      {/* Top row: Project Selector & Context Pills */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Project Selector */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#A78BFA] shrink-0">
            {selectedProjectId === 'general' ? <Sparkles className="w-4 h-4 text-[#A78BFA]" /> : <FolderGit2 className="w-4 h-4" />}
          </div>
          <div className="space-y-0.5 text-left min-w-0">
            <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider block">
              Active Scope / Mode
            </span>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                const val = e.target.value;
                onProjectChange(val);
                if (val === 'general') {
                  onContextTypeChange('general');
                } else if (contextType === 'general') {
                  onContextTypeChange('project');
                }
              }}
              className="py-1 px-2.5 rounded-xl bg-[#101827] border border-[#1E293B] text-xs sm:text-sm font-bold text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6] cursor-pointer max-w-[280px] truncate"
            >
              <option value="general">🌐 General Security Chat (No Project)</option>
              <optgroup label="Authorized Engagements">
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.organization})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Context Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-thin">
          {contextTypes.map((c) => {
            const isActive = contextType === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  onContextTypeChange(c.id);
                  if (c.id === 'general' && selectedProjectId !== 'general') {
                    // Stay in current project or switch to general
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/30 border border-[#A78BFA]/50 font-bold'
                    : 'bg-[#101827] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151F32] border border-[#1E293B]'
                }`}
              >
                {c.icon}
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Context Detail Sub-Panels */}

      {/* 0. General Chat Sub-Panel */}
      {contextType === 'general' && (
        <div className="p-3 sm:p-3.5 rounded-xl bg-[#101827] border border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30 text-[11px] font-mono font-semibold">
                <Sparkles className="w-3 h-3 text-[#A78BFA]" />
                General Security Consultation Mode
              </span>
              <span className="text-xs text-[#94A3B8]">
                Open cybersecurity advisory & triaging — no project scope restrictions
              </span>
            </div>
            <p className="text-xs text-[#CBD5E1]">
              Ask any cybersecurity question, explore attack vectors, or request code reviews.
            </p>
          </div>

          {onExecuteAction && (
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={() =>
                  onExecuteAction(
                    'explain_finding',
                    'Explain the most critical OWASP Top 10 vulnerabilities, their technical root causes, and prevention strategies.'
                  )
                }
                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#151F32] hover:bg-[#8B5CF6]/20 border border-[#1E293B] hover:border-[#8B5CF6]/40 text-xs font-mono text-[#CBD5E1] hover:text-white transition-all cursor-pointer"
              >
                <span>⚡ OWASP Top 10</span>
              </button>
              <button
                onClick={() =>
                  onExecuteAction(
                    'analyze_forensics',
                    'Explain common Active Directory and Kerberos attack techniques including Kerberoasting, AS-REP roasting, and Golden Ticket attacks.'
                  )
                }
                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#151F32] hover:bg-[#8B5CF6]/20 border border-[#1E293B] hover:border-[#8B5CF6]/40 text-xs font-mono text-[#CBD5E1] hover:text-white transition-all cursor-pointer"
              >
                <span>⚡ AD Attack Vectors</span>
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* 1. Scope Boundary Sub-Panel */}
      {contextType === 'scope' && (
        <div className="p-3 sm:p-3.5 rounded-xl bg-[#101827] border border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 text-[11px] font-mono font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                {inScopeAssets.length} In-Scope Targets
              </span>
              {outOfScopeAssets.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 text-[11px] font-mono font-semibold">
                  <AlertTriangle className="w-3 h-3" />
                  {outOfScopeAssets.length} Out-of-Scope
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap text-xs text-[#CBD5E1]">
              <span className="text-[#94A3B8] font-mono text-[11px]">Targets:</span>
              {inScopeAssets.length > 0 ? (
                inScopeAssets.slice(0, 3).map((a) => (
                  <span key={a.id} className="px-2 py-0.5 rounded bg-[#151F32] border border-[#1E293B] font-mono text-[11px] text-[#A78BFA]">
                    {a.value}
                  </span>
                ))
              ) : (
                <span className="text-[#94A3B8] italic text-xs">No targets registered</span>
              )}
              {inScopeAssets.length > 3 && (
                <span className="text-[11px] text-[#94A3B8] font-mono">+{inScopeAssets.length - 3} more</span>
              )}
            </div>
          </div>

          {onExecuteAction && (
            <button
              onClick={() =>
                onExecuteAction(
                  'summarize_project',
                  'Audit the authorized scope boundaries for this project: verify what targets are strictly IN_SCOPE vs OUT_OF_SCOPE and flag any boundary violations.'
                )
              }
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 border border-[#8B5CF6]/40 text-xs font-semibold text-[#A78BFA] hover:text-white transition-all shrink-0 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Audit Scope Boundaries</span>
            </button>
          )}
        </div>
      )}

      {/* 2. Risk Profile Sub-Panel */}
      {contextType === 'risk' && (
        <div className="p-3 sm:p-3.5 rounded-xl bg-[#101827] border border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold text-[#F8FAFC] flex items-center gap-1.5">
                <span>Aggregate Risk:</span>
                <span className="px-2 py-0.5 rounded-md bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] font-mono">
                  {activeProject?.riskScore || 0}/100
                </span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 text-[11px] font-mono font-semibold">
                {activeProject?.criticalFindingCount || 0} Critical
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F97316]/15 text-[#F97316] border border-[#F97316]/30 text-[11px] font-mono font-semibold">
                {activeProject?.highFindingCount || 0} High
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EAB308]/15 text-[#EAB308] border border-[#EAB308]/30 text-[11px] font-mono font-semibold">
                {activeProject?.mediumFindingCount || 0} Med
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">
              7-factor threat calibration evaluates likelihood, exploitability, asset exposure, and controls.
            </p>
          </div>

          {onExecuteAction && (
            <button
              onClick={() =>
                onExecuteAction(
                  'analyze_risk',
                  'Conduct a comprehensive 7-factor risk assessment across this project\'s logged vulnerabilities and assets.'
                )
              }
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 border border-[#8B5CF6]/40 text-xs font-semibold text-[#A78BFA] hover:text-white transition-all shrink-0 cursor-pointer shadow-sm"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Evaluate 7-Factor Risk</span>
            </button>
          )}
        </div>
      )}

      {/* 3. Evidence Artifacts Sub-Panel */}
      {contextType === 'evidence' && (
        <div className="p-3 sm:p-3.5 rounded-xl bg-[#101827] border border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30 text-[11px] font-mono font-semibold">
                <FileCode className="w-3 h-3" />
                {projectFiles.length} Attached Evidence Files
              </span>
              <span className="text-xs text-[#94A3B8]">
                Grounding dataset for AI forensics & IoC extraction
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-xs text-[#CBD5E1]">
              {projectFiles.length > 0 ? (
                projectFiles.slice(0, 4).map((f) => (
                  <span key={f.id} className="px-2 py-0.5 rounded bg-[#151F32] border border-[#1E293B] font-mono text-[11px] text-[#93C5FD]">
                    {f.name}
                  </span>
                ))
              ) : (
                <span className="text-[#94A3B8] italic text-xs">No evidence files attached to this project yet</span>
              )}
              {projectFiles.length > 4 && (
                <span className="text-[11px] text-[#94A3B8] font-mono">+{projectFiles.length - 4} more</span>
              )}
            </div>
          </div>

          {onExecuteAction && (
            <button
              onClick={() =>
                onExecuteAction(
                  'analyze_forensics',
                  'Analyze and correlate all project attached evidence files and forensic logs to identify IoCs, attacker timelines, and taint propagation.'
                )
              }
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 border border-[#8B5CF6]/40 text-xs font-semibold text-[#A78BFA] hover:text-white transition-all shrink-0 cursor-pointer shadow-sm"
            >
              <Cpu className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Correlate Evidence Logs</span>
            </button>
          )}
        </div>
      )}

      {/* 4. Entire Project Sub-Panel */}
      {contextType === 'project' && (
        <div className="p-3 sm:p-3.5 rounded-xl bg-[#101827] border border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[#F8FAFC] font-bold">{activeProject?.name}</span>
              <span className="text-[#94A3B8]">({activeProject?.projectType})</span>
            </div>
            <p className="text-xs text-[#94A3B8] line-clamp-1">
              {activeProject?.description || 'Authorized security testing engagement.'}
            </p>
          </div>

          {onExecuteAction && (
            <button
              onClick={() =>
                onExecuteAction(
                  'summarize_project',
                  'Provide an executive-level summary of this security assessment engagement, highlighting total scope coverage, key vulnerabilities discovered, and posture.'
                )
              }
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 border border-[#8B5CF6]/40 text-xs font-semibold text-[#A78BFA] hover:text-white transition-all shrink-0 cursor-pointer shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Summarize Engagement</span>
            </button>
          )}
        </div>
      )}

      {/* 5. Finding Sub-Panel */}
      {contextType === 'finding' && (
        <div className="p-3 sm:p-3.5 rounded-xl bg-[#101827] border border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Layers className="w-4 h-4 text-[#8B5CF6] shrink-0" />
            <div className="flex-1 min-w-0">
              <select
                value={selectedFindingId || (projectFindings[0]?.id ?? '')}
                onChange={(e) => onFindingChange(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#0B1220] border border-[#1E293B] text-xs font-mono text-[#CBD5E1] focus:outline-none focus:border-[#8B5CF6] cursor-pointer truncate"
              >
                {projectFindings.length > 0 ? (
                  projectFindings.map((f) => (
                    <option key={f.id} value={f.id}>
                      [{f.id}] {f.title} ({f.severity} - Risk: {f.riskScore}/100)
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No findings logged for this project yet
                  </option>
                )}
              </select>
            </div>
          </div>

          {onExecuteAction && activeFinding && (
            <button
              onClick={() =>
                onExecuteAction(
                  'explain_finding',
                  `Explain the technical root cause, exploitability vector, and remediation mechanism for finding [${activeFinding.id}] ${activeFinding.title}.`
                )
              }
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 border border-[#8B5CF6]/40 text-xs font-semibold text-[#A78BFA] hover:text-white transition-all shrink-0 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Deep-Dive Root Cause</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
