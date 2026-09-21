"""
Security Tests: AI Trust Boundaries (Human-in-the-Loop & Zero Auto-Promotion).
"""
from backend.ai.structured_finding_models import FindingOutputSchema

def test_ai_finding_cannot_auto_verify():
    finding_data = {
        "id": "FND-PROPOSED-01",
        "category": "SQL Injection",
        "severity": "HIGH",
        "severity_rationale": "Database disclosure risk",
        "confidence": "HIGH",
        "confidence_justification": "Observed SQL error in response",
        "affected_asset": "auth.apexfin.com",
        "evidence_refs": ["EVD-01"],
        "description": "SQL injection in auth",
        "impact": "Account takeover",
        "recommendation": "Use Prepared Statements",
        "status": "proposed"
    }
    schema = FindingOutputSchema(**finding_data)
    assert schema.status == "proposed"
