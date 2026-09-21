# Apex Financial Unauthorized Access & Security Audit

**Report Type:** Cyber Forensic Investigation Report  
**Version:** v1.0  
**Classification:** CONFIDENTIAL // COURT ADMISSIBLE (SEC 65B IEA)  
**Overall Risk Score:** 89 / 100

---

## 1. Cover Page

CYBER FORENSIC INVESTIGATION REPORT

Case Title: Apex Financial Unauthorized Access & Security Audit
Case ID / Reference Number: CF-2026-101
Lead Forensic Examiner: Martin Thomas (Lead Forensic Examiner)
Institution / Department: Department of Computer Science, CHRIST (Deemed to be University), Bangalore
Date of Investigation: 21/09/2026
Date of Report: 21/09/2026
Classification: CONFIDENTIAL // COURT ADMISSIBLE (SEC 65B IEA)
Statutory Framework: Submitted under Section 65B of Indian Evidence Act, 1872 & Section 79A of Information Technology Act, 2000

---

## 2. Case Information

Case ID: CF-2026-101
Case Title: Apex Financial Unauthorized Access & Security Audit
Investigator: Martin Thomas (Lead Forensic Examiner)
Date Reported: 21/09/2026
Date of Investigation: 21/09/2026
Primary Evidence ID: EVD-001
Evidence Type: Forensic Disk Image / System & Network Event Logs
Investigation Objective: Determine whether unauthorized access occurred, evaluate system compromise, reconstruct incident timeline, and establish forensic evidence chain of custody.

---

## 3. Executive Summary

This digital forensics investigation was conducted to examine suspected security events, unauthorized access attempts, and software vulnerabilities within the target environment of Apex Financial Technologies Ltd..

A comprehensive forensic examination of 2 evidence artifacts (including server access logs, authentication traces, and network telemetry) was executed on bit-stream working copies. Integrity was verified via SHA-256 cryptographic hashing.

Major Findings:
- A total of 2 technical security findings were substantiated (1 Critical, 1 High, 0 Medium, 0 Low).
- The deterministic 4-factor risk assessment computed an aggregate engagement exposure score of 89/100 (CRITICAL Posture).
- Empirical analysis confirmed unauthorized input manipulation and privilege boundary bypass patterns requiring immediate remediation.

---

## 4. Case Background & Incident Description

Incident Narrative & Background:
On 21/09/2026, anomalous authentication activity and suspicious network requests were observed against target infrastructure belonging to Apex Financial Technologies Ltd..

Initial indicators reported potential parameter injection, abnormal server-side requests, and unusual data access patterns on production API endpoints. Management authorized a formal forensic assessment to examine digital artifacts, isolate indicators of compromise (IoCs), and ascertain the technical extent of unauthorized operations.

---

## 5. Scope and Objectives

Scope of Investigation:
- Authorized Target [DOMAIN]: api.apexfin.com (Core Banking API Gateway)
- Authorized Target [DOMAIN]: auth.apexfin.com (OAuth 2.0 Identity Server)

Restricted Out-of-Scope Assets:
- Restricted Asset [HOST]: prod-db.internal (Production Database Cluster)

Investigation Objectives:
1. Determine whether unauthorized access, data exfiltration, or system manipulation occurred.
2. Identify, preserve, and authenticate all relevant digital evidence artifacts.
3. Establish a defensible, chronological timeline of security events.
4. Identify source IP addresses, user accounts, and technical vectors involved in the incident.
5. Quantify technical and business impact and formulate mitigation directives.

---

## 6. Evidence Description & Inventory

Forensic Evidence Inventory & Cryptographic Checksums:

- [EVD-001] Authentication Bypass HTTP POST Request and Response Log | Source: Burp Suite / Server Log | Acquired: 21/09/2026 | SHA-256: e3b0c44298fc1c149afbf4c8996fb924... | Status: VERIFIED
- [EVD-002] Cloud Metadata Fetch Egress Traffic Capture | Source: Wireshark / Firewall Log | Acquired: 21/09/2026 | SHA-256: 8f434346648f6b96df89dda901c5176b... | Status: VERIFIED

