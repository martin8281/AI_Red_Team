import React, { useState } from 'react';
import { 
  PlusCircle, 
  FolderPlus, 
  Sparkles, 
  FileText, 
  Zap, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface QuickActionsProps {
  onTriggerAskAi?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onTriggerAskAi }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const actions = [
    {
      id: 'new-project',
      label: 'New Project',
      description: 'Define scope & target boundaries',
      icon: <FolderPlus className="w-5 h-5 text-brand-primary" />,
      onClick: () => setActiveModal('New Project Scope Definition'),
    },
    {
      id: 'add-finding',
      label: 'Add Finding',
      description: 'Log verified vulnerability & payload',
      icon: <PlusCircle className="w-5 h-5 text-[#F97316]" />,
      onClick: () => setActiveModal('Add Security Finding'),
    },
    {
      id: 'ask-ai',
      label: 'Ask AI Assistant',
      description: 'Analyze vectors & root causes',
      icon: <Sparkles className="w-5 h-5 text-brand-primary" />,
      onClick: onTriggerAskAi || (() => setActiveModal('AI Co-Pilot Workspace')),
    },
    {
      id: 'generate-report',
      label: 'Generate Report',
      description: 'Export executive & tech findings',
      icon: <FileText className="w-5 h-5 text-[#22C55E]" />,
      onClick: () => setActiveModal('Security Assessment Report Dispatch'),
    },
  ];

  return (
    <>
      <Card
        variant="default"
        className="p-6 bg-bg-card border-border-dark space-y-4 shadow-card-dark"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-dark">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Quick Actions
              </h3>
              <p className="text-xs text-text-muted">
                Frequently executed security workflows
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-text-muted">
            SHORTCUTS
          </span>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className="p-3.5 rounded-xl bg-bg-elevated border border-border-dark hover:border-brand-primary/50 hover:bg-bg-hover text-left transition-all duration-200 group flex flex-col justify-between space-y-3 cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-bg-surface border border-border-dark w-fit group-hover:border-brand-primary/40 group-hover:scale-105 transition-all">
                {action.icon}
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-primary group-hover:text-white transition-colors">
                  {action.label}
                </h4>
                <p className="text-[11px] text-text-muted leading-tight mt-0.5">
                  {action.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Modal Dialog */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-bg-card border border-border-dark p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-dark">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                <span>{activeModal}</span>
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-bg-elevated"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              This workflow interface is ready. Full CRUD integration and automated payload ingestion will connect in upcoming phases.
            </p>

            <div className="pt-3 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveModal(null)}
              >
                Acknowledge
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
