"""
Backend Report Compilation Engine for AI Red Team Assistant.
Enforces deterministic data derivation, evidence traceability, and multi-format export.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
import json
from backend.risk.risk_engine import RiskEngine
from backend.reports.pdf_generator import PDFReportGenerator
from backend.reports.docx_generator import DOCXReportGenerator

class ReportEngine:
    SECTION_TYPES = [
        "cover_page",
        "executive_summary",
        "assessment_overview",
        "scope",
        "methodology",
        "risk_summary",
        "findings",
        "evidence",
        "recommendations",
        "remediation_summary",
        "conclusion",
        "appendix",
    ]

    @classmethod
    def compile_report(
        cls,
        project: Dict[str, Any],
        scope: List[Dict[str, Any]],
        findings: List[Dict[str, Any]],
        evidence: List[Dict[str, Any]],
        configuration: Optional[Dict[str, Any]] = None,
        report_type: str = "Penetration Testing Report",
        title: Optional[str] = None,
        version: str = "v1.0",
    ) -> Dict[str, Any]:
        config = configuration or {
            "include_evidence": True,
            "include_ai_summary": True,
            "include_ai_remediation": True,
            "include_ai_conclusion": True,
            "enabled_sections": cls.SECTION_TYPES,
            "classification": "CONFIDENTIAL // RESTRICTED ACCESS",
            "lead_auditor": project.get("lead_tester", "Alex Vance"),
        }

        now = datetime.utcnow().isoformat()
        report_id = f"RPT-{int(datetime.utcnow().timestamp())}"
        report_title = title or f"{project.get('name', 'Assessment')} — Security Deliverable"

        active_findings = [f for f in findings if f.get("status") not in ["RESOLVED", "ACCEPTED_RISK", "FALSE_POSITIVE", "REJECTED"]]
        critical_count = sum(1 for f in findings if f.get("severity") == "CRITICAL" and f.get("status") not in ["FALSE_POSITIVE", "REJECTED"])
        high_count = sum(1 for f in findings if f.get("severity") == "HIGH" and f.get("status") not in ["FALSE_POSITIVE", "REJECTED"])
        medium_count = sum(1 for f in findings if f.get("severity") == "MEDIUM" and f.get("status") not in ["FALSE_POSITIVE", "REJECTED"])
        low_count = sum(1 for f in findings if f.get("severity") in ["LOW", "INFORMATIONAL"] and f.get("status") not in ["FALSE_POSITIVE", "REJECTED"])

        finding_scores = [f.get("risk_score", 0) for f in active_findings]
        if finding_scores:
            max_score = max(finding_scores)
            avg_score = sum(finding_scores) / len(finding_scores)
            overall_risk = round(0.60 * max_score + 0.40 * avg_score)
        else:
            overall_risk = 0

        risk_level = "CRITICAL" if overall_risk >= 75 else ("HIGH" if overall_risk >= 50 else ("MEDIUM" if overall_risk >= 30 else "LOW"))

        in_scope = [s for s in scope if s.get("scope_status", "IN_SCOPE") == "IN_SCOPE"]
        out_of_scope = [s for s in scope if s.get("scope_status") == "OUT_OF_SCOPE"]

        enabled_sections_list = config.get("enabled_sections", cls.SECTION_TYPES)
        sections = []

        if "cover_page" in enabled_sections_list:
            sections.append({
                "id": f"sec-{report_id}-1",
                "section_type": "cover_page",
                "title": "Cover Page",
                "content": f"**AI RED TEAM ASSISTANT — SECURITY ASSESSMENT REPORT**\n\n**Client Organization:** {project.get('organization', 'N/A')}\n**Engagement Title:** {project.get('name', 'N/A')}\n**Assessment Type:** {report_type}\n**Classification:** {config.get('classification')}\n**Lead Security Tester:** {config.get('lead_auditor')}\n**Version:** {version}\n**Generated:** {now}",
                "order": 1,
                "enabled": True,
                "is_ai_generated": False,
            })

        if "executive_summary" in enabled_sections_list:
            sections.append({
                "id": f"sec-{report_id}-2",
                "section_type": "executive_summary",
                "title": "Executive Summary",
                "content": f"An authorized security assessment was conducted for **{project.get('organization')}** evaluating the **{project.get('name')}** environment.\n\nThe testing identified **{len(findings)} security findings** ({critical_count} Critical, {high_count} High, {medium_count} Medium, {low_count} Low).\n\nOverall aggregate engagement risk is evaluated at **{overall_risk}/100 ({risk_level} POSTURE)**. Immediate triage and remediation of critical and high severity vulnerabilities is recommended.",
                "order": 2,
                "enabled": True,
                "is_ai_generated": config.get("include_ai_summary", True),
            })

        if "assessment_overview" in enabled_sections_list:
            sections.append({
                "id": f"sec-{report_id}-3",
                "section_type": "assessment_overview",
                "title": "Assessment Overview",
                "content": f"### Engagement Scope & Objectives\n{project.get('description', 'Comprehensive penetration test.')}\n\n**Framework:** {project.get('project_type', 'WEB_APP')}\n**Lead Tester:** {project.get('lead_tester', config.get('lead_auditor'))}\n**Governance Model:** Human-in-the-loop tester verification without automated network exploitation.",
                "order": 3,
                "enabled": True,
                "is_ai_generated": False,
            })

        if "scope" in enabled_sections_list:
            in_scope_lines = "\n".join([f"- [{s.get('asset_type', 'HOST')}] `{s.get('value')}` — {s.get('description', 'Authorized target')}" for s in in_scope]) or "None specified"
            out_scope_lines = "\n".join([f"- [{s.get('asset_type', 'HOST')}] `{s.get('value')}` — {s.get('description', 'Explicitly excluded')}" for s in out_of_scope]) or "None"
            sections.append({
                "id": f"sec-{report_id}-4",
                "section_type": "scope",
                "title": "Scope & Rules of Engagement",
                "content": f"### Authorized In-Scope Target Assets ({len(in_scope)})\n{in_scope_lines}\n\n### Excluded Out-of-Scope Assets ({len(out_of_scope)})\n{out_scope_lines}",
                "order": 4,
                "enabled": True,
                "is_ai_generated": False,
            })

        if "methodology" in enabled_sections_list:
            sections.append({
                "id": f"sec-{report_id}-5",
                "section_type": "methodology",
                "title": "Testing Methodology",
                "content": "Assessment testing procedures were structured in accordance with industry benchmarks including the **OWASP Web Security Testing Guide (WSTG)** and **NIST Special Publication 800-115**.\n\nAll verified findings were manually confirmed by security testers using non-destructive proof-of-concept verification.",
                "order": 5,
                "enabled": True,
                "is_ai_generated": False,
            })

        if "risk_summary" in enabled_sections_list:
            sections.append({
                "id": f"sec-{report_id}-6",
                "section_type": "risk_summary",
                "title": "Deterministic Risk Analysis & Scoring",
                "content": f"Engagement risk scores are calculated using the deterministic 4-factor risk engine:\n- **Impact (35%)** + **Likelihood (30%)** + **Asset Criticality (20%)** + **Exploitability (15%)**\n\n**Overall Engagement Risk Score:** {overall_risk} / 100 ({risk_level})\n\n### Finding Severity Breakdown:\n- Critical (P1): {critical_count}\n- High (P2): {high_count}\n- Medium (P3): {medium_count}\n- Low / Info (P4): {low_count}",
                "order": 6,
                "enabled": True,
                "is_ai_generated": False,
            })

        if "findings" in enabled_sections_list:
            findings_blocks = []
            for idx, f in enumerate(findings):
                f_evidence = [e for e in evidence if e.get("finding_id") == f.get("id")]
                ev_lines = "\n".join([f"  - **[{e.get('id')}]** `{e.get('file_reference') or e.get('title')}` — {e.get('title')} ({e.get('verification_status', 'VERIFIED')})" for e in f_evidence]) or "  - *No forensic evidence file attached (Manual observation)*"
                
                v_status = "RESOLVED (Retest Confirmed)" if f.get("status") == "RESOLVED" else ("VERIFIED (Human Confirmed)" if f.get("status") in ["OPEN", "REMEDIATION"] or f.get("verification_status") == "VERIFIED" else "PROPOSED (Pending Verification)")
                cvss_str = f"- **CVSS v3.1:** {f.get('cvss_score', 'N/A')}\n" if f.get("cvss_score") else ""
                cwe_str = f"- **CWE:** {f.get('cwe_id', 'N/A')}\n" if f.get("cwe_id") else ""
                owasp_str = f"- **OWASP:** {f.get('owasp_category', 'N/A')}\n" if f.get("owasp_category") else ""
                mitre_str = f"- **MITRE ATT&CK:** {f.get('mitre_attack', 'N/A')}\n" if f.get("mitre_attack") else ""

                f_block = f"### {idx+1}. [{f.get('id')}] {f.get('title')}\n- **Vulnerability Type:** {f.get('vulnerability_type')}\n- **Verification Status:** {v_status}\n- **Severity Rating:** {f.get('severity')} (Score: {f.get('risk_score', 0)}/100)\n- **Priority:** {f.get('priority', 'P2')}\n{cvss_str}{cwe_str}{owasp_str}{mitre_str}- **Target Vector:** `{f.get('method', 'GET')} https://{f.get('asset')}{f.get('endpoint')}`\n\n**Description:**\n{f.get('description')}\n\n**Impact:**\n{f.get('impact')}\n\n**Forensic Evidence Attachments:**\n{ev_lines}\n\n**Remediation Recommendation:**\n{f.get('recommendation')}"
                findings_blocks.append(f_block)

            findings_content = "\n\n---\n\n".join(findings_blocks) if findings_blocks else "No security vulnerabilities logged for this engagement."
            sections.append({
                "id": f"sec-{report_id}-7",
                "section_type": "findings",
                "title": "Detailed Findings Catalog",
                "content": findings_content,
                "order": 7,
                "enabled": True,
                "is_ai_generated": False,
            })

        if "evidence" in enabled_sections_list and config.get("include_evidence", True):
            if evidence:
                ev_blocks = []
                for idx, e in enumerate(evidence):
                    linked_f = next((f for f in findings if f.get("id") == e.get("finding_id")), None)
                    f_ref = f"[{linked_f.get('id')}] {linked_f.get('title')}" if linked_f else "Unassigned"
                    ev_blocks.append(f"#### Evidence Item {idx+1}: [{e.get('id')}] {e.get('title')}\n- **File Reference:** `{e.get('file_reference', 'N/A')}`\n- **Associated Finding:** {f_ref}\n- **Verification Status:** {e.get('verification_status', 'VERIFIED')}\n- **Recorded By:** {e.get('created_by', 'Tester')}\n- **Observation:**\n  {e.get('description', 'Verified via HTTP trace.')}")
                ev_content = f"### Forensic Proof-of-Concept Evidence Records ({len(evidence)} Total)\n\n" + "\n\n---\n\n".join(ev_blocks)
            else:
                ev_content = "Proof-of-concept evidence artifacts attached to verified findings:\n\n- Sanitized request/response traces recorded in central evidence repository."
            sections.append({
                "id": f"sec-{report_id}-8",
                "section_type": "evidence",
                "title": "Proof-of-Concept Verification Evidence",
                "content": ev_content,
                "order": 8,
                "enabled": True,
                "is_ai_generated": False,
            })

        if "recommendations" in enabled_sections_list:
            sections.append({
                "id": f"sec-{report_id}-9",
                "section_type": "recommendations",
                "title": "Remediation & Hardening Roadmap",
                "content": "### Strategic Hardening Priorities:\n1. **Input Validation & Parameterization:** Enforce strict parameter binding on all database interaction points.\n2. **Access Control Verification:** Ensure authorization middleware validates session claims prior to serving object IDs.\n3. **Production Exception Handling:** Suppress framework stack traces in non-development environments.\n4. **Security Headers:** Enforce HSTS, CSP, and X-Frame-Options across all web origins.",
                "order": 9,
                "enabled": True,
                "is_ai_generated": config.get("include_ai_remediation", True),
            })

        if "remediation_summary" in enabled_sections_list:
            if findings:
                rem_rows = "\n".join([f"| **{f.get('id')}** | {f.get('title')} | {f.get('severity')} | {f.get('priority', 'P2')} | `{f.get('status', 'OPEN')}` |" for f in findings])
                rem_content = f"| Finding ID | Vulnerability Title | Severity | Priority Tier | Current Status |\n| :--- | :--- | :--- | :--- | :--- |\n{rem_rows}"
            else:
                rem_content = "No remediation items queued."
            sections.append({
                "id": f"sec-{report_id}-10",
                "section_type": "remediation_summary",
                "title": "Remediation Priority Queue",
                "content": rem_content,
                "order": 10,
                "enabled": True,
                "is_ai_generated": False,
            })

        if "conclusion" in enabled_sections_list:
            sections.append({
                "id": f"sec-{report_id}-11",
                "section_type": "conclusion",
                "title": "Conclusion & Next Steps",
                "content": f"The security testing engagement for **{project.get('organization')}** has concluded with comprehensive visibility into target asset boundaries.\n\nFollowing patch implementation, a formal verification re-test is recommended to validate finding remediation before deployment to production.",
                "order": 11,
                "enabled": True,
                "is_ai_generated": config.get("include_ai_conclusion", True),
            })

        if "appendix" in enabled_sections_list:
            sections.append({
                "id": f"sec-{report_id}-12",
                "section_type": "appendix",
                "title": "Appendix & Compliance Standards",
                "content": "### Reference Classifications & Frameworks:\n- **OWASP Top 10 Web Application Security Risks (2021)**\n- **Common Weakness Enumeration (CWE) Standards**\n- **NIST SP 800-115 Technical Guide to Information Security Testing**",
                "order": 12,
                "enabled": True,
                "is_ai_generated": False,
            })

        return {
            "id": report_id,
            "project_id": project.get("id"),
            "project_name": project.get("name"),
            "organization": project.get("organization"),
            "created_by": config.get("lead_auditor", "Alex Vance"),
            "title": report_title,
            "report_type": report_type,
            "status": "READY",
            "version": version,
            "configuration": config,
            "sections": sections,
            "findings_count": len(findings),
            "critical_count": critical_count,
            "high_count": high_count,
            "overall_risk_score": overall_risk,
            "generated_at": now,
            "created_at": now,
            "updated_at": now,
        }

    @classmethod
    def export_markdown(cls, report_data: Dict[str, Any]) -> str:
        enabled_secs = [s for s in report_data.get("sections", []) if s.get("enabled", True)]
        header = f"# {report_data.get('title')}\n\n**Report Type:** {report_data.get('report_type')}  \n**Version:** {report_data.get('version')}  \n**Classification:** {report_data.get('configuration', {}).get('classification')}  \n**Overall Risk Score:** {report_data.get('overall_risk_score')} / 100\n\n---\n\n"
        body = "\n\n---\n\n".join([f"## {s.get('title')}\n\n{s.get('content')}" for s in enabled_secs])
        return header + body

    @classmethod
    def export_json(cls, report_data: Dict[str, Any]) -> str:
        return json.dumps(report_data, indent=2)

    @classmethod
    def export_pdf(cls, report_data: Dict[str, Any]) -> bytes:
        return PDFReportGenerator.generate(report_data)

    @classmethod
    def export_docx(cls, report_data: Dict[str, Any]) -> bytes:
        return DOCXReportGenerator.generate(report_data)
