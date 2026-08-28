import React, { useState } from 'react';
import { X, Edit3, Shield, CheckCircle2 } from 'lucide-react';
import { 
  Finding, 
  VulnerabilityType, 
  Severity, 
  Priority, 
  FindingStatus, 
  HttpMethod 
} from '../../types/finding.types';
import { Button } from '../ui/Button';

interface EditFindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  finding: Finding;
  onSave: (updates: Partial<Finding>) => Promise<void>;
}

export const EditFindingModal: React.FC<EditFindingModalProps> = ({
  isOpen,
  onClose,
  finding,
  onSave,
}) => {
  const [title, setTitle] = useState(finding.title);
  const [vulnerabilityType, setVulnerabilityType] = useState<VulnerabilityType>(finding.vulnerabilityType);
  const [asset, setAsset] = useState(finding.asset);
  const [endpoint, setEndpoint] = useState(finding.endpoint);
  const [method, setMethod] = useState<HttpMethod>(finding.method);
  const [severity, setSeverity] = useState<Severity>(finding.severity);
  const [riskScore, setRiskScore] = useState<number>(finding.riskScore);
  const [priority, setPriority] = useState<Priority>(finding.priority);
  const [status, setStatus] = useState<FindingStatus>(finding.status);
  const [description, setDescription] = useState(finding.description);
  const [impact, setImpact] = useState(finding.impact);
  const [recommendation, setRecommendation] = useState(finding.recommendation);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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
  const statuses: FindingStatus[] = ['OPEN', 'IN_REVIEW', 'REMEDIATION', 'RESOLVED', 'ACCEPTED_RISK', 'REOPENED'];
  const httpMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'OTHER'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Finding title is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        vulnerabilityType,
        asset: asset.trim(),
        endpoint: endpoint.trim(),
        method,
        severity,
        riskScore: Number(riskScore),
        priority,
        status,
        description: description.trim(),
        impact: impact.trim(),
        recommendation: recommendation.trim(),
      });
      onClose();
    } catch {
      setError('Failed to update finding.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-bg-card border border-border-dark p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-dark">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-brand-primary" />
            <h3 className="text-base sm:text-lg font-bold text-text-primary">
              Edit Finding ({finding.id})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-bg-elevated"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <p className="p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444]">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Finding Title */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-text-secondary">
              Finding Title <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-border-dark text-xs sm:text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
          </div>

          {/* Vulnerability Type & Severity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Vulnerability Type */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-text-secondary">
                Vulnerability Classification
              </label>
              <select
                value={vulnerabilityType}
                onChange={(e) => setVulnerabilityType(e.target.value as VulnerabilityType)}
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-dark text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
              >
                {vulnerabilityTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-text-secondary">
                Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity)}
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-dark text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
              >
                {severities.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Risk Score */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-text-secondary">
                Risk Score (0-100)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={riskScore}
                onChange={(e) => setRiskScore(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-dark text-xs font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              />
            </div>
          </div>

          {/* Priority & Status & Method Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Priority */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-text-secondary">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-dark text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-text-secondary">
                Lifecycle Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as FindingStatus)}
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-dark text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* HTTP Method */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-text-secondary">
                HTTP Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as HttpMethod)}
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-dark text-xs font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
              >
                {httpMethods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Asset & Endpoint */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-text-secondary">
                Affected Asset
              </label>
              <input
                type="text"
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-dark font-mono text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-text-secondary">
                Endpoint URL / Path
              </label>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-dark font-mono text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-text-secondary">
              Vulnerability Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-lg bg-bg-elevated border border-border-dark text-xs sm:text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
          </div>

          {/* Impact */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-text-secondary">
              Security Impact
            </label>
            <textarea
              rows={2}
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              className="w-full p-3 rounded-lg bg-bg-elevated border border-border-dark text-xs sm:text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
          </div>

          {/* Recommendation */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-text-secondary">
              Remediation Guidelines
            </label>
            <textarea
              rows={2}
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              className="w-full p-3 rounded-lg bg-bg-elevated border border-border-dark text-xs sm:text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-border-dark">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving Changes...' : 'Update Finding'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
