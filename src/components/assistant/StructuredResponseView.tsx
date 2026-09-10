import React, { useState } from 'react';
import { 
  StructuredAIResponse,
  ProposedFinding
} from '../../types/ai.types';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Terminal, 
  Shield, 
  Layers
} from 'lucide-react';
import { SeverityBadge } from '../findings/SeverityBadge';

interface StructuredResponseViewProps {
  structured: StructuredAIResponse;
  onAcceptFinding?: (findingId: string) => void;
  onRejectFinding?: (findingId: string, reason: string, comment: string) => void;
  onInspectEvidence?: (evidenceId: string) => void;
  onActionClick?: (action: string, customPrompt?: string) => void;
  onCreateFindingClick?: () => void;
}

export const StructuredResponseView: React.FC<StructuredResponseViewProps> = ({
  structured,
  onAcceptFinding,
  onRejectFinding,
  onInspectEvidence,
  onActionClick,
  onCreateFindingClick,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showEvidenceDetails, setShowEvidenceDetails] = useState(false);
  const [showRemediationDetails, setShowRemediationDetails] = useState(false);

  const finding = structured.findings?.[0];
  const riskScore = structured.risk?.score || (finding?.severity === 'CRITICAL' ? 92 : finding?.severity === 'HIGH' ? 82 : 55);
  const severity = structured.risk?.level || finding?.severity || 'HIGH';
  const priority = severity === 'CRITICAL' ? 'P1 — Immediate' : severity === 'HIGH' ? 'P1' : 'P2';
  const confidence = structured.confidence || finding?.confidence || 'HIGH';

  return (
    <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed text-[#CBD5E1]">
      
      {/* LEVEL 1: Conversational Answer / Summary */}
      <div className="text-[#F8FAFC] font-medium leading-relaxed">
        {structured.summary || (finding ? `I identified a potential ${finding.category || 'Security Vulnerability'}.` : 'Technical assessment complete.')}
      </div>

      {/* LEVEL 2: Compact Security Metadata Badge Line */}
      {(structured.risk || finding) && (
        <div className="flex flex-wrap items-center gap-2 py-1.5 px-3 rounded-xl bg-[#050A14] border border-[#1E293B] text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-[#94A3B8]">Severity:</span>
            <span className={`font-bold ${
              severity === 'CRITICAL' ? 'text-[#EF4444]' :
              severity === 'HIGH' ? 'text-[#F97316]' :
              severity === 'MEDIUM' ? 'text-[#EAB308]' : 'text-[#22C55E]'
            }`}>
              {severity}
            </span>
          </div>
          <span className="text-[#1E293B]">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[#94A3B8]">Risk Score:</span>
            <span className="font-bold text-[#F8FAFC]">{riskScore}/100</span>
          </div>
          <span className="text-[#1E293B]">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[#94A3B8]">Priority:</span>
            <span className="font-bold text-[#A78BFA]">{priority}</span>
          </div>
          <span className="text-[#1E293B]">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[#94A3B8]">Confidence:</span>
            <span className={`font-bold ${
              confidence === 'CONFIRMED' || confidence === 'HIGH' ? 'text-[#22C55E]' :
              confidence === 'LIKELY' ? 'text-[#38BDF8]' :
              confidence === 'POSSIBLE' || confidence === 'MEDIUM' ? 'text-[#EAB308]' : 'text-[#94A3B8]'
            }`}>
              {confidence}
            </span>
          </div>
        </div>
      )}

      {/* LEVEL 3: Short Explanation / Core Impact */}
      {structured.impact && (
        <p className="text-[#CBD5E1] text-xs sm:text-sm leading-relaxed">
          {structured.impact}
        </p>
      )}

      {/* LEVEL 5: Progressive Disclosure Details (Collapsed by Default) */}
      {(structured.reasoning || structured.recommendation || (finding && finding.evidence_refs)) && (
        <div className="space-y-2 pt-1">
          {/* Toggle Technical Reasoning */}
          {structured.reasoning && (
            <div className="border border-[#1E293B] rounded-xl overflow-hidden bg-[#050A14]">
              <button
                type="button"
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="w-full px-3 py-2 text-left flex items-center justify-between text-[11px] font-semibold text-[#A78BFA] hover:text-white transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>Technical Analysis & Exploit Preconditions</span>
                </div>
                {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showTechnicalDetails && (
                <div className="px-3 pb-3 text-xs text-[#CBD5E1] border-t border-[#1E293B] pt-2 space-y-2 font-mono whitespace-pre-wrap leading-relaxed animate-in fade-in">
                  {structured.reasoning}
                </div>
              )}
            </div>
          )}

          {/* Toggle Evidence References */}
          {finding?.evidence_refs && finding.evidence_refs.length > 0 && (
            <div className="border border-[#1E293B] rounded-xl overflow-hidden bg-[#050A14]">
              <button
                type="button"
                onClick={() => setShowEvidenceDetails(!showEvidenceDetails)}
                className="w-full px-3 py-2 text-left flex items-center justify-between text-[11px] font-semibold text-[#3B82F6] hover:text-white transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Referenced Evidence Logs ({finding.evidence_refs.length})</span>
                </div>
                {showEvidenceDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showEvidenceDetails && (
                <div className="px-3 pb-3 text-xs text-[#CBD5E1] border-t border-[#1E293B] pt-2 space-y-1.5 animate-in fade-in">
                  <p className="text-[11px] font-mono text-[#94A3B8]">Supporting Evidence Artifacts:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {finding.evidence_refs.map((ref, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-[#101827] border border-[#1E293B] font-mono text-[11px] text-[#A78BFA]">
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Toggle Remediation Code */}
          {structured.recommendation && (
            <div className="border border-[#1E293B] rounded-xl overflow-hidden bg-[#050A14]">
              <button
                type="button"
                onClick={() => setShowRemediationDetails(!showRemediationDetails)}
                className="w-full px-3 py-2 text-left flex items-center justify-between text-[11px] font-semibold text-[#22C55E] hover:text-white transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>Recommended Defense & Code Fix</span>
                </div>
                {showRemediationDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showRemediationDetails && (
                <div className="px-3 pb-3 text-xs text-[#CBD5E1] border-t border-[#1E293B] pt-2 space-y-2 font-mono whitespace-pre-wrap leading-relaxed animate-in fade-in">
                  {structured.recommendation}
                  {structured.suggestedValidation && (
                    <div className="mt-2 p-2 rounded bg-[#101827] border border-[#1E293B] text-[11px] text-[#94A3B8]">
                      <strong className="text-[#22C55E]">Validation Test: </strong>
                      {structured.suggestedValidation}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
