import { Priority } from './finding.types';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface RiskFactors {
  impact: number; // 1 - 5
  likelihood: number; // 1 - 5
  assetCriticality: number; // 1 - 5
  exploitability: number; // 1 - 5
}

export interface RiskAssessment {
  id: string;
  findingId: string;
  impact: number;
  likelihood: number;
  assetCriticality: number;
  exploitability: number;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  recommendedPriority: Priority;
  finalPriority: Priority;
  assessedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskHistory {
  id: string;
  riskAssessmentId: string;
  findingId: string;
  previousScore: number;
  newScore: number;
  reason: string;
  changedBy: string;
  createdAt: string;
}

export interface ProjectRiskSummary {
  projectId: string;
  projectName: string;
  overallScore: number;
  riskLevel: RiskLevel;
  highestFindingTitle: string;
  highestFindingScore: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  totalFindings: number;
}

export interface AIRecommendationBundle {
  technicalRecommendation: string;
  businessImpact: string;
  validationRecommendation: string;
  priorityReasoning: string;
  generatedAt: string;
}
