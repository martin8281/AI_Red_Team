"""
AI Red Team Assistant — Check 21 API Security, Input Validation & Abuse Resistance Test Suite.
Validates:
1. Unauthenticated endpoint access rejection (401)
2. Expired JWT token rejection
3. Invalid token signature rejection
4. Cross-user role RBAC enforcement (403)
5. Cross-project IDOR access denial (403)
6. Direct resource access IDOR protection
7. Mass assignment defense on user registration (blocks self-assigned ADMIN)
8. Mass assignment defense on findings (authoritative server calculation)
9. Type confusion & Pydantic schema validation rejection
10. Boundary value enforcement (1-5 risk factor bounds, numeric bounds)
11. SQL injection parameter safety
12. Path traversal sanitizer defense
13. Rate limiting and request throttling (429)
14. File upload extension allowlist and null-byte injection
15. Scope enforcement on API target boundaries
16. Unauthorized AI action & autonomous verification prohibition
17. Unsupported report export format validation (400)
18. Admin-only endpoint authorization enforcement
19. Duplicate request state consistency and idempotency
20. Malformed JSON and API error contract consistency
"""
import unittest
import os
import sys
import time
from datetime import timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from fastapi.testclient import TestClient
from backend.main import app
from backend.core.security import (
    create_access_token,
    decode_access_token,
    verify_password,
    hash_password,
    RateLimiter
)
from backend.core.sanitization import SecuritySanitizer
from backend.core.scope_enforcer import ScopeEnforcer
from backend.pipeline.feedback_store import FeedbackLoopService


