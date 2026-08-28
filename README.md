# AI Red Team Assistant

> **Enterprise-Grade Context-Aware Co-Pilot for Authorized Security Testers**  
> Powered by Local **Qwen3 14B (Ollama)**, **PostgreSQL `pgvector` RAG**, Deterministic 4-Factor Risk Engine, and a strict **Human-in-the-Loop** Security Model.

---

## 🌟 Overview & Core Philosophy

The **AI Red Team Assistant** is an on-premises intelligence platform designed to augment professional security testers and red team operators throughout the entire lifecycle of an engagement: from scoping and vulnerability discovery to deterministic risk calibration, RAG-grounded remediation reasoning, deliverable generation, and executive analytics.

### 🛡️ Core Principles
1. **Strict Human-in-the-Loop Governance**: The AI serves strictly as an advisory co-pilot. It **never** autonomously executes attacks, exploits targets, or mutates project records without explicit human tester authorization.
2. **Deterministic Risk Engineering**: Numerical risk scores ($0–100$) are calculated via an explainable mathematical engine rather than relying on subjective LLM guesses.
3. **Verified Knowledge Grounding (Zero Hallucinations)**: The AI is grounded in indexed standards (OWASP Top 10, MITRE CWE, NIST SP 800-115, CVSS v3.1) stored in `pgvector`. Every standard citation is verified against real document chunks.
4. **100% On-Premises Privacy**: No customer data, credentials, or findings are transmitted to commercial cloud AI APIs. All inferencing executes locally via Ollama.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts | Strict typing, responsive dark theme (`#050A14`), 5x5 threat risk heatmap, 30-day velocity charts |
| **Backend API** | Python 3.11, FastAPI, Uvicorn, Pydantic, SQLAlchemy | RESTful endpoints, rate limiting, enterprise security headers, RBAC |
| **AI Inference** | Ollama, Qwen3 14B, LangGraph, Context Builder | Prompt injection defense, secret redaction, structured JSON schema parsing |
| **Vector Store** | PostgreSQL 16, `pgvector`, `nomic-embed-text` | 768-dimensional dense vector embeddings, cosine similarity search |
| **Deployment** | Docker, Docker Compose, Nginx Alpine | Multi-stage non-root containers, health checks, named volume persistence |

---

## 🚀 Quickstart & Installation

### Option 1: Docker Compose (Recommended)

```powershell
# 1. Clone the repository
git clone https://github.com/your-org/ai-red-team-assistant.git
cd ai-red-team-assistant

# 2. Configure environment variables
cp .env.example .env

# 3. Pull required Ollama models on your host
ollama pull qwen3:14b
ollama pull nomic-embed-text

# 4. Build and start all containers (PostgreSQL pgvector, FastAPI, React/Nginx)
docker-compose up -d --build
```
Access the application at: `http://localhost:3000` (API backend at `http://localhost:8000/docs`).

---

### Option 2: Local Development Setup

#### 1. Frontend Setup (Node.js LTS)
```powershell
npm install
npm run dev
```
Development server runs at `http://127.0.0.1:3000`.

#### 2. Backend Setup (Python 3.11)
```powershell
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 3. Default Tester Credentials
- **Email**: `tester@redteam.local`
- **Password**: `RedTeam@2026`
- **Role**: `SECURITY_TESTER`

---

## 🧪 Automated Testing & Verification

The project includes an exhaustive automated test suite with **100% pass rates**:

```powershell
# 1. Run Complete Automated Test Suite (Unit, Security, AI Guardrails)
python run_all_tests.py

# 2. Run End-to-End 12-Phase System Demonstration Script
python test_e2e_workflow.py

