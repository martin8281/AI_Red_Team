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
  X,
  Plus,
  Terminal,
  Shield,
  FileCode,
  Archive,
  UploadCloud,
  FileText,
  Cpu,
  RotateCcw,
  Paperclip,
  Send
} from 'lucide-react';
import { 
  Conversation, 
  ChatMessage, 
  ContextType, 
  QuickActionType,
  ForensicAttachment,
  ConversationMode
} from '../types/ai.types';
import { Project } from '../types/project.types';
import { Finding } from '../types/finding.types';
import { aiService } from '../services/aiService';
import { projectService } from '../services/projectService';
import { findingService } from '../services/findingService';
import { projectFileService } from '../services/projectFileService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { ContextSelectorBar } from '../components/assistant/ContextSelectorBar';
import { QuickActionsBar } from '../components/assistant/QuickActionsBar';
import { ChatMessageItem } from '../components/assistant/ChatMessageItem';
import { ChatInput } from '../components/assistant/ChatInput';
import { ConversationSidebar } from '../components/assistant/ConversationSidebar';
import { HumanLoopBadge } from '../components/assistant/HumanLoopBadge';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ShieldLogo } from '../assets/logo/ShieldLogo';
import { processForensicFile } from '../utils/fileHelper';

export const AssistantPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialProjectId = searchParams.get('projectId') || '';
  const initialContextType = (searchParams.get('contextType') as ContextType) || 'project';
  const initialContextId = searchParams.get('contextId') || '';
  const initialFileName = searchParams.get('file') || '';

  const [projects, setProjects] = useState<Project[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId);
  const [contextType, setContextType] = useState<ContextType>(initialContextType);
  const [selectedFindingId, setSelectedFindingId] = useState<string | undefined>(initialContextId || undefined);
  const [conversationMode, setConversationMode] = useState<ConversationMode>('chat');

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('Analyzing evidence...');
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

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
          setConversationMode(convs[0].mode || 'chat');
          const msgs = await aiService.getMessages(convs[0].id);
          setMessages(msgs);
        }

        // If launched specifically with a file param, trigger initial inspection prompt
        if (initialFileName) {
          setTimeout(() => {
            handleSendMessage(`Please inspect and analyze project attached file "${initialFileName}" for security indicators, vulnerabilities, and IoCs.`);
          }, 400);
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
      setConversationMode(conv.mode || 'chat');
    }
    const msgs = await aiService.getMessages(id);
    setMessages(msgs);
    setMobileSidebarOpen(false);
  };

  const handleToggleMode = async (newMode: ConversationMode) => {
    setConversationMode(newMode);
    if (activeConversationId) {
      await aiService.setConversationMode(activeConversationId, newMode);
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConversationId ? { ...c, mode: newMode } : c))
      );
    }
  };

  const handleNewConversation = async () => {
    setError(null);
    const activeProject = projects.find((p) => p.id === selectedProjectId);
    const title = activeProject ? `Chat on ${activeProject.name}` : 'New Security Consultation';
    const newConv = await aiService.createConversation({
      projectId: selectedProjectId,
      contextType: contextType,
      contextId: selectedFindingId,
      title,
      mode: conversationMode,
    });
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setMessages([]);
    setMobileSidebarOpen(false);
  };

  const handleDeleteConversation = async (id: string) => {
    await aiService.deleteConversation(id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        handleSelectConversation(remaining[0].id);
      } else {
        setActiveConversationId(undefined);
        setMessages([]);
      }
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Send Message
  const handleSendMessage = async (text: string, attachments?: ForensicAttachment[], quickAction?: QuickActionType | string) => {
    if ((!text.trim() && (!attachments || attachments.length === 0)) || isLoading) return;
    setError(null);
    setIsLoading(true);
    setLoadingStage('Analyzing evidence & project context...');

    // Simulate multi-stage progress
    const stageTimer1 = setTimeout(() => setLoadingStage('Retrieving relevant security knowledge...'), 180);
    const stageTimer2 = setTimeout(() => setLoadingStage('Assessing risk & correlating indicators...'), 350);

    try {
      const response = await aiService.sendMessage({
        conversationId: activeConversationId,
        projectId: selectedProjectId,
        contextType,
        contextId: selectedFindingId,
        message: text,
        mode: conversationMode,
        attachments,
        quickAction: quickAction as QuickActionType,
      });

      if (response.mode && response.mode !== conversationMode) {
        setConversationMode(response.mode);
      }

      if (!activeConversationId) {
        setActiveConversationId(response.conversationId);
        const updatedConvs = await aiService.getConversations();
        setConversations(updatedConvs);
      }

      // Reload messages for active conversation
      const currentMsgs = await aiService.getMessages(response.conversationId);
      setMessages(currentMsgs);
    } catch (err: any) {
      setError(err?.message || 'Unable to connect to the local Ollama service.');
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: QuickActionType | string, customPrompt?: string) => {
    // Structured quick actions implicitly switch to Assistant Mode
    if (conversationMode !== 'assistant') {
      handleToggleMode('assistant');
    }

    let prompt = customPrompt || '';
    if (!prompt) {
      switch (action) {
        case 'explain_finding':
        case 'explain_more':
          prompt = 'Provide a deeper explanation: What is happening? Why is it vulnerable? How could it be exploited? What evidence supports this? Potential impact? How should it be fixed?';
          break;
        case 'analyze_risk':
          prompt = 'Evaluate the 7-factor threat risk model (Likelihood, Impact, Exploitability, Exposure, Asset Criticality, Existing Controls, Evidence Confidence) for this vector.';
          break;
        case 'explain_risk':
          prompt = 'Explain the risk score and breakdown of Likelihood, Impact, Exploitability, and Asset Criticality.';
          break;
        case 'suggest_tests':
          prompt = 'Suggest controlled, authorized validation test steps including Risk, Purpose, Expected Result, and Safety Considerations.';
          break;
        case 'explain_test':
          prompt = 'Provide detailed step-by-step guidance on executing the recommended validation tests safely.';
          break;
        case 'show_expected_result':
          prompt = 'Detail the expected results, server status codes, and non-destructive response assertions for the validation tests.';
          break;
        case 'add_to_test_plan':
          prompt = 'Add these controlled validation procedures to the active engagement test plan.';
          break;
        case 'suggest_remediation':
        case 'recommend_remediation':
          prompt = 'Provide step-by-step remediation guidelines and defensive code refactoring.';
          break;
        case 'explain_remediation':
          prompt = 'Explain the defensive remediation guidelines and code fixes in detail.';
          break;
        case 'verify_fix':
          prompt = 'Explain how to verify the remediation with automated regression and unit tests.';
          break;
        case 'add_to_report':
          prompt = 'Format this finding and risk assessment for executive audit deliverables and client reports.';
          break;
        case 'show_evidence':
          prompt = 'Display and correlate the timestamped evidence logs and raw event artifacts supporting this assessment.';
          break;
        case 'investigate':
          prompt = 'Perform an in-depth security investigation into affected endpoints, services, and potential attack vectors.';
          break;
        case 'correlate_events':
          prompt = 'Correlate events and reconstruct timeline of attacker progression from all uploaded evidence files.';
          break;
        case 'view_attack_path':
          prompt = 'Map the identified vulnerabilities into a multi-stage potential attack path.';
          break;
        case 'map_attack':
          prompt = 'Map the identified vulnerabilities to MITRE ATT&CK technique IDs and tactics.';
          break;
        case 'generate_description':
          prompt = 'Generate an audit-compliant technical finding description formatted for executive deliverables.';
          break;
        case 'summarize_project':
          prompt = 'Summarize the active engagement scope, critical risk vectors, and recommended testing priority.';
          break;
        case 'analyze_forensics':
          prompt = 'Analyze the attached forensic evidence log for Indicators of Compromise (IoCs) and parameter taint propagation.';
          break;
        default:
          prompt = `Perform ${action} analysis on this engagement.`;
      }
    }
    handleSendMessage(prompt, undefined, action);
  };

  const handleEditMessage = async (messageId: string, newText: string) => {
    if (!newText.trim() || isLoading) return;
    setError(null);
    setIsLoading(true);
    setLoadingStage('Regenerating response with updated prompt...');

    try {
      const convId = activeConversationId || 'conv-live';
      const response = await aiService.editAndRegenerateMessage({
        conversationId: convId,
        messageId,
        newMessage: newText,
        projectId: selectedProjectId,
        contextType,
        contextId: selectedFindingId,
      });

      const currentMsgs = await aiService.getMessages(response.conversationId);
      setMessages(currentMsgs);
    } catch (err: any) {
      setError(err?.message || 'Unable to connect to the local Ollama service.');
    } finally {
      setIsLoading(false);
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const processed: ForensicAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const item = await processForensicFile(files[i]);
      processed.push(item);
      // Also automatically save to project files storage!
      await projectFileService.addProjectFile(selectedProjectId, files[i], `Uploaded in AI Copilot chat: ${files[i].name}`);
    }

    if (processed.length > 0) {
      handleSendMessage(
        `Please perform forensic triage and security analysis on the attached evidence artifact(s).`,
        processed
      );
    }
  };

  const isGeneralMode = selectedProjectId === 'general' || contextType === 'general';
  const activeProject = isGeneralMode ? undefined : (projects.find((p) => p.id === selectedProjectId) || projects[0]);
  const activeFinding = findings.find((f) => f.id === selectedFindingId);

  return (
    <DashboardLayout noPadding hideHeader>
      <div 
        className="flex h-screen relative overflow-hidden bg-[#050A14]"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag & Drop Overlay */}
        {isDraggingFile && (
          <div className="absolute inset-0 z-50 bg-[#0B1220]/90 backdrop-blur-md border-2 border-dashed border-[#8B5CF6] flex flex-col items-center justify-center gap-4 animate-in fade-in">
            <div className="p-4 rounded-3xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#A78BFA] animate-bounce">
              <UploadCloud className="w-12 h-12" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-[#F8FAFC]">Drop Forensic Evidence Files Here</h3>
              <p className="text-xs text-[#94A3B8] mt-1 font-mono">
                Supports PDF, Word, CSV, XML, JSON, ZIP, PCAP, Logs, Memory Dumps & Configs
              </p>
            </div>
          </div>
        )}

        {/* Left Conversation History Sidebar */}
        <div className="hidden lg:block w-72 h-full shrink-0 border-r border-[#1E293B]">
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
          <div className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex">
            <div className="w-72 h-full bg-[#0B1220] border-r border-[#1E293B] shadow-2xl relative">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#151F32]"
              >
                <X className="w-5 h-5" />
              </button>
              <ConversationSidebar
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
                onDeleteConversation={handleDeleteConversation}
              />
            </div>
            <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
          </div>
        )}

        {/* Main Central Chat Workspace */}
        <div className="flex-1 flex flex-col h-full min-w-0 relative">
          
          {/* Top Header: AI RED TEAM ASSISTANT + Human-in-the-loop Indicator */}
          <div className="h-16 border-b border-[#1E293B] bg-[#070D18]/90 backdrop-blur px-4 sm:px-6 flex items-center justify-between gap-4 z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Drawer Toggle */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#101827] border border-[#1E293B] text-[#94A3B8] hover:text-white"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <ShieldLogo size={30} className="shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-extrabold tracking-wider uppercase">
                    <span className="text-[#8B5CF6]">AI</span> <span className="text-[#e00000]">RED</span> <span className="text-white">TEAM ASSISTANT</span>
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30 text-[10px] font-mono font-semibold">
                    <Cpu className="w-2.5 h-2.5" />
                    Qwen3 14B Grounded
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[#94A3B8] truncate max-w-xs sm:max-w-md">
                  Scope: <strong className="text-[#CBD5E1]">{isGeneralMode ? 'General Security Consultation (Open Scope)' : (activeProject?.name || 'Authorized Engagement')}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Right Controls: Mode Switcher & Human-in-the-loop badge */}
          <div className="flex items-center gap-3">
            {/* Mode Switcher Segmented Control */}
            <div className="flex items-center rounded-xl bg-[#101827] border border-[#1E293B] p-0.5">
              <button
                type="button"
                onClick={() => handleToggleMode('chat')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  conversationMode === 'chat'
                    ? 'bg-[#8B5CF6] text-white shadow-sm font-semibold'
                    : 'text-[#94A3B8] hover:text-[#CBD5E1]'
                }`}
                title="Normal Chat: Standard conversational prose without structured finding cards"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Normal Chat</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleMode('assistant')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  conversationMode === 'assistant'
                    ? 'bg-[#e00000] text-white shadow-sm font-semibold'
                    : 'text-[#94A3B8] hover:text-[#CBD5E1]'
                }`}
                title="Assistant Mode: Full structured forensic analysis, confidence tiers, risk cards, and action buttons"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Assistant Mode</span>
              </button>
            </div>

            <HumanLoopBadge />
          </div>
        </div>

        {/* Quick Context Selector Strip */}
        <ContextSelectorBar
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectChange={(id: string) => setSelectedProjectId(id)}
          contextType={contextType}
          onContextTypeChange={(type: ContextType) => setContextType(type)}
          selectedFindingId={selectedFindingId}
          onFindingChange={(id: string) => setSelectedFindingId(id)}
          findings={findings}
          onExecuteAction={handleActionClick}
        />

        {/* Chat Messages Feed Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
          {isInitializing ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#8B5CF6]" />
              <p className="text-xs font-mono text-[#94A3B8]">Loading Co-Pilot context & security datasets...</p>
            </div>
          ) : messages.length === 0 ? (
            /* Welcome Canvas */
            <div className="h-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center space-y-6 py-8 px-4 animate-in fade-in duration-300">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#8B5CF6]/30 via-purple-500/20 to-[#8B5CF6]/30 blur-xl rounded-full -z-10" />
                <ShieldLogo size={56} />
              </div>

              <div className="space-y-2 max-w-lg">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  <span className="text-[#8B5CF6]">AI</span> <span className="text-[#e00000]">Red</span> <span className="text-white">Team Copilot</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                  {isGeneralMode ? (
                    <>
                      You are in <span className="text-[#A78BFA] font-semibold">General Security Consultation</span> mode.
                      Ask any open cybersecurity question, explore vulnerability mechanisms, or analyze attack techniques without project constraints.
                    </>
                  ) : (
                    <>
                      Connected to <span className="text-[#A78BFA] font-semibold">{activeProject?.name || 'Security Scope'}</span>.
                      I refer to your project attached files, evaluate 7-factor threat risks, correlate evidence, and suggest validation tests.
                    </>
                  )}
                </p>
              </div>

              {/* 4 Interactive Starter Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left pt-2">
                {isGeneralMode ? (
                  <>
                    <button
                      onClick={() => handleActionClick('explain_finding', 'Explain the most critical OWASP Top 10 vulnerabilities, exploit vectors, and secure coding defenses.')}
                      className="p-4 rounded-2xl bg-[#0B1220] border border-[#1E293B] hover:border-[#8B5CF6]/50 hover:bg-[#101827] transition-all group shadow-sm flex items-start gap-3"
                    >
                      <div className="p-2 rounded-xl bg-[#151F32] text-[#3B82F6] shrink-0 group-hover:scale-105 transition-transform">
                        <Terminal className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#F8FAFC] group-hover:text-[#A78BFA] transition-colors">
                          OWASP Top 10 Mechanics
                        </h4>
                        <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-snug">
                          SSRF, SQLi, Broken Auth, and Insecure Deserialization
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleActionClick('analyze_forensics', 'Explain common Active Directory and Kerberos attack vectors including Kerberoasting, AS-REP roasting, and DCSync.')}
                      className="p-4 rounded-2xl bg-[#0B1220] border border-[#1E293B] hover:border-[#8B5CF6]/50 hover:bg-[#101827] transition-all group shadow-sm flex items-start gap-3"
                    >
                      <div className="p-2 rounded-xl bg-[#151F32] text-[#A78BFA] shrink-0 group-hover:scale-105 transition-transform">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#F8FAFC] group-hover:text-[#A78BFA] transition-colors">
                          Active Directory Attacks
                        </h4>
                        <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-snug">
                          Kerberoasting, Pass-the-Hash, and DCSync extraction
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleActionClick('analyze_risk', 'Explain the 7-factor threat risk evaluation model used in penetration testing and calibrated risk scoring.')}
                      className="p-4 rounded-2xl bg-[#0B1220] border border-[#1E293B] hover:border-[#8B5CF6]/50 hover:bg-[#101827] transition-all group shadow-sm flex items-start gap-3"
                    >
                      <div className="p-2 rounded-xl bg-[#151F32] text-[#F97316] shrink-0 group-hover:scale-105 transition-transform">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#F8FAFC] group-hover:text-[#A78BFA] transition-colors">
                          7-Factor Risk Modeling
                        </h4>
                        <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-snug">
                          Exploitability, asset exposure, and calibrated risk scoring
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleActionClick('suggest_tests', 'Provide safe, non-destructive validation test methodology and boundaries for authorized penetration testers.')}
                      className="p-4 rounded-2xl bg-[#0B1220] border border-[#1E293B] hover:border-[#8B5CF6]/50 hover:bg-[#101827] transition-all group shadow-sm flex items-start gap-3"
                    >
                      <div className="p-2 rounded-xl bg-[#151F32] text-[#22C55E] shrink-0 group-hover:scale-105 transition-transform">
                        <FileCode className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#F8FAFC] group-hover:text-[#A78BFA] transition-colors">
                          PoC Validation Safety
                        </h4>
                        <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-snug">
                          Controlled, authorized proof-of-concept guidelines
                        </p>
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleActionClick('analyze_forensics')}
                      className="p-4 rounded-2xl bg-[#0B1220] border border-[#1E293B] hover:border-[#8B5CF6]/50 hover:bg-[#101827] transition-all group shadow-sm flex items-start gap-3"
                    >
                      <div className="p-2 rounded-xl bg-[#151F32] text-[#3B82F6] shrink-0 group-hover:scale-105 transition-transform">
                        <Terminal className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#F8FAFC] group-hover:text-[#A78BFA] transition-colors">
                          Examine Project Evidence Files
                        </h4>
                        <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-snug">
                          Correlate auth.log, nmap scans, and PCAP traces
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleActionClick('analyze_risk')}
                      className="p-4 rounded-2xl bg-[#0B1220] border border-[#1E293B] hover:border-[#8B5CF6]/50 hover:bg-[#101827] transition-all group shadow-sm flex items-start gap-3"
                    >
                      <div className="p-2 rounded-xl bg-[#151F32] text-[#F97316] shrink-0 group-hover:scale-105 transition-transform">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#F8FAFC] group-hover:text-[#A78BFA] transition-colors">
                          7-Factor Risk Calibration
                        </h4>
                        <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-snug">
                          Calculate calibrated severity, exposure, and asset criticality
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleActionClick('suggest_tests')}
                      className="p-4 rounded-2xl bg-[#0B1220] border border-[#1E293B] hover:border-[#8B5CF6]/50 hover:bg-[#101827] transition-all group shadow-sm flex items-start gap-3"
                    >
                      <div className="p-2 rounded-xl bg-[#151F32] text-[#22C55E] shrink-0 group-hover:scale-105 transition-transform">
                        <FileCode className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#F8FAFC] group-hover:text-[#A78BFA] transition-colors">
                          Suggest Controlled Tests
                        </h4>
                        <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-snug">
                          Step-by-step reproduction with safety guardrails
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleActionClick('summarize_project')}
                      className="p-4 rounded-2xl bg-[#0B1220] border border-[#1E293B] hover:border-[#8B5CF6]/50 hover:bg-[#101827] transition-all group shadow-sm flex items-start gap-3"
                    >
                      <div className="p-2 rounded-xl bg-[#151F32] text-[#A78BFA] shrink-0 group-hover:scale-105 transition-transform">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#F8FAFC] group-hover:text-[#A78BFA] transition-colors">
                          Engagement Posture
                        </h4>
                        <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-snug">
                          Executive triage across scope, risk, and active findings
                        </p>
                      </div>
                    </button>
                  </>
                )}
              </div>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessageItem 
                  key={msg.id} 
                  message={msg} 
                  onActionClick={handleActionClick}
                  onEditMessage={handleEditMessage}
                  onFindingCreated={async () => {
                    const updatedFindings = await findingService.getFindings();
                    setFindings(updatedFindings);
                  }}
                />
              ))
            )}

            {/* Live Loading State Indicator */}
            {isLoading && (
              <div className="flex items-start gap-3.5 animate-in fade-in duration-200 max-w-4xl mx-auto w-full">
                <ShieldLogo size={30} className="shrink-0 mt-1" />
                <div className="rounded-2xl p-4 sm:p-5 bg-[#101827] border border-[#1E293B] space-y-2.5 shadow-lg min-w-[280px]">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#8B5CF6]" />
                    <span className="text-xs font-mono font-bold">
                      <span className="text-[#8B5CF6]">AI</span> <span className="text-[#e00000]">Red</span> <span className="text-white">Team Assistant</span>
                    </span>
                  </div>
                  <p className="text-xs text-[#CBD5E1] font-mono animate-pulse">
                    {loadingStage}
                  </p>
                </div>
              </div>
            )}

            {/* Error State Banner */}
            {error && (
              <div className="max-w-4xl mx-auto p-5 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/30 space-y-3 animate-in fade-in">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5 text-[#EF4444]">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <h4 className="text-sm font-bold">AI Service Unavailable</h4>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendMessage('Retry last consultation')}
                    icon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Retry
                  </Button>
                </div>

                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  {error}
                </p>

                <div className="p-3 rounded-xl bg-[#050A14] border border-[#1E293B] text-[11px] font-mono text-[#94A3B8] space-y-1">
                  <p className="font-semibold text-[#CBD5E1]">Troubleshooting Checklist:</p>
                  <p>1. Ensure Ollama service is running (<code className="text-[#8B5CF6]">ollama serve</code> / <code className="text-[#8B5CF6]">http://127.0.0.1:11434</code>).</p>
                  <p>2. Verify model is installed (<code className="text-[#8B5CF6]">ollama pull qwen3:14b</code>).</p>
                  <p>3. Confirm backend FastAPI service is running on port 8000.</p>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Bottom Chat Input */}
          <div className="p-3 sm:px-6 bg-[#0B1220]/95 border-t border-[#1E293B] shrink-0">
            <div className="max-w-4xl mx-auto">
              <ChatInput
                onSendMessage={(text, atts) => handleSendMessage(text, atts)}
                isLoading={isLoading}
                hasMessages={messages.length > 0}
                onClearConversation={() => setMessages([])}
              />
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};