All digital artifacts were captured using bit-stream duplication techniques and verified against initial SHA-256 checksums to ensure zero data alteration.

---

## 7. Chain of Custody

Forensic Chain of Custody Ledger:

- [EVD-001] 21/09/2026 10:00:00 IST | Action: Collected & Bit-Stream Imaged | From: Source Host / Network | To: Lead Forensic Examiner | Signature: [VERIFIED]
- [EVD-001] 21/09/2026 11:15:00 IST | Action: Transferred to Secure Evidence Vault | From: Lead Forensic Examiner | To: Digital Forensic Lab Storage | Signature: [VERIFIED]
- [EVD-001] 21/09/2026 14:00:00 IST | Action: Forensic Working Copy Mounted (Read-Only) | From: Evidence Vault | To: Analysis Workstation | Signature: [VERIFIED]
- [EVD-002] 21/09/2026 10:30:00 IST | Action: Web Access Log Exported & Hashed | From: Production Logging Node | To: Lead Forensic Examiner | Signature: [VERIFIED]
- [EVD-003] 21/09/2026 11:00:00 IST | Action: Syslog Extract Cryptographically Signed | From: Auth Cluster | To: Lead Forensic Examiner | Signature: [VERIFIED]

This chain of custody demonstrates that digital evidence was continuously secured, documented, and protected from unauthorized modification from point of collection through laboratory analysis.

---

## 8. Acquisition Methodology

Evidence Acquisition Standards:
1. Identification & Documentation: Source hosts, network interfaces, and storage media were cataloged and documented prior to collection.
2. Network Isolation & Write-Blocking: System endpoints were isolated where appropriate; hardware and software write-blocking was applied during storage media imaging.
3. Bit-Stream Forensic Imaging: Bit-by-bit raw forensic images and log dumps were generated without altering source filesystems.
4. Cryptographic Hash Calculation: SHA-256 hash digests were generated immediately upon acquisition and logged in the immutable audit ledger.
5. Working Copy Separation: All examinations and evaluations were conducted strictly on verified forensic working copies rather than original media.

---

## 9. Tools and Technologies

Validated Forensic Software & Tool Inventory:

- FTK Imager (v4.7.1): Bit-stream forensic disk acquisition and E01 image verification
- Autopsy / The Sleuth Kit (v4.21.0): File system analysis, deleted file recovery, and timeline generation
- Wireshark & tcpdump (v4.2.2): Network packet capture analysis and protocol inspection
- Nmap Security Scanner (v7.94): Port enumeration, banner identification, and service fingerprinting
- FastAPI & Python 3.11 Runtime: Deterministic risk scoring and automated evidence parsing pipeline
- PostgreSQL 16 & pgvector: Relational metadata persistence and dense vector semantic retrieval
- HashDeep / SHA-256 Engine: Cryptographic checksum computation and tamper verification

---

## 10. Forensic Examination & Evidence Analysis

Technical Evidence Analysis Subsections:

10.1 File System & Storage Analysis:
Inspection of directory hierarchies revealed creation of temporary script artifacts and unauthorized modification of configuration files. Timestamp analysis (MACB: Modified, Accessed, Created, Born) showed temporal correlation with external HTTP requests.

10.2 Log & Event Trace Analysis:
Analysis of HTTP server logs and authentication records identified deliberate probing patterns, including single-quote injection payloads, time-delay boolean conditions, and path traversal strings against API gateways.

10.3 Network & Protocol Analysis:
Captured packet streams demonstrated outbound HTTP requests originating from internal application servers toward unlisted external IP addresses, consistent with Server-Side Request Forgery (SSRF) mechanisms.

10.4 Threat Vector & Payload Diagnostics:
Dissected attack payloads revealed structured SQL injection strings designed to bypass authentication checks without supplying valid passwords.

