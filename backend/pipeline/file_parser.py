"""
Universal File & Document Parser Service for AI Red Team Assistant.
Extracts clean, searchable plain text from PDF, Word (DOCX), Logs, CSV, JSON, XML, Code, and Archives.
"""
import io
import os
import re
import csv
import json
import zipfile
import tarfile
import hashlib
from typing import Dict, Any, Optional, List

try:
    import pypdf
except ImportError:
    pypdf = None

try:
    import docx
except ImportError:
    docx = None


class FileParserService:
    @staticmethod
    def compute_sha256(data: bytes) -> str:
        return hashlib.sha256(data).hexdigest()

    @classmethod
    def extract_text_from_pdf(cls, data: bytes) -> str:
        """Extracts text from PDF files using pypdf."""
        if pypdf is None:
            return "[PDF parser not available - please install pypdf]"
        try:
            reader = pypdf.PdfReader(io.BytesIO(data))
            text_parts = []
            for idx, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                if page_text.strip():
                    text_parts.append(f"--- Page {idx + 1} ---\n{page_text.strip()}")
            
            full_text = "\n\n".join(text_parts).strip()
            return full_text if full_text else "[PDF contains scanned images or non-extractable text]"
        except Exception as e:
            return f"[Error extracting text from PDF: {str(e)}]"

    @classmethod
    def extract_text_from_docx(cls, data: bytes) -> str:
        """Extracts text, paragraphs, and tables from Word DOCX files using python-docx."""
        if docx is None:
            return "[DOCX parser not available - please install python-docx]"
        try:
            doc = docx.Document(io.BytesIO(data))
            text_parts = []

            # 1. Paragraphs
            for p in doc.paragraphs:
                if p.text.strip():
                    text_parts.append(p.text.strip())

            # 2. Tables
            for t_idx, table in enumerate(doc.tables):
                table_rows = []
                for row in table.rows:
                    row_cells = [cell.text.strip().replace("\n", " ") for cell in row.cells]
                    table_rows.append(" | ".join(row_cells))
                if table_rows:
                    text_parts.append(f"\n[Table {t_idx + 1}]\n" + "\n".join(table_rows))

            full_text = "\n\n".join(text_parts).strip()
            return full_text if full_text else "[DOCX file contains no readable text]"
        except Exception as e:
            return f"[Error extracting text from DOCX: {str(e)}]"

    @classmethod
    def extract_text_from_plain_text(cls, data: bytes) -> str:
        """Decodes plain text / logs with multi-encoding fallback."""
        for enc in ["utf-8", "utf-8-sig", "latin-1", "cp1252", "iso-8859-1"]:
            try:
                return data.decode(enc)
            except UnicodeDecodeError:
                continue
        return data.decode("utf-8", errors="replace")

    @classmethod
    def extract_text_from_archive(cls, data: bytes, filename: str) -> str:
        """Inspects and extracts textual files inside ZIP or TAR archives."""
        text_parts = []
        try:
            if filename.lower().endswith(".zip"):
                with zipfile.ZipFile(io.BytesIO(data), "r") as zf:
                    file_list = zf.namelist()
                    text_parts.append(f"Archive Manifest ({len(file_list)} files):\n" + "\n".join([f"- {fn}" for fn in file_list[:30]]))
                    
                    extracted_count = 0
                    for fn in file_list:
                        ext = os.path.splitext(fn)[1].lower()
                        if ext in [".txt", ".log", ".json", ".csv", ".xml", ".md", ".py", ".sh", ".sql", ".env", ".yaml", ".yml"]:
                            try:
                                content_bytes = zf.read(fn)
                                file_str = cls.extract_text_from_plain_text(content_bytes)
                                text_parts.append(f"\n--- Archive File: {fn} ---\n{file_str[:5000]}")
                                extracted_count += 1
                                if extracted_count >= 5:
                                    break
                            except Exception:
                                continue

            elif filename.lower().endswith((".tar", ".tar.gz", ".tgz")):
                with tarfile.open(fileobj=io.BytesIO(data), mode="r:*") as tf:
                    members = tf.getmembers()
                    text_parts.append(f"Tar Archive Manifest ({len(members)} files):\n" + "\n".join([f"- {m.name}" for m in members[:30]]))
            
            return "\n\n".join(text_parts) if text_parts else f"[Archive {filename} contains binary files]"
        except Exception as e:
            return f"[Archive inspection error: {str(e)}]"

    @classmethod
    def extract_printable_strings(cls, data: bytes, min_length: int = 4) -> str:
        """Extracts printable ASCII strings from binary files (e.g., PCAP, EVTX, dumps)."""
        pattern = re.compile(rb"[\x20-\x7E]{" + str(min_length).encode() + rb",}")
        strings = [s.decode("ascii", errors="ignore") for s in pattern.findall(data[:200000])]
        meaningful = [s for s in strings if not s.isspace() and len(s) >= 4]
        return "\n".join(meaningful[:500]) if meaningful else "[Binary artifact - zero ASCII strings extracted]"

    @classmethod
    def parse_file(cls, filename: str, data: bytes) -> Dict[str, Any]:
        """
        Universal file parser dispatcher.
        Returns clean extracted content, category, sha256 checksum, and size.
        """
        ext = os.path.splitext(filename)[1].lower()
        sha256_hash = cls.compute_sha256(data)
        size = len(data)

        category = "DOCUMENT"
        extracted_text = ""

        if ext == ".pdf":
            category = "DOCUMENT"
            extracted_text = cls.extract_text_from_pdf(data)
        elif ext in [".docx", ".doc"]:
            category = "DOCUMENT"
            extracted_text = cls.extract_text_from_docx(data)
        elif ext in [".txt", ".md", ".rtf", ".log", ".csv", ".json", ".xml", ".yaml", ".yml", ".sql", ".html", ".js", ".ts", ".py", ".sh", ".ps1", ".env", ".config", ".trace", ".out", ".syslog"]:
            category = "LOG" if ext in [".log", ".trace", ".out", ".syslog"] else ("DATA" if ext in [".csv", ".json", ".xml", ".yaml", ".sql"] else "DOCUMENT")
            extracted_text = cls.extract_text_from_plain_text(data)
        elif ext in [".zip", ".tar", ".gz", ".tgz", ".7z", ".rar"]:
            category = "ARCHIVE"
            extracted_text = cls.extract_text_from_archive(data, filename)
        elif ext in [".pcap", ".pcapng", ".evtx", ".dump", ".raw", ".mem"]:
            category = "LOG"
            extracted_text = f"[Forensic Packet / Event Stream: {filename}]\n" + cls.extract_printable_strings(data)
        else:
            try:
                extracted_text = cls.extract_text_from_plain_text(data)
            except Exception:
                extracted_text = cls.extract_printable_strings(data)

        if len(extracted_text) > 40000:
            snippet = extracted_text[:40000] + f"\n\n... [TRUNCATED: {len(extracted_text)} total characters extracted]"
        else:
            snippet = extracted_text

        return {
            "name": filename,
            "extension": ext.lstrip("."),
            "category": category,
            "size": size,
            "sha256": sha256_hash,
            "content": snippet,
            "character_count": len(snippet),
        }
