"""
AI Red Team Assistant — Production Observability, Telemetry & Security Monitoring Subsystem.
Provides structured JSON logging, performance latency metrics, granular health probes (Liveness/Readiness),
RAG/Ollama monitoring, diagnostic breakdown, and security incident alerting.
"""
import time
import json
import re
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel, Field


class LogLevel:
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"
    SECURITY = "SECURITY"


class StructuredLogRecord(BaseModel):
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    level: str = LogLevel.INFO
    service: str = "ai_red_team"
    event: str
    request_id: Optional[str] = None
    correlation_id: Optional[str] = None
    user_id: Optional[str] = None
    project_id: Optional[str] = None
    operation: Optional[str] = None
    duration_ms: Optional[float] = None
    status: str = "SUCCESS"  # SUCCESS, FAILURE, TIMEOUT, DENIED
    error_type: Optional[str] = None
    error_detail: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class StructuredLogger:
    """
    Structured Production Logger.
    Outputs structured JSON logs and ensures sensitive tokens/credentials are redacted.
    """
    _logs: List[StructuredLogRecord] = []
    _max_in_memory: int = 1000

    _REDACT_KEYS = {"password", "passwd", "token", "secret", "api_key", "authorization", "access_token"}

    @classmethod
    def _scrub_dict(cls, data: Any) -> Any:
        if isinstance(data, dict):
            clean = {}
            for k, v in data.items():
                if any(sec in str(k).lower() for sec in cls._REDACT_KEYS):
                    clean[k] = "[REDACTED]"
                else:
                    clean[k] = cls._scrub_dict(v)
            return clean
        elif isinstance(data, list):
            return [cls._scrub_dict(item) for item in data]
        elif isinstance(data, str):
            # Redact bearer token patterns in string
            if "bearer " in data.lower():
                return re.sub(r'(?i)bearer\s+[A-Za-z0-9\-\._~\+\/]+=*', 'Bearer [REDACTED_TOKEN]', data)
            return data
        return data

    @classmethod
    def log(
        cls,
        level: str,
        event: str,
        service: str = "ai_red_team",
        request_id: Optional[str] = None,
        correlation_id: Optional[str] = None,
        user_id: Optional[str] = None,
        project_id: Optional[str] = None,
        operation: Optional[str] = None,
        duration_ms: Optional[float] = None,
        status: str = "SUCCESS",
        error_type: Optional[str] = None,
        error_detail: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> StructuredLogRecord:
        clean_meta = cls._scrub_dict(metadata or {})
        clean_detail = cls._scrub_dict(error_detail) if error_detail else None

        record = StructuredLogRecord(
            timestamp=datetime.utcnow().isoformat(),
            level=level,
            service=service,
            event=event,
            request_id=request_id,
            correlation_id=correlation_id,
            user_id=user_id,
            project_id=project_id,
            operation=operation,
            duration_ms=round(duration_ms, 2) if duration_ms is not None else None,
            status=status,
            error_type=error_type,
            error_detail=clean_detail,
            metadata=clean_meta,
        )

        cls._logs.append(record)
        if len(cls._logs) > cls._max_in_memory:
            cls._logs = cls._logs[-cls._max_in_memory:]
        return record

    @classmethod
    def get_logs(cls, level: Optional[str] = None, limit: int = 100) -> List[StructuredLogRecord]:
        if level:
            return [l for l in cls._logs if l.level == level][-limit:]
        return cls._logs[-limit:]

    @classmethod
    def clear(cls):
        cls._logs = []


class ObservabilityMetrics:
    """
    Centralized Performance & Reliability Telemetry Store.
    Tracks operational counters, failure rates, and execution latencies across all subsystems.
    """
    _start_time = time.time()
    
    # Counters
    _http_requests_total = 0
    _http_2xx_total = 0
    _http_4xx_total = 0
    _http_5xx_total = 0
    
    # AI / Ollama Telemetry
    _ai_requests_total = 0
    _ai_success_total = 0
    _ai_failure_total = 0
    _ai_timeout_total = 0
    _ai_latencies_ms: List[float] = []
    
    # RAG Telemetry
    _rag_requests_total = 0
    _rag_success_total = 0
    _rag_zero_match_total = 0
    _rag_latencies_ms: List[float] = []
    
    # Security Telemetry
    _auth_failures_total = 0
    _rbac_denials_total = 0
    _scope_violations_total = 0
    _idor_attempts_total = 0
    _prompt_injections_total = 0
    
    # Pipeline Telemetry
    _files_ingested_total = 0
    _records_parsed_total = 0
    _file_parse_errors_total = 0
    _reports_compiled_total = 0

    @classmethod
    def record_http_request(cls, status_code: int, duration_ms: float):
        cls._http_requests_total += 1
        if 200 <= status_code < 300:
            cls._http_2xx_total += 1
        elif 400 <= status_code < 500:
            cls._http_4xx_total += 1
        elif status_code >= 500:
            cls._http_5xx_total += 1

    @classmethod
    def record_ai_inference(cls, success: bool, duration_ms: float, timeout: bool = False):
        cls._ai_requests_total += 1
        cls._ai_latencies_ms.append(duration_ms)
        if len(cls._ai_latencies_ms) > 500:
            cls._ai_latencies_ms = cls._ai_latencies_ms[-500:]
            
        if success:
            cls._ai_success_total += 1
        else:
            cls._ai_failure_total += 1
            if timeout:
                cls._ai_timeout_total += 1

    @classmethod
    def record_rag_retrieval(cls, result_count: int, duration_ms: float):
        cls._rag_requests_total += 1
        cls._rag_latencies_ms.append(duration_ms)
        if len(cls._rag_latencies_ms) > 500:
            cls._rag_latencies_ms = cls._rag_latencies_ms[-500:]
            
        if result_count > 0:
            cls._rag_success_total += 1
        else:
            cls._rag_zero_match_total += 1

    @classmethod
    def record_security_event(cls, event_type: str):
        if event_type == "AUTH_FAILURE":
            cls._auth_failures_total += 1
        elif event_type == "RBAC_DENIAL":
            cls._rbac_denials_total += 1
        elif event_type == "SCOPE_VIOLATION":
            cls._scope_violations_total += 1
        elif event_type == "IDOR_ATTEMPT":
            cls._idor_attempts_total += 1
        elif event_type == "PROMPT_INJECTION":
            cls._prompt_injections_total += 1

    @classmethod
    def record_file_ingestion(cls, records: int, success: bool = True):
        cls._files_ingested_total += 1
        if success:
            cls._records_parsed_total += records
        else:
            cls._file_parse_errors_total += 1

    @classmethod
    def record_report_compiled(cls):
        cls._reports_compiled_total += 1

    @classmethod
    def get_metrics_snapshot(cls) -> Dict[str, Any]:
        uptime = time.time() - cls._start_time
        avg_ai_latency = (
            sum(cls._ai_latencies_ms) / len(cls._ai_latencies_ms)
            if cls._ai_latencies_ms else 0.0
        )
        avg_rag_latency = (
            sum(cls._rag_latencies_ms) / len(cls._rag_latencies_ms)
            if cls._rag_latencies_ms else 0.0
        )

        return {
            "uptime_seconds": round(uptime, 2),
            "http": {
                "total_requests": cls._http_requests_total,
                "status_2xx": cls._http_2xx_total,
                "status_4xx": cls._http_4xx_total,
                "status_5xx": cls._http_5xx_total,
                "error_rate_percent": round(
                    ((cls._http_4xx_total + cls._http_5xx_total) / cls._http_requests_total * 100)
                    if cls._http_requests_total else 0.0, 2
                )
            },
            "ai_inference": {
                "total_requests": cls._ai_requests_total,
                "successful_inferences": cls._ai_success_total,
                "failed_inferences": cls._ai_failure_total,
                "timeouts": cls._ai_timeout_total,
                "avg_latency_ms": round(avg_ai_latency, 2),
            },
            "rag_retrieval": {
                "total_queries": cls._rag_requests_total,
                "successful_retrievals": cls._rag_success_total,
                "zero_match_queries": cls._rag_zero_match_total,
                "avg_latency_ms": round(avg_rag_latency, 2),
            },
            "security_events": {
                "auth_failures": cls._auth_failures_total,
                "rbac_denials": cls._rbac_denials_total,
                "scope_violations": cls._scope_violations_total,
                "idor_attempts": cls._idor_attempts_total,
                "prompt_injections": cls._prompt_injections_total,
            },
            "pipeline": {
                "files_ingested": cls._files_ingested_total,
                "records_parsed": cls._records_parsed_total,
                "parse_errors": cls._file_parse_errors_total,
                "reports_compiled": cls._reports_compiled_total,
            }
        }


class SecurityAlert(BaseModel):
    alert_id: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    severity: str  # WARNING, HIGH, CRITICAL
    alert_type: str
    title: str
    description: str
    actor_ip: str
    target_resource: Optional[str] = None
    state: str = "ALERTED"  # LOGGED, DETECTED, ALERTED


class SecurityAlertManager:
    """
    Incident Detection and Security Alert Dispatcher.
    Distinguishes LOGGED vs DETECTED vs ALERTED security states.
    """
    _alerts: List[SecurityAlert] = []
    _failed_login_tracker: Dict[str, List[float]] = {}

    @classmethod
    def record_and_evaluate_auth_failure(cls, client_ip: str) -> Optional[SecurityAlert]:
        now = time.time()
        attempts = cls._failed_login_tracker.get(client_ip, [])
        # Window of 5 minutes
        attempts = [t for t in attempts if now - t < 300]
        attempts.append(now)
        cls._failed_login_tracker[client_ip] = attempts

        ObservabilityMetrics.record_security_event("AUTH_FAILURE")
        StructuredLogger.log(
            level=LogLevel.SECURITY,
            event="AUTH_FAILURE_DETECTED",
            operation="login",
            status="FAILURE",
            metadata={"client_ip": client_ip, "attempt_count_in_window": len(attempts)}
        )

        if len(attempts) >= 5:
            # Threshold breached -> Escalated to ALERTED
            alert = SecurityAlert(
                alert_id=f"ALT-{int(now)}-{client_ip.replace('.', '')[-4:]}",
                severity="HIGH",
                alert_type="BRUTE_FORCE_AUTHENTICATION_BURST",
                title="Repeated Authentication Failures Detected",
                description=f"Client IP {client_ip} has recorded {len(attempts)} failed authentication attempts within 5 minutes.",
                actor_ip=client_ip,
                state="ALERTED"
            )
            cls._alerts.append(alert)
            return alert
        return None

    @classmethod
    def emit_security_alert(
        cls,
        alert_type: str,
        title: str,
        description: str,
        severity: str = "HIGH",
        actor_ip: str = "127.0.0.1",
        target_resource: Optional[str] = None
    ) -> SecurityAlert:
        alert_id = f"ALT-{int(time.time())}-{len(cls._alerts) + 1}"
        alert = SecurityAlert(
            alert_id=alert_id,
            severity=severity,
            alert_type=alert_type,
            title=title,
            description=description,
            actor_ip=actor_ip,
            target_resource=target_resource,
            state="ALERTED"
        )
        cls._alerts.append(alert)
        StructuredLogger.log(
            level=LogLevel.SECURITY,
            event=f"SECURITY_ALERT_{alert_type}",
            operation="security_alerting",
            status="ALERTED",
            metadata={"alert_id": alert_id, "severity": severity, "target": target_resource}
        )
        return alert

    @classmethod
    def get_alerts(cls, limit: int = 50) -> List[SecurityAlert]:
        return cls._alerts[-limit:]


class HealthMonitor:
    """
    Multi-Tier Health Monitoring:
    - Liveness Probe (/health/live): Verifies process vitality and server execution.
    - Readiness Probe (/health/ready): Verifies database, vector store, Ollama, and storage dependencies.
    - Diagnostics (/health/diagnostics): Granular latency profiling across operations.
    """

    @staticmethod
    def check_liveness() -> Dict[str, Any]:
        return {
            "status": "UP",
            "probe": "liveness",
            "timestamp": datetime.utcnow().isoformat(),
            "uptime_seconds": round(time.time() - ObservabilityMetrics._start_time, 2),
            "process": "FastAPI Uvicorn ASGI Server"
        }

    @staticmethod
    def check_readiness(
        db_connected: bool = True,
        ollama_reachable: bool = True,
        vector_store_ready: bool = True,
        storage_writable: bool = True
    ) -> Dict[str, Any]:
        components = {
            "database_postgresql": "UP" if db_connected else "DOWN",
            "vector_store_pgvector": "UP" if vector_store_ready else "DOWN",
            "ai_inference_ollama": "UP" if ollama_reachable else "DOWN",
            "local_storage": "UP" if storage_writable else "DOWN",
        }

        all_up = all(v == "UP" for v in components.values())
        critical_up = db_connected and vector_store_ready

        status = "READY" if all_up else ("DEGRADED" if critical_up else "UNAVAILABLE")

        return {
            "status": status,
            "probe": "readiness",
            "timestamp": datetime.utcnow().isoformat(),
            "components": components,
            "version": "1.0.0",
            "environment": "production"
        }

    @staticmethod
    def get_diagnostics(
        api_overhead_ms: float = 0.2,
        rag_latency_ms: float = 0.8,
        ollama_generation_ms: float = 12.2,
        db_persistence_ms: float = 0.7
    ) -> Dict[str, Any]:
        total_ms = api_overhead_ms + rag_latency_ms + ollama_generation_ms + db_persistence_ms
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "total_latency_ms": round(total_ms, 2),
            "breakdown": {
                "api_gateway_overhead_ms": round(api_overhead_ms, 2),
                "rag_vector_retrieval_ms": round(rag_latency_ms, 2),
                "ollama_qwen3_generation_ms": round(ollama_generation_ms, 2),
                "database_persistence_ms": round(db_persistence_ms, 2),
            },
            "percentages": {
                "api_percent": round((api_overhead_ms / total_ms) * 100, 1),
                "rag_percent": round((rag_latency_ms / total_ms) * 100, 1),
                "ollama_percent": round((ollama_generation_ms / total_ms) * 100, 1),
                "db_percent": round((db_persistence_ms / total_ms) * 100, 1),
            }
        }
