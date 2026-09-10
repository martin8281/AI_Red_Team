import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  ArrowRight, 
  MessageSquare, 
  ShieldAlert, 
  CheckCircle2, 
  ExternalLink,
  X
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface AIAssistantCardProps {
  onReviewFindings?: () => void;
}

export const AIAssistantCard: React.FC<AIAssistantCardProps> = ({ onReviewFindings }) => {
  const [askAiModalOpen, setAskAiModalOpen] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const attentionFindings = [
    { title: 'SQL Injection in /api/v1/auth/token', severity: 'HIGH', badgeVariant: 'high' as const, cwe: 'CWE-89' },
    { title: 'IDOR in /v2/orders/{id}', severity: 'HIGH', badgeVariant: 'high' as const, cwe: 'CWE-639' },
    { title: 'Cross-Site Scripting (Reflected)', severity: 'MEDIUM', badgeVariant: 'medium' as const, cwe: 'CWE-79' },
  ];

  const handleAskAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    setAiResponse(
      `Analyzing your query: "${promptInput.trim()}".\n\nAI Co-pilot Assessment: In the current authorized scope, prioritizing parameterized queries for the SQL Injection in /api/v1/auth/token will reduce overall system risk by 18%. Recommend deploying immediate input validation filters while code refactor is in progress.`
    );
  };

  return (
    <>
      <Card
        variant="default"
        className="p-6 bg-gradient-to-br from-bg-card via-bg-elevated to-bg-card border border-brand-primary/30 relative overflow-hidden shadow-card-dark"
      >
        {/* Subtle ambient brand flare */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-primary/10 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col justify-between h-full space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border-dark">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-primary/20 border border-brand-primary/40 text-brand-primary">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold flex items-center gap-1.5">
                  <span><span className="text-brand-primary">AI</span> <span className="text-[#e00000]">Red</span> <span className="text-white">Team Assistant</span></span>
                  <Badge variant="brand" size="sm" dot pulse>
                    CO-PILOT
                  </Badge>
                </h3>
                <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
                  Human-in-the-Loop Mode
                </span>
              </div>
            </div>
            <span className="text-xs font-mono text-brand-hover hidden sm:inline-block">
              ENGINE v2.4
            </span>
          </div>

          {/* Greeting & Insight Message */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-bg-surface/80 border border-border-dark flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-brand-primary mt-0.5 shrink-0" />
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                "Good morning. I found <span className="text-[#EF4444] font-bold">3 findings</span> that may require immediate attention based on exploitability metrics."
              </p>
            </div>

            {/* Finding Pills List */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block font-mono">
                Priority Review Queue:
              </span>
              <div className="space-y-1.5">
                {attentionFindings.map((f) => (
                  <div
                    key={f.title}
                    className="p-2.5 rounded-lg bg-bg-elevated border border-border-dark hover:border-brand-primary/40 transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
                      <span className="text-xs font-medium text-text-primary truncate">
                        {f.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-text-muted font-mono">{f.cwe}</span>
                      <Badge variant={f.badgeVariant} size="sm">
                        {f.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Button
              onClick={onReviewFindings}
              variant="primary"
              size="md"
              fullWidth
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Review Findings
            </Button>
            <Button
              onClick={() => setAskAiModalOpen(true)}
              variant="secondary"
              size="md"
              fullWidth
              icon={<MessageSquare className="w-4 h-4 text-brand-primary" />}
              iconPosition="left"
            >
              Ask AI Co-Pilot
            </Button>
          </div>
        </div>
      </Card>

      {/* Interactive Mock Ask AI Modal */}
      {askAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-bg-card border border-border-dark p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-dark">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-primary" />
                <h3 className="text-sm font-bold text-text-primary">
                  Ask AI Security Assistant
                </h3>
              </div>
              <button
                onClick={() => {
                  setAskAiModalOpen(false);
                  setAiResponse(null);
                  setPromptInput('');
                }}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-bg-elevated"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-text-muted">
              Ask questions regarding authorized findings, root cause analysis, or remediation verification.
            </p>

            <form onSubmit={handleAskAiSubmit} className="space-y-3">
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="e.g. How should I prioritize remediation for the SQL injection in the auth endpoint?"
                rows={3}
                className="w-full p-3 rounded-lg bg-bg-elevated border border-border-dark text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary placeholder:text-text-disabled"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAskAiModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  Query Assistant
                </Button>
              </div>
            </form>

            {aiResponse && (
              <div className="p-3.5 rounded-xl bg-bg-surface border border-brand-primary/30 text-xs space-y-2 text-text-secondary animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 text-brand-hover font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
                  <span>AI Co-Pilot Response:</span>
                </div>
                <p className="whitespace-pre-line text-text-primary">{aiResponse}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
