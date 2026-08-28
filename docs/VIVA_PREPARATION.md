# AI Red Team Assistant — Viva Voce & Technical Defense Preparation Guide

This comprehensive guide prepares candidates for academic thesis defense, project viva voce examinations, and enterprise technical reviews for the **AI Red Team Assistant**.

---

## 🎯 Section 1: Core System Architecture & Philosophy

### Q1: What is the core problem that the AI Red Team Assistant solves?
**Answer**:  
Traditional penetration testing workflows are fragmented across separate tools for scoping, finding logging, proof-of-concept evidence storage, risk analysis, and reporting. Furthermore, while Large Language Models offer powerful reasoning capabilities, deploying generic cloud LLMs in cybersecurity introduces significant risks: non-deterministic risk scores, hallucinations of non-existent CVEs/CWEs, prompt injection vulnerabilities, and transmission of sensitive enterprise credentials to third-party APIs.  
The **AI Red Team Assistant** solves this by providing a unified, context-aware co-pilot running **100% on-premises** (Qwen3 14B via Ollama + PostgreSQL with `pgvector`) under a strict **human-in-the-loop** model with deterministic risk scoring.

---

### Q2: Explain the "Human-in-the-Loop" architecture. Why does the AI not execute autonomous attacks?
**Answer**:  
Autonomous offensive AI models are unpredictable and pose severe liability and safety hazards, including accidental denial-of-service, unintended production data corruption, or attacking out-of-scope targets.  
In our architecture:
- The AI acts strictly as an **advisory decision support co-pilot**.
- The AI assists with risk explanation, remediation advice, and report drafting.
- The AI **cannot** autonomously execute attacks, alter target scopes, change finding states, or modify database records without explicit human confirmation.
- **Workflow**: `AI Recommendation` $\to$ `Human Review` $\to$ `Human Action` $\to$ `Database Mutation`.

---

### Q3: Why did you choose Qwen3 14B and Ollama over cloud LLMs (like OpenAI GPT-4 or Anthropic Claude)?
**Answer**:  
1. **Data Privacy & Compliance**: Red team engagements uncover zero-days, production credentials, and sensitive customer data. Transmitting this telemetry to public cloud APIs violates standard non-disclosure agreements (NDAs) and regulatory mandates (SOC2, GDPR, HIPAA).
2. **On-Premises Air-Gapped Deployment**: Ollama enables local inference on isolated test workstations or dedicated enterprise servers.
3. **Deterministic Local Latency**: Avoids external network latency, rate limit throttling, and API cost scaling.
4. **Fine-Tuning & Quantization Readiness**: Qwen3 14B offers exceptional cybersecurity domain reasoning and structured JSON instruction following within feasible enterprise VRAM budgets.

---

## 📐 Section 2: Deterministic Risk Engine & Mathematical Modeling

### Q4: Why not let the LLM calculate the numerical risk score directly?
**Answer**:  
LLMs are inherently probabilistic text generators. Prompting an LLM for a risk score yields stochastic, non-reproducible values (e.g., scoring a vulnerability $85$ in one turn and $72$ in another for identical parameters).  
To ensure audit reproducibility and mathematical consistency:
- The **Risk Engine** deterministically calculates numerical risk scores ($0–100$) using fixed factor weights.
- The **LLM** receives the calculated score and explains the risk narrative, threat implications, and defensive fixes.

---

### Q5: What is the mathematical formula used for the 4-Factor Risk Engine?
**Answer**:  
The Risk Engine computes a weighted sum of 4 discrete factors (each evaluated on a $1–5$ scale):
1. **Impact** ($35\%$ weight / $0.35$)
2. **Likelihood** ($30\%$ weight / $0.30$)
3. **Asset Criticality** ($20\%$ weight / $0.20$)
4. **Exploitability** ($15\%$ weight / $0.15$)

$$\text{Raw Score} = (\text{Impact} \times 0.35) + (\text{Likelihood} \times 0.30) + (\text{Asset} \times 0.20) + (\text{Exploit} \times 0.15)$$

The raw score ($1.0$ to $5.0$) is normalized to a $0–100$ scale:
$$\text{Risk Score} = \text{round}\left(\frac{\text{Raw Score} - 1.0}{4.0} \times 100\right)$$

**Risk Level Mapping**:
- **CRITICAL**: $75 - 100$ (Recommended Priority: `P1 — Immediate`)
- **HIGH**: $50 - 74$ (Recommended Priority: `P2 — High`)
- **MODERATE**: $30 - 49$ (Recommended Priority: `P3 — Normal`)
- **LOW**: $0 - 29$ (Recommended Priority: `P4 — Low`)

---

## 🔍 Section 3: PostgreSQL `pgvector` & RAG Architecture

