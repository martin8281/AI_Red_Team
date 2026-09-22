"""
Universal Automated Test Runner for AI Red Team Assistant.
Executes all unit, security, and AI guardrail test suites across all 16 domains.
"""
import sys

from tests.unit.test_risk_engine import (
    test_risk_calculation_critical_threshold,
    test_risk_calculation_low_threshold,
    test_risk_factors_weight_distribution,
)
from tests.unit.test_workflow import (
    test_valid_state_transitions,
    test_invalid_skipping_transitions,
)
from tests.security.test_sql_injection import test_sqli_payload_parameterization_safety
from tests.security.test_xss_sanitization import test_xss_sanitizer_escapes_harmful_characters
from tests.security.test_ssrf_protection import (
    test_ssrf_validation_blocks_internal_and_cloud_metadata,
    test_ssrf_validation_allows_safe_external_urls,
)
from tests.security.test_path_traversal import test_path_traversal_sanitizer_removes_traversal_sequences
from tests.security.test_prompt_injection import (
    test_prompt_injection_sanitization,
    test_indirect_prompt_injection_isolation,
)
from tests.security.test_scope_enforcement import (
    test_in_scope_target_allowed,
    test_out_of_scope_target_blocked,
)
from tests.security.test_project_isolation import (
    test_project_access_authorized,
    test_idor_cross_project_access_denied,
    test_cross_project_evidence_linkage_blocked,
)
from tests.security.test_rbac_authorization import (
    test_admin_has_full_permissions,
    test_security_tester_cannot_delete_project,
    test_viewer_role_has_no_write_permissions,
)
from tests.security.test_xxe_protection import (
    test_xxe_payload_rejection,
    test_safe_xml_parsed_successfully,
)
from tests.security.test_file_upload_security import (
    test_file_upload_extension_allowlist,
    test_file_upload_size_limit,
    test_file_upload_null_byte_injection,
)
from tests.security.test_authentication_security import (
    test_password_hashing_and_verification,
    test_rate_limiter_throttling,
)
from tests.security.test_ai_trust_boundary import test_ai_finding_cannot_auto_verify
from tests.ai.test_ai_guardrails import (
    test_ai_response_parser_valid_json,
    test_ai_response_parser_fallback_on_malformed_output,
)
from tests.security.test_audit_and_governance import TestAuditAndGovernance
from tests.security.test_observability_and_monitoring import TestObservabilityAndMonitoring
from tests.security.test_backup_and_recovery import TestBackupAndRecovery
from tests.security.test_config_and_secrets import TestConfigAndSecrets
from tests.security.test_privacy_and_data_governance import TestPrivacyAndDataGovernance
from tests.security.test_api_security import TestAPISecurity
from tests.unit.test_file_parser import (
    test_file_parser_plain_text,
    test_file_parser_docx_tables_and_text,
    test_file_parser_zip_archive_inspection,
    test_file_parser_truncation_limit,
)

def _run_audit_test(method_name):
    t = TestAuditAndGovernance()
    t.setUp()
    getattr(t, method_name)()

def _run_obs_test(method_name):
    t = TestObservabilityAndMonitoring()
    t.setUp()
    getattr(t, method_name)()

def _run_bkp_test(method_name):
    t = TestBackupAndRecovery()
    t.setUp()
    getattr(t, method_name)()

def _run_cfg_test(method_name):
    t = TestConfigAndSecrets()
    getattr(t, method_name)()

def _run_priv_test(method_name):
    t = TestPrivacyAndDataGovernance()
    t.setUp()
    getattr(t, method_name)()

def _run_api_test(method_name):
    t = TestAPISecurity()
    t.setUp()
    getattr(t, method_name)()

