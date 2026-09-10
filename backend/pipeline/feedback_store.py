import hashlib
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class AnalystRejection(BaseModel):
    rejection_id: str
    project_id: str
    finding_category: str
    affected_asset: str
    detection_rule: str = "DEFAULT"
    signature_hash: str
    rejection_reason: str  # "FALSE_POSITIVE", "INTENDED_BEHAVIOR", "KNOWN_TEST_ACTIVITY", "INSUFFICIENT_EVIDENCE"
    analyst_comment: str
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class FeedbackLoopService:
    """
    Manages analyst feedback on false positives. When an analyst rejects a finding,
    a signature hash (category + asset + detection_rule) is recorded. Future investigations
    query this store to suppress or demote confidence for matching patterns.
    """

    # In-memory store (mirrors persistent database table `analyst_rejections`)
    _rejection_store: Dict[str, List[AnalystRejection]] = {}

    @classmethod
    def compute_signature(cls, category: str, asset: str, detection_rule: str = "DEFAULT") -> str:
        norm_cat = (category or "").strip().upper()
        norm_asset = (asset or "").strip().lower()
        norm_rule = (detection_rule or "DEFAULT").strip().upper()
        raw = f"{norm_cat}|{norm_asset}|{norm_rule}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]

    @classmethod
    def record_rejection(
        cls,
        project_id: str,
        finding_category: str,
        affected_asset: str,
        rejection_reason: str,
        analyst_comment: str,
        detection_rule: str = "DEFAULT"
    ) -> AnalystRejection:
        sig_hash = cls.compute_signature(finding_category, affected_asset, detection_rule)
        rejection_id = f"REJ-{hashlib.sha256(f'{project_id}_{sig_hash}_{datetime.utcnow().isoformat()}'.encode()).hexdigest()[:8].upper()}"

        rejection = AnalystRejection(
            rejection_id=rejection_id,
            project_id=project_id,
            finding_category=finding_category,
            affected_asset=affected_asset,
            detection_rule=detection_rule,
            signature_hash=sig_hash,
            rejection_reason=rejection_reason,
            analyst_comment=analyst_comment
        )

        cls._rejection_store.setdefault(project_id, []).append(rejection)
        return rejection

    @classmethod
    def get_rejections_for_project(cls, project_id: str) -> List[AnalystRejection]:
        return cls._rejection_store.get(project_id, [])

    @classmethod
    def filter_and_calibrate_findings(
        cls,
        findings: List[Dict[str, Any]],
        project_id: str
    ) -> List[Dict[str, Any]]:
        """
        Applies false positive feedback loop: deprioritizes or demotes confidence for
        candidate findings that match previously recorded analyst rejections.
        """
        active_rejections = cls.get_rejections_for_project(project_id)
        if not active_rejections:
            return findings

        rejection_map = {r.signature_hash: r for r in active_rejections}
        calibrated: List[Dict[str, Any]] = []

        for f in findings:
            cat = f.get("category", "")
            asset = f.get("affected_asset", "")
            rule = f.get("detection_rule", "DEFAULT")
            sig = cls.compute_signature(cat, asset, rule)

            if sig in rejection_map:
                rej = rejection_map[sig]
                # Calibrate confidence down and annotate reason
                f["confidence"] = "LOW"
                existing_justification = f.get("confidence_justification", "")
                f["confidence_justification"] = (
                    f"{existing_justification} [DEPRIORITIZED: Matches prior analyst rejection ({rej.rejection_reason}: {rej.analyst_comment})]"
                ).strip()
                f["is_suppressed_candidate"] = True
                f["rejection_reference"] = rej.rejection_id

            calibrated.append(f)

        return calibrated
