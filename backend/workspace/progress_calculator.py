from typing import Dict, Any

class ProgressCalculator:
    @staticmethod
    def calculate(
        has_metadata: bool,
        in_scope_count: int,
        findings_count: int,
        unreviewed_evidence_count: int,
        all_risk_assessed: bool,
        remediated_count: int,
        reports_count: int
    ) -> int:
        score = 0
        if has_metadata:
            score += 10
        if in_scope_count > 0:
            score += 15
        if findings_count > 0:
            score += 20
        if unreviewed_evidence_count == 0 and findings_count > 0:
            score += 15
        elif unreviewed_evidence_count > 0:
            score += 8
        if all_risk_assessed and findings_count > 0:
            score += 15
        if remediated_count > 0:
            score += 15
        if reports_count > 0:
            score += 10

        return max(10, min(100, score))
