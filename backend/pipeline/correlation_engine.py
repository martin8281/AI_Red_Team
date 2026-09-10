from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import hashlib


class LogRecord(BaseModel):
    evidence_id: str
    source_file: str
    timestamp: datetime
    log_type: str  # "auth", "firewall", "web_access", "syslog", "edr"
    src_ip: Optional[str] = None
    dest_ip: Optional[str] = None
    user: Optional[str] = None
    asset: str = "unknown"
    action: str  # "FAILED_LOGIN", "SUCCESS_LOGIN", "ALLOW", "DENY", "HTTP_500", "SUDO_EXEC"
    raw_payload: str = ""


class CorrelatedEvent(BaseModel):
    correlation_id: str
    primary_entity: str  # e.g., IP address or username
    time_window_start: datetime
    time_window_end: datetime
    matched_sources: List[str]
    evidence_refs: List[str]
    event_sequence: List[Dict[str, Any]]
    detection_rule: str
    deterministic_score: float
    summary: str


class DeterministicCorrelationEngine:
    """
    Deterministic correlation engine that indexes log/evidence entries by timestamp,
    source IP, user, and asset, and performs sliding time-window joins BEFORE anything
    reaches the LLM. This guarantees zero LLM hallucination of temporal correlations.
    """

    def __init__(self, window_minutes: int = 15):
        self.window_delta = timedelta(minutes=window_minutes)

    def correlate(self, records: List[LogRecord]) -> List[CorrelatedEvent]:
        """
        Executes multi-source temporal correlation across both IP entities and User identities.
        """
        if not records:
            return []

        correlations: List[CorrelatedEvent] = []
        correlations.extend(self._correlate_by_ip(records))
        correlations.extend(self._correlate_by_user(records))
        return correlations

    def _correlate_by_ip(self, records: List[LogRecord]) -> List[CorrelatedEvent]:
        sorted_records = sorted(records, key=lambda x: x.timestamp)
        results: List[CorrelatedEvent] = []

        # Group by Source IP (filtering out localhost if needed)
        ip_buckets: Dict[str, List[LogRecord]] = {}
        for r in sorted_records:
            if r.src_ip and r.src_ip not in ["127.0.0.1", "::1"]:
                ip_buckets.setdefault(r.src_ip, []).append(r)

        for ip, events in ip_buckets.items():
            if len(events) < 2:
                continue

            window_start = 0
            for window_end in range(len(events)):
                while events[window_end].timestamp - events[window_start].timestamp > self.window_delta:
                    window_start += 1

                current_window = events[window_start : window_end + 1]
                sources = set(e.log_type for e in current_window)
                actions = [e.action for e in current_window]

                # Rule 1: Auth failure followed by web probe or firewall activity
                has_auth_fail = "FAILED_LOGIN" in actions
                has_web_probe = any(
                    "HTTP" in a or e.log_type in ["web_access", "web"]
                    for e, a in zip(current_window, actions)
                )
                has_fw_activity = any(e.log_type == "firewall" for e in current_window)

                if len(sources) >= 2 and (has_auth_fail and (has_web_probe or has_fw_activity)):
                    evidence_ids = list(dict.fromkeys(e.evidence_id for e in current_window))
                    cluster_hash = hashlib.sha256(
                        f"IP_{ip}_{current_window[0].timestamp.isoformat()}_{'-'.join(evidence_ids)}".encode()
                    ).hexdigest()[:10].upper()

                    results.append(
                        CorrelatedEvent(
                            correlation_id=f"CORR-IP-{cluster_hash}",
                            primary_entity=ip,
                            time_window_start=current_window[0].timestamp,
                            time_window_end=current_window[-1].timestamp,
                            matched_sources=sorted(list(sources)),
                            evidence_refs=evidence_ids,
                            event_sequence=[
                                {
                                    "time": e.timestamp.isoformat(),
                                    "source": e.source_file,
                                    "type": e.log_type,
                                    "action": e.action,
                                    "evidence_id": e.evidence_id,
                                    "asset": e.asset,
                                }
                                for e in current_window
                            ],
                            detection_rule="MULTI_SOURCE_IP_PIVOT",
                            deterministic_score=0.95,
                            summary=(
                                f"Correlated {len(current_window)} events for IP {ip} across "
                                f"{', '.join(sorted(list(sources)))} within {int(self.window_delta.total_seconds() / 60)}m window."
                            ),
                        )
                    )

        # Deduplicate overlapping correlation clusters by ID
        unique_results: Dict[str, CorrelatedEvent] = {r.correlation_id: r for r in results}
        return list(unique_results.values())

    def _correlate_by_user(self, records: List[LogRecord]) -> List[CorrelatedEvent]:
        sorted_records = sorted(records, key=lambda x: x.timestamp)
        results: List[CorrelatedEvent] = []

        user_buckets: Dict[str, List[LogRecord]] = {}
        for r in sorted_records:
            if r.user and r.user.lower() not in ["anonymous", "guest", "system"]:
                user_buckets.setdefault(r.user, []).append(r)

        for user, events in user_buckets.items():
            if len(events) < 2:
                continue

            window_start = 0
            for window_end in range(len(events)):
                while events[window_end].timestamp - events[window_start].timestamp > self.window_delta:
                    window_start += 1

                current_window = events[window_start : window_end + 1]
                assets = set(e.asset for e in current_window)
                actions = [e.action for e in current_window]

                # Rule 2: Account hopping / privilege escalation attempt across multiple assets
                has_elevated_or_fail = any(a in ["FAILED_LOGIN", "SUDO_EXEC", "PRIV_ESC"] for a in actions)

                if (len(assets) >= 2 or len(current_window) >= 3) and has_elevated_or_fail:
                    evidence_ids = list(dict.fromkeys(e.evidence_id for e in current_window))
                    cluster_hash = hashlib.sha256(
                        f"USER_{user}_{current_window[0].timestamp.isoformat()}_{'-'.join(evidence_ids)}".encode()
                    ).hexdigest()[:10].upper()

                    results.append(
                        CorrelatedEvent(
                            correlation_id=f"CORR-USR-{cluster_hash}",
                            primary_entity=user,
                            time_window_start=current_window[0].timestamp,
                            time_window_end=current_window[-1].timestamp,
                            matched_sources=sorted(list(set(e.log_type for e in current_window))),
                            evidence_refs=evidence_ids,
                            event_sequence=[
                                {
                                    "time": e.timestamp.isoformat(),
                                    "source": e.source_file,
                                    "type": e.log_type,
                                    "action": e.action,
                                    "evidence_id": e.evidence_id,
                                    "asset": e.asset,
                                }
                                for e in current_window
                            ],
                            detection_rule="USER_CROSS_ASSET_PIVOT",
                            deterministic_score=0.92,
                            summary=(
                                f"Correlated {len(current_window)} actions for user '{user}' across "
                                f"{len(assets)} asset(s) ({', '.join(sorted(list(assets)))}) within window."
                            ),
                        )
                    )

        unique_results: Dict[str, CorrelatedEvent] = {r.correlation_id: r for r in results}
        return list(unique_results.values())
