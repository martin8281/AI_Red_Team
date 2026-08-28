import json
import re
from typing import Dict, Any

class ResponseParser:
    @staticmethod
    def parse(raw_output: str) -> Dict[str, Any]:
        try:
            json_match = re.search(r"\{[\s\S]*\}", raw_output)
            if json_match:
                return json.loads(json_match.group(0))
        except Exception:
            pass

        return {
            "summary": raw_output[:160] + "..." if len(raw_output) > 160 else raw_output,
            "reasoning": raw_output,
            "impact": "Evaluated in project context.",
            "recommendation": "Follow OWASP remediation recommendations.",
            "confidence": "HIGH",
            "rawText": raw_output,
        }
