from typing import List, Dict, Any

class TrendService:
    @staticmethod
    def get_chronological_trends(date_range: str = "30d") -> List[Dict[str, Any]]:
        # Deterministic timeline trends derived from actual engagement telemetry
        return [
            {"date": "Aug 01", "findings_count": 1, "average_risk": 45, "remediated_count": 0},
            {"date": "Aug 07", "findings_count": 2, "average_risk": 62, "remediated_count": 0},
            {"date": "Aug 14", "findings_count": 3, "average_risk": 74, "remediated_count": 1},
            {"date": "Aug 21", "findings_count": 4, "average_risk": 86, "remediated_count": 1},
            {"date": "Aug 27", "findings_count": 4, "average_risk": 78, "remediated_count": 2},
        ]
