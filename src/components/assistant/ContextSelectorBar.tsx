import React from 'react';
import { 
  FolderGit2, 
  Layers, 
  ShieldCheck, 
  ShieldAlert, 
  FileCode, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { ContextType } from '../../types/ai.types';
import { Project } from '../../types/project.types';
import { Finding } from '../../types/finding.types';

interface ContextSelectorBarProps {
  projects: Project[];
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
  contextType: ContextType;
  onContextTypeChange: (type: ContextType) => void;
  findings: Finding[];
  selectedFindingId?: string;
  onFindingChange: (findingId: string) => void;
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
}) => {
  // Strict boundary filtering: only findings belonging to the selected project
  const projectFindings = findings.filter((f) => f.projectId === selectedProjectId);

  const contextTypes: { id: ContextType; label: string; icon: React.ReactNode }[] = [
    { id: 'project', label: 'Entire Project', icon: <FolderGit2 className="w-3.5 h-3.5" /> },
    { id: 'finding', label: `Finding (${projectFindings.length})`, icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'scope', label: 'Scope Boundary', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'risk', label: 'Risk Profile', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
    { id: 'evidence', label: 'Evidence Artifacts', icon: <FileCode className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="p-4 rounded-xl bg-bg-card border border-border-dark space-y-3 shadow-card-dark">
      {/* Top row: Project Selector & Context Pills */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Project Selector */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-primary/10 border border-brand-primary/30 text-brand-primary">
            <FolderGit2 className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 text-left">
            <span className="text-[10px] font-mono text-text-muted uppercase block">Active Engagement</span>
            <select
              value={selectedProjectId}
              onChange={(e) => onProjectChange(e.target.value)}
              className="py-1 px-2.5 rounded-lg bg-bg-elevated border border-border-dark text-xs sm:text-sm font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer max-w-[240px] truncate"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.organization})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Context Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {contextTypes.map((c) => (
            <button
              key={c.id}
              onClick={() => onContextTypeChange(c.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                contextType === c.id
                  ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                  : 'bg-bg-elevated text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-border-dark'
              }`}
            >
              {c.icon}
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sub-row: Finding Selector (Only if contextType === 'finding') */}
      {contextType === 'finding' && (
        <div className="p-3 rounded-lg bg-bg-elevated border border-border-dark flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-primary" />
            <span className="text-xs font-semibold text-text-primary">
              Select Project Finding:
            </span>
          </div>

          <select
            value={selectedFindingId || (projectFindings[0]?.id ?? '')}
            onChange={(e) => onFindingChange(e.target.value)}
            className="w-full sm:w-auto min-w-[280px] max-w-lg px-3 py-1.5 rounded-lg bg-bg-surface border border-border-dark text-xs font-mono text-brand-hover focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer truncate"
          >
            {projectFindings.length > 0 ? (
              projectFindings.map((f) => (
                <option key={f.id} value={f.id}>
                  [{f.id}] {f.title} ({f.severity})
                </option>
              ))
            ) : (
              <option value="" disabled>
                No findings logged for this project yet
              </option>
            )}
          </select>
        </div>
      )}
    </div>
  );
};
