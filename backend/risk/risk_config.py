"""
Centralized Configuration for Deterministic Risk Engine.
Do NOT scatter weights throughout the code.
"""

from typing import Dict

# Configurable factor weights (Sum = 1.00 / 100%)
RISK_WEIGHTS: Dict[str, float] = {
    "impact": 0.35,
    "likelihood": 0.30,
    "asset_criticality": 0.20,
    "exploitability": 0.15,
}

# Risk Level Thresholds (0–100 normalized)
LEVEL_THRESHOLDS = {
    "CRITICAL": 75,
    "HIGH": 50,
    "MODERATE": 30,
    "LOW": 0,
}

# Recommended Priority Thresholds
PRIORITY_THRESHOLDS = {
    "P1": 75,
    "P2": 60,
    "P3": 40,
    "P4": 0,
}
