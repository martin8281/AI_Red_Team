# AI Red Team Assistant — 15-Minute Demonstration & Presentation Script

This script provides a step-by-step guided demonstration flow for presenting the **AI Red Team Assistant** to stakeholders, academic evaluators, and security leadership.

---

## ⏱️ Demonstration Timeline Overview

| Stage | Duration | Core Module & Objective | URL / Route |
| :---: | :---: | :--- | :--- |
| **1** | 0:00 – 1:30 | **Introduction & Landing Architecture** | `/` |
| **2** | 1:30 – 3:00 | **Authentication & Role-Based Access Control** | `/login` $\to$ `/dashboard` |
| **3** | 3:00 – 5:00 | **Project & Scope Inventory Management** | `/projects` $\to$ `/projects/PRJ-101` |
| **4** | 5:00 – 7:00 | **Vulnerability Findings & PoC Evidence Verification** | `/findings` $\to$ `/findings/FND-201` |
| **5** | 7:00 – 9:00 | **Deterministic Risk Engine & Factor Calibration** | `/risk-analysis` |
| **6** | 9:00 – 11:00 | **pgvector RAG Grounding & AI Co-Pilot (Qwen3 14B)** | `/knowledge` $\to$ `/assistant` |
| **7** | 11:00 – 13:00 | **Engagement Intelligence Workspace & State Machine** | `/projects/PRJ-101/workspace` |
| **8** | 13:00 – 14:30 | **Executive Deliverable Compilation (PDF/Markdown)** | `/reports` $\to$ `/reports/RPT-101` |
| **9** | 14:30 – 15:00 | **Security Analytics & 5x5 Threat Heatmap** | `/analytics` |

---

## 🎬 Detailed Demonstration Step-by-Step

### Stage 1: Introduction & Landing Page (`/`)
- **Action**: Open `http://localhost:3000/`.
- **Talking Point**:
  > *"Welcome to the AI Red Team Assistant—an enterprise-grade co-pilot engineered under a strict human-in-the-loop model. Unlike commercial AI chatbots that suffer from hallucinations and data leakage, our platform runs completely on-premises with local Qwen3 14B LLMs, PostgreSQL pgvector RAG, and deterministic risk modeling."*

---

### Stage 2: Authentication & RBAC (`/login`)
- **Action**: Click **Launch Co-Pilot Workspace**, enter `tester@redteam.local` / `RedTeam@2026`, and sign in.
- **Talking Point**:
  > *"The platform enforces constant-time password hashing, JWT bearer tokens, and 4 role levels (Admin, Security Tester, Reviewer, Viewer). Notice the live system health badges in the header showing active connections to FastAPI, pgvector, and Ollama."*

---

### Stage 3: Project & Scope Inventory (`/projects/PRJ-101`)
- **Action**: Open engagement **"Web Application Penetration Test" (Apex Financial Services)**. Inspect the **Scope** tab.
- **Talking Point**:
  > *"Every engagement establishes clear boundary definitions. In-scope targets (api.apexfin.com, auth.apexfin.com) are isolated from out-of-scope production databases. The AI assistant uses this inventory to prevent testing outside authorized boundaries."*

---

### Stage 4: Vulnerability Findings & PoC Evidence (`/findings/FND-201`)
- **Action**: Open finding **"Blind Boolean-Based SQL Injection on /api/v1/auth/login"**.
- **Talking Point**:
  > *"Findings record CVSS telemetry, reproduction parameters, and reviewer-signed proof-of-concept logs. Notice evidence artifact 'PoC_Auth_Blind_SQLi.log' verified by lead tester Alex Vance with an immutable audit timestamp."*

---

### Stage 5: Deterministic 4-Factor Risk Engine (`/risk-analysis`)
- **Action**: Open **Risk Analysis**. Adjust the Impact and Likelihood sliders.
- **Talking Point**:
  > *"We do NOT let the LLM guess risk scores. Our deterministic engine computes a normalized 0–100 score using weighted factors: Impact 35%, Likelihood 30%, Asset Criticality 20%, Exploitability 15%. This guarantees mathematical consistency across all audits."*

---

### Stage 6: pgvector Knowledge Base & AI Co-Pilot (`/knowledge` $\to$ `/assistant`)
- **Action**:
  1. Open `/knowledge` and highlight the 5 indexed standards (OWASP, CWE, NIST, CVSS, Methodology).
  2. Open `/assistant` and ask: *"What does OWASP recommend for SQL Injection prevention?"*
- **Talking Point**:
  > *"The AI is grounded in real standards embedded using Ollama's nomic-embed-text in PostgreSQL pgvector. Notice how the AI response attaches verified source citations with exact document references and relevance match percentages without hallucinating non-existent standards."*

---

### Stage 7: Engagement Intelligence Workspace (`/projects/PRJ-101/workspace`)
- **Action**: Open the **Engagement Workspace**.
- **Talking Point**:
  > *"The workspace connects all modules into an automated workflow state machine: Planning -> Scoping -> Assessment -> Analysis -> Remediation -> Reporting -> Completed. It tracks real progress (83%), monitors 5-dimension health, and generates AI-recommended next actions."*

---

### Stage 8: Executive Report Deliverable (`/reports/RPT-101`)
- **Action**: Open report **"Apex Financial Services — Q3 Web Application Security Assessment"**.
- **Talking Point**:
  > *"Deliverables are compiled dynamically across 12 standardized sections including Executive Summary, Scope, Findings, Risk Breakdowns, and SLA Queues. Deliverables can be exported instantly to PDF, Markdown, or JSON."*

---

### Stage 9: Security Analytics & 5x5 Heatmap Matrix (`/analytics`)
- **Action**: Open `/analytics`. Click on cell `(5, 4)` in the 5x5 Risk Heatmap.
- **Talking Point**:
  > *"All analytics are computed dynamically from live platform data—zero hardcoded numbers. The 5x5 Heatmap plots Impact vs Likelihood vectors, 30-day velocity charts track patch turnaround times, and AI Security Posture reasoning synthesizes executive threat overviews."*

---

## 🎯 Concluding Summary
> *"In summary, the AI Red Team Assistant transforms security testing into an efficient, explainable, and secure workflow. All 12 engineering phases are fully implemented, verified with 100% automated test pass rates, and container-ready for enterprise production deployment."*
