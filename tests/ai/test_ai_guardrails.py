"""
AI Tests: Grounded Citations, Honest Uncertainty, and Offline Degradation.
"""
from backend.ai.response_parser import ResponseParser

def test_ai_response_parser_valid_json():
    sample_response = """
    ```json
    {
        "summary": "Verified Blind SQL Injection on authentication endpoint.",
        "risk": {
            "level": "CRITICAL",
            "score": 92,
            "text": "High impact risk."
        },
        "reasoning": "Unparameterized SQL input concatenation.",
        "impact": "Full database read/write access.",
        "recommendation": "Use Prepared Statements.",
        "confidence": "HIGH"
    }
    ```
    """
    parsed = ResponseParser.parse(sample_response)
    assert parsed["summary"] == "Verified Blind SQL Injection on authentication endpoint."
    assert parsed["confidence"] == "HIGH"
    assert parsed["risk"]["score"] == 92

def test_ai_response_parser_fallback_on_malformed_output():
    malformed_response = "I found a vulnerability but here is raw unformatted text without json."
    parsed = ResponseParser.parse(malformed_response)
    assert parsed["summary"] == malformed_response