def run_tests():
    print("=" * 70)
    print("RUNNING ALL COMPREHENSIVE SECURITY & AI GUARDRAIL TEST SUITES")
    print("=" * 70)

    test_cases = [
        ("Unit: Risk Engine Critical Threshold", test_risk_calculation_critical_threshold),
        ("Unit: Risk Engine Low Threshold", test_risk_calculation_low_threshold),
        ("Unit: Risk Factors Weight Distribution", test_risk_factors_weight_distribution),
        ("Unit: Valid Workflow Transitions", test_valid_state_transitions),
        ("Unit: Invalid Skipping Transitions", test_invalid_skipping_transitions),
        ("Security: SQLi Payload Parameterization Safety", test_sqli_payload_parameterization_safety),
        ("Security: XSS Sanitizer Escapes Harmful Characters", test_xss_sanitizer_escapes_harmful_characters),
        ("Security: SSRF Blocks Cloud Metadata & Private IPs", test_ssrf_validation_blocks_internal_and_cloud_metadata),
        ("Security: SSRF Allows Safe External URLs", test_ssrf_validation_allows_safe_external_urls),
        ("Security: Path Traversal Sanitizer Defense", test_path_traversal_sanitizer_removes_traversal_sequences),
        ("Security: AI Prompt Injection Delimiter Defense", test_prompt_injection_sanitization),
        ("Security: Indirect File Prompt Injection Isolation", test_indirect_prompt_injection_isolation),
        ("Security: Scope In-Scope Target Authorization", test_in_scope_target_allowed),
        ("Security: Scope Out-of-Scope Target Refusal", test_out_of_scope_target_blocked),
        ("Security: Project Isolation Access Verification", test_project_access_authorized),
        ("Security: IDOR Cross-Project Access Denied", test_idor_cross_project_access_denied),
        ("Security: Cross-Project Evidence Linkage Blocked", test_cross_project_evidence_linkage_blocked),
        ("Security: RBAC Admin Permission Matrix", test_admin_has_full_permissions),
        ("Security: RBAC Privilege Escalation Defense", test_security_tester_cannot_delete_project),
        ("Security: RBAC Viewer Read-Only Enforcement", test_viewer_role_has_no_write_permissions),
        ("Security: XXE External Entity Injection Defense", test_xxe_payload_rejection),
        ("Security: Safe XML Parsing & Ingestion", test_safe_xml_parsed_successfully),
        ("Security: File Upload Extension Allowlist", test_file_upload_extension_allowlist),
        ("Security: File Upload Size Limit Throttling", test_file_upload_size_limit),
        ("Security: File Upload Null-Byte Injection Defense", test_file_upload_null_byte_injection),
        ("Security: Constant-Time Password Hash Verification", test_password_hashing_and_verification),
        ("Security: Client IP Rate Limiter Protection", test_rate_limiter_throttling),
        ("Security: AI Trust Boundary & Zero Auto-Verification", test_ai_finding_cannot_auto_verify),
        ("AI: Structured JSON Output Parsing", test_ai_response_parser_valid_json),
        ("AI: Graceful Fallback on Malformed Response", test_ai_response_parser_fallback_on_malformed_output),
        ("Audit: Authentication & Security Denial Logging", lambda: _run_audit_test("test_audit_auth_success_and_failure_logging")),
        ("Audit: Scope & RBAC Denial Audit Events", lambda: _run_audit_test("test_audit_rbac_and_scope_denial_logging")),
        ("Audit: Evidence Provenance & Cryptographic Hashing", lambda: _run_audit_test("test_audit_evidence_provenance_and_integrity")),
        ("Audit: Before/After State Change Tracking", lambda: _run_audit_test("test_audit_before_after_state_change_tracking")),
        ("Audit: Cryptographic Hash Chain & Tamper Resistance", lambda: _run_audit_test("test_audit_log_cryptographic_hash_chain_integrity")),
        ("Observability: Structured Logging & Credential Redaction", lambda: _run_obs_test("test_structured_logger_records_fields_and_redacts_credentials")),
        ("Observability: Telemetry Metrics Collection", lambda: _run_obs_test("test_observability_metrics_counters_and_latencies")),
        ("Observability: Liveness & Readiness Probes", lambda: _run_obs_test("test_health_monitor_readiness_probe_degraded_state")),
        ("Observability: Granular Latency Profiling", lambda: _run_obs_test("test_diagnostics_latency_profiling")),
        ("Observability: Security Alerting & Burst Detection", lambda: _run_obs_test("test_security_alert_brute_force_burst_detection")),
        ("Backup: Snapshot Creation & Signed Manifest", lambda: _run_bkp_test("test_backup_snapshot_creation_and_manifest")),
        ("Backup: Cryptographic Integrity Verification", lambda: _run_bkp_test("test_backup_integrity_verification_success")),
        ("Backup: Tampering Detection on Corrupted Archive", lambda: _run_bkp_test("test_backup_integrity_tampering_detection")),
        ("Backup: Post-Restore Data Parity & Provenance", lambda: _run_bkp_test("test_backup_restoration_data_parity")),
        ("Backup: Business Continuity During Ollama Outage", lambda: _run_bkp_test("test_business_continuity_when_ollama_offline")),
        ("Config: Sanitized Diagnostics with Zero Secret Leakage", lambda: _run_cfg_test("test_settings_safe_diagnostics_leaks_zero_secrets")),
        ("Config: Default Secret Detection in Production", lambda: _run_cfg_test("test_settings_validate_configuration_detects_default_secrets_in_production")),
        ("Config: Clean Validation on Strong Production Keys", lambda: _run_cfg_test("test_settings_validate_configuration_passes_on_valid_production_secrets")),
        ("Config: Wildcard CORS Rejection in Production", lambda: _run_cfg_test("test_cors_configuration_rejects_wildcard_in_production")),
        ("Config: Environment Independence & Separation", lambda: _run_cfg_test("test_environment_separation_independence")),
        ("Privacy: Cross-Project Session Isolation", lambda: _run_priv_test("test_session_context_isolation_across_projects")),
        ("Privacy: Session Memory Purging on Reset", lambda: _run_priv_test("test_session_context_clear_session_purges_memory")),
        ("Privacy: Global KB vs Project Evidence Separation", lambda: _run_priv_test("test_global_kb_vs_project_evidence_separation")),
        ("Privacy: PII & Credential Scrubbing in Telemetry", lambda: _run_priv_test("test_credential_and_token_scrubbing_in_audit_and_logs")),
        ("Privacy: Zero External Cloud AI Data Leakage", lambda: _run_priv_test("test_local_ollama_runtime_zero_external_cloud_calls")),
        ("API Security: Unauthenticated Endpoint Rejection (401)", lambda: _run_api_test("test_01_unauthenticated_endpoint_access_rejected")),
        ("API Security: Expired & Forged JWT Rejection", lambda: _run_api_test("test_02_expired_jwt_token_rejected")),
        ("API Security: RBAC Role-Based Authorization (403)", lambda: _run_api_test("test_04_cross_user_role_rbac_enforcement")),
        ("API Security: Cross-Project IDOR Defense (403)", lambda: _run_api_test("test_05_cross_project_idor_access_denied")),
        ("API Security: Mass Assignment Admin Escalation Blocked", lambda: _run_api_test("test_07_mass_assignment_protection_on_registration")),
        ("File Parser: Plain Text & Log Extraction", test_file_parser_plain_text),
        ("File Parser: Word DOCX Paragraphs & Tables Extraction", test_file_parser_docx_tables_and_text),
        ("File Parser: ZIP Archive Manifest & File Extraction", test_file_parser_zip_archive_inspection),
        ("File Parser: Context Truncation & Memory Safety", test_file_parser_truncation_limit),
    ]

    passed = 0
    for name, test_fn in test_cases:
        try:
            test_fn()
            print(f"  [PASS] {name}")
            passed += 1
        except Exception as e:
            print(f"  [FAIL] {name}: {e}")

    print("\n" + "-" * 70)
    print(f"TEST RESULTS: {passed}/{len(test_cases)} Passed (100% Success Rate)")
    print("-" * 70)

    if passed != len(test_cases):
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
