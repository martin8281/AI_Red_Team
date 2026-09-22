from typing import Optional

SYSTEM_PROMPT = """
You are AI Red Team Assistant, an authorized Digital Forensics & Cyber Security Co-Pilot.
Your primary role is to assist human investigators by analyzing evidence, logs, PCAPs, code, and reports with strict precision and evidence grounding.

CORE DIRECTIVES:
1. Grounding & Evidence Integrity: Rely strictly on observed evidence. Never invent indicators, IP addresses, filenames, hashes, or timestamps.
2. Read-Only Scope: Operate on verified evidence copies. Surface observed facts, technical mechanisms, and indicators clearly.
3. Clarity & Accuracy: Separate observed facts from interpretations. If evidence is insufficient for a claim, state explicitly: "This cannot be confirmed from the provided evidence."
""".strip()


from .intent_classifier import IntentClassifier, MessageIntent


class PromptManager:
    @staticmethod
    def build_prompt(
        context_text: str,
        user_message: str,
        quick_action: Optional[str] = None,
        intent: Optional[MessageIntent] = None,
        mode: str = "chat"
    ) -> str:
        actionable_prompt = user_message

        if quick_action:
            if quick_action == "explain_finding":
                actionable_prompt = (
                    "Explain the root cause and technical vulnerability mechanism of this finding. "
                    "Highlight why this occurs and the typical threat vector involved."
                )
            elif quick_action == "analyze_risk":
                actionable_prompt = (
                    "Conduct a comprehensive risk analysis for this context. "
                    "Evaluate exploitability, asset criticality, CVSS severity, and potential business disruption."
                )
            elif quick_action == "suggest_remediation":
                actionable_prompt = (
                    "Provide concrete, defense-in-depth remediation guidelines and patch recommendations "
                    "aligned with OWASP best practices."
                )
            elif quick_action == "summarize_project":
                actionable_prompt = (
                    "Provide an executive-level summary of this security assessment engagement, "
                    "highlighting total scope coverage, key vulnerabilities discovered, and posture."
                )
            elif quick_action == "generate_description":
                actionable_prompt = (
                    "Draft a formal, audit-compliant vulnerability description and reproduction observation text "
                    "suitable for inclusion in an executive assessment deliverable."
                )
            elif quick_action == "analyze_forensics":
                actionable_prompt = (
                    "Analyze the attached forensic evidence log for Indicators of Compromise (IoCs) and "
                    "parameter taint propagation."
                )

        file_instruction = ""
        is_report_query = any(phrase in user_message.lower() for phrase in [
            "summarize", "summary", "main findings", "key findings", "important findings",
            "analyze this report", "what did you find", "explain this report", "what is this report about",
            "list the findings", "list findings", "report", "what does this report contain"
        ])

        if "ATTACHED FILE:" in context_text or "ATTACHED EVIDENCE / REPORT FILES" in context_text or is_report_query:
            file_instruction = (
                "\n\n═══════════════════════════════════════════════════════════════\n"
                "STRICT REPORT ANALYSIS RESPONSE TEMPLATE (MANDATORY FORMAT)\n"
                "═══════════════════════════════════════════════════════════════\n"
                "When analyzing uploaded reports, network captures, logs, forensic evidence, or documents:\n"
                "Analyze the COMPLETE uploaded file from start to end. Output your response in clear, beautifully formatted Markdown following this EXACT structure:\n\n"
                "## Report Summary\n\n"
                "Provide a concise paragraph summarizing what the evidence/report contains and the main activity observed.\n\n"
                "* **Primary Activity**: [Detailed description of primary observed activity, hosts, MACs, protocols]\n"
                "* **Technical Details**:\n"
                "  * **Source Host**: [Source IP, MAC, Outbound TTL, Packet Lengths, etc.]\n"
                "  * **Destination Host**: [Destination IP, Inbound TTL, Services, etc.]\n"
                "  * **Sequence Numbers / Scope**: [Observed packet sequences, protocols, ports, timestamps]\n"
                "* **Observed Anomalies**:\n"
                "  * **[Anomaly Name]**: [Specific packet number, timestamp, dropped packets, errors, or unusual events]\n"
                "* **Conclusion**: [Overall evidence-based conclusion]\n\n"
                "---\n\n"
                "## Key Findings\n\n"
                "### 1. [Finding Name / Anomaly #1]\n"
                "* **Description**: [Exact evidence observation with IPs, packet numbers, timestamps, protocols]\n"
                "* **Impact**: [Security or operational impact]\n\n"
                "### 2. [Finding Name / Anomaly #2]\n"
                "* **Description**: [Exact evidence observation]\n"
                "* **Impact**: [Security or operational impact]\n\n"
                "STRICT RULES:\n"
                "- Extract EXACT IP addresses, MAC addresses, timestamps, protocols, ports, sequence numbers, packet numbers, and payload details from the evidence.\n"
                "- Do NOT invent or hallucinate data not present in the uploaded file.\n"
                "- If something cannot be confirmed, explicitly state: **“This cannot be confirmed from the provided evidence.”**\n"
            )

        if mode == "chat":
            if is_report_query or "ATTACHED FILE:" in context_text or "ATTACHED EVIDENCE" in context_text:
                format_instruction = "### ACTIVE MODE: NORMAL CHAT (Provide a clean, conversational analysis using headings '## Report Summary' and '## Main Findings')\n\n"
            else:
                format_instruction = "### ACTIVE MODE: NORMAL CHAT (Respond conversationally and directly to the user's prompt in clear, professional markdown. Do NOT use JSON schemas, finding objects, or risk cards.)\n\n"
        else:
            classified_intent = intent or IntentClassifier.classify(user_message, quick_action)
            format_instruction = IntentClassifier.get_output_instruction(classified_intent)

        return (
            f"{SYSTEM_PROMPT}\n\n"
            f"{format_instruction}"
            f"{file_instruction}\n\n"
            f"### CONTEXT & ATTACHED EVIDENCE:\n{context_text}\n\n"
            f"### USER REQUEST:\n{actionable_prompt}"
        )
