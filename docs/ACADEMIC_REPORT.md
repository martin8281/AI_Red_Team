# AI Red Team Assistant: A Context-Aware, Knowledge-Grounded Intelligence System for Authorized Security Assessments

**Academic Project & Thesis Technical Report**

---

## Abstract

Security testing and red team engagements play a foundational role in modern enterprise defense, yet modern penetration testers face significant cognitive overload when correlating distributed threat vectors, calculating reproducible risk scores, and generating standardized technical deliverables. This research presents the **AI Red Team Assistant**, an enterprise-grade cybersecurity co-pilot designed under a strict **human-in-the-loop** architecture. The system combines local Large Language Models (Qwen3 14B via Ollama), semantic vector search (PostgreSQL with `pgvector` and `nomic-embed-text`), a deterministic 4-factor risk calculation engine, and controlled workflow state machines. Grounded in authoritative security taxonomies (OWASP Top 10, MITRE CWE, NIST SP 800-115, CVSS v3.1), the platform provides explainable risk reasoning and verified source citations while strictly prohibiting autonomous attack execution or prompt-induced data leakage.

---

## Chapter 1 — Introduction

### 1.1 Background & Motivation
In modern enterprise cybersecurity, vulnerability discovery is only the initial stage of an engagement. Security testers must validate technical boundaries, catalog proof-of-concept evidence, calibrate impact and likelihood parameters, track developer remediation lifecycles, and compile multi-stakeholder deliverables. Generic artificial intelligence chatbots lack contextual awareness of engagement boundaries and frequently suffer from hallucinations, non-deterministic risk evaluations, and prompt injection vulnerabilities.

### 1.2 Problem Statement
Existing security testing workflows suffer from:
1. **Subjective Risk Inconsistency**: Risk levels often depend on tester bias rather than explainable mathematical calibration.
2. **AI Hallucination & Citation Inaccuracy**: Standard commercial LLMs hallucinate vulnerability mechanics and non-existent standard references.
3. **Prompt Injection & Data Leakage**: Ingesting untrusted target evidence into LLMs risks prompt injection attacks and system prompt leakage.
4. **Disjointed Workflow Tooling**: Scoping, finding management, evidence verification, and reporting remain fragmented across disparate tools.

### 1.3 Project Objectives
- **Context-Aware Co-Pilot**: Engineer a local LLM assistant grounded in active project scope, findings, and technical evidence.
- **Deterministic Risk Engine**: Implement an explainable 4-factor numerical risk engine (Impact 35%, Likelihood 30%, Asset Criticality 20%, Exploitability 15%) producing normalized 0–100 scores.
- **RAG Grounding with pgvector**: Index authoritative standards (OWASP, CWE, NIST, CVSS) to provide verified citations.
- **Human-in-the-Loop Security Model**: Provide decision support while requiring explicit human confirmation for all database state mutations.
- **Automated Deliverables**: Generate 12-section audit-ready executive reports in PDF, Markdown, and JSON formats.

---

## Chapter 2 — Literature Review

### 2.1 Security Testing Methodologies & Standards
Formal security assessments are governed by standards including NIST SP 800-115 (*Technical Guide to Information Security Testing and Assessment*) and the OWASP Testing Guide. These frameworks mandate strict scoping boundaries, non-destructive verification, and transparent evidence collection.

### 2.2 LLMs in Cybersecurity & Vulnerability Analysis
While Large Language Models have shown high proficiency in code comprehension and vulnerability explanation, their unconstrained deployment in offensive security creates severe safety concerns. Research emphasizes the necessity of delimiter containment, secret redaction, and deterministic scoring rather than relying on LLM-generated numerical risk estimates.

### 2.3 Retrieval-Augmented Generation (RAG) Architectures
RAG models combine information retrieval algorithms with generative models to ground responses in external knowledge bases. Using high-dimensional dense embeddings (such as `nomic-embed-text`) stored in PostgreSQL `pgvector`, domain-specific passages can be retrieved via cosine similarity to eliminate hallucinated standard citations.

---

## Chapter 3 — System Analysis & Requirements

### 3.1 Functional Requirements
- **Authentication & RBAC**: Secure JWT-based authentication with 4 roles (`ADMIN`, `SECURITY_TESTER`, `REVIEWER`, `VIEWER`).
- **Project & Scope Inventory**: Defining in-scope domain/IP targets and out-of-scope restriction boundaries.
- **Finding & Evidence Management**: Cataloging findings with CVSS telemetry, reproduction parameters, and reviewer-signed PoC traces.
- **Deterministic Risk Engine**: 4-factor risk scoring normalized from $[1.0, 5.0]$ to $[0, 100]$.
- **AI Decision Support**: Context-aware reasoning powered by local Qwen3 14B with verified RAG citations.
- **Engagement Intelligence Workspace**: State machine tracking stages from `PLANNING` through `COMPLETED` with 5-dimension health monitoring.
- **Security Analytics & Heatmap**: 5x5 Impact vs Likelihood threat matrix, 30-day velocity trendlines, and CSV exports.

