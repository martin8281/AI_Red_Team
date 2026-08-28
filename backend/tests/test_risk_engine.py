import unittest
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from risk.risk_engine import RiskEngine
from risk.risk_service import RiskService

class TestRiskEngine(unittest.TestCase):
    def test_minimum_boundary(self):
        """All factors = 1 should produce score 0, LOW, P4"""
        res = RiskEngine.evaluate(1, 1, 1, 1)
        self.assertEqual(res["risk_score"], 0)
        self.assertEqual(res["risk_level"], "LOW")
        self.assertEqual(res["recommended_priority"], "P4 — Low")

    def test_maximum_boundary(self):
        """All factors = 5 should produce score 100, CRITICAL, P1"""
        res = RiskEngine.evaluate(5, 5, 5, 5)
        self.assertEqual(res["risk_score"], 100)
        self.assertEqual(res["risk_level"], "CRITICAL")
        self.assertEqual(res["recommended_priority"], "P1 — Immediate")

    def test_mid_calculation(self):
        """Impact=5, Likelihood=4, Asset=4, Exploitability=4 -> 84 / 100"""
        score = RiskEngine.calculate_score(5, 4, 4, 4)
        self.assertEqual(score, 84)
        self.assertEqual(RiskEngine.get_risk_level(score), "CRITICAL")
        self.assertEqual(RiskEngine.get_recommended_priority(score), "P1 — Immediate")

    def test_risk_level_boundaries(self):
        """Test boundary thresholds: 29 vs 30, 49 vs 50, 74 vs 75"""
        self.assertEqual(RiskEngine.get_risk_level(29), "LOW")
        self.assertEqual(RiskEngine.get_risk_level(30), "MODERATE")
        self.assertEqual(RiskEngine.get_risk_level(49), "MODERATE")
        self.assertEqual(RiskEngine.get_risk_level(50), "HIGH")
        self.assertEqual(RiskEngine.get_risk_level(74), "HIGH")
        self.assertEqual(RiskEngine.get_risk_level(75), "CRITICAL")

    def test_priority_boundaries(self):
        """Test priority thresholds: 39 vs 40, 59 vs 60, 74 vs 75"""
        self.assertEqual(RiskEngine.get_recommended_priority(39), "P4 — Low")
        self.assertEqual(RiskEngine.get_recommended_priority(40), "P3 — Normal")
        self.assertEqual(RiskEngine.get_recommended_priority(59), "P3 — Normal")
        self.assertEqual(RiskEngine.get_recommended_priority(60), "P2 — High")
        self.assertEqual(RiskEngine.get_recommended_priority(74), "P2 — High")
        self.assertEqual(RiskEngine.get_recommended_priority(75), "P1 — Immediate")

    def test_invalid_factors_raise_error(self):
        """Factors outside 1-5 must raise ValueError"""
        with self.assertRaises(ValueError):
            RiskEngine.calculate_score(0, 3, 3, 3)
        with self.assertRaises(ValueError):
            RiskEngine.calculate_score(6, 3, 3, 3)
        with self.assertRaises(ValueError):
            RiskEngine.calculate_score(3, -1, 3, 3)

    def test_project_risk_aggregation(self):
        """Project risk summary composite calculation"""
        scores = [92, 58, 21]
        summary = RiskService.calculate_project_risk(scores)
        self.assertEqual(summary["highest_finding_score"], 92)
        self.assertEqual(summary["total_findings"], 3)
        self.assertTrue(summary["overall_score"] > 70)
        self.assertEqual(summary["risk_level"], "CRITICAL")

if __name__ == "__main__":
    unittest.main()
