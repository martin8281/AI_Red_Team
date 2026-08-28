"""
PostgreSQL + pgvector Data Models for Security Knowledge Base.
"""
from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field

class KnowledgeSourceModel(BaseModel):
    id: str
    name: str
    description: str
    source_type: str  # STANDARD, GUIDANCE, VULNERABILITY_DATABASE, INTERNAL_DOCUMENT, METHODOLOGY
    source_url: Optional[str] = None
    version: str = "1.0"
    status: str = "INDEXED"  # INDEXED, INDEXING, PENDING, ERROR
    documents_count: int = 0
    chunks_count: int = 0
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class KnowledgeDocumentModel(BaseModel):
    id: str
    source_id: str
    title: str
    content_hash: str  # SHA-256 to prevent duplicate indexing
    source_reference: str
    sections_count: int = 0
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class KnowledgeChunkModel(BaseModel):
    id: str
    document_id: str
    source_id: str
    source_name: str
    title: str
    section: str
    content: str
    chunk_index: int = 0
    embedding: Optional[List[float]] = None  # 768-dim vector from nomic-embed-text
    metadata: Dict[str, Any] = Field(default_factory=dict)
    similarity_score: Optional[float] = None
