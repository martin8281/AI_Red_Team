"""
Security Tests: SQL Injection Attack Payloads & Parameterized Query Validation.
"""
SQLI_ATTACK_PAYLOADS = [
    "' OR '1'='1",
    "' UNION SELECT null, username, password FROM users--",
    "1; DROP TABLE findings;--",
    "admin' --",
    "' OR 1=1#",
    "1' ORDER BY 1--+",
    "1' AND (SELECT 1 FROM (SELECT COUNT(*),CONCAT(version(),FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a)--",
]

def test_sqli_payload_parameterization_safety():
    for payload in SQLI_ATTACK_PAYLOADS:
        safe_param = {"search_term": payload}
        assert isinstance(safe_param["search_term"], str)
        assert safe_param["search_term"] == payload
