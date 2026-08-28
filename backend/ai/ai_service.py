import os
from typing import Dict, Any, Optional
from .safety import SafetySanitizer
from .context_builder import ContextBuilder
from .prompt_manager import PromptManager
from .response_parser import ResponseParser

class AIService:
    def __init__(self, provider: str = "mock"):
        self.provider = provider
        self.api_key = os.getenv("AI_API_KEY", "")

    async def analyze(self, project_data: Dict[str, Any], context_type: str, message: str, finding_data: Optional[Dict[str, Any]] = None, quick_action: Optional[str] = None) -> Dict[str, Any]:
        context_str = ContextBuilder.build_context(project_data, context_type, finding_data)
        prompt = PromptManager.build_prompt(context_str, message, quick_action)

        # In mock mode or if api_key is missing, return structured analysis
        if self.provider == "mock" or not self.api_key:
            return {
                "summary": f"Contextual Security Analysis for {project_data.get('name')}",
                "risk": {
                    "level": finding_data.get("severity", "HIGH") if finding_data else "HIGH",
                    "score": finding_data.get("riskScore", 80) if finding_data else 80,
                    "text": "Evaluated under authorized testing engagement parameters."
                },
                "reasoning": "Observed parameter flow influences backend evaluation without sufficient schema boundary enforcement.",
                "impact": "Potential confidentiality and integrity exposure if left unaddressed.",
                "recommendation": "Implement strict input validation, parameterized queries, and context-aware output encoding.",
                "suggestedValidation": "Verify response status codes and re-test with benign boundary payloads.",
                "confidence": "HIGH"
            }

        # Real LLM provider call (e.g. Anthropic, OpenAI, or local vLLM) would be invoked here
        # raw_response = await self.call_llm_provider(prompt)
        # return ResponseParser.parse(raw_response)
        return {"summary": "Analysis generated via external LLM provider."}
