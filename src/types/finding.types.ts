export type VulnerabilityType =
  | 'SQL Injection'
  | 'Cross-Site Scripting'
  | 'IDOR'
  | 'Authentication Issue'
  | 'Authorization Issue'
  | 'CSRF'
  | 'SSRF'
  | 'Security Misconfiguration'
  | 'Sensitive Data Exposure'
  | 'File Upload Vulnerability'
  | 'Command Injection'
  | 'Path Traversal'
  | 'API Security Issue'
  | 'Other';

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export type FindingStatus =
  | 'OPEN'
  | 'IN_REVIEW'
  | 'REMEDIATION'
  | 'RESOLVED'
  | 'ACCEPTED_RISK'
  | 'REOPENED';

export type Priority = 'P1 — Immediate' | 'P2 — High' | 'P3 — Normal' | 'P4 — Low';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'OTHER';

export interface Finding {
  id: string;
  projectId: string;
  projectName?: string;
  title: string;
  vulnerabilityType: VulnerabilityType;
  description: string;
  asset: string;
  endpoint: string;
  method: HttpMethod;
  severity: Severity;
  riskScore: number;
  priority: Priority;
  impact: string;
  recommendation: string;
  status: FindingStatus;
  assigneeId?: string;
  assignedUser?: string;
  dueDate?: string;
  remediationStatus?: 'NOT_STARTED' | 'IN_PROGRESS' | 'FIXED' | 'VERIFIED' | 'REJECTED';
  resolutionNotes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Evidence {
  id: string;
  findingId: string;
  title: string;
  description: string;
  fileReference?: string;
  notes?: string;
  verificationStatus?: 'UNREVIEWED' | 'REVIEWED' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: string;
  verifiedAt?: string;
  createdBy: string;
  createdAt: string;
}

export type FindingSortOption =
  | 'newest'
  | 'oldest'
  | 'highest_risk'
  | 'severity'
  | 'recently_updated';

export interface FindingStatsData {
  total: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
  byStatus: {
    open: number;
    inReview: number;
    remediation: number;
    resolved: number;
    acceptedRisk: number;
    reopened: number;
  };
}
