# AI Red Team Assistant — REST API Specification

This document provides exhaustive specifications for all REST endpoints provided by the **AI Red Team Assistant** FastAPI backend.

---

## 1. Authentication & Session Endpoints

### `POST /api/auth/login`
Authenticates a security tester and returns a secure JWT bearer token.
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "email": "tester@redteam.local",
  "password": "RedTeam@2026SecurePassword"
}
```
- **Response (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 28800,
  "user": {
    "id": "USR-001",
    "email": "tester@redteam.local",
    "name": "Alex Vance",
    "role": "SECURITY_TESTER"
  }
}
```
- **Error Codes**: `400 Bad Request`, `401 Unauthorized`, `429 Rate Limit Exceeded`.

---

## 2. Projects & Scope Endpoints

### `GET /api/projects`
Retrieves a paginated list of authorized security engagements.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
```json
[
  {
    "id": "PRJ-101",
    "name": "Web Application Penetration Test",
    "organization": "Apex Financial Services",
    "project_type": "WEB_APP",
    "status": "ACTIVE",
    "engagement_state": "ASSESSMENT",
    "progress": 83,
    "risk_score": 86,
    "lead_tester": "Alex Vance",
    "start_date": "2026-08-15",
    "end_date": "2026-09-05"
  }
]
```

### `GET /api/projects/{id}/scope`
Retrieves in-scope and out-of-scope target asset boundaries.
- **Response (200 OK)**:
```json
[
  {
    "id": "SCP-101",
    "project_id": "PRJ-101",
    "asset_identifier": "auth.apexfin.com",
    "asset_type": "DOMAIN",
    "scope_status": "IN_SCOPE",
    "environment": "PRODUCTION"
  },
  {
    "id": "SCP-102",
    "project_id": "PRJ-101",
    "asset_identifier": "prod-db.internal",
    "asset_type": "IP_RANGE",
    "scope_status": "OUT_OF_SCOPE",
    "environment": "INTERNAL"
  }
]
```

---

## 3. Findings & Evidence Endpoints

### `POST /api/findings`
Records a newly discovered security vulnerability with technical metadata.
- **Request Body**:
```json
{
  "project_id": "PRJ-101",
  "title": "Blind Boolean-Based SQL Injection on authentication endpoint",
  "vulnerability_type": "SQL Injection",
  "severity": "CRITICAL",
  "asset": "auth.apexfin.com",
  "endpoint": "POST /api/v1/auth/login",
  "description": "Unparameterized SQL input concatenation in username parameter.",
  "impact": "Exfiltrates user password hashes and active session tokens.",
  "recommendation": "Implement parameterized PreparedStatement queries."
}
```

### `PUT /api/findings/{id}/remediation`
Updates finding remediation lifecycle stage and SLA resolution notes.
- **Request Body**:
```json
{
  "remediation_status": "VERIFIED",
  "assigned_user": "DevSecOps Team",
  "due_date": "2026-09-15",
  "resolution_notes": "Prepared statements verified in staging. Retested with differential delay payloads."
}
```

### `PUT /api/evidence/{id}/status`
Verifies or rejects a proof-of-concept technical evidence artifact.
- **Request Body**:
```json
{
  "status": "VERIFIED",
  "reviewer": "Alex Vance"
}
```

---

## 4. Deterministic Risk Engine Endpoints

### `POST /api/risk/calculate`
Calculates an explainable 0–100 risk score based on 4 deterministic factors.
- **Formula**:
  $$\text{Score} = \text{round}\left(\frac{\text{Impact}(35\%) + \text{Likelihood}(30\%) + \text{Asset}(20\%) + \text{Exploit}(15\%) - 1.0}{4.0} \times 100\right)$$
- **Request Body**:
```json
{
  "impact": 5,
  "likelihood": 4,
  "asset_criticality": 5,
  "exploitability": 4
}
```
- **Response (200 OK)**:
```json
{
  "risk_score": 89,
  "risk_level": "CRITICAL",
  "recommended_priority": "P1 — Immediate",
  "weights": {
    "impact": 0.35,
    "likelihood": 0.30,
    "asset_criticality": 0.20,
    "exploitability": 0.15
  }
}
```

---

## 5. AI Co-Pilot & Decision Support Endpoints

### `POST /api/assistant/chat`
Sends a context-aware prompt to the local Qwen3 14B model with RAG grounding.
- **Request Body**:
```json
{
  "project_id": "PRJ-101",
  "context_type": "finding",
  "context_id": "FND-201",
  "message": "What does OWASP recommend for remediating this SQL injection?"
}
```
- **Response (200 OK)**:
```json
{
  "summary": "Enforce parameterized queries (Prepared Statements) with strongly typed bind variables.",
  "reasoning": "Binding parameters separates code logic from untrusted user data, neutralizing lexical escaping.",
  "recommendation": "Use PreparedStatement in Java, SqlCommand in .NET, or parameterized ORM drivers in Python.",
  "confidence": "HIGH",
  "sources": [
    {
      "document_id": "KD-OWASP-INJ",
      "title": "OWASP A03:2021 — Injection Prevention",
      "source": "OWASP Top 10",
      "reference": "Defensive Remediation Strategy",
      "relevance_score": 0.94,
      "snippet": "Primary defense against SQL Injection: The use of parameterized queries..."
    }
  ]
}
```

---

## 6. PostgreSQL pgvector Knowledge Base & RAG Endpoints

### `GET /api/knowledge/sources`
Lists indexed authoritative security standards (OWASP, CWE, NIST, CVSS).

### `POST /api/knowledge/ingest`
Ingests, validates, chunks (500 tokens / 50 overlap), and embeds security documents into pgvector table.

### `POST /api/knowledge/search`
Performs cosine similarity vector ranking over embedded knowledge chunks.
- **Request Body**:
```json
{
  "query": "AWS IMDSv2 cloud metadata protection",
  "source_type": "ALL",
  "top_k": 3,
  "similarity_threshold": 0.3
}
```

---

## 7. Reports & Deliverables Endpoints

### `POST /api/reports/generate`
Compiles an executive security assessment deliverable across 12 customizable sections.

### `GET /api/reports/{id}/export?format=pdf`
Exports deliverable in PDF, Markdown, or JSON formats.

---

## 8. Security Analytics & Monitoring Endpoints

### `GET /api/analytics/overview`
Retrieves portfolio-wide KPIs (Overall Risk, Total Findings, Critical Vectors, Remediation Rate).

### `GET /api/analytics/heatmap`
Returns 5x5 Impact vs Likelihood matrix plots.

### `POST /api/analytics/ai-insights`
Generates Qwen3 14B executive security posture and trend reasoning.

---

## 9. System Health Endpoints

### `GET /health`
System health telemetry check.
- **Response (200 OK)**:
```json
{
  "status": "HEALTHY",
  "service": "AI Red Team Assistant API",
  "version": "1.0.0",
  "environment": "production",
  "components": {
    "database": { "status": "UP", "engine": "PostgreSQL 16 + pgvector" },
    "ai_engine": { "status": "UP", "model": "qwen3:14b", "provider": "Ollama" },
    "embeddings": { "status": "UP", "model": "nomic-embed-text" },
    "rate_limiter": { "status": "ACTIVE" }
  }
}
```
