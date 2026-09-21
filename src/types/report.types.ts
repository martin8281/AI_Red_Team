export type ReportType =
  | 'Cyber Forensic Investigation Report'
  | 'Penetration Testing Report'
  | 'Security Assessment Report'
  | 'Vulnerability Assessment Report'
  | 'Executive Security Report'
  | 'Technical Security Report';

export type ReportStatus = 'DRAFT' | 'GENERATING' | 'READY' | 'FAILED' | 'ARCHIVED';

export type SectionType =
  // 19 Court-Admissible Cyber Forensic Sections (Indian Evidence Act Sec 65B & IT Act 2000)
  | 'cover_page'
  | 'case_information'
  | 'executive_summary'
  | 'case_background'
  | 'scope_and_objectives'
  | 'evidence_inventory'
  | 'chain_of_custody'
  | 'acquisition_methodology'
  | 'tools_and_technologies'
  | 'forensic_examination'
  | 'timeline_reconstruction'
  | 'findings_analysis'
  | 'evidence_correlation'
  | 'forensic_conclusion'
  | 'recommendations'
  | 'limitations'
  | 'legal_certificate_65b'
  | 'references'
  | 'appendices'
  // Assessment sections
  | 'assessment_overview'
  | 'scope'
  | 'methodology'
  | 'risk_summary'
  | 'findings'
  | 'evidence'
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
  institution?: string;
  jurisdiction?: string;
  examinerReg?: string;
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
