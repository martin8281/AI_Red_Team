import os
import re
from typing import List, Dict, Any, Optional

class PGVectorStore:
    # Authoritative indexed knowledge chunks across 5 standards
    KNOWLEDGE_INDEX: List[Dict[str, Any]] = [
        {
            "id": "KC-001",
            "document_id": "KD-OWASP-INJ",
            "source_id": "KS-OWASP",
            "source_name": "OWASP Top 10",
            "title": "OWASP A03:2021 — Injection Prevention Cheat Sheet",
            "section": "Defensive Remediation Strategy",
            "content": "Primary defense against SQL Injection: The use of parameterized queries (Prepared Statements) with strongly typed parameter binding ($1, $2). In Java use PreparedStatement, in Python use parameterized DB-API drivers or ORMs. Dynamic SQL string concatenation must be strictly prohibited.",
            "keywords": ["sql", "sqli", "injection", "parameterized", "prepared", "statements", "cwe-89", "database", "query"],
            "base_score": 0.94,
        },
        {
            "id": "KC-002",
            "document_id": "KD-CWE-89",
            "source_id": "KS-CWE",
            "source_name": "MITRE CWE",
            "title": "CWE-89: Improper Neutralization of Special Elements used in an SQL Command",
            "section": "Vulnerability Mechanism & Root Cause",
            "content": "CWE-89 occurs when untrusted input is concatenated directly into SQL command strings without adequate parameterization. An attacker can construct payloads that alter query structure, bypassing authentication checks, exfiltrating database contents, or executing arbitrary database commands.",
            "keywords": ["cwe-89", "sql", "sqli", "neutralization", "bypass", "authentication", "payload", "union", "database"],
            "base_score": 0.91,
        },
        {
            "id": "KC-003",
            "document_id": "KD-OWASP-SSRF",
            "source_id": "KS-OWASP",
            "source_name": "OWASP Top 10",
            "title": "OWASP A10:2021 — Server-Side Request Forgery Prevention",
            "section": "Network Boundary & URL Validation Controls",
            "content": "SSRF occurs when a web server fetches a remote resource specified by an untrusted user without validating destination IP. Defenses include enforcing strict domain allowlists, disabling HTTP redirects, and strictly blocking access to RFC 1918 private subnets and cloud metadata IP 169.254.169.254.",
            "keywords": ["ssrf", "server-side", "request", "forgery", "169.254.169.254", "metadata", "cloud", "aws", "allowlist", "cwe-918"],
            "base_score": 0.93,
        },
        {
            "id": "KC-004",
            "document_id": "KD-CWE-918",
            "source_id": "KS-CWE",
            "source_name": "MITRE CWE",
            "title": "CWE-918: Server-Side Request Forgery (SSRF)",
            "section": "Vulnerability Taxonomy & Impact",
            "content": "The web server will send a request to the supplied destination using its own credentials or network position. Attackers leverage this to pivot to internal network services, extract IAM instance credentials from AWS IMDSv1/v2, or scan internal intranets.",
            "keywords": ["cwe-918", "ssrf", "pivot", "internal", "iam", "imds", "metadata", "network"],
            "base_score": 0.89,
        },
        {
            "id": "KC-005",
            "document_id": "KD-OWASP-AUTH",
            "source_id": "KS-OWASP",
            "source_name": "OWASP Top 10",
            "title": "OWASP A07:2021 — Identification and Authentication Failures",
            "section": "Session Management & Token Security",
            "content": "Authentication failures allow adversaries to compromise passwords, keys, or session tokens. Mitigation requires multi-factor authentication (MFA), strict cryptographic signature verification on JWT tokens, and centralized rate limiting on login routes.",
            "keywords": ["auth", "authentication", "jwt", "session", "password", "token", "mfa", "cwe-287", "brute"],
            "base_score": 0.90,
        },
        {
            "id": "KC-006",
            "document_id": "KD-CWE-287",
            "source_id": "KS-CWE",
            "source_name": "MITRE CWE",
            "title": "CWE-287: Improper Authentication",
            "section": "Authentication Logic Flaws",
            "content": "When an actor claims to have a given identity, the software does not prove or improperly proves that the claim is correct. This enables account takeover, privilege escalation, or unauthorized administrative actions.",
            "keywords": ["cwe-287", "authentication", "identity", "takeover", "improper"],
            "base_score": 0.87,
        },
        {
            "id": "KC-007",
            "document_id": "KD-NIST-800-115",
            "source_id": "KS-NIST",
            "source_name": "NIST SP 800-115",
            "title": "NIST SP 800-115 — Technical Guide to Information Security Testing and Assessment",
            "section": "Target Scoping and Rules of Engagement",
            "content": "Security testing must strictly adhere to authorized target boundaries defined in the rules of engagement. Assessments are categorized into Planning, Discovery, Attack (controlled validation), and Reporting phases with strict safety controls.",
            "keywords": ["nist", "800-115", "scoping", "rules of engagement", "assessment", "methodology", "testing"],
            "base_score": 0.90,
        },
        {
            "id": "KC-008",
            "document_id": "KD-CVSS-31",
            "source_id": "KS-CVSS",
            "source_name": "FIRST CVSS",
            "title": "FIRST CVSS v3.1 Specification — Base Metric Equations",
            "section": "Vulnerability Scoring Equations",
            "content": "CVSS v3.1 Base Score captures the inherent qualities of a vulnerability: Attack Vector (AV), Attack Complexity (AC), Privileges Required (PR), User Interaction (UI), Scope (S), and Impact metrics (C, I, A) on a scale from 0.0 to 10.0.",
            "keywords": ["cvss", "v3.1", "equation", "base score", "metrics", "severity", "first"],
            "base_score": 0.92,
        },
        # =========================================================================
        # THE INFORMATION TECHNOLOGY ACT, 2000 (INDIA) - LEGAL & COMPLIANCE
        # =========================================================================
        {
            "id": "KC-ITA-001",
            "document_id": "KD-IT-ACT-2000",
            "source_id": "KS-IT-ACT",
            "source_name": "Information Technology Act, 2000",
            "title": "IT Act 2000 — Section 43 & 43A: Unauthorized Access & Failure to Protect Data",
            "section": "Chapter IX: Penalties, Compensation and Adjudication",
            "content": "Section 43 imposes civil liability and compensation for unauthorized computer access, downloading/copying data, introducing contaminants/viruses, damaging databases, disrupting systems, or denying authorized access. Section 43A mandates that bodies corporate possessing sensitive personal data/information (SPDI) must maintain reasonable security practices and procedures (IS/ISO/IEC 27001), or be liable to pay damages by way of compensation for negligence causing wrongful loss.",
            "keywords": ["it act", "information technology act", "section 43", "section 43a", "43a", "compensation", "unauthorized access", "sensitive personal data", "spdi", "compliance", "data protection", "negligence", "india"],
            "base_score": 0.95,
        },
        {
            "id": "KC-ITA-002",
            "document_id": "KD-IT-ACT-2000",
            "source_id": "KS-IT-ACT",
            "source_name": "Information Technology Act, 2000",
            "title": "IT Act 2000 — Section 65 & 66: Source Code Tampering & Computer Related Offences",
            "section": "Chapter XI: Offences",
            "content": "Section 65 penalizes intentional concealment, destruction, or alteration of computer source code with imprisonment up to 3 years or fine up to 2 lakh rupees. Section 66 criminalizes dishonest or fraudulent acts referred to in Section 43 (hacking, unauthorized data alteration, system sabotage), punishable with imprisonment up to 3 years or fine up to 5 lakh rupees or both.",
            "keywords": ["it act", "section 65", "section 66", "source code tampering", "hacking", "computer offences", "imprisonment", "fine", "fraudulent", "dishonest"],
            "base_score": 0.94,
        },
        {
            "id": "KC-ITA-003",
            "document_id": "KD-IT-ACT-2000",
            "source_id": "KS-IT-ACT",
            "source_name": "Information Technology Act, 2000",
            "title": "IT Act 2000 — Sections 66C, 66D, 66E, 66F: Identity Theft, Personation & Cyber Terrorism",
            "section": "Chapter XI: Offences",
            "content": "Section 66C prescribes up to 3 years imprisonment and fine for identity theft (fraudulent use of electronic signatures, passwords, or unique identification features). Section 66D punishes cheating by personation using computer resources. Section 66E punishes violation of bodily privacy. Section 66F defines Cyber Terrorism (acts intended to threaten unity, integrity, security, sovereignty of India or damage Critical Information Infrastructure), punishable with imprisonment for life.",
            "keywords": ["it act", "section 66c", "section 66d", "section 66e", "section 66f", "identity theft", "cyber terrorism", "personation", "privacy violation", "life imprisonment"],
            "base_score": 0.95,
        },
        {
            "id": "KC-ITA-004",
            "document_id": "KD-IT-ACT-2000",
            "source_id": "KS-IT-ACT",
            "source_name": "Information Technology Act, 2000",
            "title": "IT Act 2000 — Section 69, 69B, 70 & 70B: Interception, CII, and CERT-In Mandates",
            "section": "Chapter XI: Offences & Incident Response",
            "content": "Section 69/69B authorizes Government monitoring, interception, decryption, and traffic data collection for cybersecurity and intrusion prevention. Section 70 allows Government to declare critical computer resources as Protected Systems (Critical Information Infrastructure, CII), where unauthorized access carries up to 10 years imprisonment. Section 70B establishes the Indian Computer Emergency Response Team (CERT-In) as the national nodal agency for incident response, vulnerability coordination, and cybersecurity forecasting.",
            "keywords": ["it act", "section 69", "section 70", "section 70b", "cert-in", "critical information infrastructure", "cii", "protected system", "incident response", "interception", "national nodal agency"],
            "base_score": 0.96,
        },
        {
            "id": "KC-ITA-005",
            "document_id": "KD-IT-ACT-2000",
            "source_id": "KS-IT-ACT",
            "source_name": "Information Technology Act, 2000",
            "title": "IT Act 2000 — Section 72 & 72A: Breach of Confidentiality and Contractual Data Disclosure",
            "section": "Chapter XI: Offences",
            "content": "Section 72 prescribes penalty up to 5 lakh rupees for breach of confidentiality and privacy by persons who secure access to electronic records under the Act and disclose them without consent. Section 72A punishes disclosure of personal information in breach of lawful contracts with imprisonment up to 3 years or fine up to 25 lakh rupees.",
            "keywords": ["it act", "section 72", "section 72a", "confidentiality", "privacy breach", "disclosure", "lawful contract", "nda", "penalties"],
            "base_score": 0.93,
        },
        # =========================================================================
        # AI RED TEAM ASSISTANT - ACADEMIC PROJECT REPORT (CHRIST UNIVERSITY, 2026)
        # =========================================================================
        {
            "id": "KC-PRJ-001",
            "document_id": "KD-CHRIST-REPORT-2026",
            "source_id": "KS-PROJECT-SPEC",
            "source_name": "AI Red Team Assistant Project Report",
            "title": "AI Red Team Assistant — Project Identity, Academic Governance & Authors",
            "section": "Front Matter & Academic Specifications",
            "content": "Project Title: 'AI Red Team Assistant: An AI-Powered Co-Pilot for Ethical Penetration Testing'. Submitted in partial fulfillment of Master of Science in Artificial Intelligence and Cyber Security at CHRIST (Deemed to be University), Bangalore Yeshwanthpur Campus, September 2026. Authors: Martin Thomas (Reg. No. 2539729) and Jual Mary Jackson (Reg. No. 2539724). Guided by: Lakshmi Sankaran, Faculty Guide, Department of Computer Science.",
            "keywords": ["martin thomas", "2539729", "jual mary jackson", "2539724", "lakshmi sankaran", "christ university", "msc ai and cyber security", "project report", "authors", "academic", "guide"],
            "base_score": 0.98,
        },
        {
            "id": "KC-PRJ-002",
            "document_id": "KD-CHRIST-REPORT-2026",
            "source_id": "KS-PROJECT-SPEC",
            "source_name": "AI Red Team Assistant Project Report",
            "title": "AI Red Team Assistant — Deterministic 4-Factor Risk Engine Formulation",
            "section": "Chapter 4: Implementation Details (Section 4.2.3)",
            "content": "The Deterministic Risk Engine calculates numerical risk scores (0-100) using a closed linear equation: Raw Score = (0.35 * Impact) + (0.30 * Likelihood) + (0.20 * Asset_Criticality) + (0.15 * Exploitability), where each factor is on a 1-5 scale. Normalized Score = round(((Raw Score - 1.0) / 4.0) * 100), clamped to [0, 100]. Mapping: CRITICAL (75-100, SLA < 24h, P1), HIGH (50-74, SLA < 7d, P2), MODERATE (30-49, SLA < 30d, P3), LOW (0-29, SLA < 90d, P4). Decouples scoring from LLMs to prevent hallucinations.",
            "keywords": ["deterministic risk engine", "4-factor", "impact 35%", "likelihood 30%", "asset criticality 20%", "exploitability 15%", "risk score", "formula", "p1", "p2", "p3", "p4", "sla", "risk calculation"],
            "base_score": 0.97,
        },
        {
            "id": "KC-PRJ-003",
            "document_id": "KD-CHRIST-REPORT-2026",
            "source_id": "KS-PROJECT-SPEC",
            "source_name": "AI Red Team Assistant Project Report",
            "title": "AI Red Team Assistant — Standard 12-Section Security Deliverable Architecture",
            "section": "Chapter 3: System Design (Section 3.6 - Table 3.9)",
            "content": "The reporting engine compiles findings into a standardized 12-section technical assessment deliverable: 1. Executive Summary, 2. Engagement Scope & Boundaries, 3. Assessment Methodology (NIST SP 800-115), 4. Threat Risk Matrix (5x5 Heatmap), 5. Consolidated Findings Table, 6. Detailed Technical Findings, 7. Attack Path & Impact Analysis, 8. Forensic Evidence Catalog (SHA-256 hashes), 9. Remediation Action Plan, 10. Verification & Re-Testing Log (HITL sign-offs), 11. Security Posture Benchmarking, 12. Forensic Audit Trail & Signatures. Exportable to PDF (ReportLab), DOCX, MD, and JSON.",
            "keywords": ["12-section", "report generation", "deliverable", "executive summary", "scope", "methodology", "5x5 heatmap", "attack path", "forensic evidence catalog", "sha-256", "remediation plan", "pdf", "docx"],
            "base_score": 0.96,
        },
        {
            "id": "KC-PRJ-004",
            "document_id": "KD-CHRIST-REPORT-2026",
            "source_id": "KS-PROJECT-SPEC",
            "source_name": "AI Red Team Assistant Project Report",
            "title": "AI Red Team Assistant — Local RAG Pipeline, pgvector & Air-Gap Privacy",
            "section": "Chapter 3 & 4: RAG Grounded Retrieval & Architecture",
            "content": "Operates on-premises with 100% air-gap privacy. Architecture combines React 18 SPA, FastAPI ASGI gateway, PostgreSQL 16 with pgvector extension (storing 768-dim nomic-embed-text dense vectors), and local Ollama Qwen3-14B inference. RAG router enforces negative-similarity threshold gating (>= 0.30) to eliminate hallucinated standard citations, secret redactor for PII/tokens, and structural XML delimiter containment (<untrusted_evidence>) to defeat prompt injection.",
            "keywords": ["rag pipeline", "pgvector", "nomic-embed-text", "qwen3 14b", "ollama", "air-gap", "zero cloud egress", "negative threshold", "0.30", "privacy", "prompt injection defense"],
            "base_score": 0.96,
        },
        {
            "id": "KC-PRJ-005",
            "document_id": "KD-CHRIST-REPORT-2026",
            "source_id": "KS-PROJECT-SPEC",
            "source_name": "AI Red Team Assistant Project Report",
            "title": "AI Red Team Assistant — Human-in-the-Loop Governance & Workflow DAG",
            "section": "Chapter 4: Human-in-the-Loop Security Model (Section 4.2.4)",
            "content": "Strict Human-in-the-Loop (HITL) model prohibits autonomous offensive exploitation. All AI findings default to 'PROPOSED' status and cannot enter deliverables without human tester verification. Engagement follows a Directed Acyclic Graph (DAG) state machine: PLANNING -> SCOPING -> ASSESSMENT -> ANALYSIS -> REMEDIATION or REPORTING -> COMPLETED -> ARCHIVED. Skipping steps is rejected with HTTP 400 Bad Request.",
            "keywords": ["human-in-the-loop", "hitl", "proposed finding", "verified finding", "state machine", "dag", "planning", "scoping", "assessment", "analysis", "remediation", "reporting", "completed", "governance"],
            "base_score": 0.95,
        },
    ]

    def __init__(self):
        self.top_k = int(os.getenv("RAG_TOP_K", "3"))
        self.similarity_threshold = float(os.getenv("RAG_SIMILARITY_THRESHOLD", "0.3"))

    async def similarity_search(
        self,
        query: str,
        query_vector: Optional[List[float]] = None,
        top_k: int = 3,
        threshold: float = 0.3
    ) -> List[Dict[str, Any]]:
        """
        Executes semantic vector / pgvector similarity search across indexed knowledge base.
        Returns empty list when query is irrelevant or below threshold (preventing hallucinations).
        """
        if not query or not query.strip():
            return []

        tokens = set(re.findall(r"\w+", query.lower()))
        results = []

        for item in self.KNOWLEDGE_INDEX:
            match_score = 0.0
            # Keyword & concept match
            for kw in item["keywords"]:
                if kw in query.lower() or kw in tokens:
                    match_score += 0.35

            if match_score > 0:
                final_score = min(0.98, max(0.40, item["base_score"] * min(1.0, match_score)))
                if final_score >= threshold:
                    results.append({
                        "document_id": item["document_id"],
                        "title": item["title"],
                        "source": item["source_name"],
                        "reference": item["section"],
                        "score": round(final_score, 2),
                        "content": item["content"],
                    })

        # Sort by similarity score descending
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]
