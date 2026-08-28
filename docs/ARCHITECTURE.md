# AI Red Team Assistant — System Architecture & Design Specification

This document provides complete architectural specifications, data flow diagrams (DFD Level 0 & Level 1), entity-relationship (ER) models, use case representations, AI/RAG grounding workflows, and production deployment topologies for the **AI Red Team Assistant**.

---

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph Client_Layer ["Client Tier (React 18 + Vite + Tailwind CSS)"]
        UI_SPA["Single Page Application"]
        Auth_Context["Auth & RBAC Guard"]
        State_Services["Client Service Layer (Projects, Findings, Risk, RAG, Reports, Analytics)"]
    end

    subgraph API_Gateway ["Application Tier (FastAPI Gateway)"]
        Sec_Middleware["Security Headers, CORS & Rate Limiter"]
        Auth_Engine["JWT & Object-Level Authorization"]
        REST_Routers["REST API Routers (/projects, /findings, /risk, /reports, /analytics)"]
        Workflow_Engine["Engagement State Machine & Health Evaluator"]
        Deterministic_Risk["Deterministic 4-Factor Risk Engine (0–100)"]
    end

    subgraph AI_Intelligence_Tier ["AI & Reasoning Tier (LangGraph + Ollama)"]
        Context_Builder["Context Builder & Secret Redaction"]
        Prompt_Manager["System Rules & Delimiter Isolation"]
        RAG_Router["Query Intent Classifier (DB vs RAG vs Hybrid)"]
        Ollama_Engine["Ollama Server (Qwen3 14B Local LLM)"]
        Response_Parser["Structured JSON Validator & Citation Grounder"]
    end

    subgraph Data_Storage_Tier ["Persistence Tier (PostgreSQL 16 + pgvector)"]
        Relational_DB[("PostgreSQL Tables: Projects, Findings, Evidence, RiskHistory, Reports, Activities")]
        Vector_DB[("pgvector Embeddings: OWASP, CWE, NIST, CVSS Knowledge Chunks (nomic-embed-text)")]
    end

    UI_SPA --> Sec_Middleware
    Sec_Middleware --> Auth_Engine
    Auth_Engine --> REST_Routers
    REST_Routers --> Workflow_Engine
    REST_Routers --> Deterministic_Risk
    REST_Routers --> Context_Builder
    REST_Routers --> Relational_DB

    Context_Builder --> RAG_Router
    RAG_Router -->|Semantic Query| Vector_DB
    RAG_Router -->|Context + Citations| Prompt_Manager
    Prompt_Manager --> Ollama_Engine
    Ollama_Engine --> Response_Parser
    Response_Parser --> REST_Routers
```

---

## 2. Data Flow Diagram (DFD Level 0 — Context Diagram)

```mermaid
flowchart TD
    Tester(("Authorized Security Tester / Admin"))
    System[["AI Red Team Assistant System"]]
    TargetScope[("Authorized Target Infrastructure")]
    OllamaLLM[("Local Ollama Server (Qwen3 14B)")]
    KnowledgeDB[("Security Standards (OWASP, CWE, NIST)")]

    Tester -->|"1. User Credentials & Auth Request"| System
    System -->|"2. JWT Session Token & Dashboard Telemetry"| Tester

    Tester -->|"3. Engagement Scope & Target Assets"| System
    System -.->|"4. Non-Destructive Target Verification"| TargetScope

    Tester -->|"5. Vulnerability Findings & PoC Traces"| System
    System -->|"6. Deterministic Risk Scores & 5x5 Heatmap"| Tester

    Tester -->|"7. Contextual AI Query / Next Step Request"| System
    System -->|"8. Semantic Vector Search"| KnowledgeDB
    KnowledgeDB -->|"9. Verified Knowledge Chunks & Citations"| System
    System -->|"10. Sanitized Context + System Rules"| OllamaLLM
    OllamaLLM -->|"11. Structured Remediation Reasoning"| System
    System -->|"12. Grounded AI Response with Source Citations"| Tester

    Tester -->|"13. Generate Executive Assessment Report"| System
    System -->|"14. Formatted Report Deliverable (PDF / Markdown)"| Tester