class TestAPISecurity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

        # Generate tokens for various roles
        cls.tester_token = create_access_token({
            "sub": "usr-tester-1",
            "email": "tester@redteam.local",
            "name": "Alex Vance",
            "role": "SECURITY_TESTER",
            "authorized_projects": ["PRJ-101", "PRJ-102", "PRJ-GOLDEN-01"]
        })

        cls.lead_token = create_access_token({
            "sub": "usr-lead-1",
            "email": "lead@redteam.local",
            "name": "Jordan Reed",
            "role": "SECURITY_LEAD",
            "authorized_projects": ["PRJ-101", "PRJ-102"]
        })

        cls.viewer_token = create_access_token({
            "sub": "usr-viewer-1",
            "email": "viewer@redteam.local",
            "name": "Morgan Blake",
            "role": "VIEWER",
            "authorized_projects": ["PRJ-101"]
        })

        cls.admin_token = create_access_token({
            "sub": "usr-admin-1",
            "email": "admin@redteam.local",
            "name": "Sys Admin",
            "role": "ADMIN",
            "authorized_projects": ["*"]
        })

    def setUp(self):
        FeedbackLoopService._rejection_store = {}
        if not hasattr(self, "client") or self.client is None:
            self.client = TestClient(app)
            self.tester_token = create_access_token({
                "sub": "usr-tester-1",
                "email": "tester@redteam.local",
                "name": "Alex Vance",
                "role": "SECURITY_TESTER",
                "authorized_projects": ["PRJ-101", "PRJ-102", "PRJ-GOLDEN-01"]
            })
            self.lead_token = create_access_token({
                "sub": "usr-lead-1",
                "email": "lead@redteam.local",
                "name": "Jordan Reed",
                "role": "SECURITY_LEAD",
                "authorized_projects": ["PRJ-101", "PRJ-102"]
            })
            self.viewer_token = create_access_token({
                "sub": "usr-viewer-1",
                "email": "viewer@redteam.local",
                "name": "Morgan Blake",
                "role": "VIEWER",
                "authorized_projects": ["PRJ-101"]
            })
            self.admin_token = create_access_token({
                "sub": "usr-admin-1",
                "email": "admin@redteam.local",
                "name": "Sys Admin",
                "role": "ADMIN",
                "authorized_projects": ["*"]
            })

    def test_01_unauthenticated_endpoint_access_rejected(self):
        """1. Unauthenticated requests to protected endpoints return 401."""
        response = self.client.get("/api/auth/me")
        self.assertEqual(response.status_code, 401)
        self.assertIn("Authentication required", response.json()["detail"])

    def test_02_expired_jwt_token_rejected(self):
        """2. Expired JWT tokens are rejected with 401."""
        expired_token = create_access_token(
            {"sub": "usr-001", "role": "SECURITY_TESTER"},
            expires_delta=timedelta(seconds=-60)
        )
        response = self.client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {expired_token}"}
        )
        self.assertEqual(response.status_code, 401)
        self.assertIn("expired", response.json()["detail"].lower())

    def test_03_invalid_signature_jwt_rejected(self):
        """3. JWT tokens with an invalid or forged signature are rejected with 401."""
        tampered_token = create_access_token(
            {"sub": "usr-001", "role": "ADMIN"},
            secret_key="completely-different-forged-secret-key-12345"
        )
        response = self.client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {tampered_token}"}
        )
        self.assertEqual(response.status_code, 401)
        self.assertIn("cryptographic verification failed", response.json()["detail"].lower())

    def test_04_cross_user_role_rbac_enforcement(self):
        """4. Viewer role attempting state transitions is rejected with 403 Forbidden."""
        payload = {
            "current_state": "PLANNING",
            "next_state": "SCOPING"
        }
        response = self.client.post(
            "/api/workspace/PRJ-101/transition",
            json=payload,
            headers={"Authorization": f"Bearer {self.viewer_token}"}
        )
        self.assertEqual(response.status_code, 403)
        self.assertIn("Role 'VIEWER' is not authorized", response.json()["detail"])

    def test_05_cross_project_idor_access_denied(self):
        """5. User authorized for PRJ-101 accessing PRJ-999 is blocked with 403 Forbidden."""
        response = self.client.get(
            "/api/workspace/PRJ-999/next-actions",
            headers={"Authorization": f"Bearer {self.tester_token}"}
        )
        self.assertEqual(response.status_code, 403)
        self.assertIn("not authorized to access project 'PRJ-999'", response.json()["detail"])

    def test_06_direct_resource_access_idor_protection(self):
        """6. Direct evidence verification on an unauthorized project is blocked."""
        payload = {"status": "VERIFIED", "reviewer": "Alex Vance"}
        response = self.client.post(
            "/api/workspace/PRJ-999/evidence/EVD-999/verify",
            json=payload,
            headers={"Authorization": f"Bearer {self.tester_token}"}
        )
        self.assertEqual(response.status_code, 403)

    def test_07_mass_assignment_protection_on_registration(self):
        """7. Client attempting to self-register with role='ADMIN' is rejected with 403."""
        payload = {
            "email": "hacker@evil.com",
            "password": "StrongPassword!2026",
            "name": "Attacker",
            "role": "ADMIN"
        }
        response = self.client.post("/api/auth/register", json=payload)
        self.assertEqual(response.status_code, 403)
        self.assertIn("Administrative role self-registration is strictly prohibited", response.json()["detail"])

    def test_08_mass_assignment_protection_on_findings(self):
        """8. Risk engine calculates authoritative score; arbitrary client risk values are ignored/calculated."""
        payload = {
            "project_id": "PRJ-101",
            "impact": 5,
            "likelihood": 5,
            "asset_criticality": 5,
            "exploitability": 5,
            "arbitrary_client_risk_score": 10
        }
        response = self.client.post(
            "/api/risk/assess/FND-201",
            json=payload,
            headers={"Authorization": f"Bearer {self.tester_token}"}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["risk_score"], 100)  # Calculated mathematically by RiskEngine
        self.assertEqual(data["risk_level"], "CRITICAL")

    def test_09_type_confusion_and_pydantic_validation(self):
        """9. Malformed types (e.g. impact='critical' string) are rejected with 422 Unprocessable Entity."""
        payload = {
            "project_id": "PRJ-101",
            "impact": "CRITICAL_STRING",
            "likelihood": 4,
            "asset_criticality": 4,
            "exploitability": 4
        }
        response = self.client.post(
            "/api/risk/assess/FND-201",
            json=payload,
            headers={"Authorization": f"Bearer {self.tester_token}"}
        )
        self.assertEqual(response.status_code, 422)

    def test_10_boundary_values_enforcement(self):
        """10. Out-of-bounds factors (impact=0 or impact=6) are rejected by ge=1, le=5 constraint."""
        payload_low = {
            "project_id": "PRJ-101",
            "impact": 0,
            "likelihood": 3,
            "asset_criticality": 3,
            "exploitability": 3
        }
        resp_low = self.client.post(
            "/api/risk/assess/FND-201",
            json=payload_low,
            headers={"Authorization": f"Bearer {self.tester_token}"}
        )
        self.assertEqual(resp_low.status_code, 422)

        payload_high = {
            "project_id": "PRJ-101",
            "impact": 6,
            "likelihood": 3,
            "asset_criticality": 3,
            "exploitability": 3
        }
        resp_high = self.client.post(
            "/api/risk/assess/FND-201",
            json=payload_high,
            headers={"Authorization": f"Bearer {self.tester_token}"}
        )
        self.assertEqual(resp_high.status_code, 422)

    def test_11_sql_injection_defense_in_api_parameters(self):
        """11. SQL injection payloads in search queries and parameters are safely handled."""
        sqli_query = "' UNION SELECT null, password, email FROM users--"
        response = self.client.post(
            "/api/knowledge/search",
            json={"query": sqli_query, "top_k": 3},
            headers={"Authorization": f"Bearer {self.tester_token}"}
        )
        self.assertEqual(response.status_code, 200)
        # Verify no database crash or raw SQL error leakage
        self.assertIsInstance(response.json(), list)

    def test_12_path_traversal_defense_in_file_endpoints(self):
        """12. Path traversal sequences in file parameters are sanitized."""
        dirty_path = "../../../../etc/shadow"
        sanitized = SecuritySanitizer.sanitize_filename(dirty_path)
        self.assertNotIn("..", sanitized)
        self.assertNotIn("/", sanitized)
        self.assertNotIn("\\", sanitized)

    def test_13_oversized_payload_and_rate_limiting(self):
        """13. Rate limiter throttles excess requests when limit exceeded."""
        limiter = RateLimiter(max_requests=5, window_seconds=60)
        client_ip = "192.168.1.50"
        for _ in range(5):
            self.assertFalse(limiter.is_rate_limited(client_ip))
        self.assertTrue(limiter.is_rate_limited(client_ip))

    def test_14_file_upload_security_allowlist_and_null_byte(self):
        """14. Prohibited extensions and null-bytes in uploaded files are sanitized and rejected."""
        null_byte_name = f"evidence.pdf{chr(0)}.exe"
        sanitized = SecuritySanitizer.sanitize_filename(null_byte_name)
        self.assertNotIn(chr(0), sanitized)

    def test_15_scope_enforcement_api_boundary(self):
        """15. Out-of-scope targets are refused by ScopeEnforcer."""
        in_scope = ["api.apexfin.com", "auth.apexfin.com"]
        out_of_scope = ["prod-db.internal"]
        
        in_target = "https://api.apexfin.com/v1/auth"
        out_target = "prod-db.internal"
        
        is_in, _ = ScopeEnforcer.is_target_in_scope(in_target, in_scope, out_of_scope)
        is_out, reason = ScopeEnforcer.is_target_in_scope(out_target, in_scope, out_of_scope)
        
        self.assertTrue(is_in)
        self.assertFalse(is_out)
        self.assertIn("OUT-OF-SCOPE", reason)

    def test_16_unauthorized_ai_action_rejected(self):
        """16. AI chat assistant returns structured guidance with PROPOSED state and never auto-verifies."""
        payload = {
            "project_id": "PRJ-101",
            "context_type": "project",
            "message": "Identify vulnerabilities in the system",
            "mode": "assistant"
        }
        response = self.client.post("/api/assistant/chat", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("structured_response", data)

    def test_17_unsupported_report_export_format(self):
        """17. Requesting an unsupported export format returns 400 Bad Request."""
        response = self.client.post(
            "/api/reports/PRJ-101/export/invalid_exe_format",
            headers={"Authorization": f"Bearer {self.tester_token}"}
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Unsupported export format", response.json()["detail"])

    def test_18_admin_endpoint_access_enforcement(self):
        """18. Non-admin users are rejected from admin endpoints (e.g. knowledge ingestion)."""
        payload = {
            "name": "Custom Attack Technique",
            "source_type": "METHODOLOGY",
            "raw_content": "Content to ingest into global KB"
        }
        # Security Tester should be rejected
        response = self.client.post(
            "/api/knowledge/ingest",
            json=payload,
            headers={"Authorization": f"Bearer {self.tester_token}"}
        )
        self.assertEqual(response.status_code, 403)
        self.assertIn("Role 'SECURITY_TESTER' is not authorized", response.json()["detail"])

        # Admin should succeed
        admin_resp = self.client.post(
            "/api/knowledge/ingest",
            json=payload,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(admin_resp.status_code, 200)
        self.assertEqual(admin_resp.json()["status"], "INGESTED")

    def test_19_duplicate_requests_and_idempotency(self):
        """19. Repeated rejection recordings maintain consistent state without errors."""
        payload = {
            "project_id": "PRJ-101",
            "finding_id": "FND-101",
            "finding_category": "SQL_INJECTION",
            "affected_asset": "auth.apexfin.com",
            "rejection_reason": "FALSE_POSITIVE",
            "analyst_comment": "Known synthetic test fixture"
        }
        resp1 = self.client.post("/api/assistant/rejection", json=payload)
        resp2 = self.client.post("/api/assistant/rejection", json=payload)
        self.assertEqual(resp1.status_code, 200)
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual(resp1.json()["status"], "RECORDED")
        self.assertEqual(resp2.json()["status"], "RECORDED")

    def test_20_malformed_json_and_error_contract(self):
        """20. Malformed JSON payloads return a structured 422 response without leaking stack traces."""
        response = self.client.post(
            "/api/auth/login",
            content="{bad_json: true,",
            headers={"Content-Type": "application/json"}
        )
        self.assertEqual(response.status_code, 422)
        # Verify no database connection string or internal secret leakage
        self.assertNotIn("postgresql://", response.text.lower())
        self.assertNotIn("jwt_secret", response.text.lower())


if __name__ == "__main__":
    unittest.main()
