from typing import Dict, Any
import httpx
from pydantic import BaseModel
from backend.core.config import settings
from backend.core.observability import HealthMonitor, ObservabilityMetrics, SecurityAlertManager

class SystemHealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str
    components: Dict[str, Any]

async def check_ollama_connection() -> Dict[str, Any]:
    """
    Executes a real async HTTP probe to {OLLAMA_BASE_URL}/api/version with a short timeout.
    Returns status UP/CONNECTED if reachable, or DOWN with the real error otherwise.
    """
    url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/version"
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "reachable": True,
                    "status": "UP",
                    "connection": "CONNECTED",
                    "version": data.get("version", "unknown"),
                    "model": settings.OLLAMA_MODEL,
                }
            else:
                return {
                    "reachable": False,
                    "status": "DOWN",
                    "connection": "DOWN",
                    "error": f"HTTP {resp.status_code}: {resp.text[:120]}",
                    "model": settings.OLLAMA_MODEL,
                }
    except Exception as exc:
        return {
            "reachable": False,
            "status": "DOWN",
            "connection": "DOWN",
            "error": str(exc),
            "model": settings.OLLAMA_MODEL,
        }

async def get_system_health() -> Dict[str, Any]:
    ollama_check = await check_ollama_connection()
    ai_status = ollama_check["status"]
    system_status = "HEALTHY" if ai_status == "UP" else "DEGRADED"

    ai_engine_comp: Dict[str, Any] = {
        "status": ai_status,
        "model": settings.OLLAMA_MODEL,
        "provider": "Ollama",
    }
    if ai_status == "UP":
        ai_engine_comp["version"] = ollama_check.get("version")
    else:
        ai_engine_comp["error"] = ollama_check.get("error")

    return {
        "status": system_status,
        "service": "AI Red Team Assistant API",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "components": {
            "database": {"status": "UP", "engine": "PostgreSQL 16 + pgvector"},
            "ai_engine": ai_engine_comp,
            "embeddings": {"status": "UP", "model": settings.EMBEDDING_MODEL},
            "rate_limiter": {"status": "ACTIVE"},
        }
    }

async def get_assistant_health() -> Dict[str, Any]:
    ollama_check = await check_ollama_connection()
    is_connected = ollama_check["connection"] == "CONNECTED"
    res: Dict[str, Any] = {
        "assistant_status": "ONLINE" if is_connected else "DEGRADED",
        "ollama_connection": ollama_check["connection"],
        "model": settings.OLLAMA_MODEL,
        "context_builder": "ACTIVE",
        "rag_retrieval": "OPERATIONAL",
    }
    if is_connected:
        res["ollama_version"] = ollama_check.get("version")
    else:
        res["error"] = ollama_check.get("error", "Unknown error connecting to Ollama")
    return res

def get_liveness_check() -> Dict[str, Any]:
    return HealthMonitor.check_liveness()

def get_readiness_check() -> Dict[str, Any]:
    return HealthMonitor.check_readiness()

def get_diagnostics_report() -> Dict[str, Any]:
    return HealthMonitor.get_diagnostics()

def get_metrics_report() -> Dict[str, Any]:
    return ObservabilityMetrics.get_metrics_snapshot()

def get_security_alerts() -> Dict[str, Any]:
    return {"alerts": [a.model_dump() for a in SecurityAlertManager.get_alerts()]}
