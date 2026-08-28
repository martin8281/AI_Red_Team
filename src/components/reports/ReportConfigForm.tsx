import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  ShieldAlert, 
  FolderGit2, 
  CheckSquare, 
  Square, 
  ArrowRight, 
  Loader2, 
  Layers 
} from 'lucide-react';
import { Project } from '../../types/project.types';
import { 
  ReportType, 
  SectionType, 
  ReportConfiguration 
} from '../../types/report.types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface ReportConfigFormProps {
  projects: Project[];
  initialProjectId?: string;
  onSubmit: (
    projectId: string,
    title: string,
    reportType: ReportType,
    config: ReportConfiguration
  ) => Promise<void>;
  isSubmitting?: boolean;
}

export const ReportConfigForm: React.FC<ReportConfigFormProps> = ({
  projects,
  initialProjectId,
  onSubmit,
  isSubmitting = false,
}) => {
  const [projectId, setProjectId] = useState<string>(
    initialProjectId || projects[0]?.id || ''
  );
  const selectedProject = projects.find((p) => p.id === projectId);

  const [title, setTitle] = useState(
    selectedProject
      ? `${selectedProject.name} — Security Assessment Deliverable`
      : 'Comprehensive Security Assessment Deliverable'
  );

  const [reportType, setReportType] = useState<ReportType>('Penetration Testing Report');
  const [classification, setClassification] = useState('CONFIDENTIAL // RESTRICTED ACCESS');
  const [leadAuditor, setLeadAuditor] = useState(selectedProject?.leadTester || 'Alex Vance');

  const [includeEvidence, setIncludeEvidence] = useState(true);
  const [includeAiSummary, setIncludeAiSummary] = useState(true);
  const [includeAiRemediation, setIncludeAiRemediation] = useState(true);
  const [includeAiConclusion, setIncludeAiConclusion] = useState(true);

  const allSections: { id: SectionType; label: string; description: string }[] = [
    { id: 'cover_page', label: '1. Cover Page', description: 'Document title, organization, lead auditor, and classification' },
    { id: 'executive_summary', label: '2. Executive Summary', description: 'High-level risk narrative, finding counts, and executive posture' },
    { id: 'assessment_overview', label: '3. Assessment Overview', description: 'Objectives, timeline, testing criteria, and governance' },
    { id: 'scope', label: '4. Scope & Rules of Engagement', description: 'Authorized in-scope target list and excluded target assets' },
    { id: 'methodology', label: '5. Testing Methodology', description: 'OWASP WSTG, NIST SP 800-115, and non-destructive PoC standards' },
    { id: 'risk_summary', label: '6. Deterministic Risk Summary', description: '4-factor score breakdown (0–100) and severity distributions' },
    { id: 'findings', label: '7. Detailed Findings Catalog', description: 'Full vulnerability profiles with description, impact, and fix' },
    { id: 'evidence', label: '8. Proof-of-Concept Evidence', description: 'Sanitized request/response traces and validation logs' },
    { id: 'recommendations', label: '9. Remediation & Hardening', description: 'Strategic defensive guidelines aligned with industry baselines' },
    { id: 'remediation_summary', label: '10. Remediation Priority Queue', description: 'Action SLA matrix (P1 Immediate, P2 High, P3 Normal, P4 Low)' },
    { id: 'conclusion', label: '11. Conclusion & Re-Testing', description: 'Formal engagement wrap-up and verification requirements' },
    { id: 'appendix', label: '12. Appendix & References', description: 'CWE mappings, vulnerability taxonomy, and acronym glossary' },
  ];

  const [enabledSections, setEnabledSections] = useState<SectionType[]>(
    allSections.map((s) => s.id)
  );

  const toggleSection = (id: SectionType) => {
    if (enabledSections.includes(id)) {
      setEnabledSections(enabledSections.filter((s) => s !== id));
    } else {
      setEnabledSections([...enabledSections, id]);
    }
  };

  const handleProjectChange = (id: string) => {
    setProjectId(id);
    const p = projects.find((proj) => proj.id === id);
    if (p) {
      setTitle(`${p.name} — Security Assessment Deliverable`);
      if (p.leadTester) setLeadAuditor(p.leadTester);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const config: ReportConfiguration = {
      includeEvidence,
      includeAiSummary,
      includeAiRemediation,
      includeAiConclusion,
      enabledSections,
      classification,
      leadAuditor,
    };
    await onSubmit(projectId, title.trim(), reportType, config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* 1. Engagement & Metadata */}
      <Card variant="default" className="p-6 bg-bg-card border-border-dark space-y-4 shadow-card-dark">
        <div className="flex items-center gap-2 pb-2 border-b border-border-dark">
          <FolderGit2 className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm sm:text-base font-bold text-text-primary">
            Engagement & Deliverable Metadata
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-text-secondary">
              Source Project / Engagement
            </label>
            <select
              value={projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full px-3 py-2 bg-bg-elevated text-xs sm:text-sm font-semibold text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.organization})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-text-secondary">
              Report Deliverable Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full px-3 py-2 bg-bg-elevated text-xs sm:text-sm font-semibold text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
            >
              <option value="Penetration Testing Report">Penetration Testing Report</option>
              <option value="Security Assessment Report">Security Assessment Report</option>
              <option value="Vulnerability Assessment Report">Vulnerability Assessment Report</option>
              <option value="Executive Security Report">Executive Security Report</option>
              <option value="Technical Security Report">Technical Security Report</option>
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-text-secondary">
              Deliverable Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-bg-elevated text-xs sm:text-sm text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-text-secondary">
              Security Classification Banner
            </label>
            <input
              type="text"
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              className="w-full px-3 py-2 bg-bg-elevated text-xs sm:text-sm text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-text-secondary">
              Lead Security Auditor / Author
            </label>
            <input
              type="text"
              value={leadAuditor}
              onChange={(e) => setLeadAuditor(e.target.value)}
              className="w-full px-3 py-2 bg-bg-elevated text-xs sm:text-sm text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
          </div>
        </div>
      </Card>

      {/* 2. AI Enhancement Options */}
      <Card variant="default" className="p-6 bg-gradient-to-br from-bg-card via-bg-elevated to-bg-card border border-brand-primary/30 space-y-4 shadow-card-dark">
        <div className="flex items-center gap-2 pb-2 border-b border-brand-primary/20">
          <Sparkles className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm sm:text-base font-bold text-text-primary">
            AI Narrative & Co-Pilot Enhancements
          </h3>
        </div>

        <p className="text-xs text-text-muted">
          AI will reason over verified project data to synthesize executive-level narratives without altering factual findings or risk scores.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-bg-surface border border-border-dark cursor-pointer hover:border-brand-primary/40 transition-colors">
            <input
              type="checkbox"
              checked={includeAiSummary}
              onChange={(e) => setIncludeAiSummary(e.target.checked)}
              className="mt-0.5 rounded border-border-dark text-brand-primary focus:ring-brand-primary"
            />
            <div className="text-xs">
              <span className="font-bold text-text-primary block">Executive Summary</span>
              <span className="text-[11px] text-text-muted">Synthesize executive risk overview</span>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-bg-surface border border-border-dark cursor-pointer hover:border-brand-primary/40 transition-colors">
            <input
              type="checkbox"
              checked={includeAiRemediation}
              onChange={(e) => setIncludeAiRemediation(e.target.checked)}
              className="mt-0.5 rounded border-border-dark text-brand-primary focus:ring-brand-primary"
            />
            <div className="text-xs">
              <span className="font-bold text-text-primary block">Remediation Roadmap</span>
              <span className="text-[11px] text-text-muted">Generate prioritized defense guidance</span>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-bg-surface border border-border-dark cursor-pointer hover:border-brand-primary/40 transition-colors">
            <input
              type="checkbox"
              checked={includeAiConclusion}
              onChange={(e) => setIncludeAiConclusion(e.target.checked)}
              className="mt-0.5 rounded border-border-dark text-brand-primary focus:ring-brand-primary"
            />
            <div className="text-xs">
              <span className="font-bold text-text-primary block">Conclusion Narrative</span>
              <span className="text-[11px] text-text-muted">Formulate formal wrap-up & re-test</span>
            </div>
          </label>
        </div>
      </Card>

      {/* 3. Report Section Selector */}
      <Card variant="default" className="p-6 bg-bg-card border-border-dark space-y-4 shadow-card-dark">
        <div className="flex items-center justify-between pb-2 border-b border-border-dark">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-primary" />
            <h3 className="text-sm sm:text-base font-bold text-text-primary">
              Select Sections to Include (12 Total)
            </h3>
          </div>
          <span className="text-xs font-mono text-text-muted">
            {enabledSections.length} of {allSections.length} Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allSections.map((sec) => {
            const isChecked = enabledSections.includes(sec.id);
            return (
              <div
                key={sec.id}
                onClick={() => toggleSection(sec.id)}
                className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                  isChecked
                    ? 'bg-bg-elevated border-brand-primary/40 shadow-sm'
                    : 'bg-bg-surface border-border-dark opacity-60 hover:opacity-100'
                }`}
              >
                <div className="mt-0.5 text-brand-primary">
                  {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-text-disabled" />}
                </div>
                <div className="space-y-0.5 text-xs text-left">
                  <span className={`font-bold block ${isChecked ? 'text-text-primary' : 'text-text-muted'}`}>
                    {sec.label}
                  </span>
                  <p className="text-[11px] text-text-muted leading-tight">{sec.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-border-dark flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-text-secondary">
            <input
              type="checkbox"
              checked={includeEvidence}
              onChange={(e) => setIncludeEvidence(e.target.checked)}
              className="rounded border-border-dark text-brand-primary focus:ring-brand-primary"
            />
            <span>Include Proof-of-Concept Technical Evidence Logs</span>
          </label>
        </div>
      </Card>

      {/* 4. Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button to="/reports" variant="outline" size="md">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isSubmitting}
          icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
        >
          {isSubmitting ? 'Compiling Deliverable...' : 'Generate Assessment Report'}
        </Button>
      </div>

    </form>
  );
};
