import { Project } from './project.types';
import { Finding, Priority, Severity } from './finding.types';

export type EngagementState =
  | 'PLANNING'
  | 'SCOPING'
  | 'ASSESSMENT'
  | 'ANALYSIS'
  | 'REMEDIATION'
  | 'REPORTING'
  | 'COMPLETED'
  | 'ARCHIVED';

export type HealthStatus = 'GOOD' | 'ATTENTION' | 'BLOCKED';

export type RemediationStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'FIXED'
  | 'VERIFIED'
  | 'REJECTED';

export type EvidenceVerificationStatus =
  | 'UNREVIEWED'
  | 'REVIEWED'
  | 'VERIFIED'
  | 'REJECTED';

export interface EngagementHealth {
  overall: HealthStatus;
  scopeHealth: HealthStatus;
  findingHealth: HealthStatus;
  riskHealth: HealthStatus;
  evidenceHealth: HealthStatus;
  reportingHealth: HealthStatus;
  details: {
    scopeMessage: string;
    findingMessage: string;
    riskMessage: string;
    evidenceMessage: string;
    reportingMessage: string;
  };
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  description?: string;
  actionUrl?: string;
}

export interface AssessmentChecklist {
  planning: ChecklistItem[];
  scope: ChecklistItem[];
  assessment: ChecklistItem[];
  analysis: ChecklistItem[];
  reporting: ChecklistItem[];
}

export interface RecommendedAction {
  id: string;
  title: string;
  reason: string;
  relatedEntityType: 'finding' | 'scope' | 'risk' | 'evidence' | 'report' | 'project';
  relatedEntityId?: string;
  actionUrl: string;
  actionLabel: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface WorkspaceActivity {
  id: string;
  userId?: string;
  projectId: string;
  entityType: string;
  entityId: string;
  action: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface FindingStatsSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  openCount: number;
  inProgressCount: number;
  fixedCount: number;
  verifiedCount: number;
}

export interface EvidenceStatsSummary {
  total: number;
  unreviewedCount: number;
  verifiedCount: number;
  rejectedCount: number;
}

export interface WorkspaceOverview {
  project: Project;
  progress: number; // 0 - 100
  engagementState: EngagementState;
  health: EngagementHealth;
  checklist: AssessmentChecklist;
  recommendedAction: RecommendedAction;
  findingStats: FindingStatsSummary;
  evidenceStats: EvidenceStatsSummary;
  recentActivities: WorkspaceActivity[];
}
