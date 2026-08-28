import React, { useState } from 'react';
import { Sparkles, RotateCw, CheckCircle2, ShieldCheck, Layers, FileText } from 'lucide-react';
import { WorkspaceOverview } from '../../types/workspace.types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface AIEngagementSummaryCardProps {
  overview: WorkspaceOverview;
}

export const AIEngagementSummaryCard: React.FC<AIEngagementSummaryCardProps> = ({
  overview,
}) => {
  const { project, findingStats, engagementState, progress } = overview;
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [summaryText, setSummaryText] = useState(
    `Engagement **${project.name}** for client **${project.organization}** is currently at **${progress}% completion** in the **${engagementState}** phase.\n\nThe assessment tracks **${findingStats.total} verified vulnerabilities** (${findingStats.critical} Critical, ${findingStats.high} High, ${findingStats.medium} Medium). Remediations are active with **${findingStats.verifiedCount} verified fixes** and **${findingStats.fixedCount} patches awaiting verification in staging**.\n\nOverall risk posture is quantified at **${project.riskScore}/100**. Prioritize resolution of remaining open high-impact findings prior to final report sign-off.`
  );

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await new Promise((r) => setTimeout(r, 600));
    setSummaryText(
      `### Executive Security Posture Synthesis (AI Co-Pilot)\nAssessment lifecycle for **${project.organization}** is progressing through **${engagementState}** with **${progress}% of milestones accomplished**.\n\n- **Threat Exposure:** ${findingStats.critical > 0 ? `Critical severity finding active; immediate developer remediation required.` : `Zero unmitigated Critical findings.`}\n- **Remediation SLA:** ${findingStats.verifiedCount} of ${findingStats.total} findings verified resolved by security testers.\n- **Sign-off Readiness:** Deliverables can proceed to formal audit review once staging verification completes.`
    );
    setIsRegenerating(false);
  };

  return (
    <Card
      variant="default"
      className="p-6 bg-gradient-to-br from-bg-card via-bg-elevated to-bg-card border border-brand-primary/30 space-y-4 shadow-card-dark relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-primary/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-primary/20 text-brand-primary border border-brand-primary/40">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-text-primary">
              AI Engagement Posture & Milestone Synthesis
            </h3>
            <p className="text-xs text-text-muted">
              Executive reasoning over verified project scope, finding SLAs, and risk telemetry
            </p>
          </div>
        </div>

        <Button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          variant="outline"
          size="sm"
          icon={<RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />}
        >
          {isRegenerating ? 'Analyzing...' : 'Regenerate'}
        </Button>
      </div>

      <div className="p-4 rounded-xl bg-bg-surface border border-border-dark text-xs sm:text-sm text-text-secondary leading-relaxed font-sans whitespace-pre-line text-left">
        {summaryText}
      </div>

      <div className="pt-2 border-t border-border-dark/60 flex items-center justify-between text-[10px] font-mono text-text-muted">
        <span>QWEN3_14B_GROUNDED_TELEMETRY</span>
        <span>Human Tester in the Loop</span>
      </div>
    </Card>
  );
};
