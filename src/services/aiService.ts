import { 
  Conversation, 
  ChatMessage, 
  AssistantChatRequest, 
  AssistantChatResponse, 
  ContextType 
} from '../types/ai.types';
import { ContextBuilder } from '../ai/contextBuilder';
import { PromptManager } from '../ai/promptManager';
import { MockAiProvider } from '../ai/mockAiProvider';
import { projectService } from './projectService';
import { knowledgeService } from './knowledgeService';
import { SourceCitation } from '../types/knowledge.types';

const STORAGE_KEY_CONVERSATIONS = 'art_ai_conversations';
const STORAGE_KEY_MESSAGES = 'art_ai_messages';

class AIService {
  private loadConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return [
      {
        id: 'conv-101',
        userId: 'usr-tester-1',
        projectId: 'PRJ-101',
        contextType: 'finding',
        contextId: 'FND-201',
        title: 'SQL Injection Remediation Analysis',
        createdAt: '2026-08-27T09:45:00.000Z',
        updatedAt: '2026-08-27T09:48:00.000Z',
      },
      {
        id: 'conv-102',
        userId: 'usr-tester-1',
        projectId: 'PRJ-102',
        contextType: 'project',
        title: 'API Engagement Threat Model Review',
        createdAt: '2026-08-27T08:30:00.000Z',
        updatedAt: '2026-08-27T08:35:00.000Z',
      },
    ];
  }

  private saveConversations(conversations: Conversation[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
    } catch {
      // ignore
    }
  }

  private loadMessages(): ChatMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return [
      {
        id: 'msg-1',
        conversationId: 'conv-101',
        role: 'user',
        content: 'Explain the root cause and remediation for this SQL injection finding.',
        timestamp: '2026-08-27T09:45:00.000Z',
      },
      {
        id: 'msg-2',
        conversationId: 'conv-101',
        role: 'assistant',
        content: 'Technical analysis complete. See structured breakdown below.',
        structured: {
          summary: 'Boolean-Based Blind SQL Injection Vulnerability',
          risk: {
            level: 'CRITICAL',
            score: 92,
            text: 'Critical database extraction risk on authentication endpoint.',
          },
          reasoning:
            'The username parameter is concatenated directly into SQL execution strings without input sanitization or parameterized binding. This allows true/false differential time and boolean extraction.',
          impact:
            'Unauthenticated attackers can bypass credentials check and extract complete customer tables.',
          recommendation:
            'Refactor repository query to use parameterized prepared statements ($1, $2) and implement strict alphanumeric whitelist regex validation on username fields.',
          suggestedValidation:
            'Verify that supplying single quotes and SQL operators returns standard 400 Bad Request without query evaluation differences.',
          confidence: 'HIGH',
        },
        timestamp: '2026-08-27T09:45:30.000Z',
      },
    ];
  }

  private saveMessages(messages: ChatMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }

  async getConversations(projectId?: string): Promise<Conversation[]> {
    const list = this.loadConversations();
    if (projectId && projectId !== 'ALL') {
      return list.filter((c) => c.projectId === projectId);
    }
    return list;
  }

  async getConversationById(id: string): Promise<Conversation | null> {
    const list = this.loadConversations();
    return list.find((c) => c.id === id) || null;
  }

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const all = this.loadMessages();
    return all.filter((m) => m.conversationId === conversationId);
  }

  async createConversation(data: {
    projectId: string;
    contextType: ContextType;
    contextId?: string;
    title?: string;
  }): Promise<Conversation> {
    const list = this.loadConversations();
    const now = new Date().toISOString();

    const newConv: Conversation = {
      id: `conv-${Date.now().toString().slice(-4)}`,
      userId: 'usr-tester-1',
      projectId: data.projectId,
      contextType: data.contextType,
      contextId: data.contextId,
      title: data.title || `Chat on ${data.contextType.toUpperCase()}`,
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(newConv);
    this.saveConversations(list);
    return newConv;
  }

  async deleteConversation(id: string): Promise<boolean> {
    let list = this.loadConversations();
    const initialLen = list.length;
    list = list.filter((c) => c.id !== id);
    this.saveConversations(list);

    let messages = this.loadMessages();
    messages = messages.filter((m) => m.conversationId !== id);
    this.saveMessages(messages);

    return list.length < initialLen;
  }

  async sendMessage(params: AssistantChatRequest): Promise<AssistantChatResponse> {
    let convId = params.conversationId;
    const now = new Date().toISOString();

    // 1. Build and resolve context
    const resolvedContext = await ContextBuilder.buildContext(
      params.projectId,
      params.contextType,
      params.contextId
    );

    // 2. Ensure conversation exists
    let conversations = this.loadConversations();
    let currentConv = convId ? conversations.find((c) => c.id === convId) : null;

    if (!currentConv) {
      currentConv = {
        id: `conv-${Date.now().toString().slice(-4)}`,
        userId: 'usr-tester-1',
        projectId: params.projectId,
        contextType: params.contextType,
        contextId: params.contextId,
        title: params.message.slice(0, 36) || `Analysis of ${resolvedContext.projectName}`,
        createdAt: now,
        updatedAt: now,
      };
      conversations.unshift(currentConv);
      this.saveConversations(conversations);
      convId = currentConv.id;
    } else {
      currentConv.updatedAt = now;
      currentConv.contextType = params.contextType;
      currentConv.contextId = params.contextId;
      this.saveConversations(conversations);
    }

    const finalConversationId: string = convId || currentConv?.id || `conv-${Date.now()}`;

    // 3. Record user message
    const allMessages = this.loadMessages();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      conversationId: finalConversationId,
      role: 'user',
      content: params.message,
      metadata: {
        projectId: params.projectId,
        contextType: params.contextType,
        contextId: params.contextId,
      },
      timestamp: now,
    };
    allMessages.push(userMsg);

    // 4. Run RAG Router & Retrieve Verified Knowledge Chunks
    const route = knowledgeService.routeQuery(params.message);
    let citations: SourceCitation[] = [];
    let knowledgeContext = '';

    if (route.intent === 'KNOWLEDGE_BASE' || route.intent === 'HYBRID') {
      const chunks = await knowledgeService.searchChunks(params.message, { limit: route.suggestedK || 2 });
      if (chunks.length > 0) {
        citations = chunks.map((c) => ({
          documentId: c.documentId,
          title: c.title,
          source: c.sourceName,
          reference: c.section,
          relevanceScore: c.similarityScore,
          snippet: c.content.slice(0, 140) + '...',
        }));
        knowledgeContext = chunks.map((c) => `[SOURCE: ${c.sourceName} - ${c.title} (${c.section})]\n${c.content}`).join('\n\n');
      }
    }

    const combinedContext = knowledgeContext
      ? `${resolvedContext.structuredContext}\n\n### RETRIEVED AUTHORITATIVE KNOWLEDGE:\n${knowledgeContext}`
      : resolvedContext.structuredContext;

    // 5. Generate structured response via Provider
    const structuredResponse = await MockAiProvider.generate({
      projectName: resolvedContext.projectName,
      contextType: params.contextType,
      contextId: params.contextId,
      contextText: combinedContext,
      userMessage: params.message,
      quickAction: params.quickAction,
    });

    if (citations.length > 0) {
      structuredResponse.sources = citations;
    }

    // 6. Record assistant message
    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now()}-ai`,
      conversationId: finalConversationId,
      role: 'assistant',
      content: structuredResponse.summary,
      structured: structuredResponse,
      sources: citations.length > 0 ? citations : undefined,
      metadata: {
        projectId: params.projectId,
        contextType: params.contextType,
        contextId: params.contextId,
      },
      timestamp: new Date().toISOString(),
    };
    allMessages.push(assistantMsg);
    this.saveMessages(allMessages);

    return {
      conversationId: finalConversationId,
      message: assistantMsg,
    };
  }
}

export const aiService = new AIService();
