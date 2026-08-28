import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Sparkles, 
  ShieldAlert, 
  Layers, 
  FolderGit2, 
  MessageSquare, 
  Loader2, 
  AlertCircle, 
  Info,
  Menu,
  X
} from 'lucide-react';
import { 
  Conversation, 
  ChatMessage, 
  ContextType, 
  QuickActionType 
} from '../types/ai.types';
import { Project } from '../types/project.types';
import { Finding } from '../types/finding.types';
import { aiService } from '../services/aiService';
import { projectService } from '../services/projectService';
import { findingService } from '../services/findingService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { ContextSelectorBar } from '../components/assistant/ContextSelectorBar';
import { QuickActionsBar } from '../components/assistant/QuickActionsBar';
import { ChatMessageItem } from '../components/assistant/ChatMessageItem';
import { ChatInput } from '../components/assistant/ChatInput';
import { ConversationSidebar } from '../components/assistant/ConversationSidebar';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const AssistantPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialProjectId = searchParams.get('projectId') || '';
  const initialContextType = (searchParams.get('contextType') as ContextType) || 'project';
  const initialContextId = searchParams.get('contextId') || '';

  const [projects, setProjects] = useState<Project[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId);
  const [contextType, setContextType] = useState<ContextType>(initialContextType);
  const [selectedFindingId, setSelectedFindingId] = useState<string | undefined>(initialContextId || undefined);

  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize data
  useEffect(() => {
    const initData = async () => {
      setIsInitializing(true);
      try {
        const [projectsData, findingsData, convs] = await Promise.all([
          projectService.getProjects(),
          findingService.getFindings(),
          aiService.getConversations(),
        ]);

        setProjects(projectsData);
        setFindings(findingsData);
        setConversations(convs);

        const activeProj = initialProjectId || projectsData[0]?.id || '';
        setSelectedProjectId(activeProj);

        if (initialContextId) {
          setSelectedFindingId(initialContextId);
        } else {
          const firstFinding = findingsData.find((f) => f.projectId === activeProj);
          if (firstFinding) setSelectedFindingId(firstFinding.id);
        }

        if (convs.length > 0) {
          setActiveConversationId(convs[0].id);
          const msgs = await aiService.getMessages(convs[0].id);
          setMessages(msgs);
        }
      } finally {
        setIsInitializing(false);
      }
    };
    initData();
  }, []);

  // When active conversation changes, load its messages
  const handleSelectConversation = async (id: string) => {
    setActiveConversationId(id);
    setError(null);
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      setSelectedProjectId(conv.projectId);
      setContextType(conv.contextType);
      setSelectedFindingId(conv.contextId);
    }
    const msgs = await aiService.getMessages(id);
    setMessages(msgs);
    setMobileSidebarOpen(false);
  };

  const handleNewConversation = async () => {
    setError(null);
    const newConv = await aiService.createConversation({
      projectId: selectedProjectId,
      contextType,
      contextId: selectedFindingId,
      title: `Analysis of ${contextType.toUpperCase()}`,
    });
    setConversations([newConv, ...conversations]);
    setActiveConversationId(newConv.id);
    setMessages([]);
    setMobileSidebarOpen(false);
  };

  const handleDeleteConversation = async (id: string) => {
    await aiService.deleteConversation(id);
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    if (activeConversationId === id) {
      if (updated.length > 0) {
        handleSelectConversation(updated[0].id);
      } else {
        setActiveConversationId(undefined);
        setMessages([]);
      }
    }
  };

  const handleSendMessage = async (text: string, quickAction?: QuickActionType) => {
    if (!selectedProjectId) {
      setError('Please select an authorized engagement project.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversationId: activeConversationId || 'temp',
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await aiService.sendMessage({
        conversationId: activeConversationId,
        projectId: selectedProjectId,
        contextType,
        contextId: contextType === 'finding' ? selectedFindingId : undefined,
        message: text,
        quickAction,
      });

      setActiveConversationId(response.conversationId);
      const convs = await aiService.getConversations();
      setConversations(convs);

      const updatedMessages = await aiService.getMessages(response.conversationId);
      setMessages(updatedMessages);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate AI response. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteQuickAction = (action: QuickActionType) => {
    const actionLabels: Record<QuickActionType, string> = {
      explain_finding: 'Explain root cause and threat vector.',
      analyze_risk: 'Analyze exploit likelihood and aggregate risk.',
      suggest_remediation: 'Suggest concrete defense-in-depth remediation guidelines.',
      summarize_project: 'Provide an executive summary of this engagement.',
      generate_description: 'Draft an audit-ready vulnerability observation description.',
    };
    handleSendMessage(actionLabels[action], action);
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Project change handler
  const handleProjectChange = (projId: string) => {
    setSelectedProjectId(projId);
    const firstFnd = findings.find((f) => f.projectId === projId);
    setSelectedFindingId(firstFnd?.id);
  };

  if (isInitializing) {
    return (
      <DashboardLayout title="AI Red Team Assistant" subtitle="Context-aware cybersecurity co-pilot">
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
          <span className="text-xs text-text-muted font-mono">Initializing AI Assistant Workspace...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="AI Red Team Assistant"
      subtitle="Context-aware cybersecurity co-pilot for authorized testing & remediation."
    >
      <div className="h-[calc(100vh-14rem)] min-h-[580px] flex rounded-2xl bg-bg-card border border-border-dark overflow-hidden shadow-card-dark relative">
        
        {/* Desktop / Collapsible Conversation Sidebar */}
        <div className="hidden lg:block h-full">
          <ConversationSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="lg:hidden absolute inset-0 z-40 bg-black/70 backdrop-blur-sm flex">
            <div className="w-72 h-full bg-bg-card border-r border-border-dark p-2">
              <div className="flex justify-end p-2">
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-text-muted hover:text-text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ConversationSidebar
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
                onDeleteConversation={handleDeleteConversation}
              />
            </div>
          </div>
        )}

        {/* Main AI Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full bg-bg-main/50">
          
          {/* Top Context Bar */}
          <div className="p-3 border-b border-border-dark bg-bg-card">
            <div className="flex items-center gap-2 mb-2 lg:hidden">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="inline-flex items-center gap-1 text-xs text-brand-hover px-2.5 py-1 rounded-lg bg-bg-elevated border border-border-dark"
              >
                <Menu className="w-3.5 h-3.5" />
                <span>Sessions ({conversations.length})</span>
              </button>
            </div>

            <ContextSelectorBar
              projects={projects}
              selectedProjectId={selectedProjectId}
              onProjectChange={handleProjectChange}
              contextType={contextType}
              onContextTypeChange={setContextType}
              findings={findings}
              selectedFindingId={selectedFindingId}
              onFindingChange={setSelectedFindingId}
            />
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-start gap-2.5 text-xs text-[#EF4444] animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold">Execution Notice</span>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {messages.length > 0 ? (
              messages.map((msg) => (
                <ChatMessageItem key={msg.id} message={msg} />
              ))
            ) : (
              <div className="py-16 text-center space-y-4 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center mx-auto text-brand-primary">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-text-primary">
                    AI Red Team Co-Pilot Ready
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Select an authorized project and target finding above, then ask for vulnerability mechanisms, CVSS impact, or patch guidelines.
                  </p>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Bottom Controls & Message Input */}
          <div className="p-3 sm:p-4 border-t border-border-dark bg-bg-card space-y-2.5">
            <QuickActionsBar
              contextType={contextType}
              onExecuteAction={handleExecuteQuickAction}
              disabled={isLoading}
            />

            <ChatInput
              onSendMessage={(txt) => handleSendMessage(txt)}
              isLoading={isLoading}
              onClearConversation={() => setMessages([])}
              hasMessages={messages.length > 0}
            />
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};
