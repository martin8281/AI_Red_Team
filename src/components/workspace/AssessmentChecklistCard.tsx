import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckSquare, 
  Square, 
  CheckCircle2, 
  ChevronRight, 
  ListChecks, 
  ShieldCheck 
} from 'lucide-react';
import { AssessmentChecklist, ChecklistItem } from '../../types/workspace.types';
import { Card } from '../ui/Card';

interface AssessmentChecklistCardProps {
  checklist: AssessmentChecklist;
}

export const AssessmentChecklistCard: React.FC<AssessmentChecklistCardProps> = ({
  checklist,
}) => {
  const sections: { title: string; stage: string; items: ChecklistItem[] }[] = [
    { title: '1. Planning & Setup', stage: 'PLANNING', items: checklist.planning },
    { title: '2. Target Scope Definition', stage: 'SCOPING', items: checklist.scope },
    { title: '3. Vulnerability Assessment', stage: 'ASSESSMENT', items: checklist.assessment },
    { title: '4. Threat Analysis & Risk Engine', stage: 'ANALYSIS', items: checklist.analysis },
    { title: '5. Executive Reporting & Deliverables', stage: 'REPORTING', items: checklist.reporting },
  ];

  const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);
  const completedItems = sections.reduce(
    (acc, s) => acc + s.items.filter((i) => i.completed).length,
    0
  );

  return (
    <Card variant="default" className="p-6 bg-bg-card border-border-dark space-y-4 shadow-card-dark">
      <div className="flex items-center justify-between pb-3 border-b border-border-dark">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm sm:text-base font-bold text-text-primary">
            Engagement Assessment Checklist
          </h3>
        </div>
        <span className="text-xs font-mono text-text-muted">
          {completedItems} of {totalItems} Milestones Completed
        </span>
      </div>

      <div className="space-y-4">
        {sections.map((sec) => (
          <div key={sec.title} className="space-y-2 text-left">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider block">
              {sec.title}
            </span>

            <div className="space-y-1.5 pl-1">
              {sec.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-bg-surface border border-border-dark/60 text-xs hover:border-brand-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-text-disabled shrink-0" />
                    )}
                    <span className={item.completed ? 'text-text-primary font-medium' : 'text-text-muted'}>
                      {item.title}
                    </span>
                  </div>

                  {item.actionUrl && (
                    <Link
                      to={item.actionUrl}
                      className="text-[11px] font-mono text-brand-hover hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Jump</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
