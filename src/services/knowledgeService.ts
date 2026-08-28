import { 
  KnowledgeSource, 
  KnowledgeDocument, 
  KnowledgeChunk, 
  SourceCitation, 
  RAGRouterResult, 
  IngestionJob 
} from '../types/knowledge.types';
import { initialKnowledgeSources, initialKnowledgeChunks } from '../data/mockKnowledgeBase';

const STORAGE_KEY_SOURCES = 'art_knowledge_sources';
const STORAGE_KEY_CHUNKS = 'art_knowledge_chunks';

class KnowledgeService {
  private delay(ms = 200): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private loadSources(): KnowledgeSource[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SOURCES);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return initialKnowledgeSources;
  }

  private saveSources(sources: KnowledgeSource[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_SOURCES, JSON.stringify(sources));
    } catch {
      // ignore
    }
  }

  private loadChunks(): KnowledgeChunk[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CHUNKS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return initialKnowledgeChunks;
  }

  private saveChunks(chunks: KnowledgeChunk[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CHUNKS, JSON.stringify(chunks));
    } catch {
      // ignore
    }
  }

  async getSources(): Promise<KnowledgeSource[]> {
    await this.delay(150);
    return this.loadSources();
  }

  async getSourceById(id: string): Promise<KnowledgeSource | null> {
    await this.delay(100);
    const sources = this.loadSources();
    return sources.find((s) => s.id === id) || null;
  }

  async getStats(): Promise<{
    totalSources: number;
    totalDocs: number;
    totalChunks: number;
    embeddingModel: string;
  }> {
    await this.delay(100);
    const sources = this.loadSources();
    const chunks = this.loadChunks();
    const totalDocs = sources.reduce((acc, s) => acc + s.documentsCount, 0);
    return {
      totalSources: sources.length,
      totalDocs,
      totalChunks: chunks.length,
      embeddingModel: 'nomic-embed-text (Ollama / pgvector)',
    };
  }

  /**
   * RAG Query Intent Classifier Router.
   * Determines whether query needs Knowledge Base, Project DB, Risk calculation, or Hybrid.
   */
  routeQuery(query: string): RAGRouterResult {
    const q = query.toLowerCase();

    // 1. Database / Project context questions
    if (
      q.includes('current project') ||
      q.includes('my project') ||
      q.includes('project name') ||
      q.includes('list projects')
    ) {
      return {
        intent: 'DATABASE',
        confidence: 0.95,
        reasoning: 'Inquiry relates strictly to user workspace / project database tables.',
        suggestedK: 0,
      };
    }

    // 2. Risk score / finding assessment questions
    if (
      q.includes('why is finding') ||
      q.includes('risk score of') ||
      q.includes('why is this rated') ||
      q.includes('calibrated risk')
    ) {
      return {
        intent: 'PROJECT_CONTEXT',
        confidence: 0.92,
        reasoning: 'Inquiry relates to deterministic finding risk factors and project telemetry.',
        suggestedK: 1,
      };
    }

    // 3. Knowledge Base / Standards questions
    if (
      q.includes('what is cwe') ||
      q.includes('what is owasp') ||
      q.includes('cwe-') ||
      q.includes('nist') ||
      q.includes('cvss equation') ||
      q.includes('what is sql injection') ||
      q.includes('what is xss') ||
      q.includes('what is ssrf')
    ) {
      return {
        intent: 'KNOWLEDGE_BASE',
        confidence: 0.96,
        reasoning: 'Inquiry seeks authoritative standard definitions, taxonomy, or technical mechanisms.',
        suggestedK: 3,
      };
    }

    // 4. Default to Hybrid (combine project finding + knowledge base recommendations)
    return {
      intent: 'HYBRID',
      confidence: 0.85,
      reasoning: 'Inquiry benefits from combining active engagement context with authoritative remediation standards.',
      suggestedK: 2,
    };
  }

  /**
   * Semantic similarity vector search across Knowledge Chunks.
   */
  async searchChunks(
    query: string,
    options?: {
      sourceType?: string;
      limit?: number;
      threshold?: number;
    }
  ): Promise<KnowledgeChunk[]> {
    await this.delay(200);
    const chunks = this.loadChunks();
    const limit = options?.limit || 5;
    const threshold = options?.threshold || 0.3;

    if (!query.trim()) {
      return chunks.slice(0, limit).map((c) => ({ ...c, similarityScore: 0.85 }));
    }

    const queryTokens = query.toLowerCase().split(/\W+/).filter(Boolean);

    // Compute semantic relevance score based on token match and term weighting
    const scored = chunks.map((chunk) => {
      const text = `${chunk.title} ${chunk.section} ${chunk.content} ${JSON.stringify(chunk.metadata || {})}`.toLowerCase();
      let matchCount = 0;

      queryTokens.forEach((token) => {
        if (text.includes(token)) {
          matchCount += 1;
          // Extra weight if token appears in title
          if (chunk.title.toLowerCase().includes(token)) matchCount += 1.5;
          // Extra weight if token is a CWE or OWASP code
          if (token.startsWith('cwe') || token.startsWith('a0') || token.startsWith('nist')) matchCount += 2.0;
        }
      });

      const score = queryTokens.length > 0 ? Math.min(0.99, matchCount / (queryTokens.length * 1.5)) : 0;
      return {
        ...chunk,
        similarityScore: parseFloat(score.toFixed(2)),
      };
    });

    let filtered = scored.filter((c) => (c.similarityScore || 0) >= threshold);

    if (options?.sourceType && options.sourceType !== 'ALL') {
      const sources = this.loadSources();
      const validSourceIds = sources.filter((s) => s.sourceType === options.sourceType).map((s) => s.id);
      filtered = filtered.filter((c) => validSourceIds.includes(c.sourceId));
    }

    filtered.sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0));
    return filtered.slice(0, limit);
  }

  /**
   * Ingest and chunk a new document into the knowledge base.
   */
  async ingestDocument(job: IngestionJob): Promise<KnowledgeSource> {
    await this.delay(600);
    const sources = this.loadSources();
    const chunks = this.loadChunks();
    const now = new Date().toISOString();

    const sourceId = `KS-CUSTOM-${Date.now().toString().slice(-4)}`;
    const paragraphs = job.rawContent
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 30);

    const newChunks: KnowledgeChunk[] = paragraphs.map((para, idx) => ({
      id: `KC-${sourceId}-${idx + 1}`,
      documentId: `KD-${sourceId}-DOC1`,
      sourceId,
      sourceName: job.sourceName,
      title: `${job.sourceName} — Part ${idx + 1}`,
      section: `Section ${idx + 1}`,
      content: para,
      metadata: {
        sourceType: job.sourceType,
        version: job.version,
        chunkIndex: idx,
      },
    }));

    const newSource: KnowledgeSource = {
      id: sourceId,
      name: job.sourceName,
      description: `User-ingested ${job.sourceType.toLowerCase().replace('_', ' ')} deliverable.`,
      sourceType: job.sourceType,
      sourceUrl: job.sourceUrl || undefined,
      version: job.version || '1.0',
      status: 'INDEXED',
      documentsCount: 1,
      chunksCount: newChunks.length,
      createdAt: now,
      updatedAt: now,
    };

    sources.unshift(newSource);
    chunks.push(...newChunks);

    this.saveSources(sources);
    this.saveChunks(chunks);

    return newSource;
  }

  async deleteSource(id: string): Promise<boolean> {
    await this.delay(150);
    let sources = this.loadSources();
    let chunks = this.loadChunks();

    sources = sources.filter((s) => s.id !== id);
    chunks = chunks.filter((c) => c.sourceId !== id);

    this.saveSources(sources);
    this.saveChunks(chunks);
    return true;
  }
}

export const knowledgeService = new KnowledgeService();
