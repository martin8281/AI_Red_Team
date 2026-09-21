"""
AI Red Team Assistant — Production FastAPI Application.
Equipped with strict CORS, Rate Limiting, Security Headers, Request Observability, and Health Probes.
"""
import time
import uuid
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.core.security import RateLimiter, SECURITY_HEADERS
from backend.core.observability import (
    StructuredLogger,
    LogLevel,
    ObservabilityMetrics,
    SecurityAlertManager,
    HealthMonitor
)
from backend.api.health import (
    get_system_health,
    get_assistant_health,
    get_liveness_check,
    get_readiness_check,
    get_diagnostics_report,
    get_metrics_report,
    get_security_alerts
)
from backend.api.assistant import router as assistant_router
from backend.api.auth import router as auth_router
from backend.api.workspace import router as workspace_router
from backend.api.risk import router as risk_router
from backend.api.reports import router as reports_router
from backend.api.knowledge import router as knowledge_router
from backend.api.analytics import router as analytics_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url=None,
)

app.include_router(auth_router)
app.include_router(assistant_router)
app.include_router(workspace_router)
app.include_router(risk_router)
app.include_router(reports_router)
app.include_router(knowledge_router)
app.include_router(analytics_router)

# 1. CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

rate_limiter = RateLimiter(max_requests=settings.RATE_LIMIT_PER_MINUTE)

# 2. Security Headers, Request Timing & Observability Middleware
@app.middleware("http")
async def observability_and_security_middleware(request: Request, call_next):
    start_time = time.time()
    request_id = request.headers.get("X-Request-ID", f"REQ-{uuid.uuid4().hex[:12]}")
    correlation_id = request.headers.get("X-Correlation-ID", f"CORR-{uuid.uuid4().hex[:12]}")
    client_ip = request.client.host if request.client else "unknown"

    # Rate limiting check
    if rate_limiter.is_rate_limited(client_ip):
        ObservabilityMetrics.record_security_event("RATE_LIMIT_EXCEEDED")
        StructuredLogger.log(
            level=LogLevel.SECURITY,
            event="RATE_LIMIT_EXCEEDED",
            request_id=request_id,
            correlation_id=correlation_id,
            operation=request.url.path,
            status="DENIED",
            metadata={"client_ip": client_ip}
        )
        raise HTTPException(status_code=429, detail="Too Many Requests. Rate limit exceeded.")

    try:
        response: Response = await call_next(request)
        duration_ms = (time.time() - start_time) * 1000
        
        # Record HTTP telemetry
        ObservabilityMetrics.record_http_request(response.status_code, duration_ms)
        
        # Attach Enterprise Security & Tracing Headers
        for header, value in SECURITY_HEADERS.items():
            response.headers[header] = value
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Correlation-ID"] = correlation_id

        # Log request if non-trivial or error
        if response.status_code >= 400:
            StructuredLogger.log(
                level=LogLevel.WARNING if response.status_code < 500 else LogLevel.ERROR,
                event="HTTP_REQUEST_ERROR",
                request_id=request_id,
                correlation_id=correlation_id,
                operation=f"{request.method} {request.url.path}",
                duration_ms=duration_ms,
                status=f"HTTP_{response.status_code}",
                metadata={"client_ip": client_ip, "status_code": response.status_code}
            )

        return response
    except HTTPException:
        raise
    except Exception as exc:
        duration_ms = (time.time() - start_time) * 1000
        ObservabilityMetrics.record_http_request(500, duration_ms)
        StructuredLogger.log(
            level=LogLevel.ERROR,
            event="UNHANDLED_EXCEPTION",
            request_id=request_id,
            correlation_id=correlation_id,
            operation=f"{request.method} {request.url.path}",
            duration_ms=duration_ms,
            status="EXCEPTION",
            error_type=type(exc).__name__,
            error_detail=str(exc),
            metadata={"client_ip": client_ip}
        )
        raise HTTPException(status_code=500, detail="Internal Server Error. Diagnostic trace recorded.")


# 3. Health, Diagnostics & Telemetry Endpoints
@app.get("/health")
async def health_check():
    return await get_system_health()

@app.get("/health/live")
async def liveness_probe():
    return get_liveness_check()

@app.get("/health/ready")
async def readiness_probe():
    return get_readiness_check()

@app.get("/health/diagnostics")
async def diagnostics_endpoint():
    return get_diagnostics_report()

@app.get("/api/observability/metrics")
async def metrics_endpoint():
    return get_metrics_report()

@app.get("/api/observability/alerts")
async def security_alerts_endpoint():
    return get_security_alerts()

@app.get("/api/assistant/health")
async def assistant_health():
    return await get_assistant_health()

@app.get("/")
async def root():
    return {"message": "AI Red Team Assistant API is operational and secured."}
