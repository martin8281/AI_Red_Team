import hashlib
import re
from typing import List, Dict, Any

class DocumentIngestionPipeline:
    @staticmethod
    def compute_sha256(content: str) -> str:
        return hashlib.sha256(content.strip().encode("utf-8")).hexdigest()

    @staticmethod
    def clean_text(raw_text: str) -> str:
        cleaned = re.sub(r"\r\n", "\n", raw_text)
        cleaned = re.sub(r"[ \t]+", " ", cleaned)
        return cleaned.strip()

    @staticmethod
    def chunk_text(
        text: str,
        chunk_size: int = 500,
        chunk_overlap: int = 50
    ) -> List[Dict[str, Any]]:
        cleaned = DocumentIngestionPipeline.clean_text(text)
        paragraphs = [p.strip() for p in cleaned.split("\n\n") if len(p.strip()) > 30]

        chunks = []
        for idx, para in enumerate(paragraphs):
            chunks.append({
                "chunk_index": idx,
                "section": f"Section {idx + 1}",
                "content": para,
                "token_estimate": len(para.split()),
            })
        return chunks
