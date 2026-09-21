"""
Security Tests: XML External Entity (XXE) & DTD Entity Injection Defense.
"""
from backend.core.sanitization import SecuritySanitizer

XXE_PAYLOADS = [
    """<?xml version="1.0" encoding="ISO-8859-1"?>
    <!DOCTYPE foo [ <!ELEMENT foo ANY >
    <!ENTITY xxe SYSTEM "file:///etc/passwd" >]>
    <foo>&xxe;</foo>""",
    """<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE root [
    <!ENTITY % ext SYSTEM "http://127.0.0.1:8080/evil.dtd">
    %ext;
    ]>
    <root>test</root>""",
]

SAFE_XML = """<?xml version="1.0" encoding="UTF-8"?>
<nmaprun scanner="nmap" version="7.94">
  <host><address addr="203.0.113.15" addrtype="ipv4"/><ports><port portid="443"><state state="open"/></port></ports></host>
</nmaprun>"""

def test_xxe_payload_rejection():
    for xxe in XXE_PAYLOADS:
        valid, root, reason = SecuritySanitizer.safe_parse_xml(xxe)
        assert valid is False, "XXE payload should be rejected."
        assert "XXE Defense" in reason

def test_safe_xml_parsed_successfully():
    valid, root, reason = SecuritySanitizer.safe_parse_xml(SAFE_XML)
    assert valid is True
    assert root is not None
