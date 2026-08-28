from typing import Dict, Any
from .risk_config import RISK_WEIGHTS, LEVEL_THRESHOLDS, PRIORITY_THRESHOLDS

class RiskEngine:
    @staticmethod
    def validate_factors(impact: int, likelihood: int, asset_criticality: int, exploitability: int) -> None:
        factors = {
            "impact": impact,
            "likelihood": likelihood,
            "asset_criticality": asset_criticality,
            "exploitability": exploitability,
        }
        for name, val in factors.items():
            if not isinstance(val, (int, float)) or val < 1 or val > 5:
                raise ValueError(f"Invalid factor '{name}': {val}. Factors must be between 1 and 5.")

    @staticmethod
    def calculate_score(impact: int, likelihood: int, asset_criticality: int, exploitability: int) -> int:
        RiskEngine.validate_factors(impact, likelihood, asset_criticality, exploitability)

        raw = (
            impact * RISK_WEIGHTS["impact"]
            + likelihood * RISK_WEIGHTS["likelihood"]
            + asset_criticality * RISK_WEIGHTS["asset_criticality"]
            + exploitability * RISK_WEIGHTS["exploitability"]
        )

        # Normalize linearly from [1.0, 5.0] to [0, 100]
        normalized = ((raw - 1.0) / 4.0) * 100
        score = round(normalized)
        return max(0, min(100, score))

    @staticmethod
    def get_risk_level(score: int) -> str:
        if score >= LEVEL_THRESHOLDS["CRITICAL"]:
            return "CRITICAL"
        if score >= LEVEL_THRESHOLDS["HIGH"]:
            return "HIGH"
        if score >= LEVEL_THRESHOLDS["MODERATE"]:
            return "MODERATE"
        return "LOW"

    @staticmethod
    def get_recommended_priority(score: int) -> str:
        if score >= PRIORITY_THRESHOLDS["P1"]:
            return "P1 — Immediate"
        if score >= PRIORITY_THRESHOLDS["P2"]:
            return "P2 — High"
        if score >= PRIORITY_THRESHOLDS["P3"]:
            return "P3 — Normal"
        return "P4 — Low"

    @staticmethod
    def evaluate(impact: int, likelihood: int, asset_criticality: int, exploitability: int) -> Dict[str, Any]:
        score = RiskEngine.calculate_score(impact, likelihood, asset_criticality, exploitability)
        level = RiskEngine.get_risk_level(score)
        recommended_priority = RiskEngine.get_recommended_priority(score)
        return {
            "risk_score": score,
            "risk_level": level,
            "recommended_priority": recommended_priority,
        }
