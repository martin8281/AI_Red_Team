import React from 'react';
import { 
  Plus, 
  ShieldAlert, 
  FlaskConical, 
  HelpCircle, 
  FileText, 
  Network, 
  GitBranch,
  Route,
  Search,
  Wrench,
  CheckCircle2,
  FilePlus,
  Activity,
  ListChecks,
  Eye,
  CheckSquare,
  FileSearch,
  Sparkles
} from 'lucide-react';
import { StructuredAIResponse, AIAction, AIActionType } from '../../types/ai.types';

export interface ActionButtonsProps {
  actions?: AIAction[];
  structured?: StructuredAIResponse;
  rawText?: string;
  onActionClick: (action: AIActionType | string, customPrompt?: string) => void;
  onCreateFindingClick?: () => void;
  onShowEvidenceToggle?: () => void;
  isEvidenceOpen?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  actions,
  structured,
  rawText = '',
  onActionClick,
  onCreateFindingClick,
  onShowEvidenceToggle,
  isEvidenceOpen = false,
}) => {
  // If actions was explicitly set to an empty array (e.g. casual responses), render nothing
  if (actions && actions.length === 0) {
    return null;
  }

  // If structured has intent casual/clarifying and no explicit actions, don't show buttons
  if (structured?.intent === 'casual') {
    return null;
  }

  const content = (structured?.summary || '') + ' ' + (structured?.reasoning || '') + ' ' + (structured?.impact || '') + ' ' + rawText;
  const lower = content.toLowerCase();

  // Resolve actions list: use explicit actions if provided, otherwise compute contextually
  let resolvedActions: AIAction[] = [];

  if (actions && actions.length > 0) {
    resolvedActions = actions;
  } else if (structured?.actions && structured.actions.length > 0) {
    resolvedActions = structured.actions;
  } else {
    // Contextual evaluation based on AI response type
    const isRiskAnalysis = 
      lower.includes('analyzed the risk') || 
      lower.includes('analyzed the available evidence') ||
      lower.includes('risk score:') ||
      (structured?.risk && !structured?.findings);

    const isTestSuggestion = 
      lower.includes('controlled validation') || 
      lower.includes('validation steps') || 
      lower.includes('recommend validating');

    const isDeepExplanation = 
      lower.includes('technical explanation') || 
      lower.includes('potential impact') ||
      lower.includes('why this matters');

    const isEvidenceOrLog = 
      lower.includes('auth_audit.log') || 
      lower.includes('evidence logs') || 
      lower.includes('suspicious authentication activity') ||
      (structured?.correlated_events && structured.correlated_events.length > 0);

    const isAttackPath = 
      lower.includes('attack path') || 
      lower.includes('mitre att&ck') || 
      lower.includes('lateral movement');

    const isRemediation = 
      lower.includes('remediation') || 
      lower.includes('defensive code') || 
      lower.includes('parameterized queries');

    if (isRiskAnalysis) {
      resolvedActions = [
        { id: 'show-evidence', label: 'Show Evidence', type: 'show_evidence', variant: 'secondary' },
        { id: 'explain-risk', label: 'Explain Risk', type: 'explain_risk', variant: 'secondary' },
        { id: 'create-finding', label: 'Create Finding', type: 'create_finding', variant: 'primary' },
      ];
    } else if (isTestSuggestion) {
      resolvedActions = [
        { id: 'explain-test', label: 'Explain Test', type: 'explain_test', variant: 'secondary' },
        { id: 'show-expected-result', label: 'Show Expected Result', type: 'show_expected_result', variant: 'secondary' },
        { id: 'add-to-test-plan', label: 'Add to Test Plan', type: 'add_to_test_plan', variant: 'secondary' },
      ];
    } else if (isDeepExplanation) {
      resolvedActions = [
        { id: 'suggest-tests', label: 'Suggest Tests', type: 'suggest_tests', variant: 'secondary' },
        { id: 'show-evidence', label: 'Show Evidence', type: 'show_evidence', variant: 'secondary' },
        { id: 'recommend-remediation', label: 'Recommend Remediation', type: 'recommend_remediation', variant: 'secondary' },
      ];
    } else if (isEvidenceOrLog) {
      resolvedActions = [
        { id: 'show-evidence', label: 'Show Evidence', type: 'show_evidence', variant: 'secondary' },
        { id: 'investigate', label: 'Investigate', type: 'investigate', variant: 'secondary' },
        { id: 'correlate-events', label: 'Correlate Events', type: 'correlate_events', variant: 'secondary' },
        { id: 'explain-more', label: 'Explain More', type: 'explain_more', variant: 'secondary' },
      ];
    } else if (isAttackPath) {
      resolvedActions = [
        { id: 'view-attack-path', label: 'View Attack Path', type: 'view_attack_path', variant: 'secondary' },
        { id: 'analyze-risk', label: 'Analyze Risk', type: 'analyze_risk', variant: 'secondary' },
        { id: 'map-attack', label: 'Map to MITRE ATT&CK', type: 'map_attack', variant: 'secondary' },
        { id: 'explain-more', label: 'Explain More', type: 'explain_more', variant: 'secondary' },
      ];
    } else if (isRemediation) {
      resolvedActions = [
        { id: 'explain-remediation', label: 'Explain Remediation', type: 'explain_remediation', variant: 'secondary' },
        { id: 'verify-fix', label: 'Verify Fix', type: 'verify_fix', variant: 'secondary' },
        { id: 'add-to-report', label: 'Add to Report', type: 'add_to_report', variant: 'secondary' },
      ];
    } else {
      // Default finding / vulnerability response: Exactly the specified order
      resolvedActions = [
        { id: 'create-finding', label: 'Create Finding', type: 'create_finding', variant: 'primary' },
        { id: 'analyze-risk', label: 'Analyze Risk', type: 'analyze_risk', variant: 'secondary' },
        { id: 'suggest-tests', label: 'Suggest Tests', type: 'suggest_tests', variant: 'secondary' },
        { id: 'explain-more', label: 'Explain More', type: 'explain_more', variant: 'secondary' },
      ];
    }
  }

  if (resolvedActions.length === 0) {
    return null;
  }

  const getActionIcon = (type: string, isPrimary: boolean) => {
    const iconClass = `w-3.5 h-3.5 shrink-0 ${isPrimary ? 'text-white' : 'text-[#A78BFA]'}`;
    
    switch (type) {
      case 'create_finding':
        return <Plus className={iconClass} />;
      case 'analyze_risk':
        return <ShieldAlert className={isPrimary ? iconClass : 'w-3.5 h-3.5 text-[#F97316] shrink-0'} />;
      case 'explain_risk':
        return <Activity className={isPrimary ? iconClass : 'w-3.5 h-3.5 text-[#F97316] shrink-0'} />;
      case 'suggest_tests':
        return <FlaskConical className={isPrimary ? iconClass : 'w-3.5 h-3.5 text-[#22C55E] shrink-0'} />;
      case 'explain_test':
        return <ListChecks className={isPrimary ? iconClass : 'w-3.5 h-3.5 text-[#22C55E] shrink-0'} />;
      case 'show_expected_result':
        return <Eye className={isPrimary ? iconClass : 'w-3.5 h-3.5 text-[#38BDF8] shrink-0'} />;
      case 'add_to_test_plan':
        return <CheckSquare className={isPrimary ? iconClass : 'w-3.5 h-3.5 text-[#A78BFA] shrink-0'} />;
      case 'explain_more':
      case 'explain_finding':
        return <HelpCircle className={isPrimary ? iconClass : 'w-3.5 h-3.5 text-[#A78BFA] shrink-0'} />;
      case 'show_evidence':
        return <FileSearch className={isPrimary ? iconClass : 'w-3.5 h-3.5 text-[#3B82F6] shrink-0'} />;
      case 'investigate':
        return <Search className={isPrimary ? iconClass : 'w-3.5 h-3.5 text-[#38BDF8] shrink-0'} />;
      case 'correlate_events':
        return <Network className={isPrimary ? iconClass : 'w-3.5 h-3.5 text-[#3B82F6] shrink-0'} />;
      case 'view_attack_path':
        return <Route className={isPrimary ? iconClass : 'w-3.5 h-3.5 text-[#EAB308] shrink-0'} />;
      case 'map_attack':
        return <GitBranch className={isPrimary ? iconClass : 'w-3.5 h-3.5 text-[#EAB308] shrink-0'} />;
      case 'recommend_remediation':
      case 'explain_remediation':
        return <Wrench className={isPrimary ? iconClass : 'w-3.5 h-3.5 text-[#22C55E] shrink-0'} />;
      case 'verify_fix':
        return <CheckCircle2 className={isPrimary ? iconClass : 'w-3.5 h-3.5 text-[#22C55E] shrink-0'} />;
      case 'add_to_report':
        return <FilePlus className={isPrimary ? iconClass : 'w-3.5 h-3.5 text-[#A78BFA] shrink-0'} />;
      default:
        return <Sparkles className={iconClass} />;
    }
  };

  const handleButtonClick = (action: AIAction) => {
    if (action.type === 'create_finding' && onCreateFindingClick) {
      onCreateFindingClick();
      return;
    }

    if (action.type === 'show_evidence' && onShowEvidenceToggle) {
      onShowEvidenceToggle();
      return;
    }

    onActionClick(action.type, action.prompt);
  };

  return (
    <div className="pt-3 mt-1 border-t border-[#1E293B]/70 flex flex-wrap items-center gap-2">
      {resolvedActions.map((action) => {
        const isPrimary = action.variant === 'primary' || action.type === 'create_finding';
        const isToggleEvidence = action.type === 'show_evidence';
        const isEvidenceActive = isToggleEvidence && isEvidenceOpen;

        return (
          <button
            key={action.id}
            type="button"
            onClick={() => handleButtonClick(action)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer select-none active:scale-[0.98] ${
              isPrimary
                ? 'bg-[#8B5CF6] hover:bg-[#A78BFA] text-[#F8FAFC] border border-[#8B5CF6] font-semibold shadow-sm hover:scale-[1.02]'
                : isEvidenceActive
                ? 'bg-[#1E293B] text-white border border-[#3B82F6] font-medium'
                : 'bg-[#101827] hover:bg-[#151F32] text-[#CBD5E1] hover:text-[#F8FAFC] border border-[#1E293B] hover:border-[#8B5CF6]/50 font-medium'
            }`}
          >
            {getActionIcon(action.type, isPrimary)}
            <span>{isToggleEvidence && isEvidenceOpen ? 'Hide Evidence' : action.label}</span>
          </button>
        );
      })}
    </div>
  );
};
