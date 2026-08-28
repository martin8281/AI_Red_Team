export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
export type FindingStatus = 'Open' | 'Reviewing' | 'Resolved';
export type ProjectStatus = 'Active' | 'In Progress' | 'Completed' | 'Planning';

export interface Finding {
  id: string;
  title: string;
  project: string;
  severity: SeverityLevel;
  riskScore: number;
  status: FindingStatus;
  cwe: string;
  target: string;
  description: string;
  aiAnalysis: string;
  recommendation: string;
  discoveredAt: string;
}

export interface Project {
  id: string;
  name: string;
  type: string;
  status: ProjectStatus;
  progress: number;
  findingsCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  lastUpdated: string;
  leadTester: string;
}

export interface StatCardData {
  id: string;
  label: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  trendText: string;
  iconName: 'projects' | 'engagements' | 'findings' | 'critical';
  accentColor?: string;
}

export interface RiskScoreData {
  score: number;
  maxScore: number;
  status: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  statusText: string;
  changeFromLastMonth: number;
  breakdown: {
    label: string;
    value: number;
    color: string;
  }[];
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  type: 'ai' | 'finding' | 'project' | 'report' | 'user';
  severity?: SeverityLevel;
}

export interface RiskDistributionItem {
  name: string;
  count: number;
  color: string;
  percentage: number;
}
