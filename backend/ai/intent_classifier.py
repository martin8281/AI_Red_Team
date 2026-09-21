import re
from enum import Enum
from typing import Optional, List, Dict, Any


class MessageIntent(str, Enum):
    CASUAL = "casual"
    CLARIFYING = "clarifying"
    FULL_ASSESSMENT = "full_assessment"
    SPECIFIC_QUERY = "specific_query"


class IntentClassifier:
    """
    Pre-processing routing layer that classifies user message intent into one of:
    - CASUAL: greetings, thanks, small talk, chit-chat
    - CLARIFYING: step-by-step triage guidance, setup questions, disambiguation
    - FULL_ASSESSMENT: comprehensive assessment, full risk evaluations, engagement reports
    - SPECIFIC_QUERY: targeted queries (list findings, get severity of #X, show remediation only)
    """

    # Regex patterns for CASUAL / Conversational
    CASUAL_PATTERNS = [
        r"^(h+i+|h+e+y+|h+e+l+l+o+|h+o+l+a+|howdy|sup|yo|what'?s\s*up|greetings|good\s*(morning|afternoon|evening)|hlo|hii+|heyy+|namaste|welcome)(\s+there)?[\s!.,?]*$",
        r"^(thanks|thank\s*you|thx|cheers|great|ok|okay|cool|got\s*it|nice|understood|awesome|sounds\s*good|perfect)(\s+very\s+much|\s+a\s+lot|\s+so\s+much)?[\s!.,?]*$",
        r"^(who\s+are\s+you|what\s+can\s+you\s+do|what\s+is\s+your\s+role|help\s+me|introduce\s+yourself)[\s!.,?]*$",
        r"^(how\s+are\s+you(\s+doing)?|how's\s+it\s+going|what's\s+up)[\s!.,?]*$",
        r"^(bye|goodbye|see\s+you|later)[\s!.,?]*$",
    ]

    # Regex patterns for CLARIFYING / Step-by-Step Guidance
    CLARIFYING_PATTERNS = [
        r"which\s+log\s+(should\s+i|to)\s+(look\s+at|check|upload|analyze|examine)\s+(first|next)?",
        r"how\s+(do|should|can)\s+i\s+(start|begin|proceed|triage|test|investigate|setup)",
        r"where\s+(do|can|should)\s+i\s+(start|begin|upload|attach|find|see|look)",
        r"what\s+(do\s+you\s+mean|does\s+this\s+mean|is\s+the\s+next\s+step|should\s+i\s+do\s+next)",
        r"(guide|walk)\s+me\s+through",
        r"what\s+(information|data|evidence|logs)\s+do\s+you\s+need",
        r"how\s+to\s+(configure|setup|use\s+this|begin\s+testing)",
        r"can\s+you\s+explain\s+what\s+you\s+need",
    ]

    # Regex patterns for FULL ASSESSMENT
    FULL_ASSESSMENT_PATTERNS = [
        r"(analyze|assess)\s+(this|the)\s+(entire\s+)?(project|engagement)",
        r"(give|provide|show)\s+me\s+(the\s+)?full\s+(risk\s+)?assessment",
        r"comprehensive\s+(analysis|assessment|audit|review)",
        r"generate\s+(an?\s+)?(engagement\s+)?(report|deliverable)",
        r"threat\s+model(ing)?\s+(review|assessment|analysis)",
        r"(overall|full|complete)\s+(risk\s+)?(posture|evaluation|summary)",
        r"executive\s+summary\s+of\s+(the\s+)?(project|engagement)",
        r"full\s+security\s+audit",
        r"audit\s+(this|the)\s+(project|engagement)",
        r"(main|all)\s+security\s+findings",
        r"prepare\s+(the\s+)?(main\s+)?findings",
    ]

    # Regex patterns for SPECIFIC QUERY
    SPECIFIC_QUERY_PATTERNS = [
        r"(list|show|display|get)\s+(the\s+)?(all\s+|open\s+|verified\s+)?findings",
        r"what('s|\s+is)\s+the\s+severity\s+of\s+(finding|fnd)",
        r"(explain|describe)\s+(finding|vulnerability|fnd|vuln)",
        r"(show|give)\s+me\s+(just\s+|only\s+)?(the\s+)?(remediation|recommendation|fix|patch)",
        r"what\s+(are\s+the\s+)?recommendations?\s+for",
        r"is\s+([a-zA-Z0-9.-]+)\s+in\s+scope",
        r"(show|view|get)\s+(the\s+)?evidence\s+(for|of)",
        r"what\s+is\s+(cve|cwe|cvss|mitre)",
        r"show\s+(me\s+)?(the\s+)?(cvss|risk\s+score)\s+(for|of)?",
        r"how\s+many\s+findings",
    ]

    @classmethod
    def classify(
        cls,
        message: str,
        quick_action: Optional[str] = None,
        has_attachments: bool = False
    ) -> MessageIntent:
        clean_msg = message.strip()
        lower_msg = clean_msg.lower()

        # 1. Check quick actions first
        if quick_action:
            if quick_action in ["summarize_project"]:
                return MessageIntent.FULL_ASSESSMENT
            elif quick_action in ["explain_finding", "suggest_remediation", "generate_description", "analyze_risk"]:
                return MessageIntent.SPECIFIC_QUERY
            elif quick_action in ["analyze_forensics"]:
                return MessageIntent.FULL_ASSESSMENT if has_attachments else MessageIntent.SPECIFIC_QUERY

        # 2. If forensic attachments are uploaded, default to specific/full analysis depending on query length
        if has_attachments and not clean_msg:
            return MessageIntent.FULL_ASSESSMENT

        # 3. Check Casual / Conversational patterns
        for pattern in cls.CASUAL_PATTERNS:
            if re.search(pattern, lower_msg, re.IGNORECASE):
                return MessageIntent.CASUAL

        # 4. Check Clarifying / Step-by-Step patterns
        for pattern in cls.CLARIFYING_PATTERNS:
            if re.search(pattern, lower_msg, re.IGNORECASE):
                return MessageIntent.CLARIFYING

        # 5. Check Full Assessment patterns
        for pattern in cls.FULL_ASSESSMENT_PATTERNS:
            if re.search(pattern, lower_msg, re.IGNORECASE):
                return MessageIntent.FULL_ASSESSMENT

        # 6. Check Specific Query patterns
        for pattern in cls.SPECIFIC_QUERY_PATTERNS:
            if re.search(pattern, lower_msg, re.IGNORECASE):
                return MessageIntent.SPECIFIC_QUERY

        # 7. Short messages without keywords (< 15 chars) default to CASUAL
        if len(lower_msg) < 12 and not any(k in lower_msg for k in ["vuln", "log", "risk", "find", "port", "ip", "cve"]):
            return MessageIntent.CASUAL

        # 8. Default fallback for technical inquiries is SPECIFIC_QUERY (focused)
        return MessageIntent.SPECIFIC_QUERY

    @classmethod
    def get_output_instruction(cls, intent: MessageIntent) -> str:
        """
        Returns targeted prompt constraints based on classified intent.
        """
        if intent == MessageIntent.CASUAL:
            return (
                "### RESPONSE FORMAT INSTRUCTION: CASUAL CONVERSATION\n"
                "- Reply in friendly, professional, natural language plain text.\n"
                "- DO NOT use structured cards, threat impact sections, remediation templates, or severity/confidence badges.\n"
                "- Keep the response concise and conversational (1-3 sentences)."
            )
        elif intent == MessageIntent.CLARIFYING:
            return (
                "### RESPONSE FORMAT INSTRUCTION: STEP-BY-STEP GUIDANCE\n"
                "- Provide clear, actionable guidance or a numbered 1-2-3 sequential list.\n"
                "- Explain clearly what to inspect or attach next without generating a full assessment template.\n"
                "- Do not include unrequested Risk Rating, Threat Impact, or Validation sections."
            )
        elif intent == MessageIntent.SPECIFIC_QUERY:
            return (
                "### RESPONSE FORMAT INSTRUCTION: TARGETED SPECIFIC RESPONSE\n"
                "- Answer ONLY the specific question asked. Do not pad the response with unrequested sections.\n"
                "- If asking for a list of findings, provide a concise markdown list or table.\n"
                "- If asking about a single vulnerability, provide only its technical mechanism and remediation.\n"
                "- Do NOT generate full assessment cards (Threat Impact, Validation, Executive Risk) unless specifically requested."
            )
        elif intent == MessageIntent.FULL_ASSESSMENT:
            return (
                "### RESPONSE FORMAT INSTRUCTION: FULL ENGAGEMENT ASSESSMENT\n"
                "- Provide a comprehensive structured assessment with Risk Rating, Technical Reasoning, Threat Impact, Remediation, and Validation methodology.\n"
                "- Include all calibrated finding cards and pre-computed correlations."
            )
        return ""