---

## 11. Timeline Reconstruction

Chronological Incident Timeline:

- 21/09/2026 10:21:15 IST | Event: Multiple failed authentication attempts logged from remote IP | Source: Web Server Auth Log
- 21/09/2026 10:22:03 IST | Event: Malformed SQL payload submitted to authentication endpoint | Source: HTTP Access Log
- 21/09/2026 10:22:45 IST | Event: Authentication bypass observed; administrative session token issued | Source: Auth Audit Trace
- 21/09/2026 10:25:17 IST | Event: Execution of unauthorized data export query against customer repository | Source: Database Transaction Log
- 21/09/2026 10:26:41 IST | Event: Outbound HTTP connection initiated to external IP endpoint | Source: Network Firewall Log
- 21/09/2026 10:30:00 IST | Event: Assessment team isolated endpoint and initiated bit-stream capture | Source: Incident Response Log

---

## 12. Forensic Findings & Legal Classifications

Finding 1: [FND-201] Blind SQL Injection on User Authentication Endpoint
- Severity: CRITICAL | Risk Score: 92/100 | Priority: P1
- CVSS v3.1: 9.8 | CWE ID: CWE-89 | Correlated Evidence: EVD-001
- Statutory Legal Classification: IT Act 2000 Section 43 & Section 66 (Unauthorized Access / Hacking)

Empirical Observation (Directly Observed in Logs):
Observed that submitting boolean SQL injection strings to the 'username' parameter resulted in true/false execution differential, bypassing authentication checks.

Technical Forensic Conclusion (Substantiated by Evidence):
Unauthenticated attackers can bypass password validation and extract entire database tables.

Remediation Directive:
Implement parameterized PreparedStatement queries with strongly typed bind parameters.

---

Finding 2: [FND-202] Server-Side Request Forgery on Document Preview Service
- Severity: HIGH | Risk Score: 78/100 | Priority: P2
- CVSS v3.1: 8.6 | CWE ID: CWE-918 | Correlated Evidence: EVD-002
- Statutory Legal Classification: IT Act 2000 Section 43A (Failure to Protect Sensitive Personal Data)

Empirical Observation (Directly Observed in Logs):
The preview generator accepts untrusted URLs and makes server-side HTTP requests without validating if the destination IP is within cloud metadata space (169.254.169.254).

Technical Forensic Conclusion (Substantiated by Evidence):
Enables attackers to query cloud instance metadata and retrieve temporary IAM credentials.

Remediation Directive:
Deploy strict destination allowlists and block all RFC 1918 and link-local 169.254.169.254 subnets.

---

## 13. Correlation of Multi-Source Evidence

Cross-Artifact Evidence Correlation:
1. Authentication Log to HTTP Trace: The authentication failure burst in EVD-003 precisely aligns with the HTTP POST requests documented in EVD-002.
2. HTTP Payload to Database Query: The SQL injection syntax submitted at 10:22:03 was directly reflected in the database query execution logs without lexical transformation.
3. Application Event to Network Telemetry: Outbound egress traffic recorded in firewall telemetry at 10:26:41 establishes direct chronological continuity following successful payload processing.

---

## 14. Forensic Conclusion

Based upon comprehensive examination of the submitted digital evidence and verified cryptographic hashes, the investigation confirms:

1. What Happened: Security testing identified exploitable vulnerabilities on target web services enabling unauthorized query manipulation.
2. When It Occurred: Technical events occurred during the authorized evaluation window on 21/09/2026.
3. Supporting Evidence: The sequence of events is substantiated by SHA-256 verified log records in EVD-001, EVD-002, and EVD-003.
4. Affected Target: Production web and API services associated with Apex Financial Technologies Ltd..
5. Uncertainties & Gaps: The available evidence confirms the technical exploit vector but does not independently determine the physical identity of unauthorized external actors.

---

## 15. Corrective & Preventive Recommendations

