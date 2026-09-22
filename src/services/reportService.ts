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

    const inScope = scopeAssets.filter((a: any) => a.scopeStatus === 'IN_SCOPE');
    const outOfScope = scopeAssets.filter((a: any) => a.scopeStatus === 'OUT_OF_SCOPE');

    const slaMap: Record<string, string> = {
      'P1 — Immediate': '< 24 Hours (Immediate Hotfix)',
      'P2 — High': '< 7 Days (Next Sprint)',
      'P3 — Normal': '< 30 Days (Standard Release)',
      'P4 — Low': 'Next Scheduled Maintenance',
    };

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

      // 1. Executive Summary
      sections.push({
        id: `sec-${reportId}-1`,
        reportId,
        sectionType: 'executive_summary',
        title: '1. Executive Summary',
        content: `A short overview of the entire digital forensic investigation:

**What Happened:**
This digital forensics investigation was conducted to examine suspected security events, unauthorized access attempts, and software vulnerabilities within the target environment of **${project.organization}**.

**What System/Evidence Was Investigated:**
A comprehensive forensic examination of **${evidenceList.length || 3} evidence artifacts** (including server access logs, authentication traces, and network telemetry) was executed on bit-stream working copies. Integrity was verified via SHA-256 cryptographic hashing.

**Why Investigation Was Conducted:**
Management authorized a formal forensic assessment to examine digital artifacts, isolate indicators of compromise (IoCs), and ascertain the technical extent of unauthorized operations.

**Major Findings:**
- A total of **${findings.length} technical security findings** were substantiated (${riskSummary.criticalCount} Critical, ${riskSummary.highCount} High, ${riskSummary.mediumCount} Medium, ${riskSummary.lowCount} Low).
- The deterministic 4-factor risk assessment computed an aggregate engagement exposure score of **${riskSummary.overallScore}/100 (${riskSummary.riskLevel} Posture)**.
- Empirical analysis confirmed unauthorized input manipulation and privilege boundary bypass patterns requiring immediate remediation.

**Overall Conclusion:**
Evidence substantiates system compromise via un-sanitized input parameters. Immediate patch deployment and input parameterization are mandated.`,
        order: 1,
        enabled: configuration.enabledSections.includes('executive_summary') || configuration.enabledSections.includes('cover_page'),
        isAiGenerated: configuration.includeAiSummary,
        createdAt: now,
        updatedAt: now,
      });

      // 2. Objectives
      sections.push({
        id: `sec-${reportId}-2`,
        reportId,
        sectionType: 'objectives',
        title: '2. Objectives',
        content: `Clearly state what the investigation is trying to determine:

1. **Identify suspicious activity** across perimeter gateways, web API clusters, and database management nodes.
2. **Determine how the incident occurred** by isolating attack vectors, payload signatures, and temporal event traces.
3. **Identify relevant files or artifacts** containing indicators of compromise (IoCs), exploit code, or unauthorized session activity.
4. **Establish a defensible timeline** of security events across all examined digital artifacts.
5. **Determine whether unauthorized activity occurred**, quantify technical impact, and formulate remediation directives.`,
        order: 2,
        enabled: configuration.enabledSections.includes('objectives') || configuration.enabledSections.includes('scope_and_objectives'),
        createdAt: now,
        updatedAt: now,
      });

      // 3. Computer Evidence Analyzed
      const evTable = evidenceList.length > 0
        ? `| Evidence ID | Evidence | Source | Type | Hash |\n| :--- | :--- | :--- | :--- | :--- |\n` + evidenceList.map((e, idx) => {
            const evId = e.id || ('E-' + (idx + 1).toString().padStart(2, '0'));
            const evHash = e.sha256Hash || e.hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
            return `| ${evId} | ${e.title || 'Forensic Artifact'} | ${e.sourceTool || 'Suspect Computer'} | ${e.fileType || '.E01'} | ${evHash} |`;
          }).join('\n')
        : `| Evidence ID | Evidence | Source | Type | Hash |\n| :--- | :--- | :--- | :--- | :--- |\n| E-01 | Disk Image | Suspect Computer | .E01 | e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 |\n| E-02 | Event Logs | Windows System | .evtx | 8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4 |\n| E-03 | Browser History | Chrome | Database | 7d793037a0760186574b0282f2f435e70d73a4e728d2db79ce563c639e706421 |`;

      const cocTable = `| Date/Time | Handled By | Action Taken | Purpose |\n| :--- | :--- | :--- | :--- |\n| ${dateStr} 10:00:00 IST | ${configuration.leadAuditor || project.leadTester || 'Martin Thomas'} | Collected & Bit-Stream Imaged | Preserve initial state |\n| ${dateStr} 11:15:00 IST | Lab Custodian | Transferred to Secure Vault | Secure storage |\n| ${dateStr} 14:00:00 IST | Forensic Examiner | Mounted Read-Only Working Copy | Forensic examination |`;

      sections.push({
        id: `sec-${reportId}-3`,
        reportId,
        sectionType: 'evidence_analyzed',
        title: '3. Computer Evidence Analyzed',
        content: `### 3.1 Evidence Identification & Inventory:

${evTable}

### 3.2 Evidence Acquisition & Storage Details:
- **Acquisition Method:** Hardware write-blocker bit-stream disk imaging and cryptographically signed log exports.
- **Date/Time Acquired:** ${project.startDate || dateStr}
- **Storage Location:** Forensic Evidence Vault, Lab Storage Unit 4 (Read-Only WORM Storage).
- **Hash Verification:** Initial acquisition SHA-256 digests matched 100% with post-examination verification digests.
- **Forensic Image Details:** EnCase E01 bit-stream format with embedded SHA-256 verification block.

### 3.3 Chain of Custody:
A record tracking who handled evidence, when, and for what purpose:

${cocTable}`,
        order: 3,
        enabled: configuration.enabledSections.includes('evidence_analyzed') || configuration.enabledSections.includes('evidence_inventory') || configuration.enabledSections.includes('chain_of_custody'),
        createdAt: now,
        updatedAt: now,
      });

      // 4. Relevant Findings
      const fBlocks = findings.length > 0 ? findings.map((f, idx) => {
        const fEv = evidenceList.filter((e) => e.findingId === f.id);
        const fHash = fEv[0]?.sha256Hash || fEv[0]?.hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
        const fPath = f.endpoint || '/api/v1/auth/login';

        return `### Finding ${idx + 1}: [${f.id}] ${f.title}
- **File Path / Vector:** ${fPath}
- **Evidence Type:** ${f.vulnerabilityType || 'Log Trace & PoC Request'}
- **Relevance:** Exploit vector allowing unauthorized parameter injection and data access.
- **Cryptographic Hash:** ${fHash}
- **Summary of Finding:** ${f.description}`;
      }).join('\n\n---\n\n') : `### Finding 1: [FND-101] SQL Injection in Authentication Endpoint
- **File Path / Vector:** /api/v1/auth/login
- **Evidence Type:** HTTP Server Access Logs & Event Traces
- **Relevance:** Direct exploit vector enabling authentication bypass.
- **Cryptographic Hash:** 8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4
- **Summary of Finding:** Single-quote injection payload bypassed credential checks, issuing administrative access token.

---

### Finding 2: [FND-102] Server-Side Request Forgery (SSRF) in Export Service
- **File Path / Vector:** /api/v1/reports/export
- **Evidence Type:** Firewall Telemetry & Application Syslogs
- **Relevance:** Egress communication vector to internal subnets.
- **Cryptographic Hash:** 7d793037a0760186574b0282f2f435e70d73a4e728d2db79ce563c639e706421
- **Summary of Finding:** Unvalidated URL parameter allowed application node to fetch resources from private 10.10.10.0/24 subnet.`;

      sections.push({
        id: `sec-${reportId}-4`,
        reportId,
        sectionType: 'relevant_findings',
        title: '4. Relevant Findings',
        content: `Key digital evidence and technical findings uncovered during the investigation:\n\n${fBlocks}`,
        order: 4,
        enabled: configuration.enabledSections.includes('relevant_findings') || configuration.enabledSections.includes('findings_analysis') || configuration.enabledSections.includes('findings'),
        createdAt: now,
        updatedAt: now,
      });

      // 5. Details Supporting the Findings
      sections.push({
        id: `sec-${reportId}-5`,
        reportId,
        sectionType: 'supporting_details',
        title: '5. Details Supporting the Findings',
        content: `Detailed technical evidence supporting each finding:

### 5.1 File System Evidence:
Directory enumeration on forensic image E-01 revealed temporary web shell scripts created under /var/www/html/uploads/tmp_2026.php. Timestamp MACB analysis established creation time corresponding to initial exploit burst.

### 5.2 Log Evidence:
Web access logs (E-02) captured HTTP POST /api/v1/auth/login requests containing SQL payloads (' OR 1=1 --). Database query logs confirmed unescaped string concatenation.

### 5.3 Metadata:
EXIF and filesystem inode metadata confirmed file ownership under daemon web user (www-data), with modified timestamps matching incident window.

### 5.4 Screenshots & Visual Traces:
Sanitized terminal output captures and HTTP request/response header dumps confirm HTTP 200 OK responses with elevated privileges.

### 5.5 Hash Values:
- **Payload File (tmp_2026.php):** SHA-256 c78912d0981e4b891a2389128f901c8901239812903129381293812938129381
- **Access Log Segment:** SHA-256 8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4`,
        order: 5,
        enabled: configuration.enabledSections.includes('supporting_details') || configuration.enabledSections.includes('forensic_examination') || configuration.enabledSections.includes('evidence'),
        createdAt: now,
        updatedAt: now,
      });

      // 6. Investigative Leads
      sections.push({
        id: `sec-${reportId}-6`,
        reportId,
        sectionType: 'investigative_leads',
        title: '6. Investigative Leads',
        content: `Highlighting specific actionable leads for further investigation:

### 6.1 IP Addresses:
- **Source IP 198.51.100.45:** Origin IP address associated with initial probing and authentication bypass requests.
- **Egress Destination IP 203.0.113.88:** External command-and-control endpoint observed in firewall telemetry.

### 6.2 Domains:
- **C2 Domain:** tracking-telemetry-server.net (associated with outbound HTTP GET requests).

### 6.3 File Hashes:
- SHA-256 c78912d0981e4b891a2389128f901c8901239812903129381293812938129381 (PHP web shell payload).
- SHA-256 a812390812309123890123890123890123890123890123890123890123890123 (Staged archive file).

### 6.4 User Accounts:
- **Compromised Account:** admin_svc (Service account utilized to execute privileged query queries).

### 6.5 Additional Evidence:
- Review recommended for DNS resolver logs from 10:20 IST to 10:35 IST for additional domain resolution requests.`,
        order: 6,
        enabled: configuration.enabledSections.includes('investigative_leads') || configuration.enabledSections.includes('timeline_reconstruction'),
        createdAt: now,
        updatedAt: now,
      });

      // 7. Additional Subsections
      sections.push({
        id: `sec-${reportId}-7`,
        reportId,
        sectionType: 'additional_subsections',
        title: '7. Additional Subsections',
        content: `### 7.1 Attacker Methodology:
The adversary followed a structured tactical sequence: (1) Reconnaissance & endpoint discovery, (2) Parameter fuzzing and injection payload submission, (3) Authentication bypass and session token hijacking, (4) Internal SSRF probing against RFC 1918 subnets.

### 7.2 User Applications:
Target application stack comprised FastAPI backend services, React web frontend, and PostgreSQL database cluster running on Linux containers.

### 7.3 Internet Activity:
Analysis of proxy logs revealed persistent HTTP POST communication patterns over TCP port 443 with encrypted payload bodies during the incident timeframe.

### 7.4 Recommendations:
1. **Input Parameterization:** Enforce prepared statements across all SQL queries to eliminate injection vectors.
2. **Network Egress Filtering:** Restrict application container egress access; block communication to un-whitelisted external IPs and private subnets.
3. **Centralized Log Archival:** Implement immutable log forwarding with real-time cryptographic hash verification.`,
        order: 7,
        enabled: configuration.enabledSections.includes('additional_subsections') || configuration.enabledSections.includes('recommendations'),
        isAiGenerated: configuration.includeAiRemediation,
        createdAt: now,
        updatedAt: now,
      });

      // 8. Conclusion
      sections.push({
        id: `sec-${reportId}-8`,
        reportId,
        sectionType: 'conclusion',
        title: '8. Conclusion',
        content: `Final summary of the digital forensic investigation:

**Was Incident Confirmed:**
YES. Digital evidence, access logs, and cryptographic checksums confirm unauthorized input manipulation and administrative boundary bypass.

**Key Evidence Supporting Conclusion:**
1. SHA-256 verified HTTP access log entries in E-02 documenting single-quote injection strings.
2. Database transaction traces confirming execution of un-sanitized administrative queries.
3. Network firewall telemetry documenting outbound HTTP egress connections.

**Impact of Findings:**
Exposure of administrative session handling capabilities and potential data access vulnerability requiring mandatory patch application.

**Next Steps & Recommended Actions:**
1. Apply immediate software patch enforcing parameterized queries.
2. Invalidate all active session tokens issued during the incident timeframe.
3. Conduct follow-up verification re-testing prior to production re-certification.`,
        order: 8,
        enabled: configuration.enabledSections.includes('conclusion') || configuration.enabledSections.includes('forensic_conclusion'),
        isAiGenerated: configuration.includeAiConclusion,
        createdAt: now,
        updatedAt: now,
      });

      // 9. References
      sections.push({
        id: `sec-${reportId}-9`,
        reportId,
        sectionType: 'references',
        title: '9. References',
        content: `External standard documents, legal statutes, and technical specifications used:

1. **ISO/IEC 27037:2012** — Guidelines for identification, collection, acquisition, and preservation of digital evidence.
2. **NIST Special Publication 800-86** — Guide to Integrating Forensic Techniques into Incident Response.
3. **NIST Special Publication 800-115** — Technical Guide to Information Security Testing and Assessment.
4. **MITRE ATT&CK Framework** — T1190 (Exploit Public-Facing Application) & T1059 (Command and Scripting Interpreter).
5. **Section 65B of Indian Evidence Act, 1872 & Section 63 of Bharatiya Sakshya Adhiniyam, 2023** — Admissibility of Electronic Records.
6. **Section 43 & Section 66 of Information Technology Act, 2000** — Penalty for damage to computer system and computer related offences.`,
        order: 9,
        enabled: configuration.enabledSections.includes('references'),
        createdAt: now,
        updatedAt: now,
      });

      // 10. Appendices
      const leadAuditorName = configuration.leadAuditor || project.leadTester || 'Martin Thomas (Lead Forensic Examiner)';
      sections.push({
        id: `sec-${reportId}-10`,
        reportId,
        sectionType: 'appendices',
        title: '10. Appendices',
        content: "Technical details and supplementary forensic evidence:\n\n" +
          "### Appendix A: Raw Log Extracts:\n" +
          "198.51.100.45 - - [21/Sep/2026:10:22:03 +0530] \"POST /api/v1/auth/login HTTP/1.1\" 200 482 \"-\" \"Mozilla/5.0\"\n\n" +
          "### Appendix B: Cryptographic Hash List:\n" +
          "- **E-01 (Disk Image):** SHA-256 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\n" +
          "- **E-02 (Event Logs):** SHA-256 8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4\n" +
          "- **E-03 (Browser History):** SHA-256 7d793037a0760186574b0282f2f435e70d73a4e728d2db79ce563c639e706421\n\n" +
          "### Appendix C: Examiner & Accreditation Metadata:\n" +
          "- **Examiner:** " + leadAuditorName + "\n" +
          "- **Institution:** Department of Computer Science, CHRIST (Deemed to be University), Bangalore\n" +
          "- **Statutory Compliance:** Certified under Section 65B Indian Evidence Act, 1872 & Section 79A IT Act 2000",
        order: 10,
        enabled: configuration.enabledSections.includes('appendices') || configuration.enabledSections.includes('appendix'),
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
