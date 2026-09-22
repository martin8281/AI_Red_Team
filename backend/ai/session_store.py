import hashlib
import re
from datetime import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from ..pipeline.correlation_engine import LogRecord, CorrelatedEvent
from ..pipeline.ingestion_router import UniversalIngestionRouter


class StatedFact(BaseModel):
    fact_id: str
    content: str
    source_turn: int
    category: str = "SCOPE_CONSTRAINT"  # "SCOPE_CONSTRAINT", "ENVIRONMENT_FACT", "TARGET_EXCLUSION", "TESTING_NOTE"
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class SessionEvidenceFile(BaseModel):
    file_id: str
    name: str
    category: str
    extension: str
    size: int
    evidence_ids: List[str]
    content_snippet: str
    raw_content: str = ""
    uploaded_at: str
    parsed_records_count: int = 0


class SessionContext(BaseModel):
    conversation_id: str
    project_id: str
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    turn_count: int = 0
    uploaded_files: Dict[str, SessionEvidenceFile] = Field(default_factory=dict)
    all_log_records: List[LogRecord] = Field(default_factory=list)
    stated_facts: List[StatedFact] = Field(default_factory=list)
    discussed_findings: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
    correlation_clusters: List[CorrelatedEvent] = Field(default_factory=list)


class SessionContextStore:
    """
    In-memory / Persistent Session Memory Layer for AI Red Team Assistant.
    Maintains all files, facts, constraints, and correlations across multi-turn sessions.
    """

    _sessions: Dict[str, SessionContext] = {}

    @classmethod
    def clear_session(cls, conversation_id: str) -> None:
        if conversation_id in cls._sessions:
            del cls._sessions[conversation_id]

    @classmethod
    def get_or_create(cls, conversation_id: str, project_id: str) -> SessionContext:
        if conversation_id not in cls._sessions:
            cls._sessions[conversation_id] = SessionContext(
                conversation_id=conversation_id,
                project_id=project_id
            )
        return cls._sessions[conversation_id]

    @classmethod
    def register_turn(
        cls,
        conversation_id: str,
        project_id: str,
        user_message: str,
        attachments: Optional[List[Dict[str, Any]]] = None
    ) -> SessionContext:
        session = cls.get_or_create(conversation_id, project_id)
        session.turn_count += 1
        session.updated_at = datetime.utcnow().isoformat()

        # 1. Ingest and persist any newly uploaded files
        if attachments:
            for att in attachments:
                file_name = att.get("name", "evidence.log")
                content = (
                    att.get("content") or 
                    att.get("raw_content") or 
                    att.get("rawContent") or 
                    att.get("fullContent") or 
                    att.get("contentSnippet") or 
                    ""
                )
                att_id = att.get("id") or hashlib.sha256(f"{file_name}_{content}".encode()).hexdigest()[:8]

                if att_id not in session.uploaded_files or len(content) > len(session.uploaded_files[att_id].raw_content):
                    ingest_res = UniversalIngestionRouter.route_and_ingest_content(
                        file_name=file_name,
                        content=content,
                        project_id=project_id
                    )

                    ev_ids = [e["evidence_id"] for e in ingest_res.get("evidence_items", [])]
                    new_records = ingest_res.get("log_records", [])

                    session.uploaded_files[att_id] = SessionEvidenceFile(
                        file_id=att_id,
                        name=file_name,
                        category=att.get("category", "LOG"),
                        extension=att.get("extension", file_name.split(".")[-1] if "." in file_name else "txt"),
                        size=att.get("size", len(content)),
                        evidence_ids=ev_ids,
                        content_snippet=content[:2000],
                        raw_content=content,
                        uploaded_at=datetime.utcnow().isoformat(),
                        parsed_records_count=len(new_records)
                    )

                    if new_records:
                        session.all_log_records.extend(new_records)

        # 2. Extract and accumulate user-stated facts, constraints, and scope overrides
        cls._extract_facts_from_message(session, user_message)

        return session

    @classmethod
    def _extract_facts_from_message(cls, session: SessionContext, user_message: str) -> None:
        """
        Extracts persistent user constraints such as:
        - "scoped to /login and /api"
        - "ignore findings from staging server"
        - "target database is PostgreSQL 16"
        - "use token format Bearer"
        """
        msg = user_message.strip()
        lower = msg.lower()

        # Check for scope definitions
        scope_match = re.search(r"(?:scope\s+is|scoped\s+to|only\s+test|target\s+is)\s+([^.,\n]+)", msg, re.IGNORECASE)
        if scope_match:
            fact_text = f"Scope Constraint: {scope_match.group(0).strip()}"
            cls._add_fact_if_new(session, fact_text, "SCOPE_CONSTRAINT")

        # Check for exclusions / ignore rules
        ignore_match = re.search(r"(?:ignore|exclude|skip|disregard)\s+([^.,\n]+)", msg, re.IGNORECASE)
        if ignore_match:
            fact_text = f"Exclusion Rule: {ignore_match.group(0).strip()}"
            cls._add_fact_if_new(session, fact_text, "TARGET_EXCLUSION")

        # Check for environment facts
        env_match = re.search(r"(?:running\s+on|database\s+is|server\s+is|framework\s+is)\s+([^.,\n]+)", msg, re.IGNORECASE)
        if env_match:
            fact_text = f"Environment Architecture: {env_match.group(0).strip()}"
            cls._add_fact_if_new(session, fact_text, "ENVIRONMENT_FACT")

    @classmethod
    def _add_fact_if_new(cls, session: SessionContext, fact_content: str, category: str) -> None:
        # Avoid duplicate facts
        for f in session.stated_facts:
            if f.content.lower() == fact_content.lower():
                return

        fact_id = f"FACT-{len(session.stated_facts) + 1}"
        session.stated_facts.append(StatedFact(
            fact_id=fact_id,
            content=fact_content,
            source_turn=session.turn_count,
            category=category
        ))

    @classmethod
    def save_discussed_finding(cls, conversation_id: str, finding_id: str, finding_data: Dict[str, Any]) -> None:
        if conversation_id in cls._sessions:
            cls._sessions[conversation_id].discussed_findings[finding_id] = finding_data

    @classmethod
    def save_correlation_clusters(cls, conversation_id: str, clusters: List[CorrelatedEvent]) -> None:
        if conversation_id in cls._sessions:
            cls._sessions[conversation_id].correlation_clusters = clusters

    @classmethod
    def build_session_context_prompt(cls, conversation_id: str) -> str:
        """
        Packages all cumulative session files, stated facts, findings, and correlations
        into an organized context block for the LLM prompt.
        """
        if conversation_id not in cls._sessions:
            return ""

        session = cls._sessions[conversation_id]
        parts = []

        # 1. Stated User Facts & Scope Constraints
        if session.stated_facts:
            facts_str = "\n".join([f"- [{f.fact_id}] ({f.category}) {f.content}" for f in session.stated_facts])
            parts.append(f"### USER-STATED SESSION CONSTRAINTS & FACTS (MUST ENFORCE):\n{facts_str}")

        # 2. Cumulative Uploaded Evidence Files & Raw Data
        if session.uploaded_files:
            file_summaries = []
            for f in session.uploaded_files.values():
                ev_str = f"Evidences: {', '.join(f.evidence_ids[:4])}{'...' if len(f.evidence_ids) > 4 else ''}"
                file_text = f.raw_content if f.raw_content else f.content_snippet
                file_summaries.append(
                    f"================================================================================\n"
                    f"ATTACHED FILE: {f.name} (Type: {f.category}, Size: {f.size} bytes) | {ev_str}\n"
                    f"================================================================================\n"
                    f"{file_text[:30000]}\n"
                    f"================================================================================"
                )
            parts.append(
                f"### ATTACHED EVIDENCE / REPORT FILES (YOU MUST CAREFULLY READ AND ANALYZE THE FULL CONTENT BELOW):\n" +
                "\n\n".join(file_summaries)
            )

        # 3. Parsed Structured Row-Level Log Records (from CSV / JSON / LOG parsing)
        if session.all_log_records:
            record_lines = []
            for idx, r in enumerate(session.all_log_records[:40]):
                ts_str = r.timestamp.isoformat() if hasattr(r.timestamp, "isoformat") else str(r.timestamp)
                rec_info = f"- [Row {idx+1} | {r.evidence_id}] {ts_str} | IP: {r.src_ip or 'N/A'} -> {r.dest_ip or 'N/A'} | User: {r.user or 'N/A'} | Host/Asset: {r.asset or 'N/A'} | Action: {r.action}"
                if r.raw_payload:
                    rec_info += f" | Data: {r.raw_payload}"
                record_lines.append(rec_info)
            parts.append(f"### PARSED STRUCTURED LOG / CSV RECORDS ({len(session.all_log_records)} Total Rows):\n" + "\n".join(record_lines))

        # 4. Pre-computed Correlations
        if session.correlation_clusters:
            corr_summaries = [f"- [{c.correlation_id}] {c.summary} (Evidences: {', '.join(c.evidence_refs)})" for c in session.correlation_clusters]
            parts.append(f"### CUMULATIVE PRE-COMPUTED CORRELATION CLUSTERS:\n" + "\n".join(corr_summaries))

        # 5. Discussed / Proposed Findings in this session
        if session.discussed_findings:
            fnd_summaries = [f"- [{fid}] {f.get('category', 'Finding')} ({f.get('severity', 'HIGH')}) on {f.get('affected_asset', 'N/A')}: Status={f.get('status', 'proposed')}" for fid, f in session.discussed_findings.items()]
            parts.append(f"### FINDINGS GENERATED / DISCUSSED IN THIS SESSION ({len(session.discussed_findings)} Total):\n" + "\n".join(fnd_summaries))

        return "\n\n".join(parts)
