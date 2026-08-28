export type ReportType =
  | 'Penetration Testing Report'
  | 'Security Assessment Report'
  | 'Vulnerability Assessment Report'
  | 'Executive Security Report'
  | 'Technical Security Report';

export type ReportStatus = 'DRAFT' | 'GENERATING' | 'READY' | 'FAILED' | 'ARCHIVED';

export type SectionType =
  | 'cover_page'
  | 'executive_summary'
  | 'assessment_overview'
  | 'scope'
  | 'methodology'
  | 'risk_summary'
  | 'findings'
  | 'evidence'
  | 'recommendations'
  | 'remediation_summary'
  | 'conclusion'
  | 'appendix';

export interface ReportSection {
  id: string;
  reportId: string;
  sectionType: SectionType;
  title: string;
  content: string;
  order: number;
  enabled: boolean;
  isAiGenerated?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportConfiguration {
  includeEvidence: boolean;
  includeAiSummary: boolean;
  includeAiRemediation: boolean;
  includeAiConclusion: boolean;
  enabledSections: SectionType[];
  classification: string;
  leadAuditor: string;
}

export interface Report {
  id: string;
  projectId: string;
  projectName?: string;
  organization?: string;
  createdBy: string;
  title: string;
  reportType: ReportType;
  status: ReportStatus;
  version: string;
  configuration: ReportConfiguration;
  sections: ReportSection[];
  findingsCount: number;
  criticalCount: number;
  highCount: number;
  overallRiskScore: number;
  generatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExportFormat = 'pdf' | 'docx' | 'markdown' | 'json';
