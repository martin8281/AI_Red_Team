from typing import List, Dict, Any

class RiskAnalytics:
    @staticmethod
    def calculate_risk_metrics(risk_scores: List[int]) -> Dict[str, Any]:
        if not risk_scores:
            return {
                "overall_risk_score": 0,
                "average_risk_score": 0,
                "max_risk_score": 0,
            }
        avg = round(sum(risk_scores) / len(risk_scores))
        mx = max(risk_scores)
        overall = min(100, round(mx * 0.6 + avg * 0.4))
        return {
            "overall_risk_score": overall,
            "average_risk_score": avg,
            "max_risk_score": mx,
        }
