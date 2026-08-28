from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class IngestSourcePayload(BaseModel):
    name: str = Field(..., description="Document or source name")
    source_type: str = Field(..., description="STANDARD, GUIDANCE, VULNERABILITY_DATABASE, METHODOLOGY")
    version: str = "1.0"
    source_url: Optional[str] = None
    raw_content: str = Field(..., description="Markdown or text content to chunk and embed")
    chunk_size: int = 500
    chunk_overlap: int = 50

class KnowledgeSearchQuery(BaseModel):
    query: str = Field(..., description="Semantic search query")
    source_type: Optional[str] = "ALL"
    top_k: int = 5
    similarity_threshold: float = 0.3

class KnowledgeSearchResult(BaseModel):
    document_id: str
    title: str
    source: str
    reference: str
    score: float
    content: str
