import { 
  Report, 
  ReportSection, 
  ReportType, 
  ReportStatus, 
  SectionType, 
  ReportConfiguration 
} from '../types/report.types';
import { initialMockReports } from '../data/mockReports';
import { projectService } from './projectService';
import { findingService } from './findingService';
import { riskService } from './riskService';
import { MockAiProvider } from '../ai/mockAiProvider';

const STORAGE_KEY_REPORTS = 'art_reports_data';

class ReportService {
  private delay(ms = 250): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private loadReports(): Report[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_REPORTS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return initialMockReports;
  }

  private saveReports(reports: Report[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
    } catch {
      // ignore
    }
  }

  async getReports(filters?: {
    search?: string;
    projectId?: string;
    reportType?: string;
    status?: string;
  }): Promise<Report[]> {
    await this.delay(200);
    let list = this.loadReports();

    if (filters?.projectId && filters.projectId !== 'ALL') {
      list = list.filter((r) => r.projectId === filters.projectId);
    }

    if (filters?.reportType && filters.reportType !== 'ALL') {
      list = list.filter((r) => r.reportType === filters.reportType);
    }

    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((r) => r.status === filters.status);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.reportType.toLowerCase().includes(q) ||
          (r.projectName && r.projectName.toLowerCase().includes(q))
      );
    }

    return list;
  }

  async getReportById(id: string): Promise<Report | null> {
    await this.delay(150);
    const list = this.loadReports();
    return list.find((r) => r.id === id) || null;
  }

  async createReport(
    projectId: string,
    title: string,
    reportType: ReportType,
    configuration: ReportConfiguration
  ): Promise<Report> {
    await this.delay(500);
    const project = await projectService.getProjectById(projectId);
    if (!project) throw new Error('Target project not found.');

    const findings = await findingService.getFindingsByProjectId(projectId);
    const scopeAssets = await projectService.getScopeAssets(projectId);
    const riskSummary = await riskService.getProjectRiskSummary(projectId);

    // Load all associated evidence records for the project's findings
    const evidenceList: any[] = [];
    for (const f of findings) {
      const fEv = await findingService.getFindingEvidence(f.id);
      evidenceList.push(...fEv);
    }

    const now = new Date().toISOString();
    const reportId = `RPT-${Date.now().toString().slice(-4)}`;

    // Build all 12 factual sections dynamically from verified project data
    const inScope = scopeAssets.filter((a) => a.scopeStatus === 'IN_SCOPE');
    const outOfScope = scopeAssets.filter((a) => a.scopeStatus === 'OUT_OF_SCOPE');

    const slaMap: Record<string, string> = {
      'P1 — Immediate': '< 24 Hours (Immediate Hotfix)',
      'P2 — High': '< 7 Days (Next Sprint)',
      'P3 — Normal': '< 30 Days (Standard Release)',
      'P4 — Low': 'Next Scheduled Maintenance',
    };

    const sections: ReportSection[] = [
      {
        id: `sec-${reportId}-1`,
        reportId,
        sectionType: 'cover_page',
        title: 'Cover Page',
        content: `**AI RED TEAM ASSISTANT — SECURITY ASSESSMENT REPORT**\n\n**Client Organization:** ${project.organization}\n**Engagement Title:** ${project.name}\n**Assessment Type:** ${reportType}\n**Classification:** ${configuration.classification}\n**Lead Security Tester:** ${configuration.leadAuditor || 'Alex Vance'}\n**Date:** ${new Date().toLocaleDateString()}\n**Version:** v1.0`,
        order: 1,
        enabled: configuration.enabledSections.includes('cover_page'),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `sec-${reportId}-2`,
        sectionType: 'executive_summary',
        reportId,
        title: 'Executive Summary',
        content: `An authorized security assessment was conducted for **${project.organization}** evaluating the **${project.name}** environment.\n\nThe testing identified **${findings.length} verified security vulnerabilities** (${riskSummary.criticalCount} Critical, ${riskSummary.highCount} High, ${riskSummary.mediumCount} Medium, ${riskSummary.lowCount} Low).\n\nOverall aggregate engagement risk is evaluated at **${riskSummary.overallScore}/100 (${riskSummary.riskLevel} POSTURE)**. The highest severity vector identified was "${riskSummary.highestFindingTitle}". Immediate triage and remediation of high-impact vulnerabilities is recommended.`,
        order: 2,
        enabled: configuration.enabledSections.includes('executive_summary'),
        isAiGenerated: configuration.includeAiSummary,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `sec-${reportId}-3`,
        reportId,
        sectionType: 'assessment_overview',
        title: 'Assessment Overview',
        content: `### Engagement Scope & Objectives\n${project.description}\n\n**Framework:** ${project.projectType}\n**Testing Period:** ${project.startDate} to ${project.endDate}\n**Lead Tester:** ${project.leadTester || 'Alex Vance'}\n**Governance Model:** Human-in-the-loop tester verification without automated network exploitation.`,
        order: 3,
        enabled: configuration.enabledSections.includes('assessment_overview'),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `sec-${reportId}-4`,
        reportId,
        sectionType: 'scope',
        title: 'Scope & Rules of Engagement',
        content: `### Authorized In-Scope Target Assets (${inScope.length})\n${
          inScope.map((a) => `- [${a.assetType}] \`${a.value}\` — ${a.description || 'Authorized target'}`).join('\n') || 'None'
        }\n\n### Excluded Out-of-Scope Assets (${outOfScope.length})\n${
          outOfScope.map((a) => `- [${a.assetType}] \`${a.value}\` — ${a.description || 'Explicitly excluded'}`).join('\n') || 'None'
        }`,
        order: 4,
        enabled: configuration.enabledSections.includes('scope'),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `sec-${reportId}-5`,
        reportId,
        sectionType: 'methodology',
        title: 'Testing Methodology',
        content: `Assessment testing procedures were structured in accordance with industry benchmarks including the **OWASP Web Security Testing Guide (WSTG)** and **NIST Special Publication 800-115**.\n\nAll verified findings were manually confirmed by security testers using non-destructive proof-of-concept verification.`,
        order: 5,
        enabled: configuration.enabledSections.includes('methodology'),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `sec-${reportId}-6`,
        reportId,
        sectionType: 'risk_summary',
        title: 'Deterministic Risk Analysis & Scoring',
        content: `Engagement risk scores are calculated using the deterministic 4-factor risk engine:\n- **Impact (35%)** + **Likelihood (30%)** + **Asset Criticality (20%)** + **Exploitability (15%)**\n\n**Overall Engagement Risk Score:** ${riskSummary.overallScore} / 100 (${riskSummary.riskLevel})\n\n### Finding Severity Breakdown:\n- Critical (P1): ${riskSummary.criticalCount}\n- High (P2): ${riskSummary.highCount}\n- Medium (P3): ${riskSummary.mediumCount}\n- Low / Info (P4): ${riskSummary.lowCount}`,
        order: 6,
        enabled: configuration.enabledSections.includes('risk_summary'),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `sec-${reportId}-7`,
        reportId,
        sectionType: 'findings',
        title: 'Detailed Findings Catalog',
        content: findings.length > 0 ? findings
          .map(
            (f, idx) => {
              const fEv = evidenceList.filter((e) => e.findingId === f.id);
              const evidenceReferences = fEv.length > 0 
                ? fEv.map(e => `  - **[${e.id}]** \`${e.fileReference || 'Log Trace'}\` — ${e.title} (${e.verificationStatus || 'VERIFIED'})`).join('\n')
                : '  - *No forensic evidence file attached (Manual observation)*';

              const verificationLabel = f.status === 'RESOLVED' 
                ? 'RESOLVED (Retest Confirmed)'
                : (f.verificationStatus === 'VERIFIED' || f.status === 'OPEN' || f.status === 'REMEDIATION')
                  ? 'VERIFIED (Human Tester Confirmed)'
                  : 'PROPOSED (Pending Verification)';

              const cvssDisplay = f.cvssScore 
                ? `- **CVSS v3.1 Base Score:** ${f.cvssScore} ${f.cvssVector ? `(\`${f.cvssVector}\`)` : ''}\n` 
                : '';
              const cweDisplay = f.cweId ? `- **CWE Classification:** ${f.cweId}\n` : '';
              const owaspDisplay = f.owaspCategory ? `- **OWASP Top 10 Mapping:** ${f.owaspCategory}\n` : '';
              const mitreDisplay = f.mitreAttack ? `- **MITRE ATT&CK Technique:** ${f.mitreAttack}\n` : '';

              return `### ${idx + 1}. [${f.id}] ${f.title}
- **Vulnerability Type:** ${f.vulnerabilityType}
- **Verification Status:** ${verificationLabel}
- **Severity Rating:** ${f.severity} (Contextual Risk Score: ${f.riskScore}/100)
- **Remediation Priority:** ${f.priority}
${cvssDisplay}${cweDisplay}${owaspDisplay}${mitreDisplay}- **Target Vector:** \`${f.method} https://${f.asset}${f.endpoint}\`

**Technical Description:**
${f.description}

**Business & Threat Impact:**
${f.impact}

**Forensic Evidence Attachments:**
${evidenceReferences}

**Remediation Recommendation:**
${f.recommendation}`;
            }
          )
          .join('\n\n---\n\n') : 'No security vulnerabilities logged for this engagement.',
        order: 7,
        enabled: configuration.enabledSections.includes('findings'),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `sec-${reportId}-8`,
        reportId,
        sectionType: 'evidence',
        title: 'Proof-of-Concept Verification Evidence',
        content: configuration.includeEvidence
          ? (evidenceList.length > 0
              ? `### Forensic Proof-of-Concept Evidence Records (${evidenceList.length} Total)\n\n` +
                evidenceList.map((e, idx) => {
                  const linkedFinding = findings.find(f => f.id === e.findingId);
                  return `#### Evidence Item ${idx + 1}: [${e.id}] ${e.title}
- **File Reference:** \`${e.fileReference || 'N/A'}\`
- **Associated Finding:** ${linkedFinding ? `[${linkedFinding.id}] ${linkedFinding.title}` : 'Unassigned'}
- **Verification Status:** ${e.verificationStatus || 'VERIFIED'}
- **Recorded By:** ${e.createdBy || 'Tester'} (${e.createdAt ? new Date(e.createdAt).toLocaleDateString() : 'Active'})
- **Forensic Observation:**
  ${e.description || 'Verified via active HTTP request/response inspection.'}
  ${e.notes ? `*Technical Notes:* ${e.notes}` : ''}`;
                }).join('\n\n---\n\n')
              : 'Proof-of-concept evidence artifacts attached to verified findings:\n\n- Sanitized request/response traces and validation logs are recorded in the central evidence repository.\n- Zero credentials or customer secrets are included in compliance with data protection policies.')
          : 'Verification evidence excluded per configuration.',
        order: 8,
        enabled: configuration.enabledSections.includes('evidence') && configuration.includeEvidence,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `sec-${reportId}-9`,
        reportId,
        sectionType: 'recommendations',
        title: 'Remediation & Hardening Roadmap',
        content: `### Strategic Hardening Priorities:\n1. **Input Validation & Parameterization:** Enforce strict parameter binding on all database interaction points.\n2. **Access Control Verification:** Ensure authorization middleware validates session claims prior to serving object IDs.\n3. **Production Exception Handling:** Suppress framework stack traces in non-development environments.\n4. **Security Headers:** Enforce HSTS, CSP, and X-Frame-Options across all web origins.`,
        order: 9,
        enabled: configuration.enabledSections.includes('recommendations'),
        isAiGenerated: configuration.includeAiRemediation,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `sec-${reportId}-10`,
        reportId,
        sectionType: 'remediation_summary',
        title: 'Remediation Priority Queue',
        content: findings.length > 0 
          ? `| Finding ID | Vulnerability Title | Severity | Priority Tier | Action SLA Target | Current Status |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n${
              findings.map(f => `| **${f.id}** | ${f.title} | ${f.severity} | ${f.priority} | ${slaMap[f.priority] || '< 30 Days'} | \`${f.status}\` |`).join('\n')
            }`
          : 'No remediation items queued.',
        order: 10,
        enabled: configuration.enabledSections.includes('remediation_summary'),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `sec-${reportId}-11`,
        reportId,
        sectionType: 'conclusion',
        title: 'Conclusion & Next Steps',
        content: `The security testing engagement for **${project.organization}** has concluded with comprehensive visibility into target asset boundaries.\n\nFollowing patch implementation, a formal verification re-test is recommended to validate finding remediation before deployment to production.`,
        order: 11,
        enabled: configuration.enabledSections.includes('conclusion'),
        isAiGenerated: configuration.includeAiConclusion,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `sec-${reportId}-12`,
        reportId,
        sectionType: 'appendix',
        title: 'Appendix & Compliance Standards',
        content: `### Reference Classifications & Frameworks:\n- **OWASP Top 10 Web Application Security Risks (2021)**\n- **Common Weakness Enumeration (CWE) Standards**\n- **NIST SP 800-115 Technical Guide to Information Security Testing**`,
        order: 12,
        enabled: configuration.enabledSections.includes('appendix'),
        createdAt: now,
        updatedAt: now,
      },
    ];

    const newReport: Report = {
      id: reportId,
      projectId,
      projectName: project.name,
      organization: project.organization,
      createdBy: configuration.leadAuditor || 'Alex Vance',
      title,
      reportType,
      status: 'READY',
      version: 'v1.0',
      configuration,
      sections,
      findingsCount: findings.length,
      criticalCount: riskSummary.criticalCount,
      highCount: riskSummary.highCount,
      overallRiskScore: riskSummary.overallScore,
      generatedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const reports = this.loadReports();
    reports.unshift(newReport);
    this.saveReports(reports);

    return newReport;
  }

  async updateReport(id: string, updates: Partial<Report>): Promise<Report | null> {
    await this.delay(200);
    const reports = this.loadReports();
    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) return null;

    reports[index] = {
      ...reports[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveReports(reports);
    return reports[index];
  }

  async updateReportSection(
    reportId: string,
    sectionId: string,
    content: string,
    enabled?: boolean
  ): Promise<ReportSection | null> {
    await this.delay(200);
    const reports = this.loadReports();
    const report = reports.find((r) => r.id === reportId);
    if (!report) return null;

    const section = report.sections.find((s) => s.id === sectionId);
    if (!section) return null;

    section.content = content;
    if (typeof enabled === 'boolean') {
      section.enabled = enabled;
    }
    section.updatedAt = new Date().toISOString();
    report.updatedAt = new Date().toISOString();

    this.saveReports(reports);
    return section;
  }

  async regenerateAiSection(reportId: string, sectionType: SectionType): Promise<ReportSection | null> {
    await this.delay(600);
    const reports = this.loadReports();
    const report = reports.find((r) => r.id === reportId);
    if (!report) return null;

    const section = report.sections.find((s) => s.sectionType === sectionType);
    if (!section) return null;

    if (sectionType === 'executive_summary') {
      section.content = `### Executive Security Overview (AI-Regenerated)\nDuring this testing engagement for **${report.organization}**, a total of **${report.findingsCount} vulnerabilities** were analyzed. The overall security risk posture is quantified at **${report.overallRiskScore}/100**, driven primarily by high-impact finding parameters on the primary scope interface.\n\nImmediate architectural hardening is advised to prevent unauthorized credential and database extraction.`;
    } else if (sectionType === 'recommendations') {
      section.content = `### Strategic Remediation Guidelines (AI-Regenerated)\n1. **Query Parameterization:** Replace dynamic query strings with parameterized prepared statements across all controller repositories.\n2. **Tenant Boundary Enforcement:** Enforce authorization checks validating user ownership before returning order or user objects.\n3. **Security Headers:** Enforce HSTS (max-age=31536000), X-Frame-Options: DENY, and strict CSP policies.`;
    } else if (sectionType === 'conclusion') {
      section.content = `### Conclusion & Re-Testing Assurance (AI-Regenerated)\nAll authorized testing targets have been systematically evaluated. While baseline operational monitoring is active, prompt remediation of the Critical (P1) finding will substantially lower the overall risk score from **${report.overallRiskScore}/100** to safe operational limits. Re-testing is recommended within 14 days of patch deployment.`;
    }

    section.isAiGenerated = true;
    section.updatedAt = new Date().toISOString();
    report.updatedAt = new Date().toISOString();

    this.saveReports(reports);
    return section;
  }

  async createReportVersion(reportId: string, newVersionTag: string): Promise<Report> {
    await this.delay(300);
    const reports = this.loadReports();
    const original = reports.find((r) => r.id === reportId);
    if (!original) throw new Error('Original report not found.');

    const now = new Date().toISOString();
    const clonedReport: Report = {
      ...original,
      id: `RPT-${Date.now().toString().slice(-4)}`,
      version: newVersionTag || `v${(parseFloat(original.version.replace('v', '')) + 0.1).toFixed(1)}`,
      title: `${original.title} (${newVersionTag})`,
      sections: original.sections.map((s, idx) => ({
        ...s,
        id: `sec-${Date.now()}-${idx}`,
        createdAt: now,
        updatedAt: now,
      })),
      createdAt: now,
      updatedAt: now,
    };

    reports.unshift(clonedReport);
    this.saveReports(reports);
    return clonedReport;
  }

  async archiveReport(id: string): Promise<boolean> {
    const updated = await this.updateReport(id, { status: 'ARCHIVED' });
    return updated !== null;
  }

  async deleteReport(id: string): Promise<boolean> {
    await this.delay(200);
    let reports = this.loadReports();
    const len = reports.length;
    reports = reports.filter((r) => r.id !== id);
    this.saveReports(reports);
    return reports.length < len;
  }

  exportReportAsMarkdown(report: Report): string {
    const enabledSections = report.sections.filter((s) => s.enabled);
    return `# ${report.title}\n\n**Report Type:** ${report.reportType}  \n**Version:** ${report.version}  \n**Classification:** ${report.configuration.classification}  \n**Generated:** ${new Date(report.generatedAt || report.createdAt).toLocaleDateString()}  \n**Overall Risk Score:** ${report.overallRiskScore} / 100\n\n---\n\n` +
      enabledSections.map((s) => `## ${s.title}\n\n${s.content}`).join('\n\n---\n\n');
  }

  exportReportAsJson(report: Report): string {
    const enabledSections = report.sections.filter((s) => s.enabled);
    const structuredReport = {
      metadata: {
        reportId: report.id,
        title: report.title,
        reportType: report.reportType,
        status: report.status,
        version: report.version,
        classification: report.configuration.classification,
        leadAuditor: report.configuration.leadAuditor,
        generatedAt: report.generatedAt || report.createdAt,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      },
      project: {
        id: report.projectId,
        name: report.projectName,
        organization: report.organization,
      },
      riskSummary: {
        overallRiskScore: report.overallRiskScore,
        findingsCount: report.findingsCount,
        criticalCount: report.criticalCount,
        highCount: report.highCount,
      },
      configuration: report.configuration,
      sections: enabledSections.map((s) => ({
        id: s.id,
        sectionType: s.sectionType,
        title: s.title,
        content: s.content,
        order: s.order,
        isAiGenerated: !!s.isAiGenerated,
      })),
    };
    return JSON.stringify(structuredReport, null, 2);
  }
}

export const reportService = new ReportService();
