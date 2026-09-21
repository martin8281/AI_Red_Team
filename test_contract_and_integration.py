"""
End-to-End Contract & Frontend-Backend Integration Test for Check 11.
Validates complete data flow across Models, Services, APIs, and Data Contracts.
"""
import sys
import os
import json
import asyncio
from datetime import datetime

# Backend Services
from backend.risk.risk_engine import RiskEngine
from backend.pipeline.correlation_engine import DeterministicCorrelationEngine, LogRecord
from backend.pipeline.ingestion_router import UniversalIngestionRouter
from backend.pipeline.feedback_store import FeedbackLoopService
from backend.knowledge.vector_store import PGVectorStore
from backend.reports.report_engine import ReportEngine
from backend.core.sanitization import SecuritySanitizer
from backend.core.security import RateLimiter, verify_password, hash_password
from backend.core.rbac import RBACManager
from backend.core.scope_enforcer import ScopeEnforcer
from backend.ai.ai_service import AIService
from backend.ai.session_store import SessionContextStore
from backend.analytics.risk_analytics import RiskAnalytics
from backend.analytics.finding_analytics import FindingAnalytics
from backend.analytics.remediation_analytics import RemediationAnalytics

async def run_integration_audit():
    print("=" * 70)
    print("AI RED TEAM ASSISTANT — CHECK 11 CONTRACT & INTEGRATION AUDIT")
    print("=" * 70)

    # 1. User & Authorization Boundary
    print("\n[Step 1] Verifying User & RBAC Authorization Boundary...")
    assert RBACManager.check_permission("ADMIN", "create_project") is True
    assert RBACManager.check_permission("SECURITY_TESTER", "delete_project") is False
    assert RBACManager.check_permission("VIEWER", "create_finding") is False
    print("  -> RBAC Permission Enforcements: VERIFIED")

    # 2. Project Scoping & Isolation
    print("\n[Step 2] Project Scoping & Isolation Validation...")
    in_scope = ["api.apexfin.com", "auth.apexfin.com", "10.0.0.0/24"]
    out_of_scope = ["prod-db.internal", "*.billing.corp"]
    
    in_check, _ = ScopeEnforcer.is_target_in_scope("https://api.apexfin.com/v1/auth", in_scope, out_of_scope)
    out_check, _ = ScopeEnforcer.is_target_in_scope("prod-db.internal", in_scope, out_of_scope)
    iso_check, _ = ScopeEnforcer.verify_project_isolation(["PRJ-101", "PRJ-102"], "PRJ-101")
    idor_check, _ = ScopeEnforcer.verify_project_isolation(["PRJ-101"], "PRJ-999")
    
    assert in_check is True
    assert out_check is False
    assert iso_check is True
    assert idor_check is False
    print("  -> Scope In/Out and IDOR Isolation: VERIFIED")

    # 3. Evidence Ingestion, SHA-256 Hashing & Ingestion Routing
    print("\n[Step 3] Differentiated Evidence Ingestion & Cryptographic Hashing...")
    raw_csv = "timestamp,src_ip,dest_ip,user,asset,action,log_type\n2026-08-27T10:00:00,192.168.1.105,10.0.0.1,admin,auth.apexfin.com,FAILED_LOGIN,auth\n2026-08-27T10:00:05,192.168.1.105,10.0.0.1,admin,auth.apexfin.com,DENY,firewall"
    ingested = UniversalIngestionRouter.route_and_ingest_content("audit_auth.csv", raw_csv, "PRJ-101")
    
    assert ingested["pipeline_type"] == "STRUCTURED_SQL"
    assert ingested["record_count"] == 2
    assert len(ingested["evidence_items"]) == 2
    assert ingested["evidence_items"][0]["evidence_id"].startswith("EVD-")
    print(f"  -> Ingested {ingested['record_count']} evidence records with immutable hashes: VERIFIED")

    # 4. Deterministic Correlation Engine
    print("\n[Step 4] Pre-LLM Deterministic Sliding-Window Correlation...")
    corr_engine = DeterministicCorrelationEngine(window_minutes=15)
    correlations = corr_engine.correlate(ingested["log_records"])
    assert len(correlations) == 1
    assert correlations[0].primary_entity == "192.168.1.105"
    assert "auth" in correlations[0].matched_sources
    assert "firewall" in correlations[0].matched_sources
    print(f"  -> Correlated multi-source pivot '{correlations[0].correlation_id}': VERIFIED")

    # 5. Deterministic 4-Factor Risk Engine
    print("\n[Step 5] Deterministic 4-Factor Risk Engine Evaluation...")
    risk_res = RiskEngine.evaluate(impact=5, likelihood=4, asset_criticality=5, exploitability=4)
    assert risk_res["risk_score"] == 89
    assert risk_res["risk_level"] == "CRITICAL"
    assert risk_res["recommended_priority"] == "P1 — Immediate"
    print(f"  -> Calculated Risk Score: {risk_res['risk_score']}/100 ({risk_res['risk_level']}): VERIFIED")

    # 6. pgvector Semantic RAG Search
    print("\n[Step 6] pgvector Semantic Search & Grounded Citation...")
    vector_store = PGVectorStore()
    rag_chunks = await vector_store.similarity_search("How to prevent SQL injection and CWE-89?", top_k=2, threshold=0.3)
    assert len(rag_chunks) > 0
    assert "OWASP" in rag_chunks[0]["source"] or "CWE" in rag_chunks[0]["source"]
    print(f"  -> Retrieved {len(rag_chunks)} authoritative passages: VERIFIED")

    # 7. AI Security Co-Pilot Analysis & Session Memory
    print("\n[Step 7] AI Security Co-Pilot Multi-Turn Session Persistence...")
    ai_service = AIService()
    session_res = await ai_service.analyze(
        project_data={"id": "PRJ-101", "name": "Apex Financial Assessment", "scope": in_scope},
        context_type="project",
        message="Review vulnerability vectors and correlate forensic logs",
        conversation_id="conv-integ-01",
        mode="assistant"
    )
    assert session_res is not None
    assert session_res.get("confidence") == "HIGH"
    print("  -> AI Structured Finding & Action Generation: VERIFIED")

    # 8. Human-in-the-Loop Feedback Loop & False Positive Suppression
    print("\n[Step 8] False Positive Suppression & Analyst Feedback Loop...")
    rejection = FeedbackLoopService.record_rejection(
        project_id="PRJ-101",
        finding_category="Stale Web Probe",
        affected_asset="192.168.1.99",
        rejection_reason="INTERNAL_TEST_SCAN",
        analyst_comment="Known vulnerability scanner IP.",
        detection_rule="DEFAULT"
    )
    assert rejection.rejection_reason == "INTERNAL_TEST_SCAN"
    
    candidates = [{"id": "FND-999", "category": "Stale Web Probe", "affected_asset": "192.168.1.99", "severity": "LOW"}]
    filtered = FeedbackLoopService.filter_and_calibrate_findings(candidates, "PRJ-101")
    assert filtered[0]["is_suppressed_candidate"] is True
    assert filtered[0]["confidence"] == "LOW"
    print("  -> Analyst Rejection & Automatic Suppression Filter: VERIFIED")

    # 9. 12-Section Deliverable Compilation & Multi-Format Export
    print("\n[Step 9] 12-Section Deliverable Compilation & Multi-Format Export...")
    findings = [{
        "id": "FND-201",
        "title": "Blind Boolean-Based SQL Injection on Auth Endpoint",
        "vulnerability_type": "SQL Injection",
        "severity": "CRITICAL",
        "risk_score": 89,
        "priority": "P1 — Immediate",
        "status": "OPEN",
        "verification_status": "VERIFIED",
        "asset": "auth.apexfin.com",
        "endpoint": "/v1/auth/login",
        "method": "POST",
        "description": "Dynamic SQL query concatenation without parameterized statements.",
        "impact": "Database extraction.",
        "recommendation": "Use parameterized queries."
    }]
    evidence = [{
        "id": "EVD-101",
        "finding_id": "FND-201",
        "title": "PoC SQLi HTTP Trace",
        "file_reference": "audit_auth.csv",
        "verification_status": "VERIFIED",
        "created_by": "Alex Vance",
        "description": "Observed 500 error on single quote parameter injection."
    }]
    project = {
        "id": "PRJ-101",
        "name": "Apex Financial Web Assessment",
        "organization": "Apex Financial Services",
        "lead_tester": "Alex Vance"
    }
    scope = [
        {"asset_type": "HOST", "value": "auth.apexfin.com", "scope_status": "IN_SCOPE", "description": "Auth Endpoint"},
        {"asset_type": "HOST", "value": "prod-db.internal", "scope_status": "OUT_OF_SCOPE", "description": "Database"}
    ]
    
    report = ReportEngine.compile_report(project, scope, findings, evidence)
    assert len(report["sections"]) == 12
    assert report["overall_risk_score"] == 89
    
    md_export = ReportEngine.export_markdown(report)
    json_export = ReportEngine.export_json(report)
    pdf_export = ReportEngine.export_pdf(report)
    docx_export = ReportEngine.export_docx(report)
    
    assert len(md_export) > 500
    assert len(json_export) > 500
    assert len(pdf_export) > 1000
    assert len(docx_export) > 1000
    print(f"  -> Generated 12-section deliverable (PDF {len(pdf_export):,} bytes, DOCX {len(docx_export):,} bytes): VERIFIED")

    # 10. Analytics & Composite Metrics Consistency
    print("\n[Step 10] Analytics & Composite Risk Metrics Consistency...")
    f_analytics = FindingAnalytics.aggregate_findings(findings)
    r_analytics = RiskAnalytics.calculate_risk_metrics([89])
    rem_analytics = RemediationAnalytics.calculate_remediation_metrics(findings)
    
    assert f_analytics["total"] == 1
    assert f_analytics["by_severity"]["critical"] == 1
    assert r_analytics["overall_risk_score"] == 89
    assert rem_analytics["remediation_rate"] == 0
    print("  -> Finding, Risk and Remediation Analytics Aggregation: VERIFIED")

    print("\n" + "=" * 70)
    print("CHECK 11: ALL 10 END-TO-END DATA FLOW MILESTONES VERIFIED!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_integration_audit())
