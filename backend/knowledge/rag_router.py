import re
from typing import Dict, Any

class RAGRouter:
    @staticmethod
    def classify_intent(user_message: str) -> Dict[str, Any]:
        msg = user_message.lower()
        if any(term in msg for term in ["current project", "my project", "list projects"]):
            return {
                "intent": "DATABASE",
                "use_rag": False,
                "confidence": 0.95,
            }
        if any(term in msg for term in ["why is this finding", "risk score of", "why is finding"]):
            return {
                "intent": "PROJECT_CONTEXT",
                "use_rag": False,
                "confidence": 0.90,
            }
        if any(term in msg for term in ["what is cwe", "what is owasp", "cwe-", "nist", "cvss"]):
            return {
                "intent": "KNOWLEDGE_BASE",
                "use_rag": True,
                "confidence": 0.96,
            }
        return {
            "intent": "HYBRID",
            "use_rag": True,
            "confidence": 0.85,
        }

    @staticmethod
    def determine_scope(user_message: str, has_attachments: bool = False) -> Dict[str, Any]:
        """
        Determines the internal RAG routing scope:
        - "none": Pure LLM conversation (greetings, general non-sec query)
        - "security_knowledge": RAG query against local security knowledge vector DB (CWE, OWASP, attack concepts)
        - "uploaded_evidence": Analysis of attached/session evidence logs & report artifacts
        - "both": Combines uploaded evidence context with security knowledge retrieval
        """
        msg = user_message.strip().lower()

        # Check for security knowledge indicators
        sec_kb_pattern = r"(cwe[-_]?\d+|owasp|cvss|nist|cve[-_]?\d+|vulnerability|exploit|remediation|sql injection|xss|csrf|rce|buffer overflow|privilege escalation|root cause)"
        is_sec_kb = bool(re.search(sec_kb_pattern, msg))

        # Check for evidence / file indicators
        evidence_pattern = r"(report|file|log|attachment|document|evidence|capture|pcap|csv|json|xml|text|summary|summarize|findings|artifact)"
        is_evidence = has_attachments or bool(re.search(evidence_pattern, msg))

        # Check for simple greetings
        greeting_pattern = r"^(hi|hello|hey|greetings|who are you|what can you do|help)[.! \?]*$"
        is_greeting = bool(re.match(greeting_pattern, msg))

        if is_evidence:
            if is_sec_kb:
                return {"needs_rag": True, "rag_scope": "both", "confidence": 0.95}
            return {"needs_rag": True, "rag_scope": "uploaded_evidence", "confidence": 0.90}

        if is_sec_kb:
            return {"needs_rag": True, "rag_scope": "security_knowledge", "confidence": 0.90}

        if is_greeting:
            return {"needs_rag": False, "rag_scope": "none", "confidence": 0.95}

        # Default for open-ended technical queries without specific evidence attached
        return {"needs_rag": True, "rag_scope": "security_knowledge", "confidence": 0.70}

