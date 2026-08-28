import React, { useState } from 'react';
import { 
  VulnerabilityType, 
  Severity, 
  Priority, 
  HttpMethod, 
  FindingStatus, 
  Finding 
} from '../../types/finding.types';
import { Project } from '../../types/project.types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ShieldAlert, Loader2, ArrowRight } from 'lucide-react';

interface FindingFormProps {
  initialValues?: Partial<Finding>;
  projects: Project[];
  onSubmit: (values: Omit<Finding, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
}

export const FindingForm: React.FC<FindingFormProps> = ({
  initialValues,
  projects,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitButtonText = 'Save Finding',
}) => {
  const [projectId, setProjectId] = useState(initialValues?.projectId || (projects[0]?.id ?? ''));
  const [title, setTitle] = useState(initialValues?.title || '');
  const [vulnerabilityType, setVulnerabilityType] = useState<VulnerabilityType>(
    initialValues?.vulnerabilityType || 'SQL Injection'
  );
  const [asset, setAsset] = useState(initialValues?.asset || '');
  const [endpoint, setEndpoint] = useState(initialValues?.endpoint || '');
  const [method, setMethod] = useState<HttpMethod>(initialValues?.method || 'POST');
  const [severity, setSeverity] = useState<Severity>(initialValues?.severity || 'HIGH');
  const [riskScore, setRiskScore] = useState<number>(initialValues?.riskScore ?? 75);
  const [priority, setPriority] = useState<Priority>(initialValues?.priority || 'P1 — Immediate');
  const [status, setStatus] = useState<FindingStatus>(initialValues?.status || 'OPEN');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [impact, setImpact] = useState(initialValues?.impact || '');
  const [recommendation, setRecommendation] = useState(initialValues?.recommendation || '');

  const [errors, setErrors] = useState<{
    title?: string;
    vulnerabilityType?: string;
    projectId?: string;
    severity?: string;
    description?: string;
  }>({});

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
  const statuses: FindingStatus[] = ['OPEN', 'IN_REVIEW', 'REMEDIATION', 'RESOLVED', 'ACCEPTED_RISK', 'REOPENED'];

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!title.trim()) newErrors.title = 'Finding title is required.';
    if (!vulnerabilityType) newErrors.vulnerabilityType = 'Classification is required.';
    if (!projectId) newErrors.projectId = 'Parent project selection is required.';
    if (!severity) newErrors.severity = 'Severity is required.';
    if (!description.trim()) newErrors.description = 'Description is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
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
      impact: impact.trim() || 'Under evaluation.',
      recommendation: recommendation.trim() || 'Apply standard hardening controls.',
      createdBy: initialValues?.createdBy || 'Alex Vance',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Title */}
      <div className="space-y-1.5 text-left">
        <label className="block text-xs font-semibold text-text-secondary">
          Finding Title <span className="text-[#EF4444]">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. SQL Injection in Authentication Parameter"
          className={`w-full px-3.5 py-2.5 bg-bg-elevated text-text-primary text-sm rounded-lg border transition-all ${
            errors.title ? 'border-[#EF4444]' : 'border-border-dark hover:border-border-subtle'
          } focus:outline-none focus:ring-2 focus:ring-brand-primary/50`}
        />
        {errors.title && <p className="text-[11px] text-[#EF4444] font-medium">{errors.title}</p>}
      </div>

      {/* Project & Classification */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-text-secondary">
            Parent Project <span className="text-[#EF4444]">*</span>
          </label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full px-3 py-2.5 bg-bg-elevated text-xs sm:text-sm text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {errors.projectId && <p className="text-[11px] text-[#EF4444] font-medium">{errors.projectId}</p>}
        </div>

        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-text-secondary">
            Vulnerability Classification <span className="text-[#EF4444]">*</span>
          </label>
          <select
            value={vulnerabilityType}
            onChange={(e) => setVulnerabilityType(e.target.value as VulnerabilityType)}
            className="w-full px-3 py-2.5 bg-bg-elevated text-xs sm:text-sm text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
          >
            {vulnerabilityTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Asset, Method, Endpoint */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-4 space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-text-secondary">Affected Asset</label>
          <input
            type="text"
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            placeholder="portal.target.corp"
            className="w-full px-3 py-2 bg-bg-elevated font-mono text-xs text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
          />
        </div>

        <div className="sm:col-span-3 space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-text-secondary">HTTP Method</label>
          <select
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
          <label className="block text-xs font-semibold text-text-secondary">Endpoint Path</label>
          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="/api/v1/auth/login"
            className="w-full px-3 py-2 bg-bg-elevated font-mono text-xs text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
          />
        </div>
      </div>

      {/* Severity, Risk Score, Priority, Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-text-secondary">Severity</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as Severity)}
            className="w-full px-3 py-2 bg-bg-elevated text-xs font-semibold text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
          >
            {severities.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-text-secondary">Risk Score (0–100)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={riskScore}
            onChange={(e) => setRiskScore(Number(e.target.value))}
            className="w-full px-3 py-2 bg-bg-elevated font-mono text-xs text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-text-secondary">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full px-3 py-2 bg-bg-elevated text-xs text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-text-secondary">Lifecycle Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as FindingStatus)}
            className="w-full px-3 py-2 bg-bg-elevated text-xs text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
          >
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5 text-left">
        <label className="block text-xs font-semibold text-text-secondary">
          Description & Reproduction Steps <span className="text-[#EF4444]">*</span>
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed observation notes, parameter locations, and reproduction steps..."
          className={`w-full p-3 bg-bg-elevated text-xs sm:text-sm text-text-primary rounded-lg border ${
            errors.description ? 'border-[#EF4444]' : 'border-border-dark'
          } focus:outline-none focus:ring-2 focus:ring-brand-primary/50`}
        />
        {errors.description && <p className="text-[11px] text-[#EF4444] font-medium">{errors.description}</p>}
      </div>

      {/* Impact & Recommendation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-text-secondary">Security & Business Impact</label>
          <textarea
            rows={2}
            value={impact}
            onChange={(e) => setImpact(e.target.value)}
            placeholder="Impact consequences if exploited..."
            className="w-full p-2.5 bg-bg-elevated text-xs text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-text-secondary">Remediation Guidelines</label>
          <textarea
            rows={2}
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
            placeholder="Hardening recommendations..."
            className="w-full p-2.5 bg-bg-elevated text-xs text-text-primary rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-dark">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isSubmitting}
          icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
        >
          {isSubmitting ? 'Saving...' : submitButtonText}
        </Button>
      </div>
    </form>
  );
};
