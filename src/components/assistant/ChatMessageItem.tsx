import React, { useState } from 'react';
import { 
  User, 
  Sparkles, 
  FileText, 
  Terminal, 
  FileCode, 
  Archive, 
  Image as ImageIcon, 
  Copy, 
  Check, 
  Eye, 
  Pencil, 
  RotateCcw, 
  X,
  RefreshCw
} from 'lucide-react';
import { ChatMessage, ForensicAttachment, QuickActionType } from '../../types/ai.types';
import { StructuredResponseView } from './StructuredResponseView';
import { SourceCitationsView } from '../knowledge/SourceCitationsView';
import { ShieldLogo } from '../../assets/logo/ShieldLogo';
import { bytesToReadableSize } from '../../utils/fileHelper';
import { ForensicAttachmentModal } from './ForensicAttachmentModal';
import { ActionButtons } from './ActionButtons';
import { CreateFindingFromAIModal, ProposedFindingData } from '../projects/CreateFindingFromAIModal';
import { aiService } from '../../services/aiService';

interface ChatMessageItemProps {
  message: ChatMessage;
  onActionClick?: (action: QuickActionType | string, customPrompt?: string) => void;
  onFindingCreated?: (findingId: string) => void;
  onEditMessage?: (messageId: string, newText: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ 
  message, 
  onActionClick,
  onFindingCreated,
  onEditMessage,
}) => {
  const isUser = message.role === 'user';
  const citations = message.sources || message.structured?.sources || [];
  const attachments = message.attachments || [];
  
  const [copied, setCopied] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<ForensicAttachment | null>(null);
  const [showCreateFindingModal, setShowCreateFindingModal] = useState(false);

  // Edit User Message State
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);

  const handleCopy = () => {
    const textToCopy = message.structured?.summary || message.content;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (!editText.trim()) return;
    setIsEditing(false);
    if (onEditMessage && editText.trim() !== message.content) {
      onEditMessage(message.id, editText.trim());
    }
  };

  const handleCancelEdit = () => {
    setEditText(message.content);
    setIsEditing(false);
  };

  const getAttachmentIcon = (category: ForensicAttachment['category']) => {
    switch (category) {
      case 'LOG':
        return <Terminal className="w-4 h-4 text-[#3B82F6]" />;
      case 'DATA':
        return <FileCode className="w-4 h-4 text-[#8B5CF6]" />;
      case 'ARCHIVE':
        return <Archive className="w-4 h-4 text-[#EAB308]" />;
      case 'IMAGE':
        return <ImageIcon className="w-4 h-4 text-[#22C55E]" />;
      default:
        return <FileText className="w-4 h-4 text-[#CBD5E1]" />;
    }
  };

  // Build proposed finding data for confirmation modal
  const firstFinding = message.structured?.findings?.[0];
  const proposedFindingData: ProposedFindingData = {
    projectId: message.metadata?.projectId || 'PRJ-101',
    title: firstFinding?.category || message.structured?.summary || 'Potential SQL Injection',
    severity: firstFinding?.severity || 'HIGH',
    confidence: firstFinding?.confidence || 'HIGH',
    affectedAsset: firstFinding?.affected_asset || '/login',
    endpoint: firstFinding?.affected_asset?.includes('/') ? '/' + firstFinding.affected_asset.split('/').slice(1).join('/') : '/login',
    description: firstFinding?.description || message.structured?.reasoning || message.content,
    impact: firstFinding?.impact || message.structured?.impact || 'Potential unauthorized authentication bypass and database disclosure.',
    recommendation: firstFinding?.recommendation || message.structured?.recommendation || 'Enforce parameterized prepared statements and server-side validation.',
  };

  const [showEvidencePanel, setShowEvidencePanel] = useState(false);

  // Referenced evidence items
  const evidenceLogs = [
    { timestamp: '08:01:02Z', src: '198.51.100.44', event: 'AUTH_FAILURE', endpoint: '/api/v1/auth', detail: 'Invalid password for user "admin"' },
    { timestamp: '08:01:04Z', src: '198.51.100.44', event: 'AUTH_FAILURE', endpoint: '/api/v1/auth', detail: 'Invalid password for user "admin"' },
    { timestamp: '08:01:05Z', src: '198.51.100.44', event: 'SQL_INJECT_PAYLOAD', endpoint: '/api/v1/auth', detail: 'param: username, val: "admin\' OR \'1\'=\'1" -> HTTP 200 AUTH_SUCCESS' },
  ];

  return (
    <>
      <div
        className={`flex items-start gap-3.5 ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        } animate-in fade-in duration-200 max-w-4xl mx-auto w-full group`}
      >
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#8B5CF6] text-white shadow-sm font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <ShieldLogo size={32} className="shrink-0 mt-0.5" />
          )}
        </div>

        {/* Message Bubble Container */}
        <div
          className={`flex-1 rounded-xl p-4 sm:p-5 border space-y-2.5 transition-all ${
            isUser
              ? 'bg-[#8B5CF6] border-[#8B5CF6]/60 text-[#F8FAFC] shadow-md ml-12'
              : 'bg-[#101827] border-[#1E293B] shadow-xl mr-12'
          }`}
        >
          {/* Top Header Row */}
          <div
            className={`flex items-center gap-2 text-[11px] font-mono ${
              isUser ? 'text-[#EDE9FE] justify-end' : 'text-[#94A3B8] justify-between'
            }`}
          >
            {!isUser ? (
              <div className="flex items-center gap-2">
                <span className="font-bold flex items-center gap-1">
                  <span><span className="text-[#8B5CF6]">AI</span> <span className="text-[#e00000]">Red</span> <span className="text-white">Team Assistant</span></span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/20">
                  Qwen3 14B Grounded
                </span>
              </div>
            ) : null}

            <div className="flex items-center gap-2">
              <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              
              {/* Copy Button for AI Messages */}
              {!isUser && (
                <button
                  onClick={handleCopy}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[#151F32] text-[#94A3B8] hover:text-[#F8FAFC]"
                  title="Copy response"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}

              {/* Edit Button for User Messages [✎] */}
              {isUser && !isEditing && (
                <button
                  onClick={() => {
                    setEditText(message.content);
                    setIsEditing(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/20 text-[#EDE9FE] hover:text-white cursor-pointer"
                  title="Edit prompt"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* User Attached Forensic Files */}
          {attachments.length > 0 && (
            <div className="space-y-1.5">
              <div className={`text-[10px] font-mono uppercase tracking-wider ${isUser ? 'text-[#EDE9FE]' : 'text-[#94A3B8]'}`}>
                Attached Evidence Files ({attachments.length}):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    onClick={() => setSelectedAttachment(att)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all shadow-sm ${
                      isUser
                        ? 'bg-[#7C3AED] border-[#A78BFA]/40 hover:border-white'
                        : 'bg-[#050A14] border-[#1E293B] hover:border-[#8B5CF6]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-[#101827] border border-[#1E293B]">
                        {getAttachmentIcon(att.category)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#F8FAFC] truncate">
                          {att.name}
                        </p>
                        <p className={`text-[10px] font-mono ${isUser ? 'text-[#DDD6FE]' : 'text-[#94A3B8]'}`}>
                          {bytesToReadableSize(att.size)} • .{att.extension.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="p-1 text-[#94A3B8] hover:text-white">
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Inline Message Edit Mode */}
          {isUser && isEditing ? (
            <div className="space-y-3 animate-in fade-in">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={Math.max(2, editText.split('\n').length)}
                className="w-full p-3 rounded-xl bg-[#050A14] border border-[#A78BFA]/60 text-xs text-[#F8FAFC] focus:outline-none focus:border-white font-sans leading-relaxed resize-none shadow-inner"
                autoFocus
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 rounded-lg bg-black/25 hover:bg-black/40 text-[#EDE9FE] hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-[#F8FAFC] text-[#8B5CF6] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Run Again</span>
                </button>
              </div>
            </div>
          ) : (
            /* Standard Message Content View */
            <>
              {message.structured ? (
                <StructuredResponseView 
                  structured={message.structured}
                  onAcceptFinding={(findingId) => {
                    aiService.acceptProposedFinding(message.id, findingId);
                  }}
                  onRejectFinding={(findingId, reason, comment) => {
                    aiService.rejectProposedFinding(message.id, findingId, reason, comment);
                  }}
                  onActionClick={onActionClick}
                  onCreateFindingClick={() => setShowCreateFindingModal(true)}
                />
              ) : (
                <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans ${isUser ? 'text-white font-medium' : 'text-[#CBD5E1]'}`}>
                  {message.content}
                </p>
              )}
            </>
          )}

          {/* Expandable Evidence Inspection Panel (Opened via [Show Evidence]) */}
          {!isUser && showEvidencePanel && (
            <div className="p-3.5 rounded-xl bg-[#050A14] border border-[#3B82F6]/40 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#3B82F6]">
                  <Terminal className="w-4 h-4" />
                  <span>Evidence Inspection: auth_audit.log</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEvidencePanel(false)}
                  className="text-[10px] font-mono text-[#94A3B8] hover:text-white px-2 py-0.5 rounded bg-[#101827] border border-[#1E293B]"
                >
                  Close
                </button>
              </div>

              <div className="text-[11px] font-mono text-[#94A3B8] space-y-1.5">
                <p><strong className="text-[#CBD5E1]">Source:</strong> <span className="text-[#A78BFA]">auth_audit.log</span> (Lines 4–6)</p>
                <p><strong className="text-[#CBD5E1]">Target Asset:</strong> <span className="text-[#F8FAFC]">/api/v1/auth</span></p>
                
                <div className="mt-2 space-y-1 rounded-lg bg-[#0B1220] p-2.5 border border-[#1E293B] font-mono text-[11px]">
                  <div className="text-[#94A3B8] font-bold text-[10px] uppercase border-b border-[#1E293B] pb-1 mb-1.5">
                    Relevant Audit Events:
                  </div>
                  {evidenceLogs.map((ev, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-[#CBD5E1]">
                      <span className="text-[#8B5CF6] font-semibold shrink-0">{ev.timestamp}</span>
                      <span className="text-[#94A3B8] text-[10px] shrink-0">[{ev.src}]</span>
                      <span className="text-[#F8FAFC] truncate">{ev.detail}</span>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-[#94A3B8] italic pt-1">
                  The same source generated repeated authentication failures followed by successful token issuance.
                </p>
              </div>
            </div>
          )}

          {/* Verified RAG Source Citations */}
          {!isUser && citations.length > 0 && (
            <SourceCitationsView sources={citations} />
          )}

          {/* Contextual Action Buttons for AI Responses */}
          {!isUser && onActionClick && (
            <ActionButtons
              actions={message.structured?.actions || message.actions}
              structured={message.structured}
              rawText={message.content}
              onActionClick={onActionClick}
              onCreateFindingClick={() => setShowCreateFindingModal(true)}
              onShowEvidenceToggle={() => setShowEvidencePanel(!showEvidencePanel)}
              isEvidenceOpen={showEvidencePanel}
            />
          )}
        </div>
      </div>

      {/* Forensic Attachment Inspection Modal */}
      {selectedAttachment && (
        <ForensicAttachmentModal
          attachment={selectedAttachment}
          onClose={() => setSelectedAttachment(null)}
        />
      )}

      {/* Human-in-the-Loop Create Finding Modal */}
      {showCreateFindingModal && (
        <CreateFindingFromAIModal
          isOpen={showCreateFindingModal}
          onClose={() => setShowCreateFindingModal(false)}
          proposed={proposedFindingData}
          onFindingCreated={(createdId) => {
            if (onFindingCreated) onFindingCreated(createdId);
          }}
        />
      )}
    </>
  );
};
