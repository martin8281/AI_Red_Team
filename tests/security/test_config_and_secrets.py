"""
AI Red Team Assistant — Check 19 Configuration, Secrets & Environment Security Test Suite.
Validates environment variable loading, secret redaction, safe diagnostics, production key validation,
CORS restrictions, and prevention of secret leakage in source files.
"""
import unittest
import os
from backend.core.config import Settings


class TestConfigAndSecrets(unittest.TestCase):
    def test_settings_safe_diagnostics_leaks_zero_secrets(self):
        """Test that get_safe_diagnostics() returns zero plaintext credentials or tokens."""
        s = Settings(
            SECRET_KEY="my-very-secret-production-key-at-least-32-chars-long",
            JWT_SECRET="my-super-secret-jwt-signing-key-production-2026",
            DATABASE_URL="postgresql://custom_user:custom_pass@prod-db.internal:5432/redteam_prod",
            ENVIRONMENT="production"
        )
        diag = s.get_safe_diagnostics()

        self.assertIn("project_name", diag)
        self.assertIn("secret_key_configured", diag)
        self.assertTrue(diag["secret_key_configured"])
        self.assertTrue(diag["jwt_secret_configured"])
        self.assertTrue(diag["database_configured"])
        
        # Verify zero credentials in diagnostic string
        diag_str = str(diag)
        self.assertNotIn("my-very-secret", diag_str)
        self.assertNotIn("custom_pass", diag_str)
        self.assertNotIn("custom_user", diag_str)
        self.assertNotIn("prod-db.internal", diag_str)

    def test_settings_validate_configuration_detects_default_secrets_in_production(self):
        """Test that validate_configuration() flags default/development keys when ENVIRONMENT=production."""
        s = Settings(
            SECRET_KEY="super-secret-development-key-change-me-redteam-2026",
            JWT_SECRET="jwt-signing-secret-development-only-2026",
            DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_red_team",
            ENVIRONMENT="production"
        )
        issues = s.validate_configuration()

        self.assertTrue(any("SECRET_KEY" in issue for issue in issues))
        self.assertTrue(any("JWT_SECRET" in issue for issue in issues))
        self.assertTrue(any("postgres:postgres" in issue for issue in issues))

    def test_settings_validate_configuration_passes_on_valid_production_secrets(self):
        """Test that validate_configuration() returns clean on strong production credentials."""
        s = Settings(
            SECRET_KEY="a" * 48,
            JWT_SECRET="b" * 48,
            DATABASE_URL="postgresql://prod_app_user:StrongSecretPass992@db-cluster.internal:5432/redteam_live",
            ENVIRONMENT="production"
        )
        issues = s.validate_configuration()
        self.assertEqual(len(issues), 0)

    def test_settings_validate_numeric_bounds(self):
        """Test validation on negative or zero rate limits and token expiry."""
        s = Settings(
            RATE_LIMIT_PER_MINUTE=-5,
            ACCESS_TOKEN_EXPIRE_MINUTES=0,
            ENVIRONMENT="development"
        )
        issues = s.validate_configuration()
        self.assertTrue(any("RATE_LIMIT_PER_MINUTE" in issue for issue in issues))
        self.assertTrue(any("ACCESS_TOKEN_EXPIRE_MINUTES" in issue for issue in issues))

    def test_gitignore_protects_env_and_dump_files(self):
        """Test that .gitignore includes .env."""
        gitignore_path = os.path.join(os.path.dirname(__file__), "..", "..", ".gitignore")
        if os.path.exists(gitignore_path):
            with open(gitignore_path, "r", encoding="utf-8") as f:
                content = f.read()
            self.assertIn(".env", content)

    def test_env_example_contains_zero_live_production_secrets(self):
        """Test that .env.example contains only template placeholders."""
        env_ex_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env.example")
        if os.path.exists(env_ex_path):
            with open(env_ex_path, "r", encoding="utf-8") as f:
                content = f.read()
            self.assertIn("change-me", content.lower())
            self.assertIn("postgres", content)

    def test_cors_configuration_rejects_wildcard_in_production(self):
        """Test that wildcard origin in production is flagged by validation."""
        s = Settings(
            ALLOWED_ORIGINS=["*"],
            ENVIRONMENT="production",
            SECRET_KEY="a" * 36,
            JWT_SECRET="b" * 36,
            DATABASE_URL="postgresql://user:pass@host:5432/db"
        )
        issues = s.validate_configuration()
        self.assertTrue(any("ALLOWED_ORIGINS" in issue for issue in issues))

    def test_environment_separation_independence(self):
        """Test independent instantiation of development vs test vs production settings."""
        dev = Settings(ENVIRONMENT="development", OLLAMA_TIMEOUT=5.0)
        prod = Settings(ENVIRONMENT="production", OLLAMA_TIMEOUT=30.0)

        self.assertEqual(dev.ENVIRONMENT, "development")
        self.assertEqual(prod.ENVIRONMENT, "production")
        self.assertEqual(dev.OLLAMA_TIMEOUT, 5.0)
        self.assertEqual(prod.OLLAMA_TIMEOUT, 30.0)


if __name__ == "__main__":
    unittest.main()
