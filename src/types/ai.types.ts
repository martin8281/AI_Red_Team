import { Severity } from './finding.types';
import { SourceCitation } from './knowledge.types';

export type ContextType = 'general' | 'project' | 'finding' | 'scope' | 'risk' | 'evidence';

export type QuickActionType =
  | 'explain_finding'
  | 'analyze_risk'
  | 'suggest_remediation'
  | 'summarize_project'
  | 'generate_description'
  | 'analyze_forensics';

export interface ForensicAttachment {
  id: string;
  name: string;
  size: number; // in bytes
  type: string; // MIME type or generic
  extension: string;
  category: 'DOCUMENT' | 'DATA' | 'LOG' | 'ARCHIVE' | 'IMAGE' | 'BINARY';
  contentSnippet?: string; // Text content extracted for LLM analysis
  dataUrl?: string; // Base64 data URL for preview/download
  uploadedAt: string;
}

export type ConfidenceTier = 'CONFIRMED' | 'LIKELY' | 'POSSIBLE' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface ProposedFinding {
  id: string;
  category: string;
  severity: Severity;
  severity_rationale?: string;
  confidence: ConfidenceTier;
  confidence_justification: string;
  affected_asset: string;
  evidence_refs: string[];
  description: string;
  impact: string;
  recommendation: string;
  mitre_technique?: string;
  detection_rule?: string;
  status: 'proposed' | 'accepted' | 'rejected';
  rejection_reason?: string;
  rejection_comment?: string;
  is_suppressed_candidate?: boolean;
}

export interface CorrelatedCluster {
  correlation_id: string;
  primary_entity: string;
  time_window_start: string;
  time_window_end: string;
  matched_sources: string[];
  evidence_refs: string[];
  summary: string;
  deterministic_score: number;
}

export type ResponseIntentType =
  | 'casual'
  | 'clarifying'
  | 'full_assessment'
  | 'specific_query'
  | 'error';

export type AIActionType =
  | 'create_finding'
  | 'analyze_risk'
  | 'explain_risk'
  | 'suggest_tests'
  | 'explain_test'
  | 'show_expected_result'
  | 'add_to_test_plan'
  | 'explain_more'
  | 'explain_finding'
  | 'show_evidence'
  | 'investigate'
  | 'correlate_events'
  | 'view_attack_path'
  | 'map_attack'
  | 'recommend_remediation'
  | 'explain_remediation'
  | 'verify_fix'
  | 'add_to_report';

export interface AIAction {
  id: string;
  label: string;
  type: AIActionType | string;
  variant?: 'primary' | 'secondary';
  prompt?: string;
}

export interface StructuredAIResponse {
  intent?: ResponseIntentType;
  summary: string;
  risk?: {
    level: Severity;
    score: number;
    text: string;
  };
  reasoning?: string;
  impact?: string;
  recommendation?: string;
  suggestedValidation?: string;
  confidence?: ConfidenceTier;
  findings?: ProposedFinding[];
  correlated_events?: CorrelatedCluster[];
  sources?: SourceCitation[];
  actions?: AIAction[];
  rawText?: string;
  forensicInsights?: {
    detectedArtifacts?: string[];
    threatIndicators?: string[];
    recommendedContainment?: string;
  };
}

export type ConversationMode = 'chat' | 'assistant';

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  mode?: ConversationMode;
  structured?: StructuredAIResponse;
  actions?: AIAction[];
  sources?: SourceCitation[];
  attachments?: ForensicAttachment[];
  metadata?: {
    projectId: string;
    contextType: ContextType;
    contextId?: string;
    mode?: ConversationMode;
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
  mode?: ConversationMode; // Default: 'chat'
  createdAt: string;
  updatedAt: string;
}

export interface AssistantChatRequest {
  conversationId?: string;
  projectId: string;
  contextType: ContextType;
  contextId?: string;
  message: string;
  mode?: ConversationMode;
  quickAction?: QuickActionType;
  attachments?: ForensicAttachment[];
}

export interface AssistantChatResponse {
  conversationId: string;
  message: ChatMessage;
  mode?: ConversationMode;
}
