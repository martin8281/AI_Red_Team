"""
Enterprise Application Configuration & Secrets Management.
Loads settings securely from environment variables with fail-fast validation in production.
"""
import os
from typing import List, Dict, Any

try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseModel as BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Red Team Assistant"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Security & Tokens
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-development-key-change-me-redteam-2026")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "jwt-signing-secret-development-only-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 8)))  # 8 hours

    # CORS Allowed Origins
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/ai_red_team"
    )

    # Local AI & Embedding Configuration
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "qwen3:14b")
    OLLAMA_TIMEOUT: float = float(os.getenv("OLLAMA_TIMEOUT", "120.0"))
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "nomic-embed-text")

    # Database Pool Settings
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "20"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "10"))
    DB_POOL_TIMEOUT: int = int(os.getenv("DB_POOL_TIMEOUT", "30"))

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "120"))
    AI_RATE_LIMIT_PER_MINUTE: int = int(os.getenv("AI_RATE_LIMIT_PER_MINUTE", "30"))

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

    def validate_configuration(self) -> List[str]:
        """
        Validates system settings. In production, detects weak or default secrets.
        Returns a list of warning or error messages.
        """
        issues = []
        is_prod = self.ENVIRONMENT.lower() in ["production", "prod"]

        # 1. JWT & Secret Key Strength
        if is_prod:
            if "change-me" in self.SECRET_KEY.lower() or "development" in self.SECRET_KEY.lower():
                issues.append("CRITICAL: Default or development SECRET_KEY detected in production environment.")
            if len(self.SECRET_KEY) < 32:
                issues.append("WARNING: SECRET_KEY is shorter than 32 characters.")
            if "development" in self.JWT_SECRET.lower() or "change" in self.JWT_SECRET.lower():
                issues.append("CRITICAL: Default or development JWT_SECRET detected in production environment.")
            if len(self.JWT_SECRET) < 32:
                issues.append("WARNING: JWT_SECRET is shorter than 32 characters.")

        # 2. Database URL Validation
        if not self.DATABASE_URL:
            issues.append("CRITICAL: DATABASE_URL cannot be empty.")
        if is_prod and "postgres:postgres@localhost" in self.DATABASE_URL:
            issues.append("WARNING: Default postgres:postgres credentials detected in production DATABASE_URL.")

        # 3. Numeric Bounds
        if self.RATE_LIMIT_PER_MINUTE <= 0:
            issues.append("ERROR: RATE_LIMIT_PER_MINUTE must be greater than 0.")
        if self.ACCESS_TOKEN_EXPIRE_MINUTES <= 0:
            issues.append("ERROR: ACCESS_TOKEN_EXPIRE_MINUTES must be greater than 0.")

        # 4. CORS Safety
        if "*" in self.ALLOWED_ORIGINS and is_prod:
            issues.append("CRITICAL: Wildcard '*' in ALLOWED_ORIGINS is prohibited in production.")

        return issues

    def get_safe_diagnostics(self) -> Dict[str, Any]:
        """
        Returns sanitized configuration diagnostics with ZERO secret leakage.
        """
        return {
            "project_name": self.PROJECT_NAME,
            "environment": self.ENVIRONMENT,
            "secret_key_configured": bool(self.SECRET_KEY and "change-me" not in self.SECRET_KEY),
            "jwt_secret_configured": bool(self.JWT_SECRET and "development" not in self.JWT_SECRET),
            "jwt_algorithm": self.JWT_ALGORITHM,
            "token_expire_minutes": self.ACCESS_TOKEN_EXPIRE_MINUTES,
            "database_configured": bool(self.DATABASE_URL),
            "database_engine": "PostgreSQL (pgvector)",
            "ollama_url": self.OLLAMA_BASE_URL,
            "ollama_model": self.OLLAMA_MODEL,
            "embedding_model": self.EMBEDDING_MODEL,
            "allowed_origins_count": len(self.ALLOWED_ORIGINS),
            "rate_limit_per_minute": self.RATE_LIMIT_PER_MINUTE,
        }


settings = Settings()
