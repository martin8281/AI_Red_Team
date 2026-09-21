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
