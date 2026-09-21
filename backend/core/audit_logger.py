"""
AI Red Team Assistant — Centralized Audit Logging, Governance & Forensic Integrity Engine.
Provides tamper-resistant, append-only audit event recording, cryptographic hash chaining,
before/after state tracking, timeline reconstruction, and sensitive data redaction.
"""
import re
import json
import hashlib
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel, Field


class AuditSeverity:
    INFO = "INFO"
    NOTICE = "NOTICE"
    WARNING = "WARNING"
    SECURITY = "SECURITY"
    CRITICAL = "CRITICAL"


class AuditAction:
    # Authentication
    AUTH_LOGIN_SUCCESS = "AUTH_LOGIN_SUCCESS"
    AUTH_LOGIN_FAILURE = "AUTH_LOGIN_FAILURE"
    AUTH_LOGOUT = "AUTH_LOGOUT"
    AUTH_PASSWORD_CHANGE = "AUTH_PASSWORD_CHANGE"
    
    # Authorization & Governance
    AUTHZ_ACCESS_DENIED = "AUTHZ_ACCESS_DENIED"
    AUTHZ_RBAC_VIOLATION = "AUTHZ_RBAC_VIOLATION"
    AUTHZ_SCOPE_VIOLATION = "AUTHZ_SCOPE_VIOLATION"
    AUTHZ_IDOR_ATTEMPT = "AUTHZ_IDOR_ATTEMPT"
    
    # Project & Scope Management
    PROJECT_CREATED = "PROJECT_CREATED"
    PROJECT_UPDATED = "PROJECT_UPDATED"
    PROJECT_DELETED = "PROJECT_DELETED"
    SCOPE_TARGET_ADDED = "SCOPE_TARGET_ADDED"
    SCOPE_TARGET_REMOVED = "SCOPE_TARGET_REMOVED"
    SCOPE_MODIFIED = "SCOPE_MODIFIED"
    
    # Evidence Provenance & Lifecycle
    EVIDENCE_INGESTED = "EVIDENCE_INGESTED"
    EVIDENCE_VERIFIED = "EVIDENCE_VERIFIED"
    EVIDENCE_DELETED = "EVIDENCE_DELETED"
    EVIDENCE_ACCESSED = "EVIDENCE_ACCESSED"
    
    # Finding Lifecycle & HITL
    FINDING_CREATED = "FINDING_CREATED"
    FINDING_UPDATED = "FINDING_UPDATED"
    FINDING_SEVERITY_CHANGED = "FINDING_SEVERITY_CHANGED"
    FINDING_STATUS_CHANGED = "FINDING_STATUS_CHANGED"
    FINDING_VERIFIED = "FINDING_VERIFIED"
    FINDING_REJECTED = "FINDING_REJECTED"
    FALSE_POSITIVE_FLAGGED = "FALSE_POSITIVE_FLAGGED"
    REMEDIATION_UPDATED = "REMEDIATION_UPDATED"
    
    # Deterministic Risk
    RISK_CALCULATED = "RISK_CALCULATED"
    PORTFOLIO_RISK_AGGREGATED = "PORTFOLIO_RISK_AGGREGATED"
    
    # AI Decision Support
    AI_SESSION_CREATED = "AI_SESSION_CREATED"
    AI_ANALYSIS_REQUESTED = "AI_ANALYSIS_REQUESTED"
    AI_RAG_RETRIEVAL = "AI_RAG_RETRIEVAL"
    AI_FINDING_PROPOSED = "AI_FINDING_PROPOSED"
    AI_DECISION_GROUNDED = "AI_DECISION_GROUNDED"
    
    # Reporting
    REPORT_GENERATED = "REPORT_GENERATED"
    REPORT_EXPORTED = "REPORT_EXPORTED"
    REPORT_MODIFIED = "REPORT_MODIFIED"
    REPORT_FINALIZED = "REPORT_FINALIZED"
    
    # Admin
    ADMIN_CONFIG_MODIFIED = "ADMIN_CONFIG_MODIFIED"


