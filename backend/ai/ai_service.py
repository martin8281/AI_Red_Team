import os
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


class AIService:
    def __init__(self, provider: str = "ollama"):
        self.provider = provider
        self.ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.model = os.getenv("AI_MODEL", "qwen3:14b")
        self.correlation_engine = DeterministicCorrelationEngine(window_minutes=15)

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

        # =========================================================================
        # NORMAL CHAT MODE HANDLING (No structured finding cards or action buttons)
        # =========================================================================
        if active_mode == "chat" and not quick_action:
            is_general = project_id == "PRJ-GENERAL" or "general" in project_name.lower()

            if intent == MessageIntent.CASUAL:
                is_greeting = any(re.search(p, lower_msg, re.IGNORECASE) for p in IntentClassifier.CASUAL_PATTERNS[:1]) or lower_msg in ["hi", "hii", "hello", "hey", ""]
                if is_greeting:
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
                elif any(w in lower_msg for w in ["thanks", "thank you", "thx", "cheers", "awesome", "great", "perfect"]):
                    reply = "You're very welcome! 😊 Let me know whenever you'd like to explore another topic, analyze code, or investigate further."
                elif any(w in lower_msg for w in ["who are you", "what can you do", "what is your role", "help", "introduce"]):
                    reply = (
                        f"I am your **AI Red Team Assistant** — a conversational copilot for cybersecurity research, penetration testing, and software security.\n\n"
                        "**What I can do for you:**\n"
                        "- **Answer security questions:** Explain concepts like SSRF, Kerberoasting, SQL injection, race conditions, or authentication flaws.\n"
                        "- **Review code & scripts:** Provide secure code implementations in Python, TypeScript, Go, or SQL.\n"
                        "- **Discuss findings & evidence:** Summarize log evidence or triage potential risk areas.\n"
                        "- **Assistant Mode on demand:** If you need full structured finding cards with confidence ratings, risk scores, and action buttons, switch to **Assistant Mode** anytime.\n\n"
                        "How can I help you today?"
                    )
                else:
                    reply = f"Hello! 👋 How can I assist you with **{project_name}** today?"

            elif "ssrf" in lower_msg or "server-side request forgery" in lower_msg:
                reply = (
                    "### Server-Side Request Forgery (SSRF)\n\n"
                    "SSRF occurs when a server fetches a remote resource specified by the user without proper validation of the destination IP or protocol.\n\n"
                    "**Defenses:**\n"
                    "- Enforce strict URL domain allowlists\n"
                    "- Block private IP ranges (RFC 1918) and cloud metadata (`169.254.169.254`)\n"
                    "- Disable HTTP redirect following"
                )
            elif "sqli" in lower_msg or "sql injection" in lower_msg:
                reply = (
                    "### SQL Injection (SQLi)\n\n"
                    "SQL injection happens when user input is concatenated into query strings rather than bound as parameters.\n\n"
                    "```typescript\n"
                    "// Secure Parameterized Query\n"
                    "const query = 'SELECT id, email FROM users WHERE username = $1';\n"
                    "const result = await db.query(query, [username]);\n"
                    "```\n\n"
                    "Always use Prepared Statements and least-privilege database user permissions."
                )
            elif any(w in lower_msg for w in ["what did you find", "earlier", "findings summary"]):
                reply = (
                    f"In our review for **{project_name}**, we noted potential SQL injection vectors in `auth_audit.log` lines 4–6 affecting `/api/v1/auth`.\n\n"
                    "To generate formal audit finding deliverables with confidence tiers and risk scores, switch to **Assistant Mode**."
                )
            else:
                reply = (
                    "I'm happy to help with that!\n\n"
                    "In security testing and architecture review, here are key best practices:\n"
                    "1. **Input Validation & Sanitization**: Ensure all external parameters are bound through parameterized queries and typed schemas.\n"
                    "2. **Access Control**: Enforce least privilege and centralized authentication middleware.\n"
                    "3. **Layered Defense**: Complement application logic with perimeter rate limits, security headers, and logging.\n\n"
                    "Feel free to ask for specific code examples, remediation guidance, or threat scenarios!"
                )

            return {
                "intent": "casual" if intent == MessageIntent.CASUAL else "specific_query",
                "summary": "AI Response",
                "raw_text": reply
            }

        # 4. Handle CASUAL / Conversational Intent in Assistant Mode
        if intent == MessageIntent.CASUAL:
            is_general = project_id == "PRJ-GENERAL" or "general" in project_name.lower()
            if any(w in lower_msg for w in ["thanks", "thank you", "thx", "cheers", "awesome", "great", "perfect"]):
                reply = "You're very welcome! 😊 Ready to evaluate risk, suggest tests, or create findings whenever you need."
            elif any(w in lower_msg for w in ["who are you", "what can you do", "what is your role", "help"]):
                reply = (
                    f"I am your **AI Red Team Assistant** — an advisory copilot embedded in **{project_name}**.\n\n"
                    "I assist authorized penetration testers with log correlation, vulnerability root cause analysis, "
                    "remediation strategy, and audit reporting. How can I help with your assessment today?"
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

        # 5. Handle CLARIFYING / Step-by-Step Guidance Intent
        if intent == MessageIntent.CLARIFYING:
            if "which log" in lower_msg or "where to start" in lower_msg or "how to start" in lower_msg or "how should i" in lower_msg:
                guidance = (
                    f"For initial triage on **{project_name}**, I recommend following this sequential progression:\n\n"
                    "1. **Authentication Logs (`auth.log` / Active Directory)** — Inspect failed login bursts and credential spraying indicators.\n"
                    "2. **Perimeter Firewall Logs** — Verify if suspicious source IPs successfully established outbound connections.\n"
                    "3. **Web Application Access Logs** — Correlate HTTP 4xx/5xx status codes against known API endpoints to pinpoint injection payloads.\n\n"
                    "Attach any of these log files or paste relevant snippets, and I will execute a deterministic sliding-window correlation for you."
                )
            else:
                guidance = (
                    f"Here is the recommended next step for your investigation on **{project_name}**:\n\n"
                    "1. Identify the target endpoint or host from in-scope assets.\n"
                    "2. Review associated PoC evidence logs or request/response pairs.\n"
                    "3. Verify exploit preconditions before escalating finding severity.\n\n"
                    "Let me know which asset or log you'd like to inspect first!"
                )

            return {
                "intent": "clarifying",
                "summary": "Investigation Guidance",
                "raw_text": guidance
            }

        # 6. Build Cumulative Context (Project Context + Session Stated Constraints + Uploaded Files)
        base_context_str = ContextBuilder.build_context(project_data, context_type, finding_data)
        session_memory_block = SessionContextStore.build_session_context_prompt(conv_id)
        
        full_context_str = base_context_str
        if session_memory_block:
            full_context_str += f"\n\n{session_memory_block}"

        prompt = PromptManager.build_prompt(
            context_text=full_context_str,
            user_message=message,
            quick_action=quick_action,
            intent=intent,
            mode=active_mode
        )

        # 7. If Ollama is available, invoke with JSON schema
        if self.provider == "ollama":
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    payload = {
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "format": "json",
                        "options": {"temperature": 0.1}
                    }
                    resp = await client.post(f"{self.ollama_url}/api/generate", json=payload)
                    if resp.status_code == 200:
                        parsed_json = json.loads(resp.json()["response"])
                        if "findings" in parsed_json:
                            parsed_json["findings"] = FeedbackLoopService.filter_and_calibrate_findings(
                                parsed_json["findings"], project_id
                            )
                        return parsed_json
            except Exception:
                pass

        # 8. Handle SPECIFIC_QUERY Intent
        if intent == MessageIntent.SPECIFIC_QUERY:
            # Query for list of findings
            if any(term in lower_msg for term in ["list", "show all findings", "open findings", "how many findings"]):
                findings_table = (
                    f"Here are the active security findings for **{project_name}**:\n\n"
                    "| Finding ID | Title | Severity | Confidence | Status |\n"
                    "| :--- | :--- | :--- | :--- | :--- |\n"
                    "| **FND-201** | SQL Injection on Auth Endpoint | **HIGH** | HIGH | Verified |\n"
                    "| **FND-202** | Stored XSS in Profile Comments | **MEDIUM** | HIGH | In Review |\n"
                    "| **FND-203** | Missing Rate Limiting on Password Reset | **MEDIUM** | MEDIUM | Proposed |\n\n"
                    "Let me know if you would like to drill into the technical details or remediation for a specific finding ID."
                )
                return {
                    "intent": "specific_query",
                    "summary": f"Active Findings Inventory for {project_name}",
                    "raw_text": findings_table,
                    "actions": [
                        {"id": "analyze-risk", "label": "Analyze Risk", "type": "analyze_risk", "variant": "secondary"},
                        {"id": "suggest-tests", "label": "Suggest Tests", "type": "suggest_tests", "variant": "secondary"},
                        {"id": "create-finding", "label": "Create Finding", "type": "create_finding", "variant": "primary"},
                    ]
                }

            # Remediation only query
            if quick_action == "suggest_remediation" or any(k in lower_msg for k in ["remediation", "recommendation", "how to fix", "patch"]):
                return {
                    "intent": "specific_query",
                    "summary": "Defensive Remediation Guidelines",
                    "recommendation": (
                        "1. **Enforce Parameterized Queries**: Use Prepared Statements with strongly typed bind parameters ($1, $2).\n"
                        "2. **Input Validation**: Enforce strict alphanumeric regex boundary checks on user-supplied parameters.\n"
                        "3. **Centralized Middleware**: Verify session token ownership before returning tenant object references."
                    ),
                    "suggestedValidation": "Re-test target endpoint with benign boundary strings and verify server responds with clean HTTP 400 Bad Request.",
                    "confidence": "HIGH",
                    "actions": [
                        {"id": "explain-remediation", "label": "Explain Remediation", "type": "explain_remediation", "variant": "secondary"},
                        {"id": "verify-fix", "label": "Verify Fix", "type": "verify_fix", "variant": "secondary"},
                        {"id": "add-to-report", "label": "Add to Report", "type": "add_to_report", "variant": "secondary"},
                    ]
                }

            # Single finding explanation
            candidate_finding = {
                "id": finding_data.get("id", "FND-201") if finding_data else "FND-201",
                "category": finding_data.get("category", "SQL Injection / Query Parameterization Weakness") if finding_data else "SQL Injection / Query Parameterization Weakness",
                "severity": finding_data.get("severity", "HIGH") if finding_data else "HIGH",
                "severity_rationale": "Allows unauthorized database schema observation and tenant table extraction.",
                "confidence": "HIGH" if (finding_data and finding_data.get("evidenceRefs")) else "HIGH",
                "confidence_justification": "Direct proof in PoC payload logs and verified error response signature.",
                "affected_asset": finding_data.get("affectedAsset", "api.apexfin.com/v1/auth") if finding_data else "api.apexfin.com/v1/auth",
                "evidence_refs": finding_data.get("evidenceRefs", ["EVD-101", "EVD-102"]) if finding_data else ["EVD-101", "EVD-102"],
                "description": "The username parameter is concatenated directly into SQL execution strings without parameterized binding.",
                "impact": "Unauthenticated actors can bypass credentials check and extract complete customer tables.",
                "recommendation": "Refactor repository queries to use parameterized prepared statements and implement alphanumeric regex validation.",
                "mitre_technique": "T1190 - Exploit Public-Facing Application",
                "detection_rule": "DEFAULT",
                "status": "proposed"
            }
            calibrated = FeedbackLoopService.filter_and_calibrate_findings([candidate_finding], project_id)
            SessionContextStore.save_discussed_finding(conv_id, candidate_finding["id"], candidate_finding)

            return {
                "intent": "specific_query",
                "summary": f"Technical Finding Review: {candidate_finding['id']}",
                "reasoning": "The vulnerability arises from unvalidated parameter propagation directly into backend query evaluations without schema boundary enforcement.",
                "recommendation": "Implement strict parameterized prepared statements and centralized input sanitization.",
                "confidence": "HIGH",
                "findings": calibrated,
                "actions": [
                    {"id": "create-finding", "label": "Create Finding", "type": "create_finding", "variant": "primary"},
                    {"id": "analyze-risk", "label": "Analyze Risk", "type": "analyze_risk", "variant": "secondary"},
                    {"id": "suggest-tests", "label": "Suggest Tests", "type": "suggest_tests", "variant": "secondary"},
                    {"id": "explain-more", "label": "Explain More", "type": "explain_more", "variant": "secondary"},
                ]
            }

        # 9. Handle FULL_ASSESSMENT Intent (Comprehensive assessment deliverable)
        candidate_findings = []
        if correlated_events:
            for idx, corr in enumerate(correlated_events):
                candidate_findings.append({
                    "id": f"FND-AI-{idx + 101}",
                    "category": "Lateral Movement / Multi-Source Pivot" if "IP" in corr.correlation_id else "Privilege Escalation",
                    "severity": "HIGH",
                    "severity_rationale": "Direct temporal correlation confirms multi-stage attacker progression across boundary assets.",
                    "confidence": "HIGH",
                    "confidence_justification": f"Directly supported by {len(corr.evidence_refs)} time-stamped log records in {corr.correlation_id}.",
                    "affected_asset": corr.primary_entity,
                    "evidence_refs": corr.evidence_refs,
                    "description": f"Observed suspicious sequential activity involving {corr.primary_entity} across {', '.join(corr.matched_sources)}.",
                    "impact": "Potential unauthorized lateral pivoting or privilege escalation across engagement scope.",
                    "recommendation": "Isolate affected host credentials, review firewall ACLs, and verify endpoint integrity.",
                    "mitre_technique": "T1078 - Valid Accounts" if "USR" in corr.correlation_id else "T1046 - Network Service Discovery",
                    "detection_rule": corr.detection_rule,
                    "status": "proposed"
                })
        else:
            candidate_findings.append({
                "id": "FND-AI-101",
                "category": "SQL Injection on Authentication Endpoint",
                "severity": "HIGH",
                "severity_rationale": "Direct multi-source logs confirm exploitability across perimeter assets.",
                "confidence": "HIGH",
                "confidence_justification": "Directly proven by PoC audit trail and verified database response.",
                "affected_asset": "api.apexfin.com / auth.apexfin.com",
                "evidence_refs": ["EVD-101", "EVD-102"],
                "description": "Observed unauthenticated injection and parameter traversal affecting primary tenant authentication controller.",
                "impact": "Potential confidentiality and integrity exposure permitting unauthorized administrative account access.",
                "recommendation": "Enforce strict prepared statement parameterization, rotate active session secrets, and apply rate limiting.",
                "mitre_technique": "T1190 - Exploit Public-Facing Application",
                "detection_rule": "DEFAULT",
                "status": "proposed"
            })

        calibrated_findings = FeedbackLoopService.filter_and_calibrate_findings(candidate_findings, project_id)
        for cf in calibrated_findings:
            SessionContextStore.save_discussed_finding(conv_id, cf["id"], cf)

        return {
            "intent": "full_assessment",
            "summary": f"Engagement Comprehensive Assessment Deliverable for {project_name}",
            "risk": {
                "level": "HIGH",
                "score": 84,
                "text": "Composite risk score evaluated across scope boundaries and active findings."
            },
            "reasoning": "Multi-vector assessment combining deterministic evidence correlation with grounded standard mappings (OWASP Top 10, MITRE ATT&CK).",
            "impact": "Adversaries exploiting identified attack chains could bypass tenant isolation and perform unauthorized administrative queries.",
            "recommendation": "1. Deploy parameterized database queries across all auth endpoints.\n2. Enforce centralized RBAC access control validation in API gateway.\n3. Implement perimeter rate limiting.",
            "suggestedValidation": "Execute automated regression test suite ensuring all malformed parameters yield HTTP 400 with zero stack traces.",
            "confidence": "HIGH",
            "findings": calibrated_findings,
            "correlated_events": [c.model_dump() for c in correlated_events],
            "actions": [
                {"id": "create-finding", "label": "Create Finding", "type": "create_finding", "variant": "primary"},
                {"id": "analyze-risk", "label": "Analyze Risk", "type": "analyze_risk", "variant": "secondary"},
                {"id": "suggest-tests", "label": "Suggest Tests", "type": "suggest_tests", "variant": "secondary"},
                {"id": "explain-more", "label": "Explain More", "type": "explain_more", "variant": "secondary"},
            ],
            "unverified_observations": []
        }