### Q6: How does the Retrieval-Augmented Generation (RAG) pipeline work?
**Answer**:  
1. **Ingestion**: Authoritative security standards (OWASP Top 10, MITRE CWE, NIST SP 800-115, CVSS v3.1) are cleaned, hashed with SHA-256 (for duplicate detection), and chunked into $500$-token passages with a $50$-token overlap.
2. **Embedding**: Passages are vectorized into $768$-dimensional dense vectors using Ollama's `nomic-embed-text` model and stored in PostgreSQL using the `pgvector` extension.
3. **Query Routing**: When a user asks a question, the **RAG Query Router** classifies the intent (`DATABASE`, `PROJECT_CONTEXT`, `KNOWLEDGE_BASE`, or `HYBRID`).
4. **Vector Retrieval**: For knowledge intents, a cosine similarity query retrieves Top-K chunks ($K=3$) with similarity scores $\ge 0.30$.
5. **Grounded Generation**: The retrieved chunks are placed in `<RETRIEVED_KNOWLEDGE>` prompt blocks. Qwen3 14B synthesizes the response and attaches verified citation metadata (`document_id`, `source`, `reference`, `similarity_score`).

---

### Q7: How do you prevent the AI from inventing (hallucinating) standard citations?
**Answer**:  
1. Strict system instructions mandate that citations must only reference document IDs present in the `<RETRIEVED_KNOWLEDGE>` block.
2. The frontend and backend citation grounder programmatically attaches citation objects directly from the verified `pgvector` retrieval result rather than parsing arbitrary text from the LLM.

---

## 🛡️ Section 4: Security Hardening & Zero-Trust Architecture

### Q8: What protections are in place against Prompt Injection?
**Answer**:  
1. **Delimiter Containment**: External project data and retrieved chunks are wrapped inside distinct XML-style boundary tags (`<UNTRUSTED_CONTEXT_DATA>` and `<RETRIEVED_KNOWLEDGE>`).
2. **System Rule Isolation**: System instructions are placed at the highest priority level, instructing the model to treat content inside data tags as passive data rather than executable instructions.
3. **Keyword Flagging**: The backend `SafetySanitizer` scans and redacts common injection phrases (`"ignore previous instructions"`, `"system override"`, `"reveal system prompt"`).

---

### Q9: How does the platform defend against Server-Side Request Forgery (SSRF) during knowledge ingestion?
**Answer**:  
The `validate_ssrf_url` utility enforces strict boundary checks on all user-supplied URLs:
- Restricts protocol schemes strictly to `http:` and `https:`.
- Blocks loopback and localhost (`127.0.0.1`, `::1`, `localhost`).
- Blocks cloud instance metadata endpoints (`169.254.169.254` / link-local addresses).
- Blocks private internal RFC1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).

---

### Q10: How are XSS, Path Traversal, and SQL Injection prevented?
**Answer**:  
- **XSS**: All user-controlled text rendered in the DOM is escaped via `sanitizeHtml` (converting `&`, `<`, `>`, `"`, `'`, `/` to safe HTML entities).
- **Path Traversal**: Filenames for evidence and report uploads are stripped of traversal sequences (`../`, `..\`) and special characters using `sanitizeFilename`.
- **SQL Injection**: The backend uses SQLAlchemy ORM with strictly parameterized queries, ensuring user inputs are treated as literal bind parameters.

---

## 📊 Section 5: Engagement Intelligence & Security Analytics

### Q11: How is the Engagement Progress Metric ($0–100\%$) calculated?
**Answer**:  
Progress is computed dynamically from actual database records across 7 functional milestones:
- Project metadata & client configuration: $+10\%$
- In-scope target boundaries defined: $+15\%$
- Vulnerability findings logged: $+20\%$
- Proof-of-concept evidence verified: $+15\%$
- 4-factor risk assessments completed: $+15\%$
- Finding remediations verified in staging: $+15\%$
- Deliverable report compiled: $+10\%$

---

### Q12: Explain the 5x5 Threat Risk Heatmap.
**Answer**:  
The 5x5 Heatmap plots Impact ($1–5$ on the Y-axis) against Likelihood ($1–5$ on the X-axis). Each cell calculates a risk product ($1–25$) and groups findings dynamically. Testers can click any cell to inspect plotted threat vectors, calibrated risk scores, and jump directly to finding triage workflows.

---

## 🏁 Summary Checklist for the Defense Presentation
1. Emphasize **Human-in-the-Loop** safety.
2. Demonstrate **100% On-Premises Privacy** (Ollama + PostgreSQL pgvector).
3. Show **Deterministic Risk Mathematical Modeling** (explain why LLMs should not invent risk scores).
4. Highlight **Grounded RAG Citations** with zero hallucinations.
5. Present the **100% Automated Test Pass Rate** (Unit, Security, AI, and E2E demonstrations).