class AuditEvent(BaseModel):
    event_id: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    actor_id: str = "SYSTEM"
    actor_role: str = "SYSTEM"
    action: str
    resource_type: str  # USER, PROJECT, SCOPE, EVIDENCE, FINDING, RISK, AI_SESSION, REPORT, SYSTEM
    resource_id: str
    project_id: Optional[str] = None
    target_id: Optional[str] = None
    result: str = "SUCCESS"  # SUCCESS, FAILURE, DENIED, WARNING
    severity: str = AuditSeverity.INFO
    reason: Optional[str] = None
    before_state: Optional[Dict[str, Any]] = None
    after_state: Optional[Dict[str, Any]] = None
    source_ip: str = "127.0.0.1"
    user_agent: str = "System"
    request_id: Optional[str] = None
    correlation_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    prev_event_hash: str = "GENESIS"
    event_hash: str = ""


class AuditLogger:
    """
    Centralized, append-only, tamper-resistant Audit Logger.
    Maintains a cryptographic SHA-256 hash chain of all audit events.
    Enforces sensitive data redaction and timeline reconstruction.
    """
    _events: List[AuditEvent] = []
    _last_hash: str = "0" * 64

    # Sensitive patterns to redact
    _REDACT_PATTERNS = [
        (re.compile(r'(?i)(password|passwd|pwd|secret|api_key|token|access_token|bearer)\s*[:=]\s*["\']?([^"\'\s,]+)', re.IGNORECASE), r'\1: [REDACTED]'),
        (re.compile(r'Bearer\s+[A-Za-z0-9\-\._~\+\/]+=*', re.IGNORECASE), r'Bearer [REDACTED_TOKEN]'),
    ]

    @classmethod
    def sanitize_metadata(cls, data: Any) -> Any:
        """Recursively scrubs passwords, tokens, and secrets from audit payloads."""
        if isinstance(data, dict):
            clean = {}
            for k, v in data.items():
                if any(sec in k.lower() for sec in ["password", "passwd", "token", "secret", "api_key", "authorization"]):
                    clean[k] = "[REDACTED]"
                else:
                    clean[k] = cls.sanitize_metadata(v)
            return clean
        elif isinstance(data, list):
            return [cls.sanitize_metadata(item) for item in data]
        elif isinstance(data, str):
            res = data
            for pat, repl in cls._REDACT_PATTERNS:
                res = pat.sub(repl, res)
            return res
        return data

    @classmethod
    def log_event(
        cls,
        action: str,
        resource_type: str,
        resource_id: str,
        actor_id: str = "SYSTEM",
        actor_role: str = "SYSTEM",
        project_id: Optional[str] = None,
        target_id: Optional[str] = None,
        result: str = "SUCCESS",
        severity: str = AuditSeverity.INFO,
        reason: Optional[str] = None,
        before_state: Optional[Dict[str, Any]] = None,
        after_state: Optional[Dict[str, Any]] = None,
        source_ip: str = "127.0.0.1",
        user_agent: str = "System",
        request_id: Optional[str] = None,
        correlation_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> AuditEvent:
        """
        Appends an immutable audit event to the cryptographically hashed audit chain.
        """
        now_ts = datetime.utcnow().isoformat()
        raw_meta = metadata or {}
        clean_meta = cls.sanitize_metadata(raw_meta)
        clean_before = cls.sanitize_metadata(before_state) if before_state else None
        clean_after = cls.sanitize_metadata(after_state) if after_state else None
        clean_reason = cls.sanitize_metadata(reason) if reason else None

        # Generate unique event identifier
        event_body = f"{now_ts}_{actor_id}_{action}_{resource_type}_{resource_id}_{cls._last_hash}"
        event_id = f"AUD-{hashlib.sha256(event_body.encode('utf-8')).hexdigest()[:12].upper()}"

        event = AuditEvent(
            event_id=event_id,
            timestamp=now_ts,
            actor_id=actor_id,
            actor_role=actor_role,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            project_id=project_id,
            target_id=target_id,
            result=result,
            severity=severity,
            reason=clean_reason,
            before_state=clean_before,
            after_state=clean_after,
            source_ip=source_ip,
            user_agent=user_agent,
            request_id=request_id,
            correlation_id=correlation_id,
            metadata=clean_meta,
            prev_event_hash=cls._last_hash
        )

        # Compute cryptographic hash for this event
        serialized = json.dumps(event.model_dump(exclude={"event_hash"}), sort_keys=True)
        current_hash = hashlib.sha256(serialized.encode("utf-8")).hexdigest()
        event.event_hash = current_hash

        # Update blockchain-style state
        cls._last_hash = current_hash
        cls._events.append(event)
        return event

    @classmethod
    def get_events(
        cls,
        project_id: Optional[str] = None,
        actor_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        action: Optional[str] = None,
        severity: Optional[str] = None,
        limit: int = 100
    ) -> List[AuditEvent]:
        """Queries filtered audit events with deterministic ordering."""
        results = cls._events
        if project_id:
            results = [e for e in results if e.project_id == project_id]
        if actor_id:
            results = [e for e in results if e.actor_id == actor_id]
        if resource_type:
            results = [e for e in results if e.resource_type == resource_type]
        if action:
            results = [e for e in results if e.action == action]
        if severity:
            results = [e for e in results if e.severity == severity]
        return results[-limit:]

    @classmethod
    def reconstruct_timeline(
        cls,
        project_id: Optional[str] = None,
        resource_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Reconstructs a sequential chronological investigation timeline for a project or finding.
        """
        events = cls._events
        if project_id:
            events = [e for e in events if e.project_id == project_id]
        if resource_id:
            events = [e for e in events if e.resource_id == resource_id or (e.metadata and e.metadata.get("finding_id") == resource_id)]

        timeline = []
        for e in sorted(events, key=lambda x: x.timestamp):
            timeline.append({
                "timestamp": e.timestamp,
                "actor": f"{e.actor_id} ({e.actor_role})",
                "action": e.action,
                "resource": f"{e.resource_type}:{e.resource_id}",
                "result": e.result,
                "severity": e.severity,
                "summary": e.reason or f"Action {e.action} on {e.resource_id}",
                "before": e.before_state,
                "after": e.after_state,
                "event_id": e.event_id,
                "hash": e.event_hash[:10]
            })
        return timeline

    @classmethod
    def verify_chain_integrity(cls) -> Tuple[bool, Optional[str]]:
        """
        Cryptographically validates the entire audit log hash chain to ensure zero tampering.
        """
        if not cls._events:
            return True, None

        expected_prev = "0" * 64
        for idx, event in enumerate(cls._events):
            if event.prev_event_hash != expected_prev:
                return False, f"Hash chain broken at event index {idx} ({event.event_id}): prev_hash mismatch."

            serialized = json.dumps(event.model_dump(exclude={"event_hash"}), sort_keys=True)
            recalculated = hashlib.sha256(serialized.encode("utf-8")).hexdigest()
            if event.event_hash != recalculated:
                return False, f"Data tampering detected at event index {idx} ({event.event_id}): content hash mismatch."

            expected_prev = event.event_hash

        return True, "Audit log hash chain verified: 100% untampered integrity."

    @classmethod
    def export_audit_trail(cls, project_id: Optional[str] = None, format_type: str = "json") -> str:
        """Exports full audit trail in JSON or CSV format."""
        events = cls.get_events(project_id=project_id, limit=1000)
        if format_type.lower() == "json":
            return json.dumps([e.model_dump() for e in events], indent=2)
        elif format_type.lower() == "csv":
            headers = ["event_id", "timestamp", "actor_id", "actor_role", "action", "resource_type", "resource_id", "project_id", "result", "severity", "reason", "event_hash"]
            rows = [",".join(headers)]
            for e in events:
                row = [
                    e.event_id,
                    e.timestamp,
                    e.actor_id,
                    e.actor_role,
                    e.action,
                    e.resource_type,
                    e.resource_id,
                    e.project_id or "N/A",
                    e.result,
                    e.severity,
                    f'"{e.reason or ""}"',
                    e.event_hash
                ]
                rows.append(",".join(row))
            return "\n".join(rows)
        return json.dumps([e.model_dump() for e in events])

    @classmethod
    def clear_for_testing(cls):
        """Utility for test suite resets."""
        cls._events = []
        cls._last_hash = "0" * 64
