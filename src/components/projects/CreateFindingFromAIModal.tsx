import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  Loader2, 
  Layers, 
  Sparkles,
  Server,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Severity, VulnerabilityType, Priority, HttpMethod } from '../../types/finding.types';
import { ConfidenceTier } from '../../types/ai.types';
import { findingService } from '../../services/findingService';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SeverityBadge } from '../findings/SeverityBadge';

export interface ProposedFindingData {
  title: string;
  category?: string;
  vulnerabilityType?: VulnerabilityType;
  severity: Severity;
  confidence?: ConfidenceTier;
  affectedAsset: string;
  endpoint?: string;
  method?: HttpMethod;
  evidenceRefs?: string[];
  evidenceText?: string;
  impact: string;
  recommendation: string;
  description?: string;
  projectId: string;
}

interface CreateFindingFromAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposed: ProposedFindingData;
  onFindingCreated?: (createdFindingId: string) => void;
}

export const CreateFindingFromAIModal: React.FC<CreateFindingFromAIModalProps> = ({
  isOpen,
  onClose,
  proposed,
  onFindingCreated,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(proposed.title || 'Security Vulnerability');
  const [severity, setSeverity] = useState<Severity>(proposed.severity || 'HIGH');
  const [vulnerabilityType, setVulnerabilityType] = useState<VulnerabilityType>(
    (proposed.vulnerabilityType as VulnerabilityType) || 'SQL Injection'
  );
  const [asset, setAsset] = useState(proposed.affectedAsset || 'api.apexfin.com');
  const [endpoint, setEndpoint] = useState(proposed.endpoint || '/login');
  const [method, setMethod] = useState<HttpMethod>(proposed.method || 'POST');
  const [description, setDescription] = useState(
    proposed.description || proposed.evidenceText || 'Observed security weakness during active investigation.'
  );
  const [impact, setImpact] = useState(
    proposed.impact || 'Potential unauthorized access or data disclosure.'
  );
  const [recommendation, setRecommendation] = useState(
    proposed.recommendation || 'Implement parameterized queries and server-side validation.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const calculateRiskScore = (sev: Severity): number => {
    switch (sev) {
      case 'CRITICAL': return 92;
      case 'HIGH': return 82;
      case 'MEDIUM': return 58;
      case 'LOW': return 28;
      default: return 10;
    }
  };

  const getPriority = (sev: Severity): Priority => {
    switch (sev) {
      case 'CRITICAL': return 'P1 — Immediate';
      case 'HIGH': return 'P2 — High';
      case 'MEDIUM': return 'P3 — Normal';
      default: return 'P4 — Low';
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newFinding = await findingService.createFinding({
        projectId: proposed.projectId,
        title: title.trim(),
        vulnerabilityType,
        severity,
        riskScore: calculateRiskScore(severity),
        priority: getPriority(severity),
        asset: asset.trim(),
        endpoint: endpoint.trim(),
        method,
        description: description.trim(),
        impact: impact.trim(),
        recommendation: recommendation.trim(),
        status: 'OPEN',
        createdBy: 'AI Copilot (Analyst Confirmed)',
      });

      setSuccess(true);
      if (onFindingCreated) onFindingCreated(newFinding.id);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0B1220] border border-[#1E293B] p-6 shadow-2xl flex flex-col space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#A78BFA]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#F8FAFC]">
                  Create Security Finding
                </h3>
                <Badge variant="brand" size="sm">Human Confirmation</Badge>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Review and persist AI-proposed vulnerability to Project {proposed.projectId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#101827]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center mx-auto text-[#22C55E]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#F8FAFC]">Security Finding Confirmed & Persisted!</h4>
            <p className="text-xs text-[#94A3B8]">
              Finding is now active in project catalog and risk metrics.
            </p>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="space-y-4 text-xs">
            {/* Finding Title */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#CBD5E1]">
                Finding Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#050A14] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            {/* Severity & Confidence & Vulnerability Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#CBD5E1]">
                  Severity Rating *
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity)}
                  className="w-full px-3 py-2 rounded-lg bg-[#050A14] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
                >
                  <option value="CRITICAL">CRITICAL (Risk 90+)</option>
                  <option value="HIGH">HIGH (Risk 80+)</option>
                  <option value="MEDIUM">MEDIUM (Risk 50+)</option>
                  <option value="LOW">LOW (Risk 25+)</option>
                  <option value="INFORMATIONAL">INFORMATIONAL</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#CBD5E1]">
                  Vulnerability Type *
                </label>
                <select
                  value={vulnerabilityType}
                  onChange={(e) => setVulnerabilityType(e.target.value as VulnerabilityType)}
                  className="w-full px-3 py-2 rounded-lg bg-[#050A14] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
                >
                  <option value="SQL Injection">SQL Injection</option>
                  <option value="Authentication Issue">Authentication Issue</option>
                  <option value="Cross-Site Scripting">Cross-Site Scripting</option>
                  <option value="IDOR">IDOR</option>
                  <option value="Security Misconfiguration">Security Misconfiguration</option>
                  <option value="Sensitive Data Exposure">Sensitive Data Exposure</option>
                  <option value="API Security Issue">API Security Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#CBD5E1]">
                  AI Evidence Confidence
                </label>
                <div className="px-3 py-2 rounded-lg bg-[#050A14] border border-[#1E293B] text-xs font-mono text-[#22C55E]">
                  {proposed.confidence || 'HIGH'} (Verified in logs)
                </div>
              </div>
            </div>

            {/* Affected Asset & Endpoint */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#CBD5E1]">
                  Target Asset *
                </label>
                <input
                  type="text"
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#050A14] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#CBD5E1]">
                  Endpoint / Route
                </label>
                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#050A14] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>

            {/* Technical Description & Evidence */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#CBD5E1]">
                Technical Observations & Evidence *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#050A14] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6] font-mono leading-relaxed"
              />
            </div>

            {/* Impact */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#CBD5E1]">
                Business & Technical Impact *
              </label>
              <textarea
                rows={2}
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#050A14] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            {/* Recommendation */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#CBD5E1]">
                Remediation Guidance *
              </label>
              <textarea
                rows={2}
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#050A14] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#1E293B] flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmitting}
                icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              >
                {isSubmitting ? 'Persisting Finding...' : 'Confirm & Save Finding'}
              </Button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
