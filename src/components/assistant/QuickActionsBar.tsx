import React from 'react';
import { 
  HelpCircle, 
  ShieldAlert, 
  CheckCircle2, 
  FileText, 
  Sparkles,
  Layers
} from 'lucide-react';
import { QuickActionType, ContextType } from '../../types/ai.types';

interface QuickActionsBarProps {
  contextType: ContextType;
  onExecuteAction: (action: QuickActionType) => void;
  disabled?: boolean;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  contextType,
  onExecuteAction,
  disabled = false,
}) => {
  const actions: { id: QuickActionType; label: string; icon: React.ReactNode; relevantContexts: ContextType[] }[] = [
    {
      id: 'explain_finding',
      label: 'Explain Finding',
      icon: <HelpCircle className="w-3 h-3 text-brand-hover" />,
      relevantContexts: ['finding', 'project'],
    },
    {
      id: 'analyze_risk',
      label: 'Analyze Risk',
      icon: <ShieldAlert className="w-3 h-3 text-[#F97316]" />,
      relevantContexts: ['finding', 'risk', 'project'],
    },
    {
      id: 'suggest_remediation',
      label: 'Suggest Remediation',
      icon: <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />,
      relevantContexts: ['finding', 'project'],
    },
    {
      id: 'summarize_project',
      label: 'Summarize Engagement',
      icon: <Layers className="w-3 h-3 text-brand-primary" />,
      relevantContexts: ['project', 'scope', 'risk'],
    },
    {
      id: 'generate_description',
      label: 'Generate Description',
      icon: <FileText className="w-3 h-3 text-text-secondary" />,
      relevantContexts: ['finding'],
    },
  ];

  const visibleActions = actions.filter((a) => a.relevantContexts.includes(contextType));

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
      <span className="text-[11px] font-mono text-text-muted shrink-0 mr-1">
        Quick AI Prompts:
      </span>
      {visibleActions.map((act) => (
        <button
          key={act.id}
          disabled={disabled}
          onClick={() => onExecuteAction(act.id)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg-surface hover:bg-bg-elevated border border-border-dark text-xs text-text-secondary hover:text-text-primary transition-all shrink-0 hover:border-brand-primary/40 disabled:opacity-50 cursor-pointer"
        >
          {act.icon}
          <span>{act.label}</span>
        </button>
      ))}
    </div>
  );
};
