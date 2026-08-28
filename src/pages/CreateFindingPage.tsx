import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Layers, 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  FolderGit2, 
  FileCode,
  Loader2 
} from 'lucide-react';
import { 
  VulnerabilityType, 
  Severity, 
  Priority, 
  HttpMethod, 
  FindingStatus 
} from '../types/finding.types';
import { Project } from '../types/project.types';
import { findingService } from '../services/findingService';
import { projectService } from '../services/projectService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const CreateFindingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProjectId = searchParams.get('projectId') || '';

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState(preselectedProjectId);
  const [title, setTitle] = useState('');
  const [vulnerabilityType, setVulnerabilityType] = useState<VulnerabilityType>('SQL Injection');
  const [asset, setAsset] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [method, setMethod] = useState<HttpMethod>('POST');
  const [severity, setSeverity] = useState<Severity>('HIGH');
  const [riskScore, setRiskScore] = useState<number>(75);
  const [priority, setPriority] = useState<Priority>('P1 — Immediate');
  const [status, setStatus] = useState<FindingStatus>('OPEN');
  const [description, setDescription] = useState('');
  const [impact, setImpact] = useState('');
  const [recommendation, setRecommendation] = useState('');

  // Initial Evidence (Optional)
  const [hasEvidence, setHasEvidence] = useState(false);
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [evidenceFileRef, setEvidenceFileRef] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');

  const [errors, setErrors] = useState<{
    title?: string;
    vulnerabilityType?: string;
    projectId?: string;
    severity?: string;
    description?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await projectService.getProjects();
      setProjects(data);
      if (!projectId && data.length > 0) {
        setProjectId(data[0].id);
      }
    };
    fetchProjects();
  }, []);

  const vulnerabilityTypes: VulnerabilityType[] = [
    'SQL Injection',
    'Cross-Site Scripting',
    'IDOR',
    'Authentication Issue',
    'Authorization Issue',
    'CSRF',
    'SSRF',
    'Security Misconfiguration',
    'Sensitive Data Exposure',
    'File Upload Vulnerability',
    'Command Injection',
    'Path Traversal',
    'API Security Issue',
    'Other',
  ];

  const severities: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'];
  const priorities: Priority[] = ['P1 — Immediate', 'P2 — High', 'P3 — Normal', 'P4 — Low'];
  const httpMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'OTHER'];

  // Automatically adjust default risk score when severity changes
  const handleSeverityChange = (newSev: Severity) => {
    setSeverity(newSev);
    switch (newSev) {
      case 'CRITICAL':
        setRiskScore(90);
        setPriority('P1 — Immediate');
        break;
      case 'HIGH':
        setRiskScore(75);
        setPriority('P2 — High');
        break;
      case 'MEDIUM':
        setRiskScore(50);
        setPriority('P3 — Normal');
        break;
      case 'LOW':
        setRiskScore(25);
        setPriority('P4 — Low');
        break;
      case 'INFORMATIONAL':
        setRiskScore(10);
        setPriority('P4 — Low');
        break;
    }
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = 'Finding title is required.';
    }
    if (!vulnerabilityType) {
      newErrors.vulnerabilityType = 'Vulnerability type classification is required.';
    }
    if (!projectId) {
      newErrors.projectId = 'Every finding must be assigned to an authorized project.';
    }
    if (!severity) {
      newErrors.severity = 'Severity rating is required.';
    }
    if (!description.trim()) {
      newErrors.description = 'Vulnerability description and reproduction steps are required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const initialEvidence = hasEvidence && evidenceTitle.trim()
        ? [
            {
              title: evidenceTitle.trim(),
              description: evidenceDescription.trim() || 'Verification artifact',
              fileReference: evidenceFileRef.trim() || undefined,
              notes: evidenceNotes.trim() || undefined,
              createdBy: 'Alex Vance',
            },
          ]
        : undefined;

      const created = await findingService.createFinding(
        {
          projectId,
          title: title.trim(),
          vulnerabilityType,
          asset: asset.trim() || 'target.corp',
          endpoint: endpoint.trim() || '/',
          method,
          severity,
          riskScore: Number(riskScore),
          priority,
          status,
          description: description.trim(),
          impact: impact.trim() || 'Impact under evaluation.',
          recommendation: recommendation.trim() || 'Follow standard hardening recommendations.',
          createdBy: 'Alex Vance',
        },
        initialEvidence
      );

      navigate(`/findings/${created.id}`);
    } catch {
      setErrors({ general: 'Failed to record finding. Please verify form inputs.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Add Security Finding"
      subtitle="Document a verified security vulnerability under an authorized project scope."
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/findings"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors py-1 px-2 rounded-lg hover:bg-bg-elevated"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Findings</span>
          </Link>
          <span className="text-xs font-mono text-text-muted">
            PHASE 5 FINDING WIZARD
          </span>
        </div>

        {errors.general && (
          <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-start gap-2.5 text-xs text-[#EF4444]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Main Finding Container Card */}
          <Card variant="default" className="p-6 sm:p-8 bg-bg-card border-border-dark space-y-6 shadow-card-dark">
            <div className="flex items-center justify-between pb-4 border-b border-border-dark">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
                  <ShieldAlert className="w-5 h-5 text-[#F97316]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">
                    Vulnerability Metadata
                  </h3>
                  <p className="text-xs text-text-muted">
                    Specify vulnerability classification, target endpoint, and severity level.
                  </p>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="fnd-title" className="block text-xs font-semibold text-text-secondary">
                Finding Title <span className="text-[#EF4444]">*</span>
              </label>
              <input
                id="fnd-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Insecure Direct Object Reference in User Profile Endpoint"
                className={`w-full px-3.5 py-2.5 bg-bg-elevated text-text-primary text-sm rounded-lg border transition-all placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/50 ${
                  errors.title ? 'border-[#EF4444]' : 'border-border-dark hover:border-border-subtle'
                }`}
              />
              {errors.title && <p className="text-[11px] text-[#EF4444] font-medium">{errors.title}</p>}
            </div>

            {/* Project & Vulnerability Type Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Project */}
              <div className="space-y-1.5 text-left">
                <label htmlFor="fnd-proj" className="block text-xs font-semibold text-text-secondary">
                  Parent Engagement Project <span className="text-[#EF4444]">*</span>
                </label>
                <div className="relative">
                  <select
                    id="fnd-proj"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-bg-elevated text-text-primary text-xs sm:text-sm rounded-lg border border-border-dark hover:border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer appearance-none"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.organization})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-muted text-xs">
                    ▼
                  </div>
                </div>
                {errors.projectId && <p className="text-[11px] text-[#EF4444] font-medium">{errors.projectId}</p>}
              </div>

              {/* Vulnerability Type */}
              <div className="space-y-1.5 text-left">
                <label htmlFor="fnd-type" className="block text-xs font-semibold text-text-secondary">
                  Vulnerability Classification <span className="text-[#EF4444]">*</span>
                </label>
                <div className="relative">
                  <select
                    id="fnd-type"
                    value={vulnerabilityType}
                    onChange={(e) => setVulnerabilityType(e.target.value as VulnerabilityType)}
                    className="w-full px-3.5 py-2.5 bg-bg-elevated text-text-primary text-xs sm:text-sm rounded-lg border border-border-dark hover:border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer appearance-none"
                  >
                    {vulnerabilityTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-muted text-xs">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            {/* Target Asset, Method, Endpoint Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4 space-y-1.5 text-left">
                <label htmlFor="fnd-asset" className="block text-xs font-semibold text-text-secondary">
                  Target Host / Asset
                </label>
                <input
                  id="fnd-asset"
                  type="text"
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  placeholder="e.g. portal.target.corp"
                  className="w-full px-3 py-2 bg-bg-elevated font-mono text-xs text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>

              <div className="sm:col-span-3 space-y-1.5 text-left">
                <label htmlFor="fnd-method" className="block text-xs font-semibold text-text-secondary">
                  HTTP Method
                </label>
                <select
                  id="fnd-method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as HttpMethod)}
                  className="w-full px-3 py-2 bg-bg-elevated font-mono text-xs text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
                >
                  {httpMethods.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-5 space-y-1.5 text-left">
                <label htmlFor="fnd-endpoint" className="block text-xs font-semibold text-text-secondary">
                  Endpoint Path
                </label>
                <input
                  id="fnd-endpoint"
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="e.g. /api/v1/users/export"
                  className="w-full px-3 py-2 bg-bg-elevated font-mono text-xs text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>
            </div>

            {/* Severity, Risk Score, Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="space-y-1.5 text-left">
                <label htmlFor="fnd-sev" className="block text-xs font-semibold text-text-secondary">
                  Severity Rating <span className="text-[#EF4444]">*</span>
                </label>
                <select
                  id="fnd-sev"
                  value={severity}
                  onChange={(e) => handleSeverityChange(e.target.value as Severity)}
                  className="w-full px-3 py-2 bg-bg-elevated text-xs sm:text-sm font-semibold text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
                >
                  {severities.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label htmlFor="fnd-risk" className="block text-xs font-semibold text-text-secondary">
                  Risk Score (0–100)
                </label>
                <input
                  id="fnd-risk"
                  type="number"
                  min={0}
                  max={100}
                  value={riskScore}
                  onChange={(e) => setRiskScore(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-bg-elevated font-mono text-xs sm:text-sm text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label htmlFor="fnd-priority" className="block text-xs font-semibold text-text-secondary">
                  Remediation Priority
                </label>
                <select
                  id="fnd-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 bg-bg-elevated text-xs sm:text-sm text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="fnd-desc" className="block text-xs font-semibold text-text-secondary">
                Vulnerability Description & Reproduction Steps <span className="text-[#EF4444]">*</span>
              </label>
              <textarea
                id="fnd-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe how the issue was verified, required parameters, and observed behavior..."
                className={`w-full p-3.5 bg-bg-elevated text-text-primary text-xs sm:text-sm rounded-lg border transition-all placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/50 ${
                  errors.description ? 'border-[#EF4444]' : 'border-border-dark hover:border-border-subtle'
                }`}
              />
              {errors.description && <p className="text-[11px] text-[#EF4444] font-medium">{errors.description}</p>}
            </div>

            {/* Impact & Recommendation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label htmlFor="fnd-impact" className="block text-xs font-semibold text-text-secondary">
                  Business & Technical Impact
                </label>
                <textarea
                  id="fnd-impact"
                  rows={3}
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  placeholder="Explain the security consequences if an adversary exploits this finding..."
                  className="w-full p-3 bg-bg-elevated text-text-primary text-xs sm:text-sm rounded-lg border border-border-dark hover:border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary/50 placeholder:text-text-disabled"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label htmlFor="fnd-rec" className="block text-xs font-semibold text-text-secondary">
                  Remediation & Fix Recommendations
                </label>
                <textarea
                  id="fnd-rec"
                  rows={3}
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  placeholder="Provide concrete patch guidelines according to OWASP / NIST standards..."
                  className="w-full p-3 bg-bg-elevated text-text-primary text-xs sm:text-sm rounded-lg border border-border-dark hover:border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary/50 placeholder:text-text-disabled"
                />
              </div>
            </div>

            {/* Optional Initial Evidence Checkbox */}
            <div className="pt-2 border-t border-border-dark">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-text-secondary hover:text-text-primary">
                <input
                  type="checkbox"
                  checked={hasEvidence}
                  onChange={(e) => setHasEvidence(e.target.checked)}
                  className="w-4 h-4 rounded bg-bg-elevated border-border-dark text-brand-primary focus:ring-brand-primary/50"
                />
                <span className="font-semibold text-text-primary">Attach initial proof-of-concept evidence now</span>
              </label>

              {hasEvidence && (
                <div className="mt-4 p-4 rounded-xl bg-bg-elevated border border-border-dark space-y-3 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-semibold text-text-secondary">Evidence Title</label>
                      <input
                        type="text"
                        value={evidenceTitle}
                        onChange={(e) => setEvidenceTitle(e.target.value)}
                        placeholder="e.g. Parameter Injection HTTP Trace"
                        className="w-full px-3 py-1.5 bg-bg-surface text-xs text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-semibold text-text-secondary">File Reference Identifier</label>
                      <input
                        type="text"
                        value={evidenceFileRef}
                        onChange={(e) => setEvidenceFileRef(e.target.value)}
                        placeholder="e.g. poc_http_response.log"
                        className="w-full px-3 py-1.5 bg-bg-surface font-mono text-xs text-brand-hover rounded-lg border border-border-dark focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[11px] font-semibold text-text-secondary">Technical Observations</label>
                    <textarea
                      rows={2}
                      value={evidenceDescription}
                      onChange={(e) => setEvidenceDescription(e.target.value)}
                      placeholder="Context on how the test was performed..."
                      className="w-full p-2.5 bg-bg-surface text-xs text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-dark">
              <Button
                to="/findings"
                variant="outline"
                size="md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting}
                icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              >
                {isSubmitting ? 'Recording Finding...' : 'Record Security Finding'}
              </Button>
            </div>

          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
};
