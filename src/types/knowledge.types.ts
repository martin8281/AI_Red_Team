export type SourceType =
  | 'STANDARD'
  | 'GUIDANCE'
  | 'VULNERABILITY_DATABASE'
  | 'INTERNAL_DOCUMENT'
  | 'METHODOLOGY'
  | 'DATASET';

export type SourceStatus = 'INDEXED' | 'INDEXING' | 'PENDING' | 'ERROR';

export interface KnowledgeSource {
  id: string;
  name: string;
  description: string;
  sourceType: SourceType;
  sourceUrl?: string;
  version: string;
  status: SourceStatus;
  documentsCount: number;
  chunksCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeDocument {
  id: string;
  sourceId: string;
  title: string;
  contentHash: string;
  sourceReference: string;
  sectionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  sourceId: string;
  sourceName: string;
  title: string;
  section: string;
  content: string;
  similarityScore?: number;
  metadata?: Record<string, any>;
}

export interface SourceCitation {
  documentId: string;
  title: string;
  source: string;
  reference: string;
  relevanceScore?: number;
  section?: string;
  snippet?: string;
}

export type RAGQueryIntent = 'KNOWLEDGE_BASE' | 'PROJECT_CONTEXT' | 'HYBRID' | 'DATABASE';

export interface RAGRouterResult {
  intent: RAGQueryIntent;
  confidence: number;
  reasoning: string;
  suggestedK: number;
}

export interface IngestionJob {
  sourceName: string;
  sourceType: SourceType;
  version: string;
  sourceUrl?: string;
  rawContent: string;
  chunkSize: number;
  chunkOverlap: number;
}
