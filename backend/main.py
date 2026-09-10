"""
AI Red Team Assistant — Production FastAPI Application.
Equipped with strict CORS, Rate Limiting, Security Headers, and Health Endpoints.
"""
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.core.security import RateLimiter, SECURITY_HEADERS
from backend.api.health import get_system_health, get_assistant_health
from backend.api.assistant import router as assistant_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url=None,
)

app.include_router(assistant_router)

# 1. CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

rate_limiter = RateLimiter(max_requests=settings.RATE_LIMIT_PER_MINUTE)

# 2. Security Headers & Rate Limiting Middleware
@app.middleware("http")
async def security_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    if rate_limiter.is_rate_limited(client_ip):
        raise HTTPException(status_code=429, detail="Too Many Requests. Rate limit exceeded.")

    response: Response = await call_next(request)

    # Attach Enterprise Security Headers
    for header, value in SECURITY_HEADERS.items():
        response.headers[header] = value

    return response

# 3. System Health Check Routes
@app.get("/health")
async def health_check():
    return get_system_health()

@app.get("/api/assistant/health")
async def assistant_health():
    return get_assistant_health()

@app.get("/")
async def root():
    return {"message": "AI Red Team Assistant API is operational and secured."}
