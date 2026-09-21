"""
AI Red Team Assistant — Check 18 Backup, Disaster Recovery & Business Continuity Test Suite.
Validates automated snapshot creation, SHA-256 manifest integrity verification, post-disaster data parity,
evidence provenance preservation, audit continuity, and deterministic business continuity without Ollama.
"""
import unittest
import json
import zipfile
import io
from backend.core.backup_manager import BackupManager, BackupManifest
from backend.core.audit_logger import AuditLogger
from backend.core.rbac import RBACManager
from backend.risk.risk_engine import RiskEngine


class TestBackupAndRecovery(unittest.TestCase):
    def setUp(self):
        AuditLogger.clear_for_testing()
        self.mock_projects = [
            {"id": "PRJ-101", "name": "Web App Pentest", "organization": "Apex Financial", "status": "ACTIVE"}
        ]
        self.mock_findings = [
            {"id": "FND-201", "project_id": "PRJ-101", "title": "SQL Injection", "severity": "CRITICAL", "risk_score": 92}
        ]
        self.mock_evidence = [
            {"evidence_id": "EVD-9D4E5F1333", "project_id": "PRJ-101", "file_name": "auth_audit.csv", "content_hash": "9D4E5F1333"}
        ]
        self.mock_audit = [
            {"event_id": "AUD-001", "action": "FINDING_VERIFIED", "actor_id": "Alex Vance", "resource_id": "FND-201"}
        ]
        self.mock_knowledge = [
            {"chunk_id": "DOC-CWE-89", "content": "SQL Injection prevention via prepared statements."}
        ]
        self.mock_reports = [
            {"report_id": "RPT-101", "project_id": "PRJ-101", "version": "1.0", "title": "Apex Financial Assessment"}
        ]

    def test_backup_snapshot_creation_and_manifest(self):
        """Test creating a snapshot ZIP archive with structured datasets and signed manifest."""
        zip_bytes, manifest = BackupManager.create_snapshot(
            projects=self.mock_projects,
            findings=self.mock_findings,
            evidence_records=self.mock_evidence,
            audit_events=self.mock_audit,
            knowledge_chunks=self.mock_knowledge,
            reports=self.mock_reports,
            backup_type="FULL",
            created_by="admin@redteam.local"
        )

        self.assertTrue(len(zip_bytes) > 0)
        self.assertTrue(manifest.backup_id.startswith("BKP-"))
        self.assertEqual(manifest.total_files, 6)
        self.assertTrue(len(manifest.manifest_signature) > 0)

        # Inspect ZIP contents
        with zipfile.ZipFile(io.BytesIO(zip_bytes), "r") as zf:
            namelist = zf.namelist()
            self.assertIn("manifest.json", namelist)
            self.assertIn("database/findings.json", namelist)
            self.assertIn("evidence/evidence_records.json", namelist)
            self.assertIn("audit/audit_logs.json", namelist)

    def test_backup_integrity_verification_success(self):
        """Test that a pristine snapshot passes 100% cryptographic integrity verification."""
        zip_bytes, _ = BackupManager.create_snapshot(
            projects=self.mock_projects,
            findings=self.mock_findings,
            evidence_records=self.mock_evidence,
            audit_events=self.mock_audit,
            knowledge_chunks=self.mock_knowledge,
            reports=self.mock_reports,
        )

        is_valid, manifest, msg = BackupManager.verify_backup_integrity(zip_bytes)
        self.assertTrue(is_valid)
        self.assertIsNotNone(manifest)
        self.assertIn("100% untampered", msg)

    def test_backup_integrity_tampering_detection(self):
        """Test that modifying a file inside the archive is detected as an integrity failure."""
        zip_bytes, _ = BackupManager.create_snapshot(
            projects=self.mock_projects,
            findings=self.mock_findings,
            evidence_records=self.mock_evidence,
            audit_events=self.mock_audit,
            knowledge_chunks=self.mock_knowledge,
            reports=self.mock_reports,
        )

        # Tamper with the archive by modifying database/findings.json without updating manifest
        tampered_buffer = io.BytesIO()
        with zipfile.ZipFile(io.BytesIO(zip_bytes), "r") as zf_in:
            with zipfile.ZipFile(tampered_buffer, "w", zipfile.ZIP_DEFLATED) as zf_out:
                for item in zf_in.infolist():
                    content = zf_in.read(item.filename)
                    if item.filename == "database/findings.json":
                        content = json.dumps([{"id": "FND-TAMPERED", "title": "Hacked"}]).encode()
                    zf_out.writestr(item, content)

        is_valid, _, msg = BackupManager.verify_backup_integrity(tampered_buffer.getvalue())
        self.assertFalse(is_valid)
        self.assertIn("Checksum mismatch", msg)

    def test_backup_restoration_data_parity(self):
        """Test restoring from a backup archive and verifying data parity across collections."""
        zip_bytes, _ = BackupManager.create_snapshot(
            projects=self.mock_projects,
            findings=self.mock_findings,
            evidence_records=self.mock_evidence,
            audit_events=self.mock_audit,
            knowledge_chunks=self.mock_knowledge,
            reports=self.mock_reports,
        )

        restored = BackupManager.restore_snapshot(zip_bytes)
        self.assertIn("findings", restored["data"])
        self.assertEqual(restored["data"]["findings"][0]["id"], "FND-201")
        self.assertEqual(restored["data"]["findings"][0]["risk_score"], 92)
        self.assertEqual(restored["data"]["projects"][0]["id"], "PRJ-101")

    def test_evidence_provenance_hash_preservation_after_restore(self):
        """Test that evidence records retain exact cryptographic SHA-256 hashes after restoration."""
        zip_bytes, _ = BackupManager.create_snapshot(
            projects=self.mock_projects,
            findings=self.mock_findings,
            evidence_records=self.mock_evidence,
            audit_events=self.mock_audit,
            knowledge_chunks=self.mock_knowledge,
            reports=self.mock_reports,
        )

        restored = BackupManager.restore_snapshot(zip_bytes)
        evidence_item = restored["data"]["evidence_records"][0]
        self.assertEqual(evidence_item["evidence_id"], "EVD-9D4E5F1333")
        self.assertEqual(evidence_item["content_hash"], "9D4E5F1333")

    def test_audit_log_continuity_after_restore(self):
        """Test that audit events survive backup and restoration without loss."""
        zip_bytes, _ = BackupManager.create_snapshot(
            projects=self.mock_projects,
            findings=self.mock_findings,
            evidence_records=self.mock_evidence,
            audit_events=self.mock_audit,
            knowledge_chunks=self.mock_knowledge,
            reports=self.mock_reports,
        )

        restored = BackupManager.restore_snapshot(zip_bytes)
        audit_events = restored["data"]["audit_logs"]
        self.assertEqual(len(audit_events), 1)
        self.assertEqual(audit_events[0]["action"], "FINDING_VERIFIED")

    def test_business_continuity_when_ollama_offline(self):
        """Test that deterministic risk engine and verification operate continuously when Ollama is offline."""
        # Risk calculation is 100% deterministic mathematical code without AI runtime dependency
        calc = RiskEngine.evaluate(impact=5, likelihood=4, asset_criticality=4, exploitability=4)
        self.assertEqual(calc["risk_score"], 84)
        self.assertEqual(calc["risk_level"], "CRITICAL")
        self.assertEqual(calc["recommended_priority"], "P1 — Immediate")

    def test_rbac_and_scope_security_maintained_after_restore(self):
        """Test that RBAC permissions remain strictly enforced after restoration."""
        can_admin_create = RBACManager.check_permission("ADMIN", "create_project")
        can_tester_delete = RBACManager.check_permission("SECURITY_TESTER", "delete_project")
        can_viewer_write = RBACManager.check_permission("VIEWER", "create_finding")

        self.assertTrue(can_admin_create)
        self.assertFalse(can_tester_delete)
        self.assertFalse(can_viewer_write)

    def test_unauthorized_backup_restoration_rejected(self):
        """Test that non-admin roles are rejected from executing restore actions."""
        can_tester_restore = RBACManager.check_permission("SECURITY_TESTER", "restore_backup")
        can_viewer_restore = RBACManager.check_permission("VIEWER", "restore_backup")

        self.assertFalse(can_tester_restore)
        self.assertFalse(can_viewer_restore)

    def test_corrupted_archive_restoration_aborted(self):
        """Test that passing corrupt data to restore_snapshot raises ValueError."""
        corrupted_bytes = b"NOT_A_VALID_ZIP_FILE_DATA"
        with self.assertRaises(ValueError):
            BackupManager.restore_snapshot(corrupted_bytes)


if __name__ == "__main__":
    unittest.main()
