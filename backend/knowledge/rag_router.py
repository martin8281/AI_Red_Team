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