```

---

## 3. Data Flow Diagram (DFD Level 1 — Functional Decomposition)

```mermaid
flowchart TD
    User(("Security Tester"))

    subgraph P1 ["1.0 Authentication & Session Management"]
        P1_Auth["Validate Credentials & Sign JWT"]
        P1_RBAC["Enforce Role Permissions (Admin, Tester, Reviewer)"]
    end

    subgraph P2 ["2.0 Project & Scope Management"]
        P2_Create["Create Engagement Context"]
        P2_Scope["Define In-Scope & Out-of-Scope Assets"]
    end

    subgraph P3 ["3.0 Findings & Evidence Tracking"]
        P3_Log["Record Vulnerabilities & Severity"]
        P3_Evidence["Attach PoC Logs & Tester Verification"]
        P3_Remediation["Track Developer Remediation SLA"]
    end

    subgraph P4 ["4.0 Deterministic Risk Calibration Engine"]
        P4_Calc["Calculate 4-Factor Risk Score (0–100)"]
        P4_Priority["Map Priority (P1–P4) & Level"]
    end

    subgraph P5 ["5.0 pgvector Security Knowledge Base & RAG"]
        P5_Ingest["Validate, Chunk & Embed Standards"]
        P5_Search["Cosine Similarity Top-K Search"]
    end

    subgraph P6 ["6.0 AI Co-Pilot & Decision Support"]
        P6_Context["Build Sanitized Project Context"]
        P6_LLM["Prompt Qwen3 14B with Citations"]
        P6_NextAction["Synthesize Recommended Next Action"]
    end

    subgraph P7 ["7.0 Deliverables & Reporting Engine"]
        P7_Compile["Compile 12-Section Deliverable"]
        P7_Export["Export PDF / Markdown / JSON"]
    end

    subgraph P8 ["8.0 Security Analytics & Heatmap"]
        P8_Heatmap["Plot 5x5 Impact vs Likelihood Matrix"]
        P8_Trends["Generate Velocity & Risk Trendlines"]
    end

    D1[("User Data")]
    D2[("Project & Scope")]
    D3[("Findings & Evidence")]
    D4[("Risk History")]
    D5[("pgvector Knowledge Chunks")]
    D6[("Reports & Deliverables")]
    D7[("Activity Audit Log")]

    User --> P1_Auth
    P1_Auth --> D1
    P1_Auth --> P1_RBAC

    User --> P2_Create
    P2_Create --> D2
    P2_Scope --> D2

    User --> P3_Log
    P3_Log --> D3
    P3_Evidence --> D3
    P3_Remediation --> D3

    D3 --> P4_Calc
    P4_Calc --> D4

    User --> P5_Ingest
    P5_Ingest --> D5
    P5_Search --> D5

    D2 & D3 & D4 & D5 --> P6_Context
    P6_Context --> P6_LLM
    P6_LLM --> P6_NextAction

    D2 & D3 & D4 --> P7_Compile
    P7_Compile --> D6
    P7_Compile --> P7_Export

    D3 & D4 --> P8_Heatmap
    D3 & D4 --> P8_Trends

    P2_Create & P3_Log & P4_Calc & P7_Compile --> D7
