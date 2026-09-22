import { 
  Conversation, 
  ChatMessage, 
  AssistantChatRequest, 
  AssistantChatResponse, 
  ContextType,
  ConversationMode,
  StructuredAIResponse
} from '../types/ai.types';
import { ContextBuilder } from '../ai/contextBuilder';
import { PromptManager } from '../ai/promptManager';
import { MockAiProvider } from '../ai/mockAiProvider';
import { projectService } from './projectService';
import { knowledgeService } from './knowledgeService';
import { SourceCitation } from '../types/knowledge.types';
import { SessionContextStore } from '../ai/sessionStore';

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
        actions: [
          { id: 'create-finding', label: 'Create Finding', type: 'create_finding', variant: 'primary' },
          { id: 'analyze-risk', label: 'Analyze Risk', type: 'analyze_risk', variant: 'secondary' },
          { id: 'suggest-tests', label: 'Suggest Tests', type: 'suggest_tests', variant: 'secondary' },
          { id: 'explain-more', label: 'Explain More', type: 'explain_more', variant: 'secondary' },
        ],
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

  async clearConversationMessages(conversationId: string): Promise<void> {
    let messages = this.loadMessages();
    messages = messages.filter((m) => m.conversationId !== conversationId);
    this.saveMessages(messages);
    SessionContextStore.clearSession(conversationId);
  }

  async setConversationMode(conversationId: string, mode: ConversationMode): Promise<Conversation | null> {
    const list = this.loadConversations();
    const conv = list.find((c) => c.id === conversationId);
    if (!conv) return null;
    conv.mode = mode;
    conv.updatedAt = new Date().toISOString();
    this.saveConversations(list);
    return conv;
  }

  detectModeSwitch(message: string): { newMode?: ConversationMode; isExplicit: boolean } {
    const clean = message.trim();
    const lower = clean.toLowerCase();

    // Explicit tag markers
    if (/\[mode:\s*assistant\]/i.test(clean)) return { newMode: 'assistant', isExplicit: true };
    if (/\[mode:\s*(chat|normal)\]/i.test(clean)) return { newMode: 'chat', isExplicit: true };

    // Explicit phrases
    if (
      /switch to assistant mode/i.test(lower) ||
      /enter assistant mode/i.test(lower) ||
      /assistant mode/i.test(lower) ||
      /analyze this properly/i.test(lower) ||
      /run full analysis/i.test(lower) ||
      /full investigation/i.test(lower) ||
      /run an investigation/i.test(lower)
    ) {
      return { newMode: 'assistant', isExplicit: true };
    }

    if (
      /switch to normal chat/i.test(lower) ||
      /go back to normal chat/i.test(lower) ||
      /switch to chat mode/i.test(lower) ||
      /just chat with me/i.test(lower) ||
      /normal conversation/i.test(lower) ||
      /just talk to me/i.test(lower) ||
      /normal chat/i.test(lower)
    ) {
      return { newMode: 'chat', isExplicit: true };
    }

    // Strong implicit intent
    if (
      /give me the formal finding/i.test(lower) ||
      /generate the vulnerability report/i.test(lower) ||
      /create formal finding/i.test(lower)
    ) {
      return { newMode: 'assistant', isExplicit: false };
    }

    if (
      /never mind,?\s*let'?s just talk about/i.test(lower) ||
      /enough analysis,?\s*let'?s just chat/i.test(lower)
    ) {
      return { newMode: 'chat', isExplicit: false };
    }

    return { isExplicit: false };
  }

  async createConversation(data: {
    projectId: string;
    contextType: ContextType;
    contextId?: string;
    title?: string;
    mode?: ConversationMode;
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
      mode: data.mode || 'chat',
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

  async sendMessage(params: AssistantChatRequest, options?: { signal?: AbortSignal }): Promise<AssistantChatResponse> {
    let convId = params.conversationId;
    const now = new Date().toISOString();

    // 1. Build and resolve context
    const resolvedContext = await ContextBuilder.buildContext(
      params.projectId,
      params.contextType,
      params.contextId
    );

    // 2. Ensure conversation exists & resolve mode
    let conversations = this.loadConversations();
    let currentConv = convId ? conversations.find((c) => c.id === convId) : null;
    const previousMode: ConversationMode = currentConv?.mode || 'chat';

    // Detect mode switches
    let activeMode: ConversationMode = previousMode;
    let didSwitchMode = false;

    if (params.mode && params.mode !== previousMode) {
      activeMode = params.mode;
      didSwitchMode = true;
    } else {
      const modeDetection = this.detectModeSwitch(params.message);
      if (modeDetection.newMode && modeDetection.newMode !== previousMode) {
        activeMode = modeDetection.newMode;
        didSwitchMode = true;
      }
    }

    if (!currentConv) {
      currentConv = {
        id: `conv-${Date.now().toString().slice(-4)}`,
        userId: 'usr-tester-1',
        projectId: params.projectId,
        contextType: params.contextType,
        contextId: params.contextId,
        title: params.message.slice(0, 36) || `Analysis of ${resolvedContext.projectName}`,
        mode: activeMode,
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
      currentConv.mode = activeMode;
      this.saveConversations(conversations);
    }

    const finalConversationId: string = convId || currentConv?.id || `conv-${Date.now()}`;

    // 3. Register turn in SessionContextStore (persists new files, extracts user constraints)
    const sessionMemory = SessionContextStore.registerTurn(
      finalConversationId,
      params.projectId,
      params.message,
      params.attachments
    );

    // 4. Record user message
    const allMessages = this.loadMessages();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      conversationId: finalConversationId,
      role: 'user',
      content: params.message || (params.attachments && params.attachments.length > 0 ? `Uploaded ${params.attachments.length} forensic evidence artifact(s): ${params.attachments.map(a => a.name).join(', ')}` : ''),
      mode: activeMode,
      attachments: params.attachments,
      metadata: {
        projectId: params.projectId,
        contextType: params.contextType,
        contextId: params.contextId,
        mode: activeMode,
      },
      timestamp: now,
    };
    allMessages.push(userMsg);

    // 5. Build Cumulative Multi-Turn Context (Session Files + Stated Facts)
    const sessionContextBlock = SessionContextStore.buildSessionContextBlock(
      finalConversationId,
      params.projectId
    );

    let combinedContext = resolvedContext.structuredContext;
    if (sessionContextBlock) {
      combinedContext += `\n\n${sessionContextBlock}`;
    }

    // 6. Generate response with CUMULATIVE session files and active mode via Backend Ollama
    const structuredResponse = await this.callBackendChatApi(
      {
        conversation_id: finalConversationId,
        project_id: params.projectId,
        context_type: params.contextType,
        context_id: params.contextId,
        message: params.message,
        mode: activeMode,
        quick_action: params.quickAction as string | undefined,
        attachments: sessionMemory.uploadedFiles,
      },
      options?.signal
    );

    // If mode switched on this turn, prepend single-line confirmation if not already included
    if (didSwitchMode) {
      const prefix = activeMode === 'assistant' ? 'Switching to Assistant Mode —\n\n' : 'Switching to Normal Chat —\n\n';
      if (!structuredResponse.summary.startsWith('Switching to') && !structuredResponse.rawText?.startsWith('Switching to')) {
        if (structuredResponse.rawText) {
          structuredResponse.rawText = prefix + structuredResponse.rawText;
        }
        structuredResponse.summary = prefix + structuredResponse.summary;
      }
    }

    const citations: SourceCitation[] = (structuredResponse.sources as any) || [];

    // Record findings & correlations into session memory
    if (structuredResponse.findings && structuredResponse.findings.length > 0) {
      SessionContextStore.recordFindings(
        finalConversationId,
        params.projectId,
        structuredResponse.findings
      );
    }
    if (structuredResponse.correlated_events && structuredResponse.correlated_events.length > 0) {
      SessionContextStore.recordCorrelations(
        finalConversationId,
        params.projectId,
        structuredResponse.correlated_events
      );
    }

    // 7. Determine whether to attach structured card or plain conversational text
    const isPlainConversation =
      activeMode === 'chat'
        ? !params.quickAction
        : structuredResponse.intent === 'casual' ||
          structuredResponse.intent === 'clarifying' ||
          (!structuredResponse.risk && !structuredResponse.findings && !structuredResponse.recommendation && !structuredResponse.reasoning);

    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now()}-ai`,
      conversationId: finalConversationId,
      role: 'assistant',
      content: structuredResponse.rawText || structuredResponse.summary,
      mode: activeMode,
      structured: isPlainConversation ? undefined : structuredResponse,
      actions: activeMode === 'chat' && !params.quickAction ? undefined : structuredResponse.actions,
      sources: citations.length > 0 && activeMode === 'assistant' ? citations : undefined,
      metadata: {
        projectId: params.projectId,
        contextType: params.contextType,
        contextId: params.contextId,
        mode: activeMode,
      },
      timestamp: new Date().toISOString(),
    };
    allMessages.push(assistantMsg);
    this.saveMessages(allMessages);

    return {
      conversationId: finalConversationId,
      message: assistantMsg,
      mode: activeMode,
    };
  }

  private async callBackendChatApi(
    payload: {
      conversation_id?: string;
      project_id: string;
      context_type: string;
      context_id?: string;
      message: string;
      mode?: string;
      quick_action?: string;
      attachments?: any[];
    },
    signal?: AbortSignal
  ): Promise<StructuredAIResponse> {
    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const res = data.structured_response || {};
      const activeMode = (res.mode || data.mode || payload.mode || 'chat') as ConversationMode;

      let mappedSources: SourceCitation[] | undefined = undefined;
      if (res.sources && Array.isArray(res.sources) && res.sources.length > 0) {
        mappedSources = res.sources.map((s: any, idx: number) => ({
          documentId: `doc-${idx}`,
          title: s.title || s.source || 'Knowledge Base',
          source: s.source || 'Vector Store',
          reference: s.reference || 'Section',
          relevanceScore: s.relevance || 0.9,
          snippet: s.content ? (s.content.slice(0, 140) + '...') : '',
        }));
      }

      return {
        mode: activeMode,
        response_type: res.response_type || (activeMode === 'assistant' ? 'analysis' : 'chat'),
        summary: res.summary || res.raw_text || res.text || (res.findings ? 'Structured analysis complete.' : ''),
        rawText: res.raw_text || res.text || res.summary || '',
        findings: activeMode === 'chat' && !payload.quick_action ? undefined : res.findings,
        correlated_events: res.correlated_events,
        confidence: res.confidence || 'HIGH',
        intent: res.intent || (activeMode === 'chat' ? 'chat' : 'general_analysis'),
        risk: activeMode === 'chat' && !payload.quick_action ? undefined : res.risk,
        reasoning: res.reasoning,
        impact: res.impact,
        recommendation: res.recommendation,
        suggestedValidation: res.suggestedValidation,
        sources: mappedSources,
        actions: res.actions || (activeMode === 'assistant' ? [
          { id: 'create-finding', label: 'Create Finding', type: 'create_finding', variant: 'primary' },
          { id: 'analyze-risk', label: 'Analyze Risk', type: 'analyze_risk', variant: 'secondary' },
          { id: 'suggest-tests', label: 'Suggest Tests', type: 'suggest_tests', variant: 'secondary' }
        ] : undefined),
      };
    } catch (err: any) {
      const errMsg = err?.message || 'Connection refused';
      return {
        intent: 'error',
        mode: (payload.mode as ConversationMode) || 'chat',
        response_type: 'chat',
        summary: `AI engine unavailable: ${errMsg}`,
        rawText: `AI engine unavailable: Could not communicate with backend Ollama AI service (${errMsg}). Please ensure the backend and Ollama server ('ollama serve') are running.`,
        confidence: 'LOW',
        actions: [],
      };
    }
  }

  async editAndRegenerateMessage(params: {
    conversationId: string;
    messageId: string;
    newMessage: string;
    projectId: string;
    contextType: ContextType;
    contextId?: string;
  }): Promise<AssistantChatResponse> {
    const allMessages = this.loadMessages();
    const msgIndex = allMessages.findIndex(
      (m) => m.id === params.messageId && m.conversationId === params.conversationId
    );

    if (msgIndex === -1) {
      return this.sendMessage({
        conversationId: params.conversationId,
        projectId: params.projectId,
        contextType: params.contextType,
        contextId: params.contextId,
        message: params.newMessage,
      });
    }

    // Update user message content
    allMessages[msgIndex].content = params.newMessage;
    allMessages[msgIndex].timestamp = new Date().toISOString();

    // Truncate all subsequent messages in this conversation
    const targetConvId = params.conversationId;
    const remainingMessages: ChatMessage[] = [];
    let keep = true;
    for (const m of allMessages) {
      if (m.conversationId === targetConvId) {
        if (m.id === params.messageId) {
          remainingMessages.push(m);
          keep = false;
        } else if (keep) {
          remainingMessages.push(m);
        }
      } else {
        remainingMessages.push(m);
      }
    }

    this.saveMessages(remainingMessages);

    // Build context
    const resolvedContext = await ContextBuilder.buildContext(
      params.projectId,
      params.contextType,
      params.contextId
    );

    const sessionMemory = SessionContextStore.registerTurn(
      params.conversationId,
      params.projectId,
      params.newMessage
    );

    const route = knowledgeService.routeQuery(params.newMessage);
    let citations: SourceCitation[] = [];
    let knowledgeContext = '';

    if (route.intent === 'KNOWLEDGE_BASE' || route.intent === 'HYBRID') {
      const chunks = await knowledgeService.searchChunks(params.newMessage, { limit: route.suggestedK || 2 });
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

    const sessionContextBlock = SessionContextStore.buildSessionContextBlock(
      params.conversationId,
      params.projectId
    );

    let combinedContext = resolvedContext.structuredContext;
    if (sessionContextBlock) {
      combinedContext += `\n\n${sessionContextBlock}`;
    }
    if (knowledgeContext) {
      combinedContext += `\n\n### RETRIEVED AUTHORITATIVE KNOWLEDGE:\n${knowledgeContext}`;
    }

    let conversations = this.loadConversations();
    let currentConv = conversations.find((c) => c.id === params.conversationId);
    const activeMode: ConversationMode = currentConv?.mode || 'chat';

    const structuredResponse = await this.callBackendChatApi({
      conversation_id: params.conversationId,
      project_id: params.projectId,
      context_type: params.contextType,
      context_id: params.contextId,
      message: params.newMessage,
      mode: activeMode,
      attachments: sessionMemory.uploadedFiles,
    });

    if (citations.length > 0 && activeMode === 'assistant') {
      structuredResponse.sources = citations;
    }

    const isPlainConversation =
      activeMode === 'chat'
        ? true
        : structuredResponse.intent === 'casual' ||
          structuredResponse.intent === 'clarifying' ||
          (!structuredResponse.risk && !structuredResponse.findings && !structuredResponse.recommendation && !structuredResponse.reasoning);

    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now()}-ai`,
      conversationId: params.conversationId,
      role: 'assistant',
      content: structuredResponse.rawText || structuredResponse.summary,
      mode: activeMode,
      structured: isPlainConversation ? undefined : structuredResponse,
      actions: activeMode === 'chat' ? undefined : structuredResponse.actions,
      sources: citations.length > 0 && activeMode === 'assistant' ? citations : undefined,
      metadata: {
        projectId: params.projectId,
        contextType: params.contextType,
        contextId: params.contextId,
        mode: activeMode,
      },
      timestamp: new Date().toISOString(),
    };

    const finalMessages = this.loadMessages();
    finalMessages.push(assistantMsg);
    this.saveMessages(finalMessages);

    return {
      conversationId: params.conversationId,
      message: assistantMsg,
      mode: activeMode,
    };
  }

  async acceptProposedFinding(messageId: string, findingId: string): Promise<boolean> {
    const messages = this.loadMessages();
    const targetMsg = messages.find((m) => m.id === messageId);
    if (!targetMsg || !targetMsg.structured?.findings) return false;

    const finding = targetMsg.structured.findings.find((f) => f.id === findingId);
    if (!finding) return false;

    finding.status = 'accepted';
    this.saveMessages(messages);
    return true;
  }

  async rejectProposedFinding(
    messageId: string,
    findingId: string,
    reason: string,
    comment: string
  ): Promise<boolean> {
    const messages = this.loadMessages();
    const targetMsg = messages.find((m) => m.id === messageId);
    if (!targetMsg || !targetMsg.structured?.findings) return false;

    const finding = targetMsg.structured.findings.find((f) => f.id === findingId);
    if (!finding) return false;

    finding.status = 'rejected';
    finding.rejection_reason = reason;
    finding.rejection_comment = comment;
    this.saveMessages(messages);
    return true;
  }
}

export const aiService = new AIService();
