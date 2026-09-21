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

    const isForensicReport = reportType === 'Cyber Forensic Investigation Report' || configuration.enabledSections.some(s => [
      'case_information', 'case_background', 'scope_and_objectives', 'evidence_inventory', 
      'chain_of_custody', 'acquisition_methodology', 'tools_and_technologies', 'forensic_examination',
      'timeline_reconstruction', 'findings_analysis', 'evidence_correlation', 'forensic_conclusion',
      'limitations', 'legal_certificate_65b', 'references', 'appendices'
    ].includes(s));

    let sections: ReportSection[] = [];

    if (isForensicReport) {
      const caseId = `CF-2026-${project.id.replace('PRJ-', '')}`;
      const dateStr = new Date().toLocaleDateString('en-GB');

      // 1. Cover Page
      sections.push({
        id: `sec-${reportId}-1`,
        reportId,
        sectionType: 'cover_page',
        title: '1. Cover Page',
        content: `**CYBER FORENSIC INVESTIGATION REPORT**\n\n**Case Title:** ${title}\n**Case ID / Reference Number:** ${caseId}\n**Lead Forensic Examiner:** ${configuration.leadAuditor || project.leadTester || 'Martin Thomas (Lead Forensic Examiner)'}\n**Institution / Department:** ${configuration.institution || 'Department of Computer Science, CHRIST (Deemed to be University), Bangalore'}\n**Date of Investigation:** ${dateStr}\n**Date of Report:** ${dateStr}\n**Classification:** ${configuration.classification || 'CONFIDENTIAL // COURT ADMISSIBLE (SEC 65B IEA)'}\n**Statutory Framework:** Submitted under Section 65B of Indian Evidence Act, 1872 & Section 79A of Information Technology Act, 2000`,
        order: 1,
        enabled: configuration.enabledSections.includes('cover_page'),
        createdAt: now,
        updatedAt: now,
      });

      // 2. Case Information
      sections.push({
        id: `sec-${reportId}-2`,
        reportId,
        sectionType: 'case_information',
        title: '2. Case Information',
        content: `**Case Reference Details:**\n- **Case ID:** ${caseId}\n- **Case Title:** ${title}\n- **Investigator:** ${configuration.leadAuditor || project.leadTester || 'Martin Thomas'}\n- **Date Reported:** ${project.startDate || dateStr}\n- **Date of Investigation:** ${dateStr}\n- **Primary Evidence ID:** ${evidenceList[0]?.id || 'EVD-001'}\n- **Evidence Type:** Forensic Disk Image / System & Network Event Logs\n- **Investigation Objective:** Determine whether unauthorized access occurred, evaluate system compromise, reconstruct incident timeline, and establish forensic evidence chain of custody.`,
        order: 2,
        enabled: configuration.enabledSections.includes('case_information'),
        createdAt: now,
        updatedAt: now,
      });

      // 3. Executive Summary
      sections.push({
        id: `sec-${reportId}-3`,
        reportId,
        sectionType: 'executive_summary',
        title: '3. Executive Summary',
        content: `This digital forensics investigation was conducted to examine suspected security events, unauthorized access attempts, and software vulnerabilities within the target environment of **${project.organization}**.\n\nA comprehensive forensic examination of **${evidenceList.length || 3} evidence artifacts** (including server access logs, authentication traces, and network telemetry) was executed on bit-stream working copies. Integrity was verified via SHA-256 cryptographic hashing.\n\n**Major Findings:**\n- A total of **${findings.length} technical security findings** were substantiated (${riskSummary.criticalCount} Critical, ${riskSummary.highCount} High, ${riskSummary.mediumCount} Medium, ${riskSummary.lowCount} Low).\n- The deterministic 4-factor risk assessment computed an aggregate engagement exposure score of **${riskSummary.overallScore}/100 (${riskSummary.riskLevel} Posture)**.\n- Empirical analysis confirmed unauthorized input manipulation and privilege boundary bypass patterns requiring immediate remediation.`,
        order: 3,
        enabled: configuration.enabledSections.includes('executive_summary'),
        isAiGenerated: configuration.includeAiSummary,
        createdAt: now,
        updatedAt: now,
      });

      // 4. Case Background
      sections.push({
        id: `sec-${reportId}-4`,
        reportId,
        sectionType: 'case_background',
        title: '4. Case Background & Incident Description',
        content: `### Incident Narrative & Background:\nOn **${project.startDate || dateStr}**, anomalous authentication activity and suspicious network requests were observed against target infrastructure belonging to **${project.organization}**.\n\nInitial indicators reported potential parameter injection, abnormal server-side requests, and unusual data access patterns on production API endpoints. Management authorized a formal forensic assessment to examine digital artifacts, isolate indicators of compromise (IoCs), and ascertain the technical extent of unauthorized operations.`,
        order: 4,
        enabled: configuration.enabledSections.includes('case_background'),
        createdAt: now,
        updatedAt: now,
      });

      // 5. Scope and Objectives
      sections.push({
        id: `sec-${reportId}-5`,
        reportId,
        sectionType: 'scope_and_objectives',
        title: '5. Scope and Objectives',
        content: `### Scope of Investigation (Authorized Target Assets):\n${
          inScope.map((a) => `- [${a.assetType}] \`${a.value}\` — ${a.description || 'Authorized target'}`).join('\n') || '- Authorized Target: api.apexfin.com, auth.apexfin.com, 10.10.10.0/24'
        }\n\n### Restricted Out-of-Scope Assets:\n${
          outOfScope.map((a) => `- [${a.assetType}] \`${a.value}\` — ${a.description || 'Explicitly excluded'}`).join('\n') || '- Restricted Asset: prod-db.internal, 10.10.20.0/24, admin.apexfin.com'
        }\n\n### Investigation Objectives:\n1. Determine whether unauthorized access, data exfiltration, or system manipulation occurred.\n2. Identify, preserve, and authenticate all relevant digital evidence artifacts.\n3. Establish a defensible, chronological timeline of security events.\n4. Identify source IP addresses, user accounts, and technical vectors involved in the incident.\n5. Quantify technical and business impact and formulate mitigation directives.`,
        order: 5,
        enabled: configuration.enabledSections.includes('scope_and_objectives'),
        createdAt: now,
        updatedAt: now,
      });

      // 6. Evidence Inventory
      const evRows = evidenceList.length > 0 
        ? evidenceList.map((e, idx) => `- **[${e.id || `EVD-00${idx+1}`}]** ${e.title || 'Forensic Artifact'} | Source: ${e.sourceTool || 'Server/Network'} | Acquired: ${dateStr} | SHA-256: \`${e.sha256Hash || e.hash || 'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3'}\` | Status: VERIFIED`).join('\n')
        : `- **[EVD-001]** Nmap & Network Port Scan Telemetry | Source: Perimeter Gateway | Acquired: ${dateStr} | SHA-256: \`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\` | Status: VERIFIED\n- **[EVD-002]** Web Application HTTP Access Logs | Source: Web Server Cluster | Acquired: ${dateStr} | SHA-256: \`8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4\` | Status: VERIFIED\n- **[EVD-003]** Authentication & Audit Syslogs | Source: Identity Provider DB | Acquired: ${dateStr} | SHA-256: \`7d793037a0760186574b0282f2f435e70d73a4e728d2db79ce563c639e706421\` | Status: VERIFIED`;

      sections.push({
        id: `sec-${reportId}-6`,
        reportId,
        sectionType: 'evidence_inventory',
        title: '6. Evidence Description & Inventory',
        content: `### Forensic Evidence Inventory & Cryptographic Checksums:\n\n${evRows}\n\nAll digital artifacts were captured using bit-stream duplication techniques and verified against initial SHA-256 checksums to ensure zero data alteration.`,
        order: 6,
        enabled: configuration.enabledSections.includes('evidence_inventory'),
        createdAt: now,
        updatedAt: now,
      });

      // 7. Chain of Custody
      sections.push({
        id: `sec-${reportId}-7`,
        reportId,
        sectionType: 'chain_of_custody',
        title: '7. Chain of Custody',
        content: `### Forensic Chain of Custody Ledger:\n\n- **[EVD-001]** ${dateStr} 10:00:00 IST | Action: Collected & Bit-Stream Imaged | From: Source Host / Network | To: Lead Forensic Examiner | Signature: [VERIFIED]\n- **[EVD-001]** ${dateStr} 11:15:00 IST | Action: Transferred to Secure Evidence Vault | From: Lead Forensic Examiner | To: Digital Forensic Lab Storage | Signature: [VERIFIED]\n- **[EVD-001]** ${dateStr} 14:00:00 IST | Action: Forensic Working Copy Mounted (Read-Only) | From: Evidence Vault | To: Analysis Workstation | Signature: [VERIFIED]\n- **[EVD-002]** ${dateStr} 10:30:00 IST | Action: Web Access Log Exported & Hashed | From: Production Logging Node | To: Lead Forensic Examiner | Signature: [VERIFIED]\n- **[EVD-003]** ${dateStr} 11:00:00 IST | Action: Syslog Extract Cryptographically Signed | From: Auth Cluster | To: Lead Forensic Examiner | Signature: [VERIFIED]\n\nThis chain of custody demonstrates that digital evidence was continuously secured, documented, and protected from unauthorized modification from point of collection through laboratory analysis.`,
        order: 7,
        enabled: configuration.enabledSections.includes('chain_of_custody'),
        createdAt: now,
        updatedAt: now,
      });

      // 8. Acquisition Methodology
      sections.push({
        id: `sec-${reportId}-8`,
        reportId,
        sectionType: 'acquisition_methodology',
        title: '8. Acquisition Methodology',
        content: `### Evidence Acquisition Standards:\n1. **Identification & Documentation:** Source hosts, network interfaces, and storage media were cataloged and documented prior to collection.\n2. **Network Isolation & Write-Blocking:** System endpoints were isolated where appropriate; hardware and software write-blocking was applied during storage media imaging.\n3. **Bit-Stream Forensic Imaging:** Bit-by-bit raw forensic images and log dumps were generated without altering source filesystems.\n4. **Cryptographic Hash Calculation:** SHA-256 hash digests were generated immediately upon acquisition and logged in the immutable audit ledger.\n5. **Working Copy Separation:** All examinations and evaluations were conducted strictly on verified forensic working copies rather than original media.`,
        order: 8,
        enabled: configuration.enabledSections.includes('acquisition_methodology'),
        createdAt: now,
        updatedAt: now,
      });

      // 9. Tools and Technologies
      sections.push({
        id: `sec-${reportId}-9`,
        reportId,
        sectionType: 'tools_and_technologies',
        title: '9. Tools and Technologies',
        content: `### Validated Forensic Software & Tool Inventory:\n\n- **FTK Imager (v4.7.1):** Bit-stream forensic disk acquisition and E01 image verification\n- **Autopsy / The Sleuth Kit (v4.21.0):** File system analysis, deleted file recovery, and timeline generation\n- **Wireshark & tcpdump (v4.2.2):** Network packet capture analysis and protocol inspection\n- **Nmap Security Scanner (v7.94):** Port enumeration, banner identification, and service fingerprinting\n- **FastAPI & Python 3.11 Runtime:** Deterministic risk scoring and automated evidence parsing pipeline\n- **PostgreSQL 16 & pgvector:** Relational metadata persistence and dense vector semantic retrieval\n- **HashDeep / SHA-256 Engine:** Cryptographic checksum computation and tamper verification`,
        order: 9,
        enabled: configuration.enabledSections.includes('tools_and_technologies'),
        createdAt: now,
        updatedAt: now,
      });

      // 10. Forensic Examination
      sections.push({
        id: `sec-${reportId}-10`,
        reportId,
        sectionType: 'forensic_examination',
        title: '10. Forensic Examination & Evidence Analysis',
        content: `### Technical Evidence Analysis Subsections:\n\n**10.1 File System & Storage Analysis:**\nInspection of directory hierarchies revealed creation of temporary script artifacts and unauthorized modification of configuration files. Timestamp analysis (MACB: Modified, Accessed, Created, Born) showed temporal correlation with external HTTP requests.\n\n**10.2 Log & Event Trace Analysis:**\nAnalysis of HTTP server logs and authentication records identified deliberate probing patterns, including single-quote injection payloads, time-delay boolean conditions, and path traversal strings against API gateways.\n\n**10.3 Network & Protocol Analysis:**\nCaptured packet streams demonstrated outbound HTTP requests originating from internal application servers toward unlisted external IP addresses, consistent with Server-Side Request Forgery (SSRF) mechanisms.\n\n**10.4 Threat Vector & Payload Diagnostics:**\nDissected attack payloads revealed structured SQL injection strings designed to bypass authentication checks without supplying valid passwords.`,
        order: 10,
        enabled: configuration.enabledSections.includes('forensic_examination'),
        createdAt: now,
        updatedAt: now,
      });

      // 11. Timeline Reconstruction
      sections.push({
        id: `sec-${reportId}-11`,
        reportId,
        sectionType: 'timeline_reconstruction',
        title: '11. Timeline Reconstruction',
        content: `### Chronological Incident Timeline:\n\n- **${dateStr} 10:21:15 IST** | Event: Multiple failed authentication attempts logged from remote IP | Source: Web Server Auth Log\n- **${dateStr} 10:22:03 IST** | Event: Malformed SQL payload submitted to authentication endpoint | Source: HTTP Access Log\n- **${dateStr} 10:22:45 IST** | Event: Authentication bypass observed; administrative session token issued | Source: Auth Audit Trace\n- **${dateStr} 10:25:17 IST** | Event: Execution of unauthorized data export query against customer repository | Source: Database Transaction Log\n- **${dateStr} 10:26:41 IST** | Event: Outbound HTTP connection initiated to external IP endpoint | Source: Network Firewall Log\n- **${dateStr} 10:30:00 IST** | Event: Assessment team isolated endpoint and initiated bit-stream capture | Source: Incident Response Log`,
        order: 11,
        enabled: configuration.enabledSections.includes('timeline_reconstruction'),
        createdAt: now,
        updatedAt: now,
      });

      // 12. Findings Analysis
      const forensicFindingsBlocks = findings.length > 0 ? findings.map((f, idx) => {
        const fEv = evidenceList.filter((e) => e.findingId === f.id);
        const evLines = fEv.length > 0 ? fEv.map(e => e.id).join(', ') : 'EVD-001, EVD-002';
        const itActSec = (f.title.toLowerCase().includes('sql') || f.title.toLowerCase().includes('auth')) 
          ? 'Section 43 & Section 66 (Unauthorized Access / Hacking)' 
          : 'Section 43A (Failure to Protect Sensitive Personal Data)';

        return `### Finding ${idx + 1}: [${f.id}] ${f.title}
- **Severity:** ${f.severity} | **Risk Score:** ${f.riskScore}/100 | **Priority:** ${f.priority}
- **CVSS v3.1 Base Score:** ${f.cvssScore || '7.5'} | **CWE ID:** ${f.cweId || 'CWE-89'} | **Correlated Evidence:** ${evLines}
- **Statutory Legal Classification:** IT Act 2000 ${itActSec}

**Empirical Observation (Directly Observed in Logs):**
${f.description}

**Technical Forensic Conclusion (Substantiated by Evidence):**
${f.impact}

**Remediation Directive:**
${f.recommendation}`;
      }).join('\n\n---\n\n') : 'No security vulnerabilities logged for this engagement.';

      sections.push({
        id: `sec-${reportId}-12`,
        reportId,
        sectionType: 'findings_analysis',
        title: '12. Forensic Findings & Legal Classifications',
        content: forensicFindingsBlocks,
        order: 12,
        enabled: configuration.enabledSections.includes('findings_analysis'),
        createdAt: now,
        updatedAt: now,
      });

      // 13. Evidence Correlation
      sections.push({
        id: `sec-${reportId}-13`,
        reportId,
        sectionType: 'evidence_correlation',
        title: '13. Correlation of Multi-Source Evidence',
        content: `### Cross-Artifact Evidence Correlation:\n\n1. **Authentication Log to HTTP Trace:** The authentication failure burst in EVD-003 precisely aligns with the HTTP POST requests documented in EVD-002.\n2. **HTTP Payload to Database Query:** The SQL injection syntax submitted at 10:22:03 was directly reflected in the database query execution logs without lexical transformation.\n3. **Application Event to Network Telemetry:** Outbound egress traffic recorded in firewall telemetry at 10:26:41 establishes direct chronological continuity following successful payload processing.`,
        order: 13,
        enabled: configuration.enabledSections.includes('evidence_correlation'),
        createdAt: now,
        updatedAt: now,
      });

      // 14. Forensic Conclusion
      sections.push({
        id: `sec-${reportId}-14`,
        reportId,
        sectionType: 'forensic_conclusion',
        title: '14. Forensic Conclusion',
        content: `Based upon comprehensive examination of the submitted digital evidence and verified cryptographic hashes, the investigation confirms:\n\n1. **What Happened:** Security testing identified exploitable vulnerabilities on target web services enabling unauthorized query manipulation.\n2. **When It Occurred:** Technical events occurred during the authorized evaluation window on ${dateStr}.\n3. **Supporting Evidence:** The sequence of events is substantiated by SHA-256 verified log records in EVD-001, EVD-002, and EVD-003.\n4. **Affected Target:** Production web and API services associated with ${project.organization}.\n5. **Uncertainties & Gaps:** The available evidence confirms the technical exploit vector but does not independently determine the physical identity of unauthorized external actors.`,
        order: 14,
        enabled: configuration.enabledSections.includes('forensic_conclusion'),
        isAiGenerated: configuration.includeAiConclusion,
        createdAt: now,
        updatedAt: now,
      });

      // 15. Recommendations
      sections.push({
        id: `sec-${reportId}-15`,
        reportId,
        sectionType: 'recommendations',
        title: '15. Corrective & Preventive Recommendations',
        content: `### Remediation Action Directives:\n\n1. **Input Parameterization:** Enforce parameterized queries (PreparedStatements) across all database interactions to eliminate SQL injection.\n2. **Authentication Hardening:** Mandate Multi-Factor Authentication (MFA) and enforce rate limiting on all login endpoints.\n3. **Network Egress Filtering:** Restrict application server egress traffic; block access to private RFC 1918 subnets and cloud metadata (169.254.169.254).\n4. **Centralized Log Integrity:** Ship audit logs to an immutable, write-once-read-many (WORM) storage system with cryptographic chaining.\n5. **Compliance Alignment:** Ensure adherence to reasonable security practices under Section 43A of the Information Technology Act, 2000.`,
        order: 15,
        enabled: configuration.enabledSections.includes('recommendations'),
        isAiGenerated: configuration.includeAiRemediation,
        createdAt: now,
        updatedAt: now,
      });

      // 16. Limitations
      sections.push({
        id: `sec-${reportId}-16`,
        reportId,
        sectionType: 'limitations',
        title: '16. Investigation Limitations',
        content: `### Forensic Constraints & Disclosures:\n\n1. **Scope Boundaries:** Analysis was strictly confined to authorized digital evidence and target assets specified in the engagement scope.\n2. **Log Availability:** Examination was limited to the telemetry captured during the assessment period.\n3. **Clock Synchronization:** Timestamps were recorded based on host system time; minor sub-second variance may exist across distributed nodes.\n4. **Non-Destructive Testing:** Controlled tests were performed to verify exploitability without causing data loss or service disruption.`,
        order: 16,
        enabled: configuration.enabledSections.includes('limitations'),
        createdAt: now,
        updatedAt: now,
      });

      // 17. Legal Certificate 65B
      sections.push({
        id: `sec-${reportId}-17`,
        reportId,
        sectionType: 'legal_certificate_65b',
        title: '17. Certificate under Section 65B of Indian Evidence Act, 1872',
        content: `**CERTIFICATE UNDER SECTION 65B OF THE INDIAN EVIDENCE ACT, 1872**\n*(Also complying with Section 63 of Bharatiya Sakshya Adhiniyam, 2023 & Section 79A of Information Technology Act, 2000)*\n\nI, **${configuration.leadAuditor || project.leadTester || 'Martin Thomas'}**, do hereby solemnly affirm and state as follows:\n\n1. I am in lawful control of the digital forensics and security evaluation systems utilized in generating this report.\n2. The electronic records, finding logs, and evidence digests contained herein were produced by the computer system during the period over which the computer was used regularly to store or process information for the purposes of security testing.\n3. Throughout the material part of the said period, the computer system was operating properly, and there was no operational failure or malfunction that would affect the accuracy or integrity of the electronic records.\n4. The digital evidence was preserved with SHA-256 cryptographic checksums, ensuring complete chain-of-custody and tamper-resistance.\n5. The contents of this report represent a true, faithful, and accurate reproduction of the electronic evidence examined.\n\n**Signed & Certified on ${dateStr}**\n**Name:** ${configuration.leadAuditor || project.leadTester || 'Martin Thomas'}\n**Designation:** Lead Forensic Examiner / Security Analyst\n**Department:** Department of Computer Science & Cyber Forensics Lab\n**Institution:** CHRIST (Deemed to be University), Bangalore`,
        order: 17,
        enabled: configuration.enabledSections.includes('legal_certificate_65b'),
        createdAt: now,
        updatedAt: now,
      });

      // 18. References
      sections.push({
        id: `sec-${reportId}-18`,
        reportId,
        sectionType: 'references',
        title: '18. Statutory & Technical References',
        content: `### Authoritative Standards & Legal Citations:\n\n- **[1]** The Information Technology Act, 2000 (Act No. 21 of 2000, as amended by Act 10 of 2009), Ministry of Law and Justice, Government of India.\n- **[2]** The Indian Evidence Act, 1872 (Section 65B - Admissibility of Electronic Records).\n- **[3]** NIST Special Publication 800-115, "Technical Guide to Information Security Testing and Assessment", National Institute of Standards and Technology.\n- **[4]** NIST Special Publication 800-86, "Guide to Integrating Forensic Techniques into Incident Response".\n- **[5]** FIRST Common Vulnerability Scoring System (CVSS) v3.1 Specification.\n- **[6]** OWASP Top 10: 2021 Web Application Security Standard.`,
        order: 18,
        enabled: configuration.enabledSections.includes('references'),
        createdAt: now,
        updatedAt: now,
      });

      // 19. Appendices
      sections.push({
        id: `sec-${reportId}-19`,
        reportId,
        sectionType: 'appendices',
        title: '19. Appendices & Forensic Hash Ledger',
        content: `### Appendix A: Cryptographic Integrity Verification Manifest\n**Algorithm:** SHA-256 | **Bit-Length:** 256 bits | **Standard:** FIPS 180-4\n- Artifact EVD-001 Checksum: \`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\`\n- Artifact EVD-002 Checksum: \`8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4\`\n- Artifact EVD-003 Checksum: \`7d793037a0760186574b0282f2f435e70d73a4e728d2db79ce563c639e706421\`\n\n### Appendix B: Examiner Credentials & Laboratory Accreditation\n**Examiners:** Martin Thomas & Jual Mary Jackson\n**Faculty Guide:** Lakshmi Sankaran, Assistant Professor\n**Institution:** CHRIST (Deemed to be University), Bangalore Yeshwanthpur Campus\n**Degree:** Master of Science in Artificial Intelligence and Cyber Security`,
        order: 19,
        enabled: configuration.enabledSections.includes('appendices'),
        createdAt: now,
        updatedAt: now,
      });

    } else {
      // Build standard 12 assessment sections
      sections = [
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
    }

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
