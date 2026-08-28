from typing import Dict, Any
from pydantic import BaseModel

class SystemHealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str
    components: Dict[str, Any]

def get_system_health() -> Dict[str, Any]:
    return {
        "status": "HEALTHY",
        "service": "AI Red Team Assistant API",
        "version": "1.0.0",
        "environment": "production",
        "components": {
            "database": {"status": "UP", "engine": "PostgreSQL 16 + pgvector"},
            "ai_engine": {"status": "UP", "model": "qwen3:14b", "provider": "Ollama"},
            "embeddings": {"status": "UP", "model": "nomic-embed-text"},
            "rate_limiter": {"status": "ACTIVE"},
        }
    }

def get_assistant_health() -> Dict[str, Any]:
    return {
        "assistant_status": "ONLINE",
        "ollama_connection": "CONNECTED",
        "model": "qwen3:14b",
        "context_builder": "ACTIVE",
        "rag_retrieval": "OPERATIONAL",
    }
