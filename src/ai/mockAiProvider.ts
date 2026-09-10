import { 
  StructuredAIResponse, 
  QuickActionType, 
  ContextType,
  ForensicAttachment,
  ProposedFinding,
  CorrelatedCluster,
  ResponseIntentType,
  AIAction,
  ConversationMode
} from '../types/ai.types';
import { Severity } from '../types/finding.types';
import { IntentClassifier } from './intentClassifier';

export class MockAiProvider {
  /**
   * Generates a context-aware response based on active conversation mode.
   * - MODE 1: NORMAL CHAT (Default) -> Plain, natural conversational prose (Claude/ChatGPT style).
   *   No severity/risk cards, no evidence tables, no action buttons unless explicitly requested.
   * - MODE 2: ASSISTANT MODE -> Structured forensic analysis, confidence tiers, risk calibration,
   *   grounded evidence refs, and contextual action buttons.
   */
  static async generate(params: {
    projectName: string;
    contextType: ContextType;
    contextId?: string;
    contextText: string;
    userMessage: string;
    quickAction?: QuickActionType | string;
    mode?: ConversationMode;
    attachments?: ForensicAttachment[];
  }): Promise<StructuredAIResponse> {
    const {
      contextType,
      contextText,
      userMessage,
      quickAction,
      projectName,
      mode = 'chat',
      attachments = []
    } = params;
    const lowerMsg = userMessage.trim().toLowerCase();

    // Artificial latency for professional LLM response feel
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 1. Check for Project Attached Files in Context
    const hasProjectFiles =
      contextText.includes('MANDATORY ATTACHED PROJECT EVIDENCE FILES') ||
      contextText.includes('[ATTACHED PROJECT FILE');

    // 2. Classify Message Intent
    const intent: ResponseIntentType = IntentClassifier.classify(
      userMessage,
      quickAction as QuickActionType,
      attachments.length > 0 || hasProjectFiles
    );

    // =========================================================================
    // =========================================================================
    // MODE 1: NORMAL CHAT (Standard Conversational Assistant)
    // =========================================================================
    if (mode === 'chat' && !quickAction) {
      // 1. Greetings & Friendly Small Talk
      const isGreeting =
        /^(h+i+|h+e+y+|h+e+l+l+o+|h+o+l+a+|howdy|sup|yo|what'?s\s*up|greetings|good\s*(morning|afternoon|evening)|hlo|namaste|welcome)(\s+there)?[\s!.,?]*$/i.test(lowerMsg) ||
        /^(hi|hello|hey|greetings|good\s+morning|good\s+afternoon|good\s+evening)\b/i.test(lowerMsg) ||
        lowerMsg === '';

      if (isGreeting) {
        const isGeneral = contextType === 'general' || projectName.toLowerCase().includes('general');
        const greetingText = isGeneral
          ? `Hello! 👋 How can I help you today?

I'm your **AI Red Team Assistant**. Feel free to ask me anything about:
- **Vulnerability Mechanisms**: Explaining OWASP Top 10, SSRF, SQLi, IDOR, Broken Auth, etc.
- **Active Directory & Infrastructure**: Kerberoasting, Pass-the-Hash, AS-REP roasting, DCSync.
- **Secure Coding & Defense**: Practical code snippets and remediations in Python, TypeScript, Go, etc.
- **Forensic Logs & Triaging**: Analyzing incident logs and indicators of compromise.

What would you like to explore?`
          : `Hello! 👋 How can I help you with **${projectName}** today?

We can discuss scope boundaries, review potential security concerns, explore validation test procedures, or answer any technical cybersecurity questions. What would you like to focus on?`;

        return {
          intent: 'casual',
          summary: isGeneral ? "Hello! How can I assist you today?" : `Hello! How can I assist you with ${projectName} today?`,
          rawText: greetingText,
          actions: [],
        };
      }

      // Small talk: Thanks
      if (/^(thanks|thank\s*you|thx|cheers|great|awesome|perfect|ok|okay|cool|got\s*it|nice)/i.test(lowerMsg)) {
        return {
          intent: 'casual',
          summary: "You're very welcome!",
          rawText: "You're very welcome! 😊 Let me know whenever you'd like to explore another topic, analyze code, or investigate further.",
          actions: [],
        };
      }

      // Small talk: Identity & Help
      if (/^(who\s*are\s*you|what\s*can\s*you\s*do|what\s*is\s*your\s*role|help|introduce)/i.test(lowerMsg)) {
        const isGeneral = contextType === 'general' || projectName.toLowerCase().includes('general');
        return {
          intent: 'casual',
          summary: "I am your AI Red Team Assistant.",
          rawText: `I am your **AI Red Team Assistant** — a conversational copilot for cybersecurity research, penetration testing, and software security.

**What I can do for you:**
- **Answer security questions:** Explain concepts like SSRF, Kerberoasting, SQL injection, race conditions, memory safety, or cryptographic flaws.
- **Review code & scripts:** Provide secure code implementations in Python, TypeScript, Go, or SQL.
- **Discuss case findings:** Conversationally summarize evidence or triage potential risk areas.
- **Assistant Mode on demand:** If you need full structured finding cards with confidence ratings, risk scores, and one-click action buttons, you can switch to **Assistant Mode** anytime using the toggle above or by asking me to *"switch to assistant mode"*.

How can I help you today?`,
          actions: [],
        };
      }

      // Explanations of Security Concepts (SSRF, SQLi, Kerberoasting, etc.)
      if (lowerMsg.includes('ssrf') || lowerMsg.includes('server-side request forgery')) {
        return {
          intent: 'specific_query',
          summary: "Server-Side Request Forgery (SSRF) Explanation",
          rawText: `### What is Server-Side Request Forgery (SSRF)?

**Server-Side Request Forgery (SSRF)** occurs when a web application makes an HTTP request to an arbitrary URL supplied by an attacker, without adequate validation or network boundary restriction.

#### How It Works
1. An application accepts a user-supplied URL (e.g., for generating a PDF, importing an image, or calling a webhook).
2. The server backend executes the request using its internal network privileges.
3. If not properly restricted, an attacker can coerce the server into contacting internal-only services (e.g. \`http://169.254.169.254/latest/meta-data/\` on AWS, internal Redis instances, or intranet admin portals).

#### Prevention & Defense
- **URL Whitelisting:** Strictly restrict allowed protocols (\`https\` only) and domain destinations.
- **DNS Resolution & IP Validation:** Resolve the hostname and verify the resulting IP does NOT fall within RFC 1918 private ranges (\`10.0.0.0/8\`, \`172.16.0.0/12\`, \`192.168.0.0/16\`, \`127.0.0.0/8\`) or cloud metadata IP (\`169.254.169.254\`).
- **Disable HTTP Redirects:** Prevent redirect-based bypasses where a safe URL redirects to an internal endpoint.`,
          actions: [],
        };
      }

      if (lowerMsg.includes('kerberoast') || lowerMsg.includes('kerberos') || lowerMsg.includes('active directory')) {
        return {
          intent: 'specific_query',
          summary: "Active Directory & Kerberoasting Mechanics",
          rawText: `### Active Directory Kerberoasting Explained

**Kerberoasting** is a post-exploitation attack technique targeting Active Directory domain user accounts that have a **Service Principal Name (SPN)** configured (e.g., MSSQL service accounts).

#### Attack Lifecycle
1. **Request Ticket:** Any authenticated domain user requests a Kerberos Ticket Granting Service (TGS) ticket from the Domain Controller (KDC) for an SPN service account.
2. **Encrypted with Service Hash:** The KDC encrypts the TGS ticket using the NTLM hash of the target service account's password.
3. **Offline Brute-Force:** The attacker extracts the ticket from memory or network traffic and performs offline cracking (via Hashcat mode \`13100\` or John the Ripper) to reveal the plaintext password.

#### Detection & Defense
- **Managed Service Accounts (gMSA):** Transition service accounts to Group Managed Service Accounts (gMSAs), which automatically generate 128-character complex passwords and rotate them periodically.
- **AES Encryption:** Enforce AES-128/256 Kerberos encryption over legacy RC4_HMAC (\`0x17\`).
- **Event Monitoring:** Alert on high volumes of Kerberos TGS requests with RC4 encryption (Event ID 4769).`,
          actions: [],
        };
      }

      if (lowerMsg.includes('sql injection') || lowerMsg.includes('sqli')) {
        return {
          intent: 'specific_query',
          summary: "SQL Injection Root Cause & Remediation",
          rawText: `### Understanding SQL Injection (SQLi)

SQL injection occurs when untrusted user input is directly concatenated or formatted into a dynamic SQL query string instead of being treated strictly as parameterized data.

#### Example of Vulnerable Code
\`\`\`typescript
// Vulnerable: user input concatenated directly
const query = "SELECT * FROM users WHERE username = '" + req.body.username + "' AND password = '" + req.body.password + "'";
const result = await db.query(query);
\`\`\`

#### Secure Parameterized Implementation
\`\`\`typescript
// Secure: parameterized Prepared Statements
const query = 'SELECT id, username, email FROM users WHERE username = $1 AND password_hash = $2 LIMIT 1';
const result = await db.query(query, [username, hashedPassword]);
\`\`\`

#### Key Defense Rules
1. **Prepared Statements (Parameterized Queries):** Ensures the database engine parses the query structure before binding user input as literal values.
2. **Object-Relational Mapping (ORM):** Use vetted ORMs (Prisma, TypeORM, SQLAlchemy) with parameter bindings.
3. **Least Privilege Database Accounts:** Ensure web application database users do not have administrative or cross-database permissions.`,
          actions: [],
        };
      }

      // Questions about previous findings / IP / logs in Normal Chat
      if (lowerMsg.includes('earlier') || lowerMsg.includes('what did you find') || lowerMsg.includes('what was that ip') || lowerMsg.includes('summary of findings')) {
        return {
          intent: 'specific_query',
          summary: `Summary of findings discussed for ${projectName}`,
          rawText: `In our ongoing investigation for **${projectName}**, we observed the following key points:
- **Authentication Endpoint:** Suspicious SQL injection attempts were logged in \`auth_audit.log\` (lines 4–6) targeting \`/api/v1/auth\`.
- **Source Address:** The probe originated from IP \`198.51.100.44\` with payload \`admin' OR '1'='1\`.
- **Perimeter Services:** Verified via \`nmap_perimeter_scan.xml\` that public HTTP/HTTPS gateways are exposed.

If you'd like to run a formal risk rating, generate an audit finding, or suggest specific test scripts, let me know or switch to **Assistant Mode**!`,
          actions: [],
        };
      }

      // Code requests / scripting requests in Normal Chat
      if (lowerMsg.includes('script') || lowerMsg.includes('code') || lowerMsg.includes('python') || lowerMsg.includes('write')) {
        return {
          intent: 'specific_query',
          summary: "Code implementation for security analysis",
          rawText: `Here is a Python script that parses authentication log files for suspicious SQL injection patterns and failed login bursts:

\`\`\`python
import re
import sys
from collections import defaultdict

SQLI_PATTERNS = [
    re.compile(r"(\%27)|(\')|(\-\-)|(\%23)|(#)", re.IGNORECASE),
    re.compile(r"\b(OR|AND)\b.+?(=|>|<|\bLIKE\b)", re.IGNORECASE),
    re.compile(r"\bUNION\b.+?\bSELECT\b", re.IGNORECASE),
]

def analyze_log(file_path):
    suspicious_events = []
    ip_counter = defaultdict(int)

    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        for line_no, line in enumerate(f, 1):
            for pattern in SQLI_PATTERNS:
                if pattern.search(line):
                    suspicious_events.append((line_no, line.strip()))
                    # Extract IP if present
                    ip_match = re.search(r"\b(?:\d{1,3}\.){3}\d{1,3}\b", line)
                    if ip_match:
                        ip_counter[ip_match.group(0)] += 1
                    break

    print(f"[*] Found {len(suspicious_events)} suspicious log entries:")
    for line_no, entry in suspicious_events[:5]:
        print(f"  Line {line_no}: {entry}")

    if ip_counter:
        print("\n[*] Top Suspicious Source IPs:")
        for ip, count in sorted(ip_counter.items(), key=lambda x: x[1], reverse=True)[:5]:
            print(f"  {ip}: {count} occurrences")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        analyze_log(sys.argv[1])
    else:
        print("Usage: python analyze_logs.py <path_to_log_file>")
\`\`\`

Let me know if you would like me to customize this script for specific log formats (such as JSON, Nginx, or Windows EVTX).`,
          actions: [],
        };
      }

      // File / log question in Normal Chat
      if (attachments.length > 0 || lowerMsg.includes('file') || lowerMsg.includes('log') || lowerMsg.includes('evidence')) {
        return {
          intent: 'specific_query',
          summary: `Evidence log analysis for ${projectName}`,
          rawText: `I reviewed the attached evidence for **${projectName}**.

**Key Observations:**
- In \`auth_audit.log\`, there is an entry at timestamp \`08:01:05Z\` from IP \`198.51.100.44\` sending the payload \`admin' OR '1'='1\` against \`/api/v1/auth\`.
- The server responded with HTTP status 200 and issued a session token.
- This indicates that user input reached the database query without parameterized protection.

To generate a formal finding deliverable with confidence scoring and risk calibration, switch to **Assistant Mode** or ask me to *"create a formal finding"*.`,
          actions: [],
        };
      }

      // Dynamic friendly fallback for general inquiries in Normal Chat
      return {
        intent: 'specific_query',
        summary: `Guidance for ${projectName}`,
        rawText: `I'm happy to help with that!

In security testing and architecture review, here are key best practices:
1. **Input Validation & Sanitization**: Ensure all external parameters are bound through parameterized queries and typed schemas.
2. **Access Control**: Enforce least privilege and centralized authentication middleware.
3. **Layered Defense**: Complement application logic with perimeter rate limits, security headers, and logging.

Feel free to ask for specific code examples, remediation guidance, or threat scenarios!`,
        actions: [],
      };
    }

    // =========================================================================
    // MODE 2: ASSISTANT MODE (Full Structured Forensic & Finding Behavior)
    // =========================================================================

    // 1. CASUAL / GREETINGS IN ASSISTANT MODE
    if (intent === 'casual' && !quickAction) {
      if (/^(thanks|thank\s*you|thx|cheers|great|awesome|perfect|ok|okay|cool|got\s*it|nice)/i.test(lowerMsg)) {
        return {
          intent: 'casual',
          summary: "You're welcome! Ready to evaluate risk, suggest tests, or create findings.",
          rawText: "You're welcome! 😊 Ready to evaluate risk, suggest tests, or create findings whenever you need.",
          actions: [],
        };
      }

      const isGeneral = contextType === 'general' || projectName.toLowerCase().includes('general');
      return {
        intent: 'casual',
        summary: `Assistant Mode active for ${isGeneral ? 'General Consultation' : projectName}.`,
        rawText: `Hello! 👋 **Assistant Mode** is active for **${isGeneral ? 'General Security Consultation' : projectName}**.

I am calibrated to provide grounded findings, 7-factor threat risk scoring, evidence correlation, and structured audit reporting.

How would you like to proceed?`,
        actions: [],
      };
    }

    // 2. SPECIFIC ACTION: ANALYZE RISK
    if (
      quickAction === 'analyze_risk' ||
      lowerMsg.includes('analyze risk') ||
      lowerMsg.includes('risk score') ||
      lowerMsg.includes('how risky') ||
      lowerMsg.includes('severity driven')
    ) {
      const riskActions: AIAction[] = [
        { id: 'show-evidence', label: 'Show Evidence', type: 'show_evidence', variant: 'secondary' },
        { id: 'explain-risk', label: 'Explain Risk', type: 'explain_risk', variant: 'secondary' },
        { id: 'create-finding', label: 'Create Finding', type: 'create_finding', variant: 'primary' },
      ];

      return {
        intent: 'specific_query',
        summary: "I analyzed the available evidence.",
        risk: {
          level: 'HIGH',
          score: 82,
          text: 'Risk Score: 82/100 | Priority: P1 | Confidence: CONFIRMED',
        },
        impact: "The risk is elevated because authentication is affected and the endpoint interacts directly with the database.",
        reasoning: `7-Factor Risk Calibration Breakdown:
1. Likelihood: HIGH (Target login endpoint is exposed on perimeter /api/v1/auth)
2. Impact: CRITICAL (Direct potential database table leakage and JWT token manipulation)
3. Exploitability: HIGH (Tainted parameter requires standard SQL injection strings without memory corruption)
4. Exposure: HIGH (Externally reachable over public HTTPS gateway)
5. Asset Criticality: HIGH (Central user authentication & session management controller)
6. Existing Controls: INADEQUATE (Missing parameterized bind statements, zero WAF block)
7. Evidence Confidence: CONFIRMED (auth_audit.log lines 4–6 show verbatim payload and status 200)`,
        recommendation: 'Refactor query execution to use parameterized prepared statements ($1, $2) and implement strict input whitelist validation.',
        suggestedValidation: 'Re-test target endpoint with benign boundary strings and verify server responds with clean HTTP 400 Bad Request.',
        confidence: 'CONFIRMED',
        actions: riskActions,
      };
    }

    // 3. SPECIFIC ACTION: EXPLAIN RISK
    if (quickAction === 'explain_risk' || lowerMsg.includes('explain risk')) {
      const explainRiskActions: AIAction[] = [
        { id: 'show-evidence', label: 'Show Evidence', type: 'show_evidence', variant: 'secondary' },
        { id: 'recommend-remediation', label: 'Recommend Remediation', type: 'recommend_remediation', variant: 'secondary' },
        { id: 'create-finding', label: 'Create Finding', type: 'create_finding', variant: 'primary' },
      ];

      return {
        intent: 'specific_query',
        summary: "Risk Score 82/100 is driven by unauthenticated external reachability and database access.",
        risk: {
          level: 'HIGH',
          score: 82,
          text: 'Risk Score: 82/100 | Priority: P1 | Confidence: CONFIRMED',
        },
        impact: "If exploited, an attacker can bypass user password verification, assume administrative roles, and exfiltrate tenant records from the backend database.",
        reasoning: `Threat Likelihood vs. Impact Analysis:
- Asset: Primary Authentication Service (/api/v1/auth)
- Threat Actor Capability: Low barrier to entry (standard SQL injection syntax)
- Business Impact: Loss of tenant data confidentiality, integrity violation, and compliance penalty.`,
        recommendation: 'Enforce parameterized queries ($1, $2) and apply rate limiting.',
        confidence: 'CONFIRMED',
        actions: explainRiskActions,
      };
    }

    // 4. SPECIFIC ACTION: SUGGEST TESTS
    if (
      quickAction === 'suggest_tests' ||
      lowerMsg.includes('suggest tests') ||
      lowerMsg.includes('test steps') ||
      lowerMsg.includes('validation tests') ||
      lowerMsg.includes('how to test')
    ) {
      const testActions: AIAction[] = [
        { id: 'explain-test', label: 'Explain Test', type: 'explain_test', variant: 'secondary' },
        { id: 'show-expected-result', label: 'Show Expected Result', type: 'show_expected_result', variant: 'secondary' },
        { id: 'add-to-test-plan', label: 'Add to Test Plan', type: 'add_to_test_plan', variant: 'secondary' },
      ];

      return {
        intent: 'specific_query',
        summary: "I recommend these controlled validation steps:",
        impact: "Execute these non-destructive tests to verify whether user input reaches the database SQL parser without causing downtime.",
        reasoning: `Controlled Validation Test Steps:
1. Verify whether user input reaches the database query (send benign boundary string \`test'probe\`).
2. Review parameterized query implementation in the repository data layer.
3. Validate authentication behavior under malformed parameter conditions.
4. Review application logs during testing for syntax error leakage or unhandled 500 responses.`,
        recommendation: 'Ensure all tests remain non-destructive and adhere to authorized testing windows.',
        suggestedValidation: 'Verify that invalid payloads return standard HTTP 400 Bad Request with zero database syntax leakage.',
        confidence: 'CONFIRMED',
        actions: testActions,
      };
    }

    // 5. SPECIFIC ACTION: EXPLAIN TEST / EXPECTED RESULT / ADD TO TEST PLAN
    if (quickAction === 'explain_test' || lowerMsg.includes('explain test')) {
      return {
        intent: 'specific_query',
        summary: "Detailed methodology for safe, non-destructive validation:",
        impact: "Controlled testing must avoid sleep delays or table drops; focus solely on query parser parameter binding behavior.",
        reasoning: `Step-by-Step Test Procedure:
1. Send benign probe: Send POST /api/v1/auth with JSON {"username": "admin'"} and observe status code.
2. Check Response: Look for HTTP 400 (properly handled) vs HTTP 500 / SQL Syntax error (vulnerable).
3. Confirm Parameter Binding: Inspect code in AuthController.ts to verify PreparedStatement or ORM parameter binding.`,
        recommendation: 'Notify the SOC team before launching test payloads.',
        confidence: 'CONFIRMED',
        actions: [
          { id: 'show-expected-result', label: 'Show Expected Result', type: 'show_expected_result', variant: 'secondary' },
          { id: 'add-to-test-plan', label: 'Add to Test Plan', type: 'add_to_test_plan', variant: 'secondary' },
          { id: 'suggest-tests', label: 'Suggest Tests', type: 'suggest_tests', variant: 'secondary' },
        ],
      };
    }

    if (quickAction === 'show_expected_result' || lowerMsg.includes('expected result')) {
      return {
        intent: 'specific_query',
        summary: "Expected test outcomes for secure vs vulnerable implementations:",
        impact: "A secure endpoint returns uniform HTTP 400 or 401 with generic error messages and zero query traces.",
        reasoning: `Expected Result Matrix:
- Secure Behavior (PASS): HTTP 400 Bad Request | Payload treated strictly as literal string | No SQL parser errors.
- Vulnerable Behavior (FAIL): HTTP 200 OK without password OR HTTP 500 with SQL syntax error traces leaked in response body.`,
        recommendation: 'Ensure error handling middleware masks all internal database exceptions.',
        confidence: 'CONFIRMED',
        actions: [
          { id: 'add-to-test-plan', label: 'Add to Test Plan', type: 'add_to_test_plan', variant: 'secondary' },
          { id: 'recommend-remediation', label: 'Recommend Remediation', type: 'recommend_remediation', variant: 'secondary' },
        ],
      };
    }

    if (quickAction === 'add_to_test_plan' || lowerMsg.includes('add to test plan')) {
      return {
        intent: 'specific_query',
        summary: "Validation test procedure successfully added to the active engagement test plan.",
        impact: "Test ID `TST-AUTH-SQLI` is now registered under engagement scope with assigned non-destructive parameters.",
        reasoning: `Test Plan Entry:
- Target: ${projectName} - /api/v1/auth
- Test Category: Input Validation & Parameterization
- Execution Status: Scheduled for Controlled Window`,
        recommendation: 'Review test plan checklist in the engagement overview dashboard.',
        confidence: 'CONFIRMED',
        actions: [
          { id: 'suggest-tests', label: 'Suggest Tests', type: 'suggest_tests', variant: 'secondary' },
          { id: 'create-finding', label: 'Create Finding', type: 'create_finding', variant: 'primary' },
        ],
      };
    }

    // 6. SPECIFIC ACTION: EXPLAIN FINDING / EXPLAIN MORE
    if (
      quickAction === 'explain_finding' ||
      quickAction === 'explain_more' ||
      lowerMsg.includes('explain more') ||
      lowerMsg.includes('explain finding') ||
      lowerMsg.includes('why is it vulnerable') ||
      lowerMsg.includes('what is happening')
    ) {
      const explainActions: AIAction[] = [
        { id: 'suggest-tests', label: 'Suggest Tests', type: 'suggest_tests', variant: 'secondary' },
        { id: 'show-evidence', label: 'Show Evidence', type: 'show_evidence', variant: 'secondary' },
        { id: 'recommend-remediation', label: 'Recommend Remediation', type: 'recommend_remediation', variant: 'secondary' },
      ];

      return {
        intent: 'specific_query',
        summary: "The application appears to pass user-controlled input into a database query without sufficient parameterization.",
        impact: "Potential Impact: An attacker could potentially manipulate database queries to bypass authentication or extract sensitive customer records.",
        reasoning: `Technical Explanation:
The vulnerability occurs because the login controller concatenates user-supplied strings directly into raw SQL execution statements rather than binding them to typed placeholders ($1, $2).

Evidence:
Referenced from project attached file auth_audit.log (lines 4–6) showing the payload \`admin' OR '1'='1\` generating an unauthenticated token.

Remediation:
Use parameterized queries (Prepared Statements) and server-side input validation with strict regex whitelists.`,
        recommendation: 'Use parameterized queries and server-side input validation.',
        suggestedValidation: 'Execute controlled verification with benign probe to confirm parameter encapsulation.',
        confidence: 'CONFIRMED',
        actions: explainActions,
      };
    }

    // 7. SPECIFIC ACTION: RECOMMEND REMEDIATION
    if (
      quickAction === 'suggest_remediation' ||
      quickAction === 'recommend_remediation' ||
      quickAction === 'explain_remediation' ||
      lowerMsg.includes('remediation') ||
      lowerMsg.includes('how to fix') ||
      lowerMsg.includes('patch')
    ) {
      return {
        intent: 'specific_query',
        summary: "Defensive remediation guidelines and secure code implementation:",
        impact: "Replacing string concatenation with Prepared Statements permanently eliminates SQL syntax injection vectors.",
        reasoning: `Recommended Code Fix:
\`\`\`typescript
// Secure Parameterized Query Implementation
const query = 'SELECT id, email, password_hash FROM users WHERE username = $1 LIMIT 1';
const result = await db.query(query, [sanitizedUsername]);
\`\`\`
1. Use Prepared Statements with strongly typed bind parameters ($1, $2).
2. Validate username format with strict regex: /^[a-zA-Z0-9_.]{3,32}$/.
3. Apply least-privilege permissions to the database service user.`,
        recommendation: 'Deploy parameterized queries and verify in staging.',
        confidence: 'CONFIRMED',
        actions: [
          { id: 'explain-remediation', label: 'Explain Remediation', type: 'explain_remediation', variant: 'secondary' },
          { id: 'verify-fix', label: 'Verify Fix', type: 'verify_fix', variant: 'secondary' },
          { id: 'add-to-report', label: 'Add to Report', type: 'add_to_report', variant: 'secondary' },
        ],
      };
    }

    if (quickAction === 'verify_fix' || lowerMsg.includes('verify fix')) {
      return {
        intent: 'specific_query',
        summary: "Post-remediation verification and regression testing plan:",
        impact: "Verify that defensive prepared statements prevent quote interpretation without breaking valid user authentication.",
        reasoning: `Verification Checklist:
1. Re-test target endpoint with single quotes and Boolean operators -> Must return HTTP 400 or HTTP 401.
2. Confirm valid user credentials authenticate normally with 200 OK.
3. Check database server query logs to confirm queries execute as prepared parameter bindings.`,
        recommendation: 'Automate this assertion in your CI/CD regression test pipeline.',
        confidence: 'CONFIRMED',
        actions: [
          { id: 'suggest-tests', label: 'Suggest Tests', type: 'suggest_tests', variant: 'secondary' },
          { id: 'add-to-report', label: 'Add to Report', type: 'add_to_report', variant: 'secondary' },
        ],
      };
    }

    if (quickAction === 'add_to_report' || lowerMsg.includes('add to report')) {
      return {
        intent: 'specific_query',
        summary: "Finding and risk calibration formatted for executive deliverables and audit reports.",
        impact: "Deliverable section compiled with CVSS 3.1 score, affected assets, PoC logs, and defensive code diffs.",
        reasoning: `Report Deliverable Preview:
- Title: SQL Injection on Primary Authentication Controller
- Severity: HIGH (CVSS 8.2)
- Asset: /api/v1/auth
- Status: Proposed for Analyst Acceptance`,
        recommendation: 'Export report via the Deliverables tab when ready.',
        confidence: 'CONFIRMED',
        actions: [
          { id: 'create-finding', label: 'Create Finding', type: 'create_finding', variant: 'primary' },
          { id: 'analyze-risk', label: 'Analyze Risk', type: 'analyze_risk', variant: 'secondary' },
        ],
      };
    }

    // 8. SPECIFIC ACTION: ATTACK PATH & MITRE ATT&CK
    if (quickAction === 'view_attack_path' || quickAction === 'map_attack' || lowerMsg.includes('attack path') || lowerMsg.includes('mitre')) {
      return {
        intent: 'specific_query',
        summary: "Multi-stage attack path mapped to MITRE ATT&CK Enterprise Matrix:",
        risk: {
          level: 'HIGH',
          score: 82,
          text: 'Risk Score: 82/100 | Priority: P1 | Confidence: CONFIRMED',
        },
        impact: "Adversaries can chain perimeter SQLi to gain valid credentials and pivot laterally to internal microservices.",
        reasoning: `MITRE ATT&CK Progression:
1. Initial Access: T1190 - Exploit Public-Facing Application (SQLi on /api/v1/auth)
2. Credential Access: T1003 - OS Credential Dumping / Database Hash Extraction
3. Lateral Movement: T1021 - Remote Services via forged session tokens`,
        recommendation: 'Implement API gateway rate-limiting and enforce strict network segmentation.',
        confidence: 'CONFIRMED',
        actions: [
          { id: 'view-attack-path', label: 'View Attack Path', type: 'view_attack_path', variant: 'secondary' },
          { id: 'analyze-risk', label: 'Analyze Risk', type: 'analyze_risk', variant: 'secondary' },
          { id: 'map-attack', label: 'Map to MITRE ATT&CK', type: 'map_attack', variant: 'secondary' },
          { id: 'explain-more', label: 'Explain More', type: 'explain_more', variant: 'secondary' },
        ],
      };
    }

    // 9. PROJECT ATTACHED FILES INQUIRY / LOG ANALYSIS / INVESTIGATE IN ASSISTANT MODE
    if (
      lowerMsg.includes('file') ||
      lowerMsg.includes('attach') ||
      lowerMsg.includes('evidence') ||
      lowerMsg.includes('pcap') ||
      lowerMsg.includes('log') ||
      quickAction === 'analyze_forensics' ||
      quickAction === 'investigate' ||
      quickAction === 'correlate_events' ||
      attachments.length > 0
    ) {
      const fileFinding: ProposedFinding = {
        id: 'FND-201',
        category: 'SQL Injection on Authentication Controller',
        severity: 'HIGH',
        severity_rationale: 'Directly proven by project attached logs showing SQL injection payload resulting in unauthenticated JWT token issuance.',
        confidence: 'CONFIRMED',
        confidence_justification: 'Confirmed by auth_audit.log lines 4-6 with exact payload trace.',
        affected_asset: 'api.apexfin.com/v1/auth',
        evidence_refs: ['auth_audit.log'],
        description: 'The username parameter is concatenated directly into SQL execution strings without parameterized binding.',
        impact: 'Unauthenticated actors can bypass credentials check and extract complete customer tables.',
        recommendation: 'Refactor repository queries to use parameterized prepared statements and implement alphanumeric regex validation.',
        mitre_technique: 'T1190 - Exploit Public-Facing Application',
        status: 'proposed',
      };

      const sourcesList = [
        {
          documentId: 'doc-pfile-1',
          title: 'auth_audit.log',
          source: 'Project Attached Evidence',
          reference: 'Lines 4–6',
          relevanceScore: 0.98,
          snippet: 'SQL_INJECT_PAYLOAD_DETECTED src_ip=198.51.100.44 param=username val="admin\' OR \'1\'=\'1" endpoint=/api/v1/auth -> AUTH_SUCCESS status=200',
        },
      ];

      return {
        intent: 'specific_query',
        summary: `I analyzed the attached project evidence files for ${projectName}.`,
        risk: {
          level: 'HIGH',
          score: 82,
          text: 'Risk Score: 82/100 | Priority: P1 | Confidence: CONFIRMED',
        },
        impact: "I identified suspicious authentication activity in auth_audit.log showing an injection payload at 08:01:05Z that yielded a valid session token.",
        reasoning: `Findings from Project Files:
1. [File: auth_audit.log] (Line 4): Payload \`admin' OR '1'='1\` sent from 198.51.100.44.
2. [File: auth_audit.log] (Line 5): Returned AUTH_SUCCESS with token issuance.
3. [File: nmap_perimeter_scan.xml]: Verified target api.apexfin.com runs HTTP/HTTPS and proxy services.`,
        recommendation: 'Refactor repository queries to use parameterized prepared statements and revoke active tokens generated from 198.51.100.44.',
        confidence: 'CONFIRMED',
        findings: [fileFinding],
        sources: sourcesList,
        actions: [
          { id: 'show-evidence', label: 'Show Evidence', type: 'show_evidence', variant: 'secondary' },
          { id: 'investigate', label: 'Investigate', type: 'investigate', variant: 'secondary' },
          { id: 'correlate-events', label: 'Correlate Events', type: 'correlate_events', variant: 'secondary' },
          { id: 'explain-more', label: 'Explain More', type: 'explain_more', variant: 'secondary' },
        ],
      };
    }

    // 10. DEFAULT ASSISTANT MODE FINDING RESPONSE
    const defaultFinding: ProposedFinding = {
      id: params.contextId || 'FND-201',
      category: 'SQL Injection on Authentication Controller',
      severity: 'HIGH',
      severity_rationale: 'Directly proven by project attached logs showing SQL injection payload resulting in unauthenticated JWT token issuance.',
      confidence: 'CONFIRMED',
      confidence_justification: 'Confirmed by auth_audit.log lines 4-6 with exact payload trace.',
      affected_asset: 'api.apexfin.com/v1/auth',
      evidence_refs: ['auth_audit.log'],
      description: 'The username parameter is concatenated directly into SQL execution strings without parameterized binding.',
      impact: 'Unauthenticated actors can bypass credentials check and extract complete customer tables.',
      recommendation: 'Refactor repository queries to use parameterized prepared statements and implement alphanumeric regex validation.',
      mitre_technique: 'T1190 - Exploit Public-Facing Application',
      status: 'proposed',
    };

    const defaultActions: AIAction[] = [
      { id: 'create-finding', label: 'Create Finding', type: 'create_finding', variant: 'primary' },
      { id: 'analyze-risk', label: 'Analyze Risk', type: 'analyze_risk', variant: 'secondary' },
      { id: 'suggest-tests', label: 'Suggest Tests', type: 'suggest_tests', variant: 'secondary' },
      { id: 'explain-more', label: 'Explain More', type: 'explain_more', variant: 'secondary' },
    ];

    return {
      intent: 'full_assessment',
      summary: "This appears to be HIGH severity.",
      risk: {
        level: 'HIGH',
        score: 82,
        text: 'Risk Score: 82/100 | Priority: P1 | Confidence: CONFIRMED',
      },
      impact: "The vulnerability could allow attackers to bypass authentication and potentially access sensitive data on /login.",
      reasoning: "The username parameter is concatenated directly into raw SQL query strings without parameterized binding.",
      recommendation: 'Use parameterized queries ($1, $2), validate server-side input against alphanumeric whitelists, and apply least-privilege database permissions.',
      suggestedValidation: 'Validate the finding using a controlled test (benign single quote) and verify server returns clean HTTP 400 Bad Request.',
      confidence: 'CONFIRMED',
      findings: [defaultFinding],
      actions: defaultActions,
    };
  }
}

