import { Severity } from './finding.types';
import { SourceCitation } from './knowledge.types';

export type ContextType = 'project' | 'finding' | 'scope' | 'risk' | 'evidence';

export type QuickActionType =
  | 'explain_finding'
  | 'analyze_risk'
  | 'suggest_remediation'
  | 'summarize_project'
  | 'generate_description';

export interface StructuredAIResponse {
  summary: string;
  risk?: {
    level: Severity;
    score: number;
    text: string;
  };
  reasoning: string;
  impact: string;
  recommendation: string;
  suggestedValidation?: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  sources?: SourceCitation[];
  rawText?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  structured?: StructuredAIResponse;
  sources?: SourceCitation[];
  metadata?: {
    projectId: string;
    contextType: ContextType;
    contextId?: string;
  };
  timestamp: string;
}

export interface Conversation {
  id: string;
  userId: string;
  projectId: string;
  contextType: ContextType;
  contextId?: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssistantChatRequest {
  conversationId?: string;
  projectId: string;
  contextType: ContextType;
  contextId?: string;
  message: string;
  quickAction?: QuickActionType;
}

export interface AssistantChatResponse {
  conversationId: string;
  message: ChatMessage;
}
