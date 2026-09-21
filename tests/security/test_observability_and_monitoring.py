"""
AI Red Team Assistant — Check 17 Observability, Health Monitoring & Security Alerting Test Suite.
Validates structured logging, latency metrics, liveness/readiness probes, diagnostic breakdown,
incident alerting, and error visibility.
"""
import unittest
import time
from backend.core.observability import (
    StructuredLogger,
    LogLevel,
    ObservabilityMetrics,
    SecurityAlertManager,
    HealthMonitor
)


class TestObservabilityAndMonitoring(unittest.TestCase):
    def setUp(self):
        StructuredLogger.clear()

    def test_structured_logger_records_fields_and_redacts_credentials(self):
        """Test structured JSON logging and sensitive credential/token scrubbing."""
        record = StructuredLogger.log(
            level=LogLevel.SECURITY,
            event="USER_AUTH_ATTEMPT",
            service="auth_service",
            request_id="REQ-123456",
            correlation_id="CORR-ABCDEF",
            user_id="USR-001",
            project_id="PRJ-101",
            operation="login",
            duration_ms=45.67,
            status="SUCCESS",
            metadata={
                "username": "tester@redteam.local",
                "password": "SuperSecretPassword2026",
                "api_key": "sk-secret-key-12345",
                "auth_header": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token",
                "safe_field": "public_data"
            }
        )

        self.assertEqual(record.event, "USER_AUTH_ATTEMPT")
        self.assertEqual(record.request_id, "REQ-123456")
        self.assertEqual(record.duration_ms, 45.67)
        self.assertEqual(record.metadata["password"], "[REDACTED]")
        self.assertEqual(record.metadata["api_key"], "[REDACTED]")
        self.assertEqual(record.metadata["safe_field"], "public_data")
        self.assertNotIn("SuperSecretPassword2026", str(record.metadata))

    def test_observability_metrics_counters_and_latencies(self):
        """Test operational telemetry metrics collection across HTTP, AI, and RAG."""
        # Record HTTP requests
        ObservabilityMetrics.record_http_request(200, 15.5)
        ObservabilityMetrics.record_http_request(403, 12.0)
        ObservabilityMetrics.record_http_request(500, 45.0)

        # Record AI inferences
        ObservabilityMetrics.record_ai_inference(success=True, duration_ms=1250.0)
        ObservabilityMetrics.record_ai_inference(success=False, duration_ms=5000.0, timeout=True)

        # Record RAG retrievals
        ObservabilityMetrics.record_rag_retrieval(result_count=3, duration_ms=8.5)
        ObservabilityMetrics.record_rag_retrieval(result_count=0, duration_ms=4.2)

        snapshot = ObservabilityMetrics.get_metrics_snapshot()
        self.assertTrue(snapshot["http"]["total_requests"] >= 3)
        self.assertTrue(snapshot["ai_inference"]["total_requests"] >= 2)
        self.assertTrue(snapshot["ai_inference"]["timeouts"] >= 1)
        self.assertTrue(snapshot["rag_retrieval"]["total_queries"] >= 2)
        self.assertTrue(snapshot["rag_retrieval"]["zero_match_queries"] >= 1)

    def test_health_monitor_liveness_probe(self):
        """Test Liveness probe (/health/live) returns UP with uptime."""
        live = HealthMonitor.check_liveness()
        self.assertEqual(live["status"], "UP")
        self.assertEqual(live["probe"], "liveness")
        self.assertIn("uptime_seconds", live)
        self.assertIn("timestamp", live)

    def test_health_monitor_readiness_probe_all_up(self):
        """Test Readiness probe (/health/ready) returns READY when all components are UP."""
        ready = HealthMonitor.check_readiness(
            db_connected=True,
            ollama_reachable=True,
            vector_store_ready=True,
            storage_writable=True
        )
        self.assertEqual(ready["status"], "READY")
        self.assertEqual(ready["probe"], "readiness")
        self.assertEqual(ready["components"]["database_postgresql"], "UP")
        self.assertEqual(ready["components"]["ai_inference_ollama"], "UP")
        self.assertEqual(ready["components"]["vector_store_pgvector"], "UP")

    def test_health_monitor_readiness_probe_degraded_state(self):
        """Test Readiness probe reports DEGRADED when Ollama is DOWN but DB is UP."""
        degraded = HealthMonitor.check_readiness(
            db_connected=True,
            ollama_reachable=False,
            vector_store_ready=True,
            storage_writable=True
        )
        self.assertEqual(degraded["status"], "DEGRADED")
        self.assertEqual(degraded["components"]["ai_inference_ollama"], "DOWN")
        self.assertEqual(degraded["components"]["database_postgresql"], "UP")

        # When DB is down, status must be UNAVAILABLE
        unavailable = HealthMonitor.check_readiness(
            db_connected=False,
            ollama_reachable=True,
            vector_store_ready=False,
            storage_writable=True
        )
        self.assertEqual(unavailable["status"], "UNAVAILABLE")

    def test_diagnostics_latency_profiling(self):
        """Test granular execution latency breakdown across operations."""
        diag = HealthMonitor.get_diagnostics(
            api_overhead_ms=0.5,
            rag_latency_ms=1.2,
            ollama_generation_ms=14.0,
            db_persistence_ms=0.8
        )
        self.assertEqual(diag["total_latency_ms"], 16.5)
        self.assertEqual(diag["breakdown"]["api_gateway_overhead_ms"], 0.5)
        self.assertEqual(diag["breakdown"]["rag_vector_retrieval_ms"], 1.2)
        self.assertEqual(diag["breakdown"]["ollama_qwen3_generation_ms"], 14.0)
        self.assertTrue(diag["percentages"]["ollama_percent"] > 80.0)

    def test_security_alert_brute_force_burst_detection(self):
        """Test that burst authentication failures trigger an operational security alert."""
        client_ip = "192.168.1.250"
        alert = None
        for _ in range(5):
            alert = SecurityAlertManager.record_and_evaluate_auth_failure(client_ip)

        self.assertIsNotNone(alert)
        self.assertEqual(alert.alert_type, "BRUTE_FORCE_AUTHENTICATION_BURST")
        self.assertEqual(alert.severity, "HIGH")
        self.assertEqual(alert.state, "ALERTED")
        self.assertEqual(alert.actor_ip, client_ip)

    def test_security_alert_manager_arbitrary_alert_dispatch(self):
        """Test explicit security alert dispatch for IDOR and Prompt Injections."""
        alert = SecurityAlertManager.emit_security_alert(
            alert_type="IDOR_PROJECT_ACCESS_ATTEMPT",
            title="Unauthorized Cross-Project Access Attempt",
            description="User tester@redteam.local attempted to read PRJ-999 (Unauthorized project boundary).",
            severity="CRITICAL",
            actor_ip="10.0.0.15",
            target_resource="PRJ-999"
        )
        self.assertEqual(alert.alert_type, "IDOR_PROJECT_ACCESS_ATTEMPT")
        self.assertEqual(alert.severity, "CRITICAL")
        self.assertEqual(alert.state, "ALERTED")

        alerts = SecurityAlertManager.get_alerts()
        self.assertTrue(len(alerts) >= 1)

    def test_observability_failure_scenarios_and_error_capture(self):
        """Test unhandled exception recording in structured logger with error details."""
        try:
            raise ValueError("Simulated database timeout during query execution")
        except Exception as e:
            record = StructuredLogger.log(
                level=LogLevel.ERROR,
                event="DATABASE_QUERY_EXCEPTION",
                service="database_pool",
                operation="SELECT findings",
                status="EXCEPTION",
                error_type=type(e).__name__,
                error_detail=str(e),
                metadata={"table": "findings"}
            )

        self.assertEqual(record.level, "ERROR")
        self.assertEqual(record.error_type, "ValueError")
        self.assertIn("Simulated database timeout", record.error_detail)

    def test_structured_log_retrieval_and_filtering(self):
        """Test querying structured logs by level and limit."""
        StructuredLogger.log(level=LogLevel.INFO, event="SYSTEM_INIT", operation="startup")
        StructuredLogger.log(level=LogLevel.ERROR, event="PARSE_ERROR", operation="ingestion")
        StructuredLogger.log(level=LogLevel.SECURITY, event="UNAUTHORIZED_ACCESS", operation="rbac")

        error_logs = StructuredLogger.get_logs(level=LogLevel.ERROR)
        self.assertEqual(len(error_logs), 1)
        self.assertEqual(error_logs[0].event, "PARSE_ERROR")

        sec_logs = StructuredLogger.get_logs(level=LogLevel.SECURITY)
        self.assertEqual(len(sec_logs), 1)
        self.assertEqual(sec_logs[0].event, "UNAUTHORIZED_ACCESS")


if __name__ == "__main__":
    unittest.main()