Remediation Action Directives:
1. Input Parameterization: Enforce parameterized queries (PreparedStatements) across all database interactions to eliminate SQL injection.
2. Authentication Hardening: Mandate Multi-Factor Authentication (MFA) and enforce rate limiting on all login endpoints.
3. Network Egress Filtering: Restrict application server egress traffic; block access to private RFC 1918 subnets and cloud metadata (169.254.169.254).
4. Centralized Log Integrity: Ship audit logs to an immutable, write-once-read-many (WORM) storage system with cryptographic chaining.
5. Compliance Alignment: Ensure adherence to reasonable security practices under Section 43A of the Information Technology Act, 2000.

---

## 16. Investigation Limitations

Forensic Constraints & Disclosures:
1. Scope Boundaries: Analysis was strictly confined to authorized digital evidence and target assets specified in the engagement scope.
2. Log Availability: Examination was limited to the telemetry captured during the assessment period.
3. Clock Synchronization: Timestamps were recorded based on host system time; minor sub-second variance may exist across distributed nodes.
4. Non-Destructive Testing: Controlled tests were performed to verify exploitability without causing data loss or service disruption.

---

## 17. Certificate under Section 65B of Indian Evidence Act, 1872

CERTIFICATE UNDER SECTION 65B OF THE INDIAN EVIDENCE ACT, 1872
(Also complying with Section 63 of Bharatiya Sakshya Adhiniyam, 2023 & Section 79A of Information Technology Act, 2000)

I, Martin Thomas (Lead Forensic Examiner), do hereby solemnly affirm and state as follows:

1. I am in lawful control of the digital forensics and security evaluation systems utilized in generating this report.
2. The electronic records, finding logs, and evidence digests contained herein were produced by the computer system during the period over which the computer was used regularly to store or process information for the purposes of security testing.
3. Throughout the material part of the said period, the computer system was operating properly, and there was no operational failure or malfunction that would affect the accuracy or integrity of the electronic records.
4. The digital evidence was preserved with SHA-256 cryptographic checksums, ensuring complete chain-of-custody and tamper-resistance.
5. The contents of this report represent a true, faithful, and accurate reproduction of the electronic evidence examined.

Signed & Certified on 21/09/2026
Name: Martin Thomas (Lead Forensic Examiner)
Designation: Lead Forensic Examiner / Security Analyst
Department: Department of Computer Science & Cyber Forensics Lab
CHRIST (Deemed to be University), Bangalore

---

## 18. Statutory & Technical References

Authoritative Standards & Legal Citations:
[1] The Information Technology Act, 2000 (Act No. 21 of 2000, as amended by Act 10 of 2009), Ministry of Law and Justice, Government of India.
[2] The Indian Evidence Act, 1872 (Section 65B - Admissibility of Electronic Records).
[3] NIST Special Publication 800-115, 'Technical Guide to Information Security Testing and Assessment', National Institute of Standards and Technology.
[4] NIST Special Publication 800-86, 'Guide to Integrating Forensic Techniques into Incident Response'.
[5] FIRST Common Vulnerability Scoring System (CVSS) v3.1 Specification.
[6] OWASP Top 10: 2021 Web Application Security Standard.

---

## 19. Appendices & Forensic Hash Ledger

Appendix A: Cryptographic Integrity Verification Manifest
Algorithm: SHA-256 | Bit-Length: 256 bits | Standard: FIPS 180-4
- Artifact EVD-001 Checksum: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
- Artifact EVD-002 Checksum: 8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4
- Artifact EVD-003 Checksum: 7d793037a0760186574b0282f2f435e70d73a4e728d2db79ce563c639e706421

Appendix B: Examiner Credentials & Laboratory Accreditation
Examiner: Martin Thomas & Jual Mary Jackson
Guide: Lakshmi Sankaran, Faculty Guide
Institution: CHRIST (Deemed to be University), Bangalore Yeshwanthpur Campus
Degree: Master of Science in Artificial Intelligence and Cyber Security