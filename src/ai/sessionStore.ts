import { ForensicAttachment, ProposedFinding, CorrelatedCluster } from '../types/ai.types';

export interface StatedFact {
  factId: string;
  content: string;
  category: 'SCOPE_CONSTRAINT' | 'ENVIRONMENT_FACT' | 'TARGET_EXCLUSION' | 'TESTING_NOTE';
  timestamp: string;
}

export interface SessionMemoryState {
  conversationId: string;
  projectId: string;
  uploadedFiles: ForensicAttachment[];
  statedFacts: StatedFact[];
  discussedFindings: ProposedFinding[];
  correlationClusters: CorrelatedCluster[];
  updatedAt: string;
}

const STORAGE_PREFIX = 'art_session_memory_';

export class SessionContextStore {
  /**
   * Loads cumulative memory state for a given conversation.
   */
  static getSession(conversationId: string, projectId: string): SessionMemoryState {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}${conversationId}`);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }

    return {
      conversationId,
      projectId,
      uploadedFiles: [],
      statedFacts: [],
      discussedFindings: [],
      correlationClusters: [],
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Saves updated memory state for a conversation.
   */
  static saveSession(session: SessionMemoryState): void {
    try {
      session.updatedAt = new Date().toISOString();
      localStorage.setItem(`${STORAGE_PREFIX}${session.conversationId}`, JSON.stringify(session));
    } catch {
      // ignore
    }
  }

  /**
   * Registers a new user turn: persists new files and extracts stated constraints.
   */
  static registerTurn(
    conversationId: string,
    projectId: string,
    userMessage: string,
    newAttachments?: ForensicAttachment[]
  ): SessionMemoryState {
    const session = this.getSession(conversationId, projectId);

    // 1. Accumulate new files without duplicates
    if (newAttachments && newAttachments.length > 0) {
      for (const att of newAttachments) {
        const exists = session.uploadedFiles.some((f) => f.id === att.id || f.name === att.name);
        if (!exists) {
          session.uploadedFiles.push(att);
        }
      }
    }

    // 2. Extract facts and constraints from user text
    this.extractFacts(session, userMessage);

    this.saveSession(session);
    return session;
  }

  /**
   * Stores generated / discussed findings into session memory.
   */
  static recordFindings(conversationId: string, projectId: string, findings: ProposedFinding[]): void {
    const session = this.getSession(conversationId, projectId);
    for (const fnd of findings) {
      const idx = session.discussedFindings.findIndex((f) => f.id === fnd.id);
      if (idx >= 0) {
        session.discussedFindings[idx] = fnd;
      } else {
        session.discussedFindings.push(fnd);
      }
    }
    this.saveSession(session);
  }

  /**
   * Stores computed correlations into session memory.
   */
  static recordCorrelations(conversationId: string, projectId: string, clusters: CorrelatedCluster[]): void {
    const session = this.getSession(conversationId, projectId);
    session.correlationClusters = clusters;
    this.saveSession(session);
  }

  /**
   * Automatically extracts user-stated facts and constraints.
   */
  private static extractFacts(session: SessionMemoryState, userMessage: string): void {
    const msg = userMessage.trim();

    // Scope constraints: "scope is /api and /login", "scoped to auth.apexfin.com"
    const scopeMatch = /(?:scope\s+is|scoped\s+to|only\s+test|target\s+is)\s+([^.,\n]+)/i.exec(msg);
    if (scopeMatch) {
      this.addFactIfNew(session, `Scope Constraint: ${scopeMatch[0].trim()}`, 'SCOPE_CONSTRAINT');
    }

    // Exclusions: "ignore findings from staging", "skip port 8080"
    const ignoreMatch = /(?:ignore|exclude|skip|disregard)\s+([^.,\n]+)/i.exec(msg);
    if (ignoreMatch) {
      this.addFactIfNew(session, `Exclusion Rule: ${ignoreMatch[0].trim()}`, 'TARGET_EXCLUSION');
    }

    // Environment facts: "database is PostgreSQL 16", "backend is Node.js"
    const envMatch = /(?:running\s+on|database\s+is|server\s+is|framework\s+is)\s+([^.,\n]+)/i.exec(msg);
    if (envMatch) {
      this.addFactIfNew(session, `Environment Architecture: ${envMatch[0].trim()}`, 'ENVIRONMENT_FACT');
    }
  }

  private static addFactIfNew(
    session: SessionMemoryState,
    factContent: string,
    category: StatedFact['category']
  ): void {
    const exists = session.statedFacts.some(
      (f) => f.content.toLowerCase() === factContent.toLowerCase()
    );
    if (!exists) {
      session.statedFacts.push({
        factId: `FACT-${session.statedFacts.length + 1}`,
        content: factContent,
        category,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Builds the formatted prompt context block for cumulative session memory.
   */
  static buildSessionContextBlock(conversationId: string, projectId: string): string {
    const session = this.getSession(conversationId, projectId);
    const parts: string[] = [];

    if (session.statedFacts.length > 0) {
      const factsStr = session.statedFacts
        .map((f) => `- [${f.factId}] (${f.category}) ${f.content}`)
        .join('\n');
      parts.push(`### USER-STATED SESSION CONSTRAINTS & FACTS (MUST ENFORCE):\n${factsStr}`);
    }

    if (session.uploadedFiles.length > 0) {
      const filesStr = session.uploadedFiles
        .map(
          (f) =>
            `- [FILE: ${f.name}] (${f.category} - .${f.extension.toUpperCase()}) | Uploaded: ${new Date(
              f.uploadedAt
            ).toLocaleTimeString()}\n  Snippet: ${f.contentSnippet ? f.contentSnippet.slice(0, 160) + '...' : 'Available in session store'}`
        )
        .join('\n');
      parts.push(
        `### CUMULATIVE EVIDENCE FILES UPLOADED IN THIS SESSION (${session.uploadedFiles.length} Total):\n${filesStr}`
      );
    }

    if (session.correlationClusters.length > 0) {
      const corrStr = session.correlationClusters
        .map((c) => `- [${c.correlation_id}] ${c.summary} (Evidences: ${c.evidence_refs.join(', ')})`)
        .join('\n');
      parts.push(`### CUMULATIVE PRE-COMPUTED CORRELATION CLUSTERS:\n${corrStr}`);
    }

    if (session.discussedFindings.length > 0) {
      const fndStr = session.discussedFindings
        .map(
          (f) =>
            `- [${f.id}] ${f.category} (${f.severity}) on ${f.affected_asset}: Status=${f.status}`
        )
        .join('\n');
      parts.push(
        `### FINDINGS GENERATED / DISCUSSED IN THIS SESSION (${session.discussedFindings.length} Total):\n${fndStr}`
      );
    }

    return parts.join('\n\n');
  }
}
