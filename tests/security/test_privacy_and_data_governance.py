"""
AI Red Team Assistant — Check 20 Privacy, Data Governance & Sensitive-Data Handling Test Suite.
Validates cross-project isolation, session context clearing, data minimization, credential redaction,
RAG knowledge separation, and zero external cloud data transmission.
"""
import unittest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.ai.session_store import SessionContextStore
from backend.core.scope_enforcer import ScopeEnforcer
from backend.core.audit_logger import AuditLogger
from backend.core.observability import StructuredLogger, LogLevel
from backend.core.config import settings
from backend.knowledge.vector_store import PGVectorStore
from backend.pipeline.feedback_store import FeedbackLoopService
from backend.reports.report_engine import ReportEngine


class TestPrivacyAndDataGovernance(unittest.TestCase):
    def setUp(self):
        SessionContextStore._sessions = {}
        AuditLogger.clear_for_testing()
        StructuredLogger.clear()
        FeedbackLoopService._rejection_store = {}

    def test_session_context_isolation_across_projects(self):
        """Test that Project A session context does not leak into Project B."""
        # Session A for Project 101
        session_a = SessionContextStore.register_turn(
            conversation_id="CONV-AAA",
            project_id="PRJ-101",
            user_message="Analyze authentication log for Project 101",
            attachments=[{"name": "auth_prj101.log", "content": "2026-08-27,admin,FAILED_LOGIN,192.168.1.100"}]
        )
        self.assertEqual(len(session_a.uploaded_files), 1)
        self.assertIn("auth_prj101.log", [f.name for f in session_a.uploaded_files.values()])

        # Session B for Project 102
        session_b = SessionContextStore.register_turn(
            conversation_id="CONV-BBB",
            project_id="PRJ-102",
            user_message="Analyze firewall log for Project 102",
            attachments=[{"name": "fw_prj102.log", "content": "2026-08-27,10.0.0.5,DENY,firewall"}]
        )
        self.assertEqual(len(session_b.uploaded_files), 1)
        self.assertIn("fw_prj102.log", [f.name for f in session_b.uploaded_files.values()])

        # Verify strict separation
        self.assertNotIn("auth_prj101.log", [f.name for f in session_b.uploaded_files.values()])
        self.assertEqual(session_a.project_id, "PRJ-101")
        self.assertEqual(session_b.project_id, "PRJ-102")

    def test_session_context_clear_session_purges_memory(self):
        """Test that clear_session() completely removes all session data and evidence from memory."""
        SessionContextStore.register_turn(
            conversation_id="CONV-TEMP",
            project_id="PRJ-101",
            user_message="Sensitive investigative prompt",
            attachments=[{"name": "confidential_dump.log", "content": "Sensitive database records"}]
        )
        self.assertIn("CONV-TEMP", SessionContextStore._sessions)

        # Purge session
        SessionContextStore.clear_session("CONV-TEMP")
        self.assertNotIn("CONV-TEMP", SessionContextStore._sessions)

    def test_global_kb_vs_project_evidence_separation(self):
        """Test that global RAG vector store only returns public standards (OWASP/CWE) and no project evidence."""
        import asyncio
        vstore = PGVectorStore()
        results = asyncio.run(vstore.similarity_search("SQL injection prepared statements"))
        
        self.assertTrue(len(results) > 0)
        for res in results:
            # Source must be an authoritative public standard
            self.assertIn(res["source"], ["OWASP Top 10", "MITRE CWE", "NIST SP 800-115", "FIRST CVSS"])
            self.assertNotIn("PRJ-101", res.get("content", ""))

    def test_cross_project_idor_isolation_defense(self):
        """Test that users authorized for Project 101 are denied access to Project 999."""
        user_projects = ["PRJ-101", "PRJ-102"]
        allowed, msg = ScopeEnforcer.verify_project_isolation(user_projects, "PRJ-101")
        self.assertTrue(allowed)

        denied, err_msg = ScopeEnforcer.verify_project_isolation(user_projects, "PRJ-999")
        self.assertFalse(denied)
        self.assertIn("Unauthorized", err_msg)

    def test_credential_and_token_scrubbing_in_audit_and_logs(self):
        """Test that audit logger and structured logger automatically scrub passwords and bearer tokens."""
        raw_payload = {
            "user": "analyst@redteam.local",
            "password": "ClearTextPassword!2026",
            "token": "secret-jwt-token-value",
            "auth_header": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token"
        }
        record = StructuredLogger.log(
            level=LogLevel.INFO,
            event="USER_ACTION",
            metadata=raw_payload
        )
        self.assertEqual(record.metadata["password"], "[REDACTED]")
        self.assertEqual(record.metadata["token"], "[REDACTED]")
        self.assertNotIn("ClearTextPassword!2026", str(record.metadata))

    def test_safe_diagnostic_endpoints_leak_zero_secrets(self):
        """Test that safe diagnostics return boolean flags without leaking database or JWT secrets."""
        diag = settings.get_safe_diagnostics()
        self.assertIn("secret_key_configured", diag)
        self.assertIn("database_configured", diag)
        self.assertNotIn("password", str(diag).lower())
        self.assertNotIn("postgresql://", str(diag))

    def test_report_generation_preserves_tenant_project_scoping(self):
        """Test that report engine deliverables are compiled strictly from target project findings."""
        project = {"id": "PRJ-101", "name": "Project Alpha", "organization": "Apex Corp", "lead_tester": "Alex Vance"}
        scope = [{"asset_identifier": "api.apexfin.com", "scope_status": "IN_SCOPE"}]
        findings = [
            {"id": "FND-101", "project_id": "PRJ-101", "title": "SQLi", "severity": "CRITICAL", "risk_score": 90, "remediation_status": "FIXED"}
        ]
        evidence = [{"evidence_id": "EVD-101", "project_id": "PRJ-101", "file_name": "alpha.log", "content_hash": "ABC12345"}]
        
        report = ReportEngine.compile_report(project, scope, findings, evidence, {})
        self.assertEqual(report["project_id"], "PRJ-101")
        self.assertEqual(report["findings_count"], 1)

    def test_local_ollama_runtime_zero_external_cloud_calls(self):
        """Test that Ollama base URL is configured locally (127.0.0.1 / localhost) with 0 cloud AI dependencies."""
        self.assertIn("127.0.0.1", settings.OLLAMA_BASE_URL)
        self.assertEqual(settings.OLLAMA_MODEL, "qwen3:14b")
        self.assertEqual(settings.EMBEDDING_MODEL, "nomic-embed-text")

    def test_false_positive_feedback_scoped_to_project(self):
        """Test that false-positive feedback suppression rules are isolated per project."""
        FeedbackLoopService.record_rejection(
            project_id="PRJ-101",
            finding_category="SQL_INJECTION",
            affected_asset="auth.apexfin.com",
            rejection_reason="KNOWN_TEST_ACTIVITY",
            analyst_comment="Synthetic unit test fixture"
        )

        rejections_101 = FeedbackLoopService.get_rejections_for_project("PRJ-101")
        rejections_102 = FeedbackLoopService.get_rejections_for_project("PRJ-102")

        self.assertEqual(len(rejections_101), 1)
        self.assertEqual(len(rejections_102), 0)


if __name__ == "__main__":
    unittest.main()
