import os
import re
import json
import httpx
from typing import Dict, Any, Optional, List
from .safety import SafetySanitizer
from .context_builder import ContextBuilder
from .prompt_manager import PromptManager
from .response_parser import ResponseParser
from .structured_finding_models import FindingOutputSchema, CopilotInvestigationResponse
from .intent_classifier import IntentClassifier, MessageIntent
from .session_store import SessionContextStore
from ..pipeline.correlation_engine import DeterministicCorrelationEngine, LogRecord, CorrelatedEvent
from ..pipeline.ingestion_router import UniversalIngestionRouter
from ..pipeline.feedback_store import FeedbackLoopService


from ..knowledge.vector_store import PGVectorStore
from ..knowledge.rag_router import RAGRouter
from ..core.config import settings
from ..core.observability import StructuredLogger, LogLevel


class AIService:
    def __init__(self, provider: str = "ollama"):
        self.provider = provider
        self.ollama_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.timeout = settings.OLLAMA_TIMEOUT
        self.correlation_engine = DeterministicCorrelationEngine(window_minutes=15)
        self.vector_store = PGVectorStore()

    async def analyze(
        self,
        project_data: Dict[str, Any],
        context_type: str,
        message: str,
        finding_data: Optional[Dict[str, Any]] = None,
        quick_action: Optional[str] = None,
        attachments: Optional[List[Dict[str, Any]]] = None,
        conversation_id: Optional[str] = None,
        mode: Optional[str] = "chat"
    ) -> Dict[str, Any]:
        """
        Executes an intent-routed investigation query with multi-turn session persistence.
        - MODE 1: NORMAL CHAT -> Plain conversational markdown without structured cards.
        - MODE 2: ASSISTANT MODE -> Grounded structured forensic findings, confidence tiers, and action buttons.
        """
        project_id = project_data.get("id", "PRJ-DEFAULT")
        project_name = project_data.get("name", "Target Engagement")
        conv_id = conversation_id or "conv-live"
        lower_msg = message.strip().lower()
        active_mode = mode or "chat"

        # 1. Register turn in SessionContextStore (persists files & extracts constraints across turns)
        session = SessionContextStore.register_turn(
            conversation_id=conv_id,
            project_id=project_id,
            user_message=message,
            attachments=attachments
        )

        # 2. Classify Message Intent (considering cumulative session files)
        intent = IntentClassifier.classify(
            message=message,
            quick_action=quick_action,
            has_attachments=bool(len(session.uploaded_files) > 0)
        )

        # 3. Perform pre-LLM deterministic correlation over ALL cumulative session log records
        correlated_events: List[CorrelatedEvent] = []
        if session.all_log_records:
            correlated_events = self.correlation_engine.correlate(session.all_log_records)
            SessionContextStore.save_correlation_clusters(conv_id, correlated_events)

        # 4. Instant Replies for pure greetings / thanks (ONLY true greetings / thanks, no canned technical answers)
        if not quick_action and not attachments and len(session.uploaded_files) == 0:
            is_general = project_id == "PRJ-GENERAL" or "general" in project_name.lower()
            is_greeting = any(re.search(p, lower_msg, re.IGNORECASE) for p in IntentClassifier.CASUAL_PATTERNS[:1]) or lower_msg in ["hi", "hii", "hello", "hey", ""]
            is_thanks = any(w in lower_msg for w in ["thanks", "thank you", "thx", "cheers", "awesome", "great", "perfect"])

            if is_greeting:
                if active_mode == "chat":
                    if is_general:
                        reply = (
                            "Hello! 👋 How can I help you today?\n\n"
                            "I'm your **AI Red Team Assistant**. Feel free to ask me anything about:\n"
                            "- **Vulnerability Mechanisms**: Explaining OWASP Top 10, SSRF, SQLi, IDOR, Broken Auth, etc.\n"
                            "- **Active Directory & Infrastructure**: Kerberoasting, Pass-the-Hash, AS-REP roasting, DCSync.\n"
                            "- **Secure Coding & Defense**: Practical code snippets and remediations in Python, TypeScript, Go, etc.\n"
                            "- **Forensic Logs & Triaging**: Analyzing incident logs and indicators of compromise.\n\n"
                            "What would you like to explore?"
                        )
                    else:
                        reply = (
                            f"Hello! 👋 How can I help you with **{project_name}** today?\n\n"
                            "We can discuss scope boundaries, review potential security concerns, explore validation test procedures, "
                            "or answer any technical cybersecurity questions. What would you like to focus on?"
                        )
                else:
                    target_desc = 'General Security Consultation' if is_general else project_name
                    reply = (
                        f"Hello! 👋 **Assistant Mode** is active for **{target_desc}**.\n\n"
                        "I am calibrated to provide grounded findings, 7-factor threat risk scoring, evidence correlation, and structured audit reporting.\n\n"
                        "How would you like to proceed?"
                    )
                return {
                    "intent": "casual",
                    "summary": reply,
                    "raw_text": reply
                }

            if is_thanks:
                reply = (
                    "You're very welcome! 😊 Ready to evaluate risk, suggest tests, or explore findings whenever you need."
                    if active_mode == "assistant"
                    else "You're very welcome! 😊 Let me know whenever you'd like to explore another topic, analyze code, or investigate further."
                )
                return {
                    "intent": "casual",
                    "summary": reply,
                    "raw_text": reply
                }

        # 5. Run RAG Retrieval (Semantic pgvector lookup on Knowledge Base for technical queries)
        rag_route = RAGRouter.classify_intent(message)
        retrieved_sources: List[Dict[str, Any]] = []
        knowledge_context_str = ""

        if rag_route.get("use_rag", True) and intent in [MessageIntent.SPECIFIC_QUERY, MessageIntent.FULL_ASSESSMENT, MessageIntent.CLARIFYING]:
            retrieved_sources = await self.vector_store.similarity_search(query=message, top_k=3, threshold=0.3)
            if retrieved_sources:
                knowledge_context_str = "\n\n### RETRIEVED AUTHORITATIVE KNOWLEDGE:\n" + "\n\n".join(
                    f"[SOURCE: {s['source']} - {s['title']} ({s['reference']})]\n{s['content']}"
                    for s in retrieved_sources
                )

        # 6. Build Cumulative Context (Project Context + Session Stated Constraints + Uploaded Files + RAG Chunks)
        base_context_str = ContextBuilder.build_context(project_data, context_type, finding_data)
        session_memory_block = SessionContextStore.build_session_context_prompt(conv_id)

        full_context_str = base_context_str
        if session_memory_block:
            full_context_str += f"\n\n{session_memory_block}"
        if knowledge_context_str:
            full_context_str += f"\n\n{knowledge_context_str}"

        prompt = PromptManager.build_prompt(
            context_text=full_context_str,
            user_message=message,
            quick_action=quick_action,
            intent=intent,
            mode=active_mode
        )

        # 7. Invoke Ollama AI Engine
        if self.provider == "ollama":
            is_json_mode = (active_mode == "assistant")
            payload: Dict[str, Any] = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.1 if is_json_mode else 0.2,
                    "num_predict": 768 if is_json_mode else 512
                }
            }
            if is_json_mode:
                payload["format"] = "json"

            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    resp = await client.post(f"{self.ollama_url.rstrip('/')}/api/generate", json=payload)

                    if resp.status_code != 200:
                        err_msg = f"Ollama HTTP {resp.status_code}: {resp.text[:200]}"
                        StructuredLogger.log(
                            level=LogLevel.ERROR,
                            event="OLLAMA_HTTP_ERROR",
                            operation="ai_generate",
                            status="FAILURE",
                            error_type="HTTPStatusError",
                            error_detail=err_msg,
                            metadata={"status_code": resp.status_code, "model": self.model}
                        )
                        return {
                            "error": f"AI engine unavailable: {err_msg}",
                            "summary": f"AI engine unavailable: {err_msg}",
                            "raw_text": f"AI engine unavailable: {err_msg}",
                            "confidence": "LOW",
                            "intent": "error"
                        }

                    data = resp.json()
                    raw_response = data.get("response", "").strip()

                    if is_json_mode:
                        try:
                            parsed_json = json.loads(raw_response)
                            if "findings" in parsed_json:
                                parsed_json["findings"] = FeedbackLoopService.filter_and_calibrate_findings(
                                    parsed_json["findings"], project_id
                                )
                                for cf in parsed_json["findings"]:
                                    if isinstance(cf, dict) and "id" in cf:
                                        SessionContextStore.save_discussed_finding(conv_id, cf["id"], cf)
                            if retrieved_sources:
                                parsed_json["sources"] = retrieved_sources
                            if correlated_events and "correlated_events" not in parsed_json:
                                parsed_json["correlated_events"] = [c.model_dump() for c in correlated_events]
                            if "confidence" in parsed_json:
                                parsed_json["confidence"] = str(parsed_json["confidence"]).upper()
                            else:
                                parsed_json["confidence"] = "HIGH"
                            return parsed_json
                        except json.JSONDecodeError as jde:
                            StructuredLogger.log(
                                level=LogLevel.ERROR,
                                event="OLLAMA_JSON_PARSE_ERROR",
                                operation="ai_generate",
                                status="FAILURE",
                                error_type="JSONDecodeError",
                                error_detail=str(jde),
                                metadata={"raw_response": raw_response[:500]}
                            )
                            err_msg = f"Failed to parse AI engine JSON response: {str(jde)}"
                            return {
                                "error": f"AI engine unavailable: {err_msg}",
                                "summary": raw_response if raw_response else f"AI engine unavailable: {err_msg}",
                                "raw_text": raw_response,
                                "confidence": "LOW",
                                "intent": "error"
                            }
                    else:
                        # Normal Chat Mode: return real conversational markdown generated by the model
                        res_dict = {
                            "intent": "chat",
                            "summary": raw_response,
                            "raw_text": raw_response
                        }
                        if retrieved_sources:
                            res_dict["sources"] = retrieved_sources
                        return res_dict

            except httpx.TimeoutException as exc:
                err_detail = f"Request to Ollama timed out after {self.timeout}s"
                StructuredLogger.log(
                    level=LogLevel.ERROR,
                    event="OLLAMA_TIMEOUT",
                    operation="ai_generate",
                    status="TIMEOUT",
                    error_type="TimeoutException",
                    error_detail=err_detail,
                    metadata={"timeout": self.timeout, "model": self.model}
                )
                return {
                    "error": f"AI engine unavailable: {err_detail}",
                    "summary": f"AI engine unavailable: {err_detail}",
                    "raw_text": f"AI engine unavailable: {err_detail}",
                    "confidence": "LOW",
                    "intent": "error"
                }

            except (httpx.ConnectError, httpx.NetworkError) as exc:
                err_detail = f"Could not connect to Ollama at {self.ollama_url} ({str(exc)})"
                StructuredLogger.log(
                    level=LogLevel.ERROR,
                    event="OLLAMA_CONNECT_ERROR",
                    operation="ai_generate",
                    status="FAILURE",
                    error_type=type(exc).__name__,
                    error_detail=err_detail,
                    metadata={"url": self.ollama_url}
                )
                return {
                    "error": f"AI engine unavailable: {err_detail}",
                    "summary": f"AI engine unavailable: {err_detail}",
                    "raw_text": f"AI engine unavailable: {err_detail}",
                    "confidence": "LOW",
                    "intent": "error"
                }

            except Exception as exc:
                err_detail = str(exc)
                StructuredLogger.log(
                    level=LogLevel.ERROR,
                    event="OLLAMA_UNEXPECTED_ERROR",
                    operation="ai_generate",
                    status="FAILURE",
                    error_type=type(exc).__name__,
                    error_detail=err_detail
                )
                return {
                    "error": f"AI engine unavailable: {err_detail}",
                    "summary": f"AI engine unavailable: {err_detail}",
                    "raw_text": f"AI engine unavailable: {err_detail}",
                    "confidence": "LOW",
                    "intent": "error"
                }

        return {
            "error": f"AI engine unavailable: Unsupported provider '{self.provider}'",
            "summary": f"AI engine unavailable: Unsupported provider '{self.provider}'",
            "raw_text": f"AI engine unavailable: Unsupported provider '{self.provider}'",
            "confidence": "LOW",
            "intent": "error"
        }
