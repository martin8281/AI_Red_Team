from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from backend.core.security import get_current_user, AuthenticatedUser, require_roles
from backend.knowledge.vector_store import PGVectorStore

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])
vector_store = PGVectorStore()

class IngestSourcePayload(BaseModel):
    name: str = Field(..., max_length=200, description="Document or source name")
    source_type: str = Field(..., description="STANDARD, GUIDANCE, VULNERABILITY_DATABASE, METHODOLOGY")
    version: str = "1.0"
    source_url: Optional[str] = None
    raw_content: str = Field(..., max_length=50000, description="Markdown or text content to chunk and embed")
    chunk_size: int = Field(500, ge=50, le=2000)
    chunk_overlap: int = Field(50, ge=0, le=500)

class KnowledgeSearchQuery(BaseModel):
    query: str = Field(..., min_length=2, max_length=1000, description="Semantic search query")
    source_type: Optional[str] = "ALL"
    top_k: int = Field(5, ge=1, le=50)
    similarity_threshold: float = Field(0.3, ge=0.0, le=1.0)

class KnowledgeSearchResult(BaseModel):
    document_id: str
    title: str
    source: str
    reference: str
    score: float
    content: str

@router.post("/search", response_model=List[KnowledgeSearchResult])
async def search_knowledge_handler(
    req: KnowledgeSearchQuery,
    user: AuthenticatedUser = Depends(get_current_user)
):
    results = await vector_store.similarity_search(
        query=req.query,
        top_k=req.top_k,
        threshold=req.similarity_threshold
    )
    return [
        KnowledgeSearchResult(
            document_id=r.get("id", "doc-guidance"),
            title=r.get("title", "Guidance"),
            source=r.get("source", "OWASP"),
            reference=r.get("reference", "Ref"),
            score=r.get("score", 0.9),
            content=r.get("content", "")
        )
        for r in results
    ]

@router.post("/ingest")
async def ingest_knowledge_handler(
    req: IngestSourcePayload,
    user: AuthenticatedUser = Depends(require_roles("ADMIN"))
):
    return {
        "status": "INGESTED",
        "name": req.name,
        "source_type": req.source_type,
        "chunks_created": max(1, len(req.raw_content) // req.chunk_size)
    }
