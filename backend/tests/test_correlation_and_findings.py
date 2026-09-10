import unittest
from datetime import datetime, timedelta
import os
import sys

# Ensure backend directory is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.pipeline.correlation_engine import DeterministicCorrelationEngine, LogRecord
from backend.pipeline.ingestion_router import UniversalIngestionRouter
from backend.pipeline.feedback_store import FeedbackLoopService
from backend.ai.structured_finding_models import FindingOutputSchema, CopilotInvestigationResponse


class TestCorrelationAndFindings(unittest.TestCase):

    def test_deterministic_ip_correlation(self):
        """Test multi-source sliding window temporal join across Auth and Firewall logs."""
        engine = DeterministicCorrelationEngine(window_minutes=15)
        now = datetime.utcnow()

        records = [
            LogRecord(
                evidence_id="EVD-AUTH-01",
                source_file="auth.log",
                timestamp=now,
                log_type="auth",
                src_ip="198.51.100.44",
                action="FAILED_LOGIN",
                asset="auth.apexfin.com"
            ),
            LogRecord(
                evidence_id="EVD-AUTH-02",
                source_file="auth.log",
                timestamp=now + timedelta(minutes=2),
                log_type="auth",
                src_ip="198.51.100.44",
                action="FAILED_LOGIN",
                asset="auth.apexfin.com"
            ),
            LogRecord(
                evidence_id="EVD-FW-01",
                source_file="firewall.log",
                timestamp=now + timedelta(minutes=5),
                log_type="firewall",
                src_ip="198.51.100.44",
                action="ALLOW",
                asset="perimeter-fw"
            )
        ]

        correlations = engine.correlate(records)
        self.assertEqual(len(correlations), 1)
        corr = correlations[0]
        self.assertEqual(corr.primary_entity, "198.51.100.44")
        self.assertIn("EVD-AUTH-01", corr.evidence_refs)
        self.assertIn("EVD-FW-01", corr.evidence_refs)
        self.assertEqual(corr.detection_rule, "MULTI_SOURCE_IP_PIVOT")
        self.assertGreaterEqual(corr.deterministic_score, 0.9)

    def test_differentiated_ingestion_routing(self):
        """Test routing structured CSV vs unstructured DOCX/TXT content."""
        # 1. Structured CSV
        csv_content = "timestamp,source_ip,user,host,action\n2026-09-07T10:00:00Z,10.0.0.5,admin,auth-srv,FAILED_LOGIN\n2026-09-07T10:02:00Z,10.0.0.5,admin,auth-srv,FAILED_LOGIN"
        struct_res = UniversalIngestionRouter.route_and_ingest_content("auth_audit.csv", csv_content, "PRJ-TEST")
        self.assertEqual(struct_res["pipeline_type"], "STRUCTURED_SQL")
        self.assertEqual(struct_res["record_count"], 2)
        self.assertTrue(all(e["evidence_id"].startswith("EVD-") for e in struct_res["evidence_items"]))

        # 2. Unstructured Report
        unstruct_content = "Executive Summary\n\nDuring the engagement, testing of the API gateway revealed missing rate limiting and weak JWT signature validation.\n\nRecommendations include implementing strict HS256 to RS256 migration."
        unstruct_res = UniversalIngestionRouter.route_and_ingest_content("pentest_report.docx", unstruct_content, "PRJ-TEST")
        self.assertEqual(unstruct_res["pipeline_type"], "UNSTRUCTURED_VECTOR")
        self.assertGreaterEqual(unstruct_res["chunk_count"], 2)
        self.assertTrue(all(e["evidence_id"].startswith("DOC-") for e in unstruct_res["evidence_items"]))

    def test_structured_finding_schema_and_calibration(self):
        """Test FindingOutputSchema validation and confidence calibration constraint."""
        finding = FindingOutputSchema(
            id="FND-801",
            category="SQL Injection",
            severity="CRITICAL",
            severity_rationale="Allows unauthorized database record extraction.",
            confidence="HIGH",
            confidence_justification="Directly confirmed by PoC evidence EVD-9921 showing extracted schema.",
            affected_asset="api.apexfin.com/v1/auth",
            evidence_refs=["EVD-9921"],
            description="SQL injection vulnerability in login query parameter.",
            impact="Full compromise of user database confidentiality.",
            recommendation="Use parameterized PreparedStatement queries.",
            mitre_technique="T1190",
            status="proposed"
        )
        self.assertEqual(finding.status, "proposed")
        self.assertEqual(finding.confidence, "HIGH")
        self.assertIn("EVD-9921", finding.evidence_refs)

    def test_false_positive_feedback_suppression(self):
        """Test recording analyst rejection and filtering candidate findings."""
        project_id = "PRJ-FEEDBACK-01"
        
        # Record analyst rejection
        rejection = FeedbackLoopService.record_rejection(
            project_id=project_id,
            finding_category="PORT_SCAN",
            affected_asset="scan-target.internal",
            rejection_reason="KNOWN_TEST_ACTIVITY",
            analyst_comment="Authorized internal vulnerability scanner health check."
        )
        self.assertTrue(rejection.rejection_id.startswith("REJ-"))

        # Candidate findings before feedback filter
        candidates = [
            {
                "id": "FND-AI-101",
                "category": "PORT_SCAN",
                "affected_asset": "scan-target.internal",
                "detection_rule": "DEFAULT",
                "severity": "MEDIUM",
                "confidence": "HIGH",
                "confidence_justification": "Observed rapid SYN probes."
            },
            {
                "id": "FND-AI-102",
                "category": "SQL Injection",
                "affected_asset": "api.apexfin.com",
                "detection_rule": "DEFAULT",
                "severity": "CRITICAL",
                "confidence": "HIGH",
                "confidence_justification": "SQL syntax error observed."
            }
        ]

        calibrated = FeedbackLoopService.filter_and_calibrate_findings(candidates, project_id)
        
        # Finding 1 should be deprioritized
        self.assertEqual(calibrated[0]["confidence"], "LOW")
        self.assertTrue(calibrated[0].get("is_suppressed_candidate"))
        self.assertIn("DEPRIORITIZED: Matches prior analyst rejection", calibrated[0]["confidence_justification"])

        # Finding 2 should remain unchanged
        self.assertEqual(calibrated[1]["confidence"], "HIGH")
        self.assertFalse(calibrated[1].get("is_suppressed_candidate", False))


if __name__ == "__main__":
    unittest.main()
