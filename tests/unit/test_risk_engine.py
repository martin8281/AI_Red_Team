"""
Unit Tests: Deterministic Risk Engine & Boundary Score Thresholds.
"""
from backend.risk.risk_engine import RiskEngine

def test_risk_calculation_critical_threshold():
    result = RiskEngine.evaluate(impact=5, likelihood=5, asset_criticality=5, exploitability=5)
    assert result["risk_score"] == 100
    assert result["risk_level"] == "CRITICAL"
    assert result["recommended_priority"] == "P1 — Immediate"

def test_risk_calculation_low_threshold():
    result = RiskEngine.evaluate(impact=1, likelihood=1, asset_criticality=1, exploitability=1)
    assert result["risk_score"] == 0
    assert result["risk_level"] == "LOW"
    assert result["recommended_priority"] == "P4 — Low"

def test_risk_factors_weight_distribution():
    # Impact (35%) vs Likelihood (30%)
    res_impact = RiskEngine.evaluate(impact=5, likelihood=1, asset_criticality=1, exploitability=1)
    res_likelihood = RiskEngine.evaluate(impact=1, likelihood=5, asset_criticality=1, exploitability=1)
    assert res_impact["risk_score"] > res_likelihood["risk_score"]
