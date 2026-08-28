import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Layers, 
  FolderGit2, 
  ChevronRight, 
  Sparkles, 
  Loader2, 
  Flame, 
  AlertCircle 
} from 'lucide-react';
import { Project } from '../types/project.types';
import { Finding } from '../types/finding.types';
import { 
  RiskAssessment, 
  RiskHistory, 
  ProjectRiskSummary 
} from '../types/risk.types';
import { projectService } from '../services/projectService';
import { findingService } from '../services/findingService';
import { riskService } from '../services/riskService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { ProjectRiskOverview } from '../components/risk/ProjectRiskOverview';
import { RiskTrendsChart } from '../components/risk/RiskTrendsChart';
import { SeverityBadge } from '../components/findings/SeverityBadge';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const RiskAnalysisPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [summary, setSummary] = useState<ProjectRiskSummary | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const projList = await projectService.getProjects();
      setProjects(projList);

      const activeProjId = selectedProjectId || projList[0]?.id || '';
      if (activeProjId) {
        setSelectedProjectId(activeProjId);
        const [sum, fnds, asses] = await Promise.all([
          riskService.getProjectRiskSummary(activeProjId),
          findingService.getFindingsByProjectId(activeProjId),
          riskService.getAllAssessments(),
        ]);
        setSummary(sum);
        setFindings(fnds);
        setAssessments(asses);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProjectId]);

  // Compute severity and priority counts for charts
  const severityCounts = {
    critical: findings.filter((f) => f.severity === 'CRITICAL').length,
    high: findings.filter((f) => f.severity === 'HIGH').length,
    medium: findings.filter((f) => f.severity === 'MEDIUM').length,
    low: findings.filter((f) => f.severity === 'LOW' || f.severity === 'INFORMATIONAL').length,
  };

  const priorityCounts = {
    p1: findings.filter((f) => f.priority.startsWith('P1')).length,
    p2: findings.filter((f) => f.priority.startsWith('P2')).length,
    p3: findings.filter((f) => f.priority.startsWith('P3')).length,
    p4: findings.filter((f) => f.priority.startsWith('P4')).length,
  };

  // Sort findings by calculated risk score descending
  const sortedFindings = [...findings].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <DashboardLayout
      title="Risk Prioritization & Analysis"
      subtitle="Deterministic mathematical risk engine paired with AI-driven threat reasoning."
    >
      <div className="space-y-6">
        
        {/* Top Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-bg-card border border-border-dark shadow-card-dark">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-brand-primary/10 border border-brand-primary/30 text-brand-primary">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-text-muted uppercase block">Select Assessment Scope</span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="py-1 px-2.5 rounded-lg bg-bg-elevated border border-border-dark text-xs sm:text-sm font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer max-w-[280px] truncate"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.organization})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            to={`/assistant?projectId=${selectedProjectId}&contextType=risk`}
            variant="primary"
            size="sm"
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Explain Risk Posture with AI
          </Button>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-7 h-7 text-brand-primary animate-spin" />
            <span className="text-xs text-text-muted font-mono">
              Running Deterministic Risk Engine Calculations...
            </span>
          </div>
        ) : summary ? (
          <>
            {/* Project Level Overview */}
            <ProjectRiskOverview summary={summary} />

            {/* Risk Trends & Priority Queue Charts */}
            <RiskTrendsChart
              severityCounts={severityCounts}
              priorityCounts={priorityCounts}
            />

            {/* Ranked High-Risk Findings Table */}
            <Card variant="default" className="p-0 bg-bg-card border-border-dark overflow-hidden shadow-card-dark">
              <div className="p-4 bg-bg-surface border-b border-border-dark flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#EF4444]" />
                  <h3 className="text-sm font-bold text-text-primary">
                    Prioritized Threat Vectors (Ranked by Engine Score)
                  </h3>
                </div>
                <span className="text-xs font-mono text-text-muted">
                  {sortedFindings.length} Logged Vulnerabilities
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-bg-card border-b border-border-dark text-[11px] font-mono uppercase text-text-muted">
                      <th className="py-3 px-4 font-semibold">Rank</th>
                      <th className="py-3 px-4 font-semibold">Finding Title</th>
                      <th className="py-3 px-4 font-semibold">Vulnerability Type</th>
                      <th className="py-3 px-4 font-semibold">Severity</th>
                      <th className="py-3 px-4 font-semibold">Risk Score</th>
                      <th className="py-3 px-4 font-semibold">Priority</th>
                      <th className="py-3 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark/60">
                    {sortedFindings.map((f, idx) => (
                      <tr key={f.id} className="hover:bg-bg-elevated/70 transition-colors">
                        <td className="py-3 px-4 font-mono text-text-muted font-bold">
                          #{idx + 1}
                        </td>
                        <td className="py-3 px-4 font-bold text-text-primary max-w-[260px] truncate">
                          <Link
                            to={`/findings/${f.id}`}
                            className="hover:text-brand-hover hover:underline"
                          >
                            {f.title}
                          </Link>
                          <div className="text-[10px] font-mono text-text-muted mt-0.5">
                            {f.id} · {f.asset}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-text-secondary whitespace-nowrap">
                          {f.vulnerabilityType}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <SeverityBadge severity={f.severity} size="sm" />
                        </td>
                        <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                          <span
                            className={
                              f.riskScore >= 75
                                ? 'text-[#EF4444]'
                                : f.riskScore >= 50
                                ? 'text-[#F97316]'
                                : 'text-[#22C55E]'
                            }
                          >
                            {f.riskScore}
                          </span>
                          <span className="text-[10px] text-text-muted font-normal"> / 100</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-mono text-text-primary">
                          {f.priority}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Link
                            to={`/findings/${f.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-bg-surface hover:bg-brand-primary text-text-secondary hover:text-white border border-border-dark text-[11px] font-semibold transition-colors"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        ) : null}

      </div>
    </DashboardLayout>
  );
};
