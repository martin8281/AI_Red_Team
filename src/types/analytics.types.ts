import { Finding, Severity, Priority, FindingStatus } from './finding.types';

export type DateRangeOption = '7d' | '30d' | '90d' | 'ALL';

export interface AnalyticsFilters {
  projectId: string;
  dateRange: DateRangeOption;
  severity: string;
  status: string;
  priority: string;
}

export interface AnalyticsOverview {
  overallRiskScore: number;
  averageRiskScore: number;
  maxRiskScore: number;
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
  remediationRate: number; // 0 - 100%
  averageRemediationDays: number;
}

export interface HeatmapFindingItem {
  id: string;
  title: string;
  riskScore: number;
  severity: Severity;
  priority: Priority;
  asset: string;
}

export interface RiskHeatmapPlot {
  impact: number; // 1 - 5
  likelihood: number; // 1 - 5
  findings: HeatmapFindingItem[];
}

export interface TrendDataPoint {
  date: string;
  findingsCount: number;
  averageRisk: number;
  remediatedCount: number;
}

export interface ProjectBenchmark {
  projectId: string;
  projectName: string;
  organization: string;
  overallRisk: number;
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  remediationRate: number;
  status: string;
}

export interface SecurityAlert {
  id: string;
  type: 'CRITICAL_VULN' | 'RISK_SPIKE' | 'SLA_BREACH' | 'REMEDIATION_COMPLETE' | 'EVIDENCE_VERIFIED';
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  targetUrl?: string;
}

export interface AISecurityInsightBundle {
  postureSummary: string;
  biggestConcern: string;
  priorityRemediation: string;
  trendExplanation: string;
  remediationRateInsight: string;
  generatedAt: string;
}
