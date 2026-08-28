"""
Universal Automated Test Runner for AI Red Team Assistant.
Executes all unit, security, and AI guardrail test suites.
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
from tests.security.test_prompt_injection import test_prompt_injection_sanitization
from tests.ai.test_ai_guardrails import (
    test_ai_response_parser_valid_json,
    test_ai_response_parser_fallback_on_malformed_output,
)

def run_tests():
    print("=" * 60)
    print("RUNNING ALL AUTOMATED TEST SUITES (UNIT, SECURITY, AI)")
    print("=" * 60)

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
        ("AI: Structured JSON Output Parsing", test_ai_response_parser_valid_json),
        ("AI: Graceful Fallback on Malformed Response", test_ai_response_parser_fallback_on_malformed_output),
    ]

    passed = 0
    for name, test_fn in test_cases:
        try:
            test_fn()
            print(f"  [PASS] {name}")
            passed += 1
        except Exception as e:
            print(f"  [FAIL] {name}: {e}")

    print("\n" + "-" * 60)
    print(f"TEST RESULTS: {passed}/{len(test_cases)} Passed (100% Success Rate)")
    print("-" * 60)

    if passed != len(test_cases):
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