### 3.2 Non-Functional Requirements
- **Security**: Zero-trust input sanitization (XSS, SQLi, SSRF, Path Traversal), rate limiting, and security headers.
- **Privacy & Compliance**: Zero external API dependencies; all LLM inferencing and vector search runs locally on-premises.
- **Performance**: Sub-100ms API response latency for relational queries; sub-1.5s latency for local LLM token generation.
- **Reliability**: Controlled offline degradation if the local LLM daemon is unavailable.

---

## Chapter 4 — System Design & Engineering Architecture

### 4.1 System Architecture
The application follows a three-tier decoupled architecture:
1. **Presentation Layer**: React 18 Single Page Application with TypeScript and Tailwind CSS.
2. **Application Layer**: FastAPI ASGI gateway enforcing security middleware, rate limiting, and business logic.
3. **Persistence & AI Layer**: PostgreSQL 16 with `pgvector` extension paired with a local Ollama inference server (Qwen3 14B).

### 4.2 Deterministic Risk Formula
$$\text{Score} = \text{round}\left(\frac{\text{Impact}(0.35) + \text{Likelihood}(0.30) + \text{Asset}(0.20) + \text{Exploit}(0.15) - 1.0}{4.0} \times 100\right)$$

Risk levels are mapped as:
- **CRITICAL**: $75 - 100$ (Priority: `P1 — Immediate`)
- **HIGH**: $50 - 74$ (Priority: `P2 — High`)
- **MODERATE**: $30 - 49$ (Priority: `P3 — Normal`)
- **LOW**: $0 - 29$ (Priority: `P4 — Low`)

### 4.3 Controlled State Machine Transitions
$$\text{PLANNING} \to \text{SCOPING} \to \text{ASSESSMENT} \to \text{ANALYSIS} \to \text{REMEDIATION} \to \text{REPORTING} \to \text{COMPLETED}$$

---

## Chapter 5 — Implementation Details

### 5.1 Frontend Engineering (React + TypeScript)
The frontend utilizes strict TypeScript interfaces, responsive dashboard layouts, Lucide icons, and Recharts visualization components. Navigation and workspace state machines are synchronized dynamically with local storage and backend endpoints.

### 5.2 Backend API & Security Gateway (FastAPI)
The backend enforces Pydantic schema validation on all endpoints. Middleware injects enterprise security headers (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `HSTS`) and token bucket rate limiting.

### 5.3 AI Co-Pilot & RAG Pipeline (Ollama + pgvector)
The RAG pipeline extracts text from standards (OWASP Top 10, MITRE CWE, NIST SP 800-115, CVSS v3.1), chunks documents into 500-token blocks with 50-token overlap, computes 768-dimensional dense embeddings via `nomic-embed-text`, and indexes them in PostgreSQL. The RAG Query Router classifies user inquiries into `DATABASE`, `PROJECT_CONTEXT`, `KNOWLEDGE_BASE`, or `HYBRID` intents.

---

## Chapter 6 — Testing & Quality Assurance

### 6.1 Testing Methodology
The verification framework combines unit testing, security payload attacks, AI guardrail evaluations, and full end-to-end integration tests.

### 6.2 Test Results Summary
- **Unit Tests**: 5/5 Passed (100%)
- **Security Tests (SQLi, XSS, SSRF, Traversal)**: 5/5 Passed (100%)
- **AI Guardrails & Citations**: 3/3 Passed (100%)
- **End-to-End System Demonstration**: 12/12 Phases Passed (100%)
- **TypeScript Compilation**: 2,535 modules transformed with 0 errors.

---

## Chapter 7 — Results & Discussion

### 7.1 Quantitative Findings
- **Risk Score Explainability**: 100% mathematical consistency across all evaluated threat vectors.
- **RAG Semantic Precision**: Average cosine similarity match score of 92.4% on OWASP and CWE vulnerability inquiries.
- **Exploit Prevention**: 0% autonomous exploit generation; 100% of state mutations require explicit tester sign-off.
- **Build Performance**: Production bundle compiled in 8.57s with total gzipped size under 290 kB.

---

## Chapter 8 — Conclusion & Future Scope

### 8.1 Conclusion
The **AI Red Team Assistant** successfully demonstrates that generative AI can be integrated into enterprise cybersecurity workflows without sacrificing safety, determinism, or data privacy. By enforcing a strict **human-in-the-loop** architecture, local LLM execution, and deterministic risk modeling, the platform serves as a reliable, explainable co-pilot for authorized security professionals.

### 8.2 Future Enhancements
- Integration with live CI/CD security scanning pipelines (SAST/DAST webhooks).
- Multi-agent collaboration with specialized subagents for network, cloud, and smart contract audits.
- Hardware-accelerated on-device quantization for low-power edge field engagements.
