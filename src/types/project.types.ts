export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'ON HOLD' | 'COMPLETED' | 'ARCHIVED';

export type ProjectType =
  | 'Web Application Pentest'
  | 'API Security Assessment'
  | 'Network Security Assessment'
  | 'Mobile Application Assessment'
  | 'Cloud Security Assessment'
  | 'Infrastructure Assessment'
  | 'Other';

export type AssetType = 'Domain' | 'IP Address' | 'URL' | 'Application' | 'API' | 'Other';

export type ScopeStatus = 'IN_SCOPE' | 'OUT_OF_SCOPE';

export interface ScopeAsset {
  id: string;
  projectId: string;
  assetType: AssetType;
  value: string;
  description?: string;
  scopeStatus: ScopeStatus;
  createdAt: string;
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  projectType: ProjectType;
  organization: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  progress: number;
  findingCount: number;
  criticalFindingCount: number;
  highFindingCount: number;
  mediumFindingCount: number;
  lowFindingCount: number;
  riskScore: number;
  createdAt: string;
  updatedAt: string;
  leadTester?: string;
}

export interface ProjectActivityItem {
  id: string;
  projectId: string;
  timestamp: string;
  title: string;
  description?: string;
  type: 'creation' | 'scope' | 'status' | 'finding' | 'ai';
}

export type ProjectSortOption =
  | 'recently_updated'
  | 'newest'
  | 'oldest'
  | 'risk_score'
  | 'finding_count';
