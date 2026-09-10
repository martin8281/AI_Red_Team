import os
import csv
import json
import hashlib
import re
from datetime import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from .correlation_engine import LogRecord


class IngestedEvidenceItem(BaseModel):
    evidence_id: str
    project_id: str
    file_name: str
    pipeline_type: str  # "STRUCTURED_SQL" or "UNSTRUCTURED_VECTOR"
    timestamp: str
    summary: str
    content_hash: str
    metadata: Dict[str, Any] = {}


class UniversalIngestionRouter:
    """
    Differentiated Ingestion Pipeline:
    - Structured logs (CSV/JSON/LOG/EVTX): parsed into time-indexed records with
      immutable SHA-256 evidence hashes for exact field & time-range SQL queries.
    - Unstructured documents (PDF/DOCX/MD/TXT): semantic chunking for RAG vector search.
    """

    @staticmethod
    def compute_sha256(content: str) -> str:
        return hashlib.sha256(content.strip().encode("utf-8")).hexdigest()

    @classmethod
    def route_and_ingest_content(
        cls,
        file_name: str,
        content: str,
        project_id: str
    ) -> Dict[str, Any]:
        ext = os.path.splitext(file_name)[1].lower()

        if ext in [".csv", ".json", ".log", ".evtx", ".syslog"]:
            return cls._ingest_structured_content(file_name, content, project_id)
        elif ext in [".pdf", ".docx", ".md", ".txt"]:
            return cls._ingest_unstructured_content(file_name, content, project_id)
        else:
            # Fallback to structured log line parser
            return cls._ingest_structured_content(file_name, content, project_id)

    @classmethod
    def _ingest_structured_content(
        cls,
        file_name: str,
        content: str,
        project_id: str
    ) -> Dict[str, Any]:
        records: List[LogRecord] = []
        evidence_items: List[IngestedEvidenceItem] = []

        lines = [line for line in content.splitlines() if line.strip()]

        # 1. Try CSV Parsing
        if file_name.lower().endswith(".csv") or ("," in lines[0] if lines else False):
            try:
                reader = csv.DictReader(lines)
                for idx, row in enumerate(reader):
                    ev_hash = cls.compute_sha256(f"{file_name}_{idx}_{json.dumps(row)}")[:10].upper()
                    ev_id = f"EVD-{ev_hash}"
                    
                    # Parse timestamp or default
                    ts_str = row.get("timestamp") or row.get("time") or row.get("datetime") or datetime.utcnow().isoformat()
                    try:
                        ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                    except Exception:
                        ts = datetime.utcnow()

                    src_ip = row.get("src_ip") or row.get("source_ip") or row.get("client_ip") or row.get("ip")
                    dest_ip = row.get("dest_ip") or row.get("destination_ip") or row.get("server_ip")
                    user = row.get("user") or row.get("username") or row.get("account")
                    asset = row.get("asset") or row.get("host") or row.get("hostname") or file_name
                    action = row.get("action") or row.get("event") or row.get("status") or "OBSERVED"
                    log_type = row.get("log_type") or ("auth" if "auth" in file_name.lower() else "firewall" if "fw" in file_name.lower() else "web_access")

                    rec = LogRecord(
                        evidence_id=ev_id,
                        source_file=file_name,
                        timestamp=ts,
                        log_type=log_type,
                        src_ip=src_ip,
                        dest_ip=dest_ip,
                        user=user,
                        asset=asset,
                        action=action.upper(),
                        raw_payload=json.dumps(row)
                    )
                    records.append(rec)
                    evidence_items.append(IngestedEvidenceItem(
                        evidence_id=ev_id,
                        project_id=project_id,
                        file_name=file_name,
                        pipeline_type="STRUCTURED_SQL",
                        timestamp=ts.isoformat(),
                        summary=f"Row {idx+1}: {action} on {asset} (src: {src_ip or 'N/A'})",
                        content_hash=ev_hash,
                        metadata=row
                    ))
            except Exception:
                # Fallback to line parser if CSV format fails
                pass

        # 2. Line-by-line / Syslog / JSON Parser fallback
        if not records:
            ip_pattern = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
            for idx, line in enumerate(lines):
                ev_hash = cls.compute_sha256(f"{file_name}_{idx}_{line}")[:10].upper()
                ev_id = f"EVD-{ev_hash}"
                
                # Check for IP
                found_ips = ip_pattern.findall(line)
                src_ip = found_ips[0] if found_ips else None
                dest_ip = found_ips[1] if len(found_ips) > 1 else None

                # Detect action keywords
                line_upper = line.upper()
                if "FAILED" in line_upper or "FAILURE" in line_upper:
                    action = "FAILED_LOGIN"
                elif "ACCEPTED" in line_upper or "SUCCESS" in line_upper:
                    action = "SUCCESS_LOGIN"
                elif "DENIED" in line_upper or "DROP" in line_upper or "BLOCK" in line_upper:
                    action = "DENY"
                elif "ALLOW" in line_upper or "PASS" in line_upper:
                    action = "ALLOW"
                elif "500" in line_upper or "ERROR" in line_upper:
                    action = "HTTP_500"
                else:
                    action = "LOG_EVENT"

                log_type = "auth" if "auth" in file_name.lower() or "sshd" in line.lower() else (
                    "firewall" if "firewall" in file_name.lower() or "iptables" in line.lower() else "web_access"
                )

                rec = LogRecord(
                    evidence_id=ev_id,
                    source_file=file_name,
                    timestamp=datetime.utcnow(),
                    log_type=log_type,
                    src_ip=src_ip,
                    dest_ip=dest_ip,
                    user=None,
                    asset=file_name,
                    action=action,
                    raw_payload=line
                )
                records.append(rec)
                evidence_items.append(IngestedEvidenceItem(
                    evidence_id=ev_id,
                    project_id=project_id,
                    file_name=file_name,
                    pipeline_type="STRUCTURED_SQL",
                    timestamp=datetime.utcnow().isoformat(),
                    summary=line[:120],
                    content_hash=ev_hash,
                    metadata={"raw_line": line}
                ))

        return {
            "pipeline_type": "STRUCTURED_SQL",
            "file_name": file_name,
            "record_count": len(records),
            "evidence_items": [e.model_dump() for e in evidence_items],
            "log_records": records
        }

    @classmethod
    def _ingest_unstructured_content(
        cls,
        file_name: str,
        content: str,
        project_id: str
    ) -> Dict[str, Any]:
        cleaned = re.sub(r"\r\n", "\n", content)
        cleaned = re.sub(r"[ \t]+", " ", cleaned).strip()
        paragraphs = [p.strip() for p in cleaned.split("\n\n") if len(p.strip()) > 30]

        chunks = []
        evidence_items = []
        for idx, para in enumerate(paragraphs):
            ev_hash = cls.compute_sha256(f"{file_name}_{idx}_{para}")[:10].upper()
            ev_id = f"DOC-{ev_hash}"
            chunks.append({
                "chunk_id": ev_id,
                "section": f"Section {idx + 1}",
                "content": para,
                "token_estimate": len(para.split()),
            })
            evidence_items.append(IngestedEvidenceItem(
                evidence_id=ev_id,
                project_id=project_id,
                file_name=file_name,
                pipeline_type="UNSTRUCTURED_VECTOR",
                timestamp=datetime.utcnow().isoformat(),
                summary=para[:100] + "...",
                content_hash=ev_hash,
                metadata={"section": f"Section {idx + 1}"}
            ))

        return {
            "pipeline_type": "UNSTRUCTURED_VECTOR",
            "file_name": file_name,
            "chunk_count": len(chunks),
            "chunks": chunks,
            "evidence_items": [e.model_dump() for e in evidence_items]
        }
