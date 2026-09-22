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
from .report_analyzer import ReportAnalyzer
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

        # 4. Run RAG Router (Determine scope: none, security_knowledge, uploaded_evidence, both)
        rag_scope_info = RAGRouter.determine_scope(message, has_attachments=bool(len(session.uploaded_files) > 0))
        retrieved_sources: List[Dict[str, Any]] = []
        knowledge_context_str = ""

        if rag_scope_info.get("needs_rag", True) and rag_scope_info.get("rag_scope") in ["security_knowledge", "both"]:
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
                    "temperature": 0.2,
                    "num_predict": 768
                }
            }

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
                            "text": f"AI engine unavailable: {err_msg}",
                            "error": f"AI engine unavailable: {err_msg}",
                            "summary": f"AI engine unavailable: {err_msg}",
                            "raw_text": f"AI engine unavailable: {err_msg}",
                            "confidence": "LOW",
                            "intent": "error"
                        }

                    data = resp.json()
                    raw_response = data.get("response", "").strip()

                    # Clean thinking tags (<think>...</think>) safely from reasoning models (e.g. Qwen3/DeepSeek)
                    if "<think>" in raw_response:
                        if "</think>" in raw_response:
                            parts = raw_response.split("</think>", 1)
                            clean_response = parts[1].strip()
                            thinking_text = parts[0].replace("<think>", "").strip()
                            if not clean_response:
                                clean_response = thinking_text
                        else:
                            clean_response = re.sub(r"</?think>", "", raw_response).strip()
                    else:
                        clean_response = raw_response.strip()

                    # SINGLE AUTOMATIC RETRY if output is empty or whitespace
                    if not clean_response or clean_response.strip() in ["Analysis complete.", "{}", ""]:
                        recovery_prompt = prompt + "\n\nIMPORTANT INSTRUCTION: Provide a direct, comprehensive answer and report analysis in clear Markdown text. Do not output blank text or thinking tags only."
                        payload["prompt"] = recovery_prompt
                        try:
                            retry_resp = await client.post(f"{self.ollama_url.rstrip('/')}/api/generate", json=payload)
                            if retry_resp.status_code == 200:
                                retry_data = retry_resp.json()
                                retry_raw = retry_data.get("response", "").strip()
                                if "<think>" in retry_raw:
                                    if "</think>" in retry_raw:
                                        rparts = retry_raw.split("</think>", 1)
                                        clean_response = rparts[1].strip() or rparts[0].replace("<think>", "").strip()
                                    else:
                                        clean_response = re.sub(r"</?think>", "", retry_raw).strip()
                                else:
                                    clean_response = retry_raw.strip()
                        except Exception:
                            pass

                    # Try parsing clean_response / raw_response for structured JSON output
                    parsed_json = None
                    for text_candidate in [clean_response, raw_response]:
                        if not text_candidate or text_candidate.strip() in ["{}", ""]:
                            continue
                        try:
                            json_candidate = text_candidate.strip()
                            if not (json_candidate.startswith("{") or json_candidate.startswith("[")):
                                json_match = re.search(r"(\{.*\})", json_candidate, re.DOTALL)
                                if json_match:
                                    json_candidate = json_match.group(1)
                            parsed_candidate = json.loads(json_candidate)
                            if isinstance(parsed_candidate, dict) and len(parsed_candidate) > 0:
                                # Unwrap nested "summary" string if model double-encoded JSON inside summary
                                if "summary" in parsed_candidate and isinstance(parsed_candidate["summary"], str) and parsed_candidate["summary"].strip().startswith("{"):
                                    try:
                                        nested = json.loads(parsed_candidate["summary"].strip())
                                        if isinstance(nested, dict):
                                            parsed_candidate.update(nested)
                                    except Exception:
                                        pass
                                parsed_json = parsed_candidate
                                break
                        except Exception:
                            continue

                    # Generate evidence report fallback if clean_response is short or missing headings
                    is_valid_report_text = bool(
                        clean_response and 
                        len(clean_response.strip()) > 80 and 
                        clean_response.strip() not in ["Analysis complete.", "{}"] and 
                        not clean_response.strip().startswith("{")
                    )

                    if not is_valid_report_text and session and session.uploaded_files:
                        reports = []
                        for f in session.uploaded_files.values():
                            content_to_parse = f.raw_content if f.raw_content else f.content_snippet
                            rep_md = ReportAnalyzer.generate_evidence_report(f.name, content_to_parse)
                            reports.append(rep_md)
                        clean_response = "\n\n---\n\n".join(reports)
                    elif not clean_response or clean_response.strip() in ["Analysis complete.", "{}", ""]:
                        if active_mode == "chat":
                            clean_response = "Hello! I'm your AI Red Team Assistant. How can I assist you with your security assessment today?"
                        else:
                            clean_response = "Security investigation assessment complete."

                    if is_json_mode and parsed_json and isinstance(parsed_json, dict) and len(parsed_json) > 0:
                        parsed_json["mode"] = "assistant"
                        parsed_json["response_type"] = "analysis"
                        
                        # Build comprehensive markdown report text from JSON fields, ReportAnalyzer, or clean_response
                        markdown_text = ""
                        if clean_response and "## Report Summary" in clean_response:
                            markdown_text = clean_response.strip()
                        elif clean_response and not clean_response.strip().startswith("{") and len(clean_response.strip()) > 50:
                            markdown_text = clean_response.strip()
                        
                        if not markdown_text and session and session.uploaded_files:
                            reports = []
                            for f in session.uploaded_files.values():
                                content_to_parse = f.raw_content if f.raw_content else f.content_snippet
                                rep_md = ReportAnalyzer.generate_evidence_report(f.name, content_to_parse)
                                reports.append(rep_md)
                            markdown_text = "\n\n---\n\n".join(reports)

                        if not markdown_text:
                            reasoning_text = parsed_json.get("reasoning") or parsed_json.get("summary") or ""
                            if reasoning_text and len(reasoning_text) > 30 and not reasoning_text.strip().startswith("{") and reasoning_text.strip() not in ["Analysis complete.", "{}"]:
                                markdown_text += f"## Report Summary\n\n{reasoning_text}\n\n"
                            
                            if parsed_json.get("findings") and isinstance(parsed_json["findings"], list) and len(parsed_json["findings"]) > 0:
                                markdown_text += "## Key Findings\n\n"
                                for idx, f in enumerate(parsed_json["findings"], 1):
                                    cat = f.get("category") or f.get("title") or f"Finding #{idx}"
                                    desc = f.get("description") or f.get("impact") or "Observed security finding in evidence."
                                    asset = f.get("affected_asset") or f.get("asset") or "Target Asset"
                                    sev = f.get("severity") or "HIGH"
                                    rec = f.get("recommendation") or ""
                                    
                                    markdown_text += f"### {idx}. {cat} ({sev})\n"
                                    markdown_text += f"* **Target Asset**: `{asset}`\n"
                                    markdown_text += f"* **Description**: {desc}\n"
                                    if rec:
                                        markdown_text += f"* **Remediation**: {rec}\n"
                                    markdown_text += "\n"

                        if not markdown_text.strip():
                            markdown_text = "Security investigation assessment complete."

                        parsed_json["summary"] = markdown_text
                        parsed_json["raw_text"] = markdown_text
                        parsed_json["text"] = markdown_text

                        if "findings" in parsed_json and isinstance(parsed_json["findings"], list):
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

                    # Plain text or mixed response normalization
                    if not clean_response or clean_response.strip() in ["Analysis complete.", "{}", ""]:
                        if session and session.uploaded_files:
                            file_names = ", ".join([f.name for f in session.uploaded_files.values()])
                            clean_response = f"## Report Summary\n\nAnalyzed attached evidence file(s): `{file_names}`.\n\n"
                            for f in session.uploaded_files.values():
                                snippet = f.raw_content[:2000] if f.raw_content else f.content_snippet[:2000]
                                clean_response += f"### Evidence Artifact: {f.name}\n"
                                clean_response += f"```text\n{snippet}\n```\n\n"
                        elif active_mode == "chat":
                            clean_response = "Hello! I'm your AI Red Team Assistant. How can I assist you with your security assessment today?"
                        else:
                            clean_response = "Security investigation assessment complete."

                    res_dict = {
                        "text": clean_response,
                        "mode": active_mode,
                        "response_type": "analysis" if active_mode == "assistant" else "chat",
                        "summary": clean_response,
                        "raw_text": clean_response,
                        "confidence": "HIGH",
                        "intent": "chat" if active_mode == "chat" else "general_analysis"
                    }
                    if retrieved_sources:
                        res_dict["sources"] = retrieved_sources
                    if correlated_events:
                        res_dict["correlated_events"] = [c.model_dump() for c in correlated_events]
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
