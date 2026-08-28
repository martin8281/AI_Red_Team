# AI Red Team Assistant — Academic Defense Presentation Slides (PPT Deck Outline)

**Project Title**: AI Red Team Assistant: A Context-Aware, Knowledge-Grounded Intelligence System for Authorized Security Assessments  
**Presenter**: Alex Vance (Lead Security Tester & Researcher)  
**Time Limit**: 15 Minutes (12 Slides)

---

## 🖥️ Slide 1: Title & Introduction
- **Title**: AI Red Team Assistant
- **Subtitle**: Enterprise-Grade Context-Aware Co-Pilot for Authorized Security Assessments
- **Key Badges**:
  - Local Qwen3 14B (Ollama)
  - PostgreSQL 16 `pgvector` RAG
  - Deterministic 4-Factor Risk Engine
  - Strict Human-in-the-Loop Security Governance
- **Presenter Info**: Alex Vance | Cybersecurity & AI Engineering

---

## 🖥️ Slide 2: Problem Statement & Motivation
- **The Challenge in Modern Security Testing**:
  - **Tool Fragmentation**: Separate tools for scoping, finding logging, PoC evidence storage, risk modeling, and reporting.
  - **Subjective Risk Inconsistency**: Risk levels depend on tester bias rather than explainable mathematical calibration.
  - **Commercial Cloud AI Hazards**: Public LLMs leak confidential customer credentials, hallucinate non-existent CVEs/CWEs, and are vulnerable to prompt injection attacks.
- **Our Solution**:
  - A unified, on-premises security intelligence workspace delivering grounded decision support without cloud dependencies.

---

## 🖥️ Slide 3: Core Architectural Philosophy (Human-in-the-Loop)
- **Zero Autonomous Exploitation**:
  - The AI serves strictly as an **advisory decision support co-pilot**.
  - The AI assists with risk reasoning, remediation advice, and report drafting.
  - The AI **never** mutates database state, alters scopes, or closes findings without human confirmation.
- **Workflow Pipeline**:
  $$\text{AI Recommendation} \longrightarrow \text{Tester Review} \longrightarrow \text{Tester Confirmation} \longrightarrow \text{Database Mutation}$$

---

## 🖥️ Slide 4: System Architecture & Technology Stack
- **Presentation Tier**: React 18, TypeScript, Vite, Tailwind CSS, Recharts (Strict dark theme: `#050A14`).
- **Application Gateway**: FastAPI, Python 3.11, Pydantic validation, Rate limiting, Security headers.
- **AI Inference Engine**: Local Ollama daemon running **Qwen3 14B**.
- **Vector & Relational Storage**: PostgreSQL 16 with `pgvector` extension (`nomic-embed-text` 768-dim embeddings).

---

## 🖥️ Slide 5: Deterministic 4-Factor Risk Engine
- **Why Mathematical Modeling?**
  - Stochastic LLMs cannot be trusted to generate reproducible risk scores.
- **Formula**:
  $$\text{Score} = \text{round}\left(\frac{\text{Impact}(35\%) + \text{Likelihood}(30\%) + \text{Asset}(20\%) + \text{Exploit}(15\%) - 1.0}{4.0} \times 100\right)$$
- **Calibrated Levels**:
  - **CRITICAL** ($75–100$ | `P1 — Immediate`)
  - **HIGH** ($50–74$ | `P2 — High`)
  - **MODERATE** ($30–49$ | `P3 — Normal`)
  - **LOW** ($0–29$ | `P4 — Low`)

---

## 🖥️ Slide 6: PostgreSQL `pgvector` RAG Grounding
- **Indexed Standards**: OWASP Top 10:2021, MITRE CWE v4.14, NIST SP 800-115, CVSS v3.1, Methodology Playbooks.
- **Pipeline Workflow**:
  $$\text{Document} \to \text{SHA-256 Hash} \to \text{Chunking} \to \text{nomic-embed-text} \to \text{pgvector Cosine Search} \to \text{Verified Citations}$$
- **Zero Hallucinations**: Citations are derived programmatically from top-ranked chunks with exact document IDs and similarity scores.

---

## 🖥️ Slide 7: Engagement Intelligence Workspace
- **Controlled State Machine**:
  $$\text{PLANNING} \to \text{SCOPING} \to \text{ASSESSMENT} \to \text{ANALYSIS} \to \text{REMEDIATION} \to \text{REPORTING} \to \text{COMPLETED}$$
- **Key Capabilities**:
  - Real-time Progress Metric ($0–100\%$) derived from 7 database dimensions.
  - **5-Dimension Health Monitor**: Scope, Findings, Risk, Evidence, Reporting (`GOOD` | `ATTENTION` | `BLOCKED`).
  - **AI Recommended Next Action**: Identifies top blocker with 1-click deep links.

---

## 🖥️ Slide 8: Automated Deliverables & Report Generation
- **Audit-Ready Deliverables**:
  - 12 Customizable Sections: Cover Page, Executive Summary, Scope, Findings, PoC Evidence, Risk Summaries, Remediation SLAs, Conclusion.
- **Multi-Format Export**:
  - Instant generation to PDF, Markdown, and JSON.
  - Section editor with live markdown preview and AI section regeneration.

---

## 🖥️ Slide 9: Security Analytics & 5x5 Risk Heatmap
- **100% Real Data Integrity**: Zero hardcoded numbers; metrics synchronized directly with live finding records.
- **Visual Analytics**:
  - **5x5 Impact vs Likelihood Heatmap**: Interactive cell inspector with finding details.
  - **Chronological Velocity Trends**: 30-day discovery vs remediation turnaround curves.
  - **Cross-Engagement Benchmarks**: Side-by-side risk posture comparison across clients.

---

## 🖥️ Slide 10: Zero-Trust Security Hardening
- **Defense-in-Depth Measures**:
  - **XSS Sanitization**: Escapes script tags and quote entities across all inputs.
  - **Path Traversal**: Strips traversal sequences (`../`, `..\`) from file uploads.
  - **SSRF Guard**: Blocks loopback, cloud metadata (`169.254.169.254`), and private RFC1918 subnets.
  - **SQL Injection**: Strict parameterized query binding.
  - **Prompt Injection**: System rule isolation and keyword redaction.

---

## 🖥️ Slide 11: Testing & Quality Assurance Results
- **Automated Test Results**:
  - **Unit Tests**: 5/5 Passed (100%)
  - **Security Attack Regression**: 5/5 Passed (100%)
  - **AI Guardrails & Citations**: 3/3 Passed (100%)
  - **Golden Test Project Integration**: 10/10 Milestones Passed (100%)
  - **End-to-End System Demonstration**: 12/12 Phases Passed (100%)
  - **TypeScript Build**: 2,535 modules transformed with **0 errors**.

---

## 🖥️ Slide 12: Conclusion & Future Scope
- **Conclusion**:
  - The AI Red Team Assistant demonstrates that Generative AI can be safely integrated into enterprise security workflows when combined with deterministic risk modeling, grounded RAG citations, and strict human oversight.
- **Future Work**:
  - CI/CD automated SAST/DAST scanner webhooks.
  - Multi-agent collaboration for specialized cloud and network audits.
  - Hardware-accelerated local quantization for field air-gapped engagements.
- **Thank You**: Questions & Technical Discussion.