# 3. Verify TypeScript Strict Compilation & Production Bundle
npm run build
```

### Test Suite Summary
- **Unit Tests**: Deterministic risk calculation, factor weight distribution, workflow state machine transitions.
- **Security Tests**: SQL injection parameterization, XSS escaping, SSRF cloud metadata blocklist (169.254.169.254 / RFC1918), Path Traversal defense (`../../etc/passwd`).
- **AI Tests**: Prompt injection keyword defense, structured JSON response parsing, and honest uncertainty fallbacks.

---

## 📂 Project Structure

```text
S3_PJ/
├── src/                              # React 18 TypeScript Frontend
│   ├── assets/                       # Brand icons & Shield SVG logos
│   ├── auth/                         # JWT Authentication context & session storage
│   ├── components/                   # Modular UI components
│   │   ├── analytics/                # 5x5 Risk Heatmap, Trend Charts, Benchmarks
│   │   ├── assistant/                # AI Chat workspace & citation views
│   │   ├── dashboard/                # Main dashboard widgets & navigation sidebar
│   │   ├── findings/                 # Finding cards, severity badges, filter bars
│   │   ├── knowledge/                # Source catalog, search bar, ingestion wizard
│   │   ├── projects/                 # Project cards, scope inventory tables
│   │   ├── reports/                  # Report previewer, section editor, export modal
│   │   ├── risk/                     # 4-factor risk sliders & history timelines
│   │   └── workspace/                # Engagement workspace, health monitor, checklist
│   ├── data/                         # Authoritative mock datasets & knowledge sources
│   ├── pages/                        # Route page views (/dashboard, /projects, /findings, /assistant, /risk-analysis, /reports, /knowledge, /analytics)
│   ├── routes/                       # ProtectedRoute & PublicOnlyRoute guards
│   ├── services/                     # Business logic service layer
│   ├── types/                        # TypeScript domain model definitions
│   └── utils/                        # Security sanitizers & RBAC guards
├── backend/                          # FastAPI Backend Architecture
│   ├── ai/                           # Context builder, prompt manager, response parser
│   ├── analytics/                    # Risk, finding, and remediation aggregators
│   ├── api/                          # REST API route handlers
│   ├── core/                         # Config, security middleware, rate limiter, RBAC
│   ├── knowledge/                    # pgvector models, ingestion, embedding client
│   ├── reports/                      # Report models & export formatters
│   ├── risk/                         # Deterministic 4-factor risk engine
│   └── workspace/                    # Workflow state machine & health evaluator
├── docs/                             # Academic & Enterprise Documentation
│   ├── ACADEMIC_REPORT.md            # Chapters 1–8 thesis documentation
│   ├── API_DOCUMENTATION.md          # Exhaustive REST API specification
│   ├── ARCHITECTURE.md               # Visual Mermaid architecture & DFD diagrams
│   ├── BACKUP_STRATEGY.md            # Enterprise backup & disaster recovery SOP
│   ├── DEMO_SCRIPT.md                # 15-Minute guided presentation script
│   └── TEST_REPORT.md                # QA testing matrix (100% pass)
├── docker-compose.yml                # Multi-container Docker orchestration
├── Dockerfile.backend                # Python FastAPI production container
├── Dockerfile.frontend               # Nginx + Vite production container
├── run_all_tests.py                  # Universal automated test runner
└── test_e2e_workflow.py              # End-to-end 12-phase demonstration script
```

---

## 📖 Documentation & Academic Deliverables

Complete documentation is available in the [`docs/`](./docs/) directory:
- [**System Architecture & Diagrams**](./docs/ARCHITECTURE.md) (DFD Level 0/1, ER Model, Use Cases, AI/RAG Pipeline)
- [**API Specifications**](./docs/API_DOCUMENTATION.md) (Full endpoint request/response contracts)
- [**Academic Thesis Report**](./docs/ACADEMIC_REPORT.md) (Chapters 1–8 thesis report)
- [**Quality Assurance Test Report**](./docs/TEST_REPORT.md) (Complete QA testing matrix)
- [**15-Minute Demo Script**](./docs/DEMO_SCRIPT.md) (Step-by-step presentation walkthrough)
- [**Backup & Disaster Recovery SOP**](./docs/BACKUP_STRATEGY.md) (PostgreSQL & pgvector backup procedures)

---

## ⚖️ License & Ethical Testing Notice

This software is developed strictly for **authorized security testing, defense-in-depth evaluations, and academic research**. Unauthorized penetration testing against systems without prior written consent is illegal. The system strictly adheres to non-destructive testing guidelines and requires explicit human confirmation for all actions.
