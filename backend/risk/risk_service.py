from typing import Dict, Any, List, Optional
from datetime import datetime
from .risk_engine import RiskEngine

class RiskService:
    @staticmethod
    def assess_finding(
        finding_id: str,
        impact: int,
        likelihood: int,
        asset_criticality: int,
        exploitability: int,
        assessed_by: str = "Alex Vance",
        final_priority: Optional[str] = None
    ) -> Dict[str, Any]:
        evaluated = RiskEngine.evaluate(impact, likelihood, asset_criticality, exploitability)
        return {
            "id": f"RA-{finding_id}",
            "finding_id": finding_id,
            "impact": impact,
            "likelihood": likelihood,
            "asset_criticality": asset_criticality,
            "exploitability": exploitability,
            "risk_score": evaluated["risk_score"],
            "risk_level": evaluated["risk_level"],
            "recommended_priority": evaluated["recommended_priority"],
            "final_priority": final_priority or evaluated["recommended_priority"],
            "assessed_by": assessed_by,
            "created_at": datetime.utcnow().isoformat(),
        }

    @staticmethod
    def calculate_project_risk(findings_scores: List[int]) -> Dict[str, Any]:
        if not findings_scores:
            return {
                "overall_score": 0,
                "risk_level": "LOW",
                "total_findings": 0,
            }
        highest = max(findings_scores)
        avg = sum(findings_scores) / len(findings_scores)
        overall = round(highest * 0.6 + avg * 0.4)
        overall = max(0, min(100, overall))
        return {
            "overall_score": overall,
            "risk_level": RiskEngine.get_risk_level(overall),
            "highest_finding_score": highest,
            "total_findings": len(findings_scores),
        }
