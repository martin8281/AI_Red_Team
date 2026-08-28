from typing import Dict, Any

class HealthEvaluator:
    @staticmethod
    def evaluate(
        in_scope_count: int,
        out_of_scope_count: int,
        critical_findings: int,
        high_findings: int,
        all_risk_assessed: bool,
        unreviewed_evidence: int,
        reports_count: int
    ) -> Dict[str, Any]:
        scope = "GOOD" if in_scope_count > 0 and out_of_scope_count > 0 else ("ATTENTION" if in_scope_count > 0 else "BLOCKED")
        findings = "BLOCKED" if critical_findings > 0 else ("ATTENTION" if high_findings > 0 else "GOOD")
        risk = "GOOD" if all_risk_assessed else "ATTENTION"
        evidence = "ATTENTION" if unreviewed_evidence > 0 else "GOOD"
        reporting = "GOOD" if reports_count > 0 else "ATTENTION"

        overall = "BLOCKED" if (scope == "BLOCKED" or findings == "BLOCKED") else ("ATTENTION" if "ATTENTION" in [scope, findings, risk, evidence, reporting] else "GOOD")

        return {
            "overall": overall,
            "scope_health": scope,
            "finding_health": findings,
            "risk_health": risk,
            "evidence_health": evidence,
            "reporting_health": reporting,
        }
