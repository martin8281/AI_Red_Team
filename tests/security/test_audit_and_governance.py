"""
AI Red Team Assistant — Check 16 Auditability, Governance & Forensic Integrity Test Suite.
Validates audit logging, before/after change tracking, evidence provenance, hash chaining,
HITL accountability, AI decision traceability, and sensitive data redaction.
"""
import unittest
import json
import hashlib
from datetime import datetime

from backend.core.audit_logger import AuditLogger, AuditAction, AuditSeverity, AuditEvent
from backend.core.rbac import RBACManager
from backend.core.scope_enforcer import ScopeEnforcer
from backend.core.security import verify_password, hash_password
from backend.pipeline.ingestion_router import UniversalIngestionRouter
from backend.pipeline.feedback_store import FeedbackLoopService
from backend.risk.risk_engine import RiskEngine


class TestAuditAndGovernance(unittest.TestCase):
    def setUp(self):
        AuditLogger.clear_for_testing()

    def test_audit_auth_success_and_failure_logging(self):
        """Test logging of successful and failed authentication events with IP and actor details."""
        # 1. Successful Authentication
        stored_hash = hash_password("RedTeam@2026")
        is_valid = verify_password("RedTeam@2026", stored_hash)
        self.assertTrue(is_valid)

        evt_success = AuditLogger.log_event(
            action=AuditAction.AUTH_LOGIN_SUCCESS,
            resource_type="USER",
            resource_id="USR-001",
            actor_id="tester@redteam.local",
            actor_role="SECURITY_TESTER",
            result="SUCCESS",
            severity=AuditSeverity.INFO,
            source_ip="192.168.1.100",
            user_agent="Mozilla/5.0 Chrome/120.0"
        )
        self.assertEqual(evt_success.action, "AUTH_LOGIN_SUCCESS")
        self.assertEqual(evt_success.actor_id, "tester@redteam.local")
        self.assertEqual(evt_success.source_ip, "192.168.1.100")

        # 2. Failed Authentication
        is_invalid = verify_password("WrongPassword123", stored_hash)
        self.assertFalse(is_invalid)

        evt_fail = AuditLogger.log_event(
            action=AuditAction.AUTH_LOGIN_FAILURE,
            resource_type="USER",
            resource_id="USR-UNKNOWN",
            actor_id="attacker@unknown.com",
            actor_role="UNAUTHENTICATED",
            result="FAILURE",
            severity=AuditSeverity.SECURITY,
            reason="Invalid credentials supplied",
            source_ip="10.0.0.50",
            user_agent="Python-urllib/3.11"
        )
        self.assertEqual(evt_fail.result, "FAILURE")
        self.assertEqual(evt_fail.severity, "SECURITY")

        events = AuditLogger.get_events()
        self.assertEqual(len(events), 2)

    def test_audit_rbac_and_scope_denial_logging(self):
        """Test logging of RBAC violations, scope breaches, and IDOR attempts."""
        # 1. RBAC Violation
        can_delete = RBACManager.check_permission("SECURITY_TESTER", "delete_project")
        self.assertFalse(can_delete)
        AuditLogger.log_event(
            action=AuditAction.AUTHZ_RBAC_VIOLATION,
            resource_type="PROJECT",
            resource_id="PRJ-101",
            actor_id="tester@redteam.local",
            actor_role="SECURITY_TESTER",
            result="DENIED",
            severity=AuditSeverity.SECURITY,
            reason="SECURITY_TESTER role is not authorized to execute 'delete_project'"
        )

        # 2. Scope Violation Attempt
        in_scope = ["api.apexfin.com"]
        out_of_scope = ["prod-db.internal"]
        is_in, reason = ScopeEnforcer.is_target_in_scope("prod-db.internal", in_scope, out_of_scope)
        self.assertFalse(is_in)
        AuditLogger.log_event(
            action=AuditAction.AUTHZ_SCOPE_VIOLATION,
            resource_type="SCOPE",
            resource_id="SCP-102",
            target_id="prod-db.internal",
            project_id="PRJ-101",
            actor_id="tester@redteam.local",
            actor_role="SECURITY_TESTER",
            result="DENIED",
            severity=AuditSeverity.SECURITY,
            reason=reason
        )

        # 3. IDOR Cross-Project Access Attempt
        iso_ok, iso_msg = ScopeEnforcer.verify_project_isolation(["PRJ-101"], "PRJ-999")
        self.assertFalse(iso_ok)
        AuditLogger.log_event(
            action=AuditAction.AUTHZ_IDOR_ATTEMPT,
            resource_type="PROJECT",
            resource_id="PRJ-999",
            project_id="PRJ-999",
            actor_id="tester@redteam.local",
            actor_role="SECURITY_TESTER",
            result="DENIED",
            severity=AuditSeverity.CRITICAL,
            reason=iso_msg
        )

        denials = AuditLogger.get_events(severity=AuditSeverity.SECURITY)
        self.assertEqual(len(denials), 2)
        idor = AuditLogger.get_events(severity=AuditSeverity.CRITICAL)
        self.assertEqual(len(idor), 1)

    def test_audit_evidence_provenance_and_integrity(self):
        """Test that evidence ingestion records SHA-256 hash, record counts, and immutable metadata."""
        raw_log = "2026-08-27T10:00:00,192.168.1.105,10.0.0.1,admin,auth.apexfin.com,FAILED_LOGIN,auth"
        ingested = UniversalIngestionRouter.route_and_ingest_content("auth_audit.csv", raw_log, "PRJ-101")
        
        evidence_item = ingested["evidence_items"][0]
        content_hash = evidence_item["content_hash"]
        self.assertTrue(len(content_hash) > 0)

        evt = AuditLogger.log_event(
            action=AuditAction.EVIDENCE_INGESTED,
            resource_type="EVIDENCE",
            resource_id=evidence_item["evidence_id"],
            project_id="PRJ-101",
            actor_id="tester@redteam.local",
            actor_role="SECURITY_TESTER",
            metadata={
                "file_name": "auth_audit.csv",
                "pipeline_type": ingested["pipeline_type"],
                "content_hash": content_hash,
                "record_count": ingested["record_count"]
            }
        )
        self.assertEqual(evt.metadata["content_hash"], content_hash)
        self.assertEqual(evt.metadata["pipeline_type"], "STRUCTURED_SQL")

    def test_audit_before_after_state_change_tracking(self):
        """Test before/after state capture on finding modification and severity escalation."""
        before = {"severity": "HIGH", "status": "PROPOSED", "risk_score": 75}
        after = {"severity": "CRITICAL", "status": "UNDER_REVIEW", "risk_score": 92}

        evt = AuditLogger.log_event(
            action=AuditAction.FINDING_SEVERITY_CHANGED,
            resource_type="FINDING",
            resource_id="FND-201",
            project_id="PRJ-101",
            actor_id="lead_analyst@redteam.local",
            actor_role="SECURITY_TESTER",
            before_state=before,
            after_state=after,
            reason="Tester confirmed remote code execution vector alongside SQLi."
        )

        self.assertEqual(evt.before_state["severity"], "HIGH")
        self.assertEqual(evt.after_state["severity"], "CRITICAL")
        self.assertEqual(evt.before_state["risk_score"], 75)
        self.assertEqual(evt.after_state["risk_score"], 92)

    def test_audit_hitl_accountability_and_false_positive(self):
        """Test human verification decision logging and reversible false-positive feedback recording."""
        # 1. Human Verification
        AuditLogger.log_event(
            action=AuditAction.FINDING_VERIFIED,
            resource_type="FINDING",
            resource_id="FND-201",
            project_id="PRJ-101",
            actor_id="Alex Vance",
            actor_role="SECURITY_TESTER",
            before_state={"status": "UNDER_REVIEW"},
            after_state={"status": "VERIFIED"},
            reason="Confirmed with verified Burp Suite trace and SQL query sleep benchmark."
        )

        # 2. False Positive Rejection
        rej = FeedbackLoopService.record_rejection(
            project_id="PRJ-101",
            finding_category="SQL_INJECTION",
            affected_asset="auth.apexfin.com",
            rejection_reason="KNOWN_TEST_ACTIVITY",
            analyst_comment="Known unit test fixture generating synthetic mock syntax errors."
        )

        AuditLogger.log_event(
            action=AuditAction.FALSE_POSITIVE_FLAGGED,
            resource_type="FINDING",
            resource_id="FND-999",
            project_id="PRJ-101",
            actor_id="Alex Vance",
            actor_role="SECURITY_TESTER",
            reason=f"Marked false positive: {rej.rejection_reason} ({rej.analyst_comment})",
            metadata={"signature_hash": rej.signature_hash, "rejection_id": rej.rejection_id}
        )

        events = AuditLogger.get_events(project_id="PRJ-101")
        self.assertEqual(len(events), 2)
        self.assertEqual(events[1].action, "FALSE_POSITIVE_FLAGGED")

    def test_audit_ai_traceability_pipeline(self):
        """Test full traceability from user prompt -> pgvector RAG -> AI reasoning -> deterministic risk score."""
        # Step 1: AI Prompt & Session
        corr_id = "TRC-8899AABB"
        AuditLogger.log_event(
            action=AuditAction.AI_SESSION_CREATED,
            resource_type="AI_SESSION",
            resource_id="SES-001",
            project_id="PRJ-101",
            actor_id="Alex Vance",
            actor_role="SECURITY_TESTER",
            correlation_id=corr_id,
            metadata={"prompt_preview": "Analyze authentication log for SQL injection"}
        )

        # Step 2: RAG Grounding
        AuditLogger.log_event(
            action=AuditAction.AI_RAG_RETRIEVAL,
            resource_type="AI_SESSION",
            resource_id="SES-001",
            project_id="PRJ-101",
            correlation_id=corr_id,
            metadata={"retrieved_chunks": ["OWASP-A03:2021", "CWE-89"], "top_similarity": 0.94}
        )

        # Step 3: AI Proposed Finding
        AuditLogger.log_event(
            action=AuditAction.AI_FINDING_PROPOSED,
            resource_type="FINDING",
            resource_id="FND-PROP-01",
            project_id="PRJ-101",
            correlation_id=corr_id,
            metadata={"confidence": "HIGH", "model": "Qwen3-14B", "temperature": 0.2}
        )

        # Step 4: Deterministic Risk Calculation
        calc = RiskEngine.evaluate(impact=5, likelihood=4, asset_criticality=4, exploitability=4)
        AuditLogger.log_event(
            action=AuditAction.RISK_CALCULATED,
            resource_type="RISK",
            resource_id="RA-001",
            project_id="PRJ-101",
            correlation_id=corr_id,
            metadata={"score": calc["risk_score"], "level": calc["risk_level"], "priority": calc["recommended_priority"]}
        )

        traces = [e for e in AuditLogger.get_events() if e.correlation_id == corr_id]
        self.assertEqual(len(traces), 4)

    def test_audit_log_cryptographic_hash_chain_integrity(self):
        """Test cryptographic hash chaining and validation of zero tampering."""
        for i in range(5):
            AuditLogger.log_event(
                action=AuditAction.PROJECT_UPDATED,
                resource_type="PROJECT",
                resource_id=f"PRJ-10{i}",
                project_id=f"PRJ-10{i}",
                actor_id="admin@redteam.local",
                actor_role="ADMIN",
                reason=f"Sequential engagement milestone update {i}"
            )

        # Verify pristine hash chain
        is_valid, msg = AuditLogger.verify_chain_integrity()
        self.assertTrue(is_valid)
        self.assertIn("100% untampered integrity", msg)

        # Simulate tampering: manually mutate an event field in historical memory
        AuditLogger._events[2].reason = "TAMPERED: Altered audit record maliciously"

        # Verify tampering detection
        tampered_valid, tampered_msg = AuditLogger.verify_chain_integrity()
        self.assertFalse(tampered_valid)
        self.assertIn("Data tampering detected", tampered_msg)

    def test_audit_sensitive_data_redaction(self):
        """Test automatic redaction of credentials, API keys, and Bearer tokens in audit logs."""
        raw_payload = {
            "username": "tester@redteam.local",
            "password": "SuperSecretPassword!2026",
            "api_key": "sk-1234567890abcdef",
            "auth_header": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0",
            "normal_field": "public_project_data"
        }

        evt = AuditLogger.log_event(
            action=AuditAction.AUTH_LOGIN_SUCCESS,
            resource_type="USER",
            resource_id="USR-001",
            actor_id="tester@redteam.local",
            metadata=raw_payload,
            reason="User authenticated with password: SuperSecretPassword!2026"
        )

        # Verify password and keys are redacted in metadata
        self.assertEqual(evt.metadata["password"], "[REDACTED]")
        self.assertEqual(evt.metadata["api_key"], "[REDACTED]")
        self.assertEqual(evt.metadata["normal_field"], "public_project_data")
        # Verify redaction in reason text
        self.assertNotIn("SuperSecretPassword!2026", evt.reason)
        self.assertIn("[REDACTED]", evt.reason)

    def test_audit_forensic_timeline_reconstruction(self):
        """Test chronological timeline reconstruction for a security investigation."""
        AuditLogger.log_event(
            action=AuditAction.EVIDENCE_INGESTED,
            resource_type="EVIDENCE",
            resource_id="EVD-01",
            project_id="PRJ-101",
            actor_id="Alice",
            actor_role="SECURITY_TESTER",
            reason="Uploaded authentication log"
        )
        AuditLogger.log_event(
            action=AuditAction.FINDING_CREATED,
            resource_type="FINDING",
            resource_id="FND-101",
            project_id="PRJ-101",
            actor_id="Bob",
            actor_role="SECURITY_TESTER",
            reason="Identified potential SQL injection"
        )
        AuditLogger.log_event(
            action=AuditAction.FINDING_VERIFIED,
            resource_type="FINDING",
            resource_id="FND-101",
            project_id="PRJ-101",
            actor_id="Carol",
            actor_role="REVIEWER",
            reason="Verified PoC trace"
        )

        timeline = AuditLogger.reconstruct_timeline(project_id="PRJ-101")
        self.assertEqual(len(timeline), 3)
        self.assertEqual(timeline[0]["action"], "EVIDENCE_INGESTED")
        self.assertEqual(timeline[1]["action"], "FINDING_CREATED")
        self.assertEqual(timeline[2]["action"], "FINDING_VERIFIED")

    def test_audit_export_formats_json_and_csv(self):
        """Test exporting audit trail in JSON and CSV formats."""
        AuditLogger.log_event(
            action=AuditAction.PROJECT_CREATED,
            resource_type="PROJECT",
            resource_id="PRJ-101",
            project_id="PRJ-101",
            actor_id="admin@redteam.local",
            actor_role="ADMIN"
        )

        json_export = AuditLogger.export_audit_trail(project_id="PRJ-101", format_type="json")
        csv_export = AuditLogger.export_audit_trail(project_id="PRJ-101", format_type="csv")

        parsed_json = json.loads(json_export)
        self.assertEqual(len(parsed_json), 1)
        self.assertIn("PRJ-101", json_export)

        self.assertIn("event_id,timestamp,actor_id", csv_export)
        self.assertIn("PROJECT_CREATED", csv_export)


if __name__ == "__main__":
    unittest.main()