```

---

## 4. Entity-Relationship (ER) Data Model

```mermaid
erDiagram
    USER ||--o{ PROJECT : "creates / leads"
    PROJECT ||--o{ SCOPE_ASSET : "contains"
    PROJECT ||--o{ FINDING : "contains"
    PROJECT ||--o{ REPORT : "generates"
    PROJECT ||--o{ WORKSPACE_ACTIVITY : "logs"
    
    FINDING ||--o{ EVIDENCE : "supported by"
    FINDING ||--|| RISK_ASSESSMENT : "evaluated by"
    FINDING ||--o{ REMEDIATION_RECORD : "tracked by"

    KNOWLEDGE_SOURCE ||--o{ KNOWLEDGE_DOCUMENT : "organizes"
    KNOWLEDGE_DOCUMENT ||--o{ KNOWLEDGE_CHUNK : "split into"

    USER {
        string id PK
        string email UK
        string password_hash
        string full_name
        string role "ADMIN | SECURITY_TESTER | REVIEWER | VIEWER"
        datetime created_at
    }

    PROJECT {
        string id PK
        string name
        string organization
        string project_type "WEB_APP | NETWORK | CLOUD | API"
        string status "ACTIVE | IN_PROGRESS | COMPLETED | ARCHIVED"
        string engagement_state "PLANNING | SCOPING | ASSESSMENT | ANALYSIS | REMEDIATION | REPORTING | COMPLETED"
        int progress "0 - 100"
        int risk_score "0 - 100"
        string lead_tester
        date start_date
        date end_date
    }

    SCOPE_ASSET {
        string id PK
        string project_id FK
        string asset_identifier "e.g. auth.apexfin.com"
        string asset_type "DOMAIN | IP_RANGE | REPO | ENDPOINT"
        string scope_status "IN_SCOPE | OUT_OF_SCOPE"
        string environment "PRODUCTION | STAGING | INTERNAL"
    }

    FINDING {
        string id PK
        string project_id FK
        string title
        string vulnerability_type "SQLi | XSS | SSRF | IDOR | AUTH"
        string severity "CRITICAL | HIGH | MEDIUM | LOW | INFORMATIONAL"
        int risk_score "0 - 100"
        string priority "P1 — Immediate | P2 — High | P3 — Normal | P4 — Low"
        string asset
        string endpoint
        string description
        string impact
        string recommendation
        string status "OPEN | REMEDIATION | RESOLVED | ACCEPTED_RISK"
        string remediation_status "NOT_STARTED | IN_PROGRESS | FIXED | VERIFIED | REJECTED"
        string assigned_user
        date due_date
        string resolution_notes
    }

    EVIDENCE {
        string id PK
        string finding_id FK
        string title
        string description
        string file_reference
        string verification_status "UNREVIEWED | REVIEWED | VERIFIED | REJECTED"
        string verified_by
        datetime verified_at
    }

    RISK_ASSESSMENT {
        string id PK
        string finding_id FK
        int impact "1 - 5 (35%)"
        int likelihood "1 - 5 (30%)"
        int asset_criticality "1 - 5 (20%)"
        int exploitability "1 - 5 (15%)"
        int calculated_score "0 - 100"
        string risk_level "CRITICAL | HIGH | MODERATE | LOW"
        string recommended_priority "P1 | P2 | P3 | P4"
        string justification
    }

    KNOWLEDGE_SOURCE {
        string id PK
        string name "OWASP Top 10 | MITRE CWE | NIST SP 800-115 | CVSS v3.1"
        string source_type "STANDARD | VULNERABILITY_DATABASE | GUIDANCE | METHODOLOGY"
        string version
        string status "INDEXED"
    }

    KNOWLEDGE_DOCUMENT {
        string id PK
        string source_id FK
        string title
        string content_hash "SHA-256 duplicate detection"
        string source_reference
    }

    KNOWLEDGE_CHUNK {
        string id PK
        string document_id FK
        string section
        string content
        vector embedding "768-dim nomic-embed-text vector"
        json metadata
    }

    REPORT {
        string id PK
        string project_id FK
        string title
        string report_type "EXECUTIVE | TECHNICAL | FULL_ASSESSMENT | REMEDIATION"
        string version "v1.0 | v1.1"
        string status "DRAFT | IN_REVIEW | READY | ARCHIVED"
        json sections_data
    }

    WORKSPACE_ACTIVITY {
        string id PK
        string project_id FK
        string entity_type "PROJECT | FINDING | RISK | EVIDENCE | REPORT"
        string entity_id
        string action "FINDING_CREATED | RISK_UPDATED | EVIDENCE_VERIFIED | REPORT_GENERATED"
        string description
        datetime created_at
    }
```

---

## 5. Use Case Diagram (Actors & Capabilities)

```mermaid
graph LR
    subgraph Actors
        Tester(("Security Tester"))
        LeadTester(("Lead Reviewer"))
        Admin(("Administrator"))
        ClientViewer(("Executive Viewer"))
    end

    subgraph Use_Cases ["Platform Use Cases"]
        UC1["Authenticate & Manage Session"]
        UC2["Define Engagement Scope & Boundaries"]
        UC3["Log Findings & Attach PoC Evidence"]
        UC4["Calculate Deterministic Risk (4-Factor Engine)"]
        UC5["Consult Context-Aware AI Co-Pilot (Qwen3 14B)"]
        UC6["Execute Semantic RAG Search across Standards"]
        UC7["Track Remediation SLAs & Stage Verifications"]
        UC8["Verify & Sign-off PoC Technical Traces"]
        UC9["Compile & Export 12-Section Security Reports"]
        UC10["Inspect 5x5 Risk Heatmap & Trend Velocity"]
        UC11["Control Workflow State Transitions"]
        UC12["Manage User Roles & System Health"]
    end

    Tester --> UC1
    Tester --> UC2
    Tester --> UC3
    Tester --> UC4
    Tester --> UC5
    Tester --> UC6
    Tester --> UC7
    Tester --> UC9
    Tester --> UC10

    LeadTester --> UC1
    LeadTester --> UC4
    LeadTester --> UC7
    LeadTester --> UC8
    LeadTester --> UC9
    LeadTester --> UC10
    LeadTester --> UC11

    Admin --> UC1
    Admin --> UC11
    Admin --> UC12

    ClientViewer --> UC1
    ClientViewer --> UC9
    ClientViewer --> UC10
```

---

## 6. pgvector RAG Grounding Pipeline Architecture

```mermaid
flowchart LR
    subgraph Ingestion_Stage ["1. Knowledge Ingestion Pipeline"]
        Doc[Security Standard / Methodology Document] --> Validate[Validate & Compute SHA-256 Hash]
        Validate --> Clean[Text Normalization & Secret Redaction]
        Clean --> Chunk[Semantic Chunker (500 tokens / 50 overlap)]
        Chunk --> Embed[Ollama nomic-embed-text (768-dim)]
        Embed --> PGVector[(PostgreSQL pgvector Table)]
    end

    subgraph Query_Stage ["2. Intent Routing & Retrieval Pipeline"]
        UserQ[User Question / Finding Context] --> Router{RAG Query Router}
        Router -->|Project Context| DB[(Project DB)]
        Router -->|Security Standard / Remediation| VectorSearch[Cosine Similarity Search Top-K]
        VectorSearch --> PGVector
        PGVector --> RankedChunks[Ranked Relevant Chunks with Cosine %]
    end

    subgraph Grounding_Stage ["3. Prompt Construction & Output"]
        RankedChunks --> PromptAssembler[Assemble Prompt with Delimiters]
        DB --> PromptAssembler
        PromptAssembler --> QwenLLM[Local Ollama Qwen3 14B]
        QwenLLM --> Response[Structured AI Response + Verified Source Citations]
    end
```

---

## 7. Production Deployment Topology (Docker Compose)

```mermaid
graph TB
    subgraph Host_Environment ["Host Machine (Enterprise Server / Workstation)"]
        Ollama_Daemon["Ollama Daemon (qwen3:14b + nomic-embed-text) :11434"]
    end

    subgraph Docker_Bridge_Network ["Docker Compose Network (redteam_network)"]
        subgraph Container_Frontend ["Frontend Container (redteam_react_frontend)"]
            Nginx_Web["Nginx Alpine Server (:80) -> Host Port :3000"]
            React_Dist["Static Vite Single Page Application Build"]
        end

        subgraph Container_Backend ["Backend Container (redteam_fastapi_backend)"]
            FastAPI_App["Uvicorn ASGI FastAPI Service (:8000)"]
            Sec_Layer["Rate Limiter, Security Headers & RBAC"]
        end

        subgraph Container_DB ["Database Container (redteam_postgres_vector)"]
            PostgreSQL_DB["PostgreSQL 16 Engine (:5432)"]
            PGVector_Ext["pgvector Vector Extension"]
            Persistent_Vol[("Named Volume: pgdata")]
        end
    end

    WebUser(("Security Tester Browser")) -->|HTTP / HTTPS :3000| Nginx_Web
    Nginx_Web -->|Proxy /api/ -> :8000| FastAPI_App
    FastAPI_App -->|SQLAlchemy Connection Pool| PostgreSQL_DB
    PostgreSQL_DB --- Persistent_Vol
    FastAPI_App -->|HTTP aiohttp Client| Ollama_Daemon
```
