import React from 'react';
import { FolderPlus, PlusCircle, Sparkles, BarChart2, FileCheck, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Create Project',
      description: 'Define your assessment scope, engagement boundaries, and target specifications.',
      icon: <FolderPlus className="w-5 h-5 text-brand-primary" />,
    },
    {
      step: '02',
      title: 'Add Findings',
      description: 'Log verified vulnerabilities, evidence payloads, HTTP traces, and observations.',
      icon: <PlusCircle className="w-5 h-5 text-brand-primary" />,
    },
    {
      step: '03',
      title: 'AI Analysis',
      description: 'AI assists in interpreting vulnerability mechanics, root causes, and blast radius.',
      icon: <Sparkles className="w-5 h-5 text-brand-primary" />,
    },
    {
      step: '04',
      title: 'Prioritize Risk',
      description: 'Score severity and rank issues dynamically based on asset criticality and impact.',
      icon: <BarChart2 className="w-5 h-5 text-brand-primary" />,
    },
    {
      step: '05',
      title: 'Generate Report',
      description: 'Export professional, audit-ready security assessment reports in minutes.',
      icon: <FileCheck className="w-5 h-5 text-brand-primary" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 relative bg-bg-main overflow-hidden">
      
      {/* Subtle background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-brand-primary/5 blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="brand" size="md">
            Workflow Architecture
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text-primary tracking-tight">
            How It Works
          </h2>
          <p className="text-sm sm:text-base text-text-muted">
            A structured, 5-step human-in-the-loop workflow from initial engagement setup to executive deliverable export.
          </p>
        </div>

        {/* Desktop Horizontal Workflow */}
        <div className="hidden lg:grid grid-cols-5 gap-4 relative">
          
          {steps.map((item, index) => (
            <div key={item.step} className="relative flex flex-col group">
              
              {/* Connector line between steps */}
              {index < steps.length - 1 && (
                <div className="absolute top-7 left-[calc(50%+24px)] w-[calc(100%-48px)] h-[2px] bg-border-dark group-hover:bg-brand-primary/40 transition-colors z-0 flex items-center justify-end">
                  <ArrowRight className="w-3 h-3 text-border-dark group-hover:text-brand-primary -mr-1 transition-colors" />
                </div>
              )}

              {/* Step Card */}
              <div className="relative z-10 flex flex-col h-full p-5 rounded-xl bg-bg-card border border-border-dark group-hover:border-brand-primary/50 group-hover:bg-bg-elevated transition-all duration-300">
                
                {/* Step Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-bg-surface border border-border-dark flex items-center justify-center group-hover:border-brand-primary/40 group-hover:bg-brand-primary/10 transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-xs font-mono font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20">
                    {item.step}
                  </span>
                </div>

                {/* Step Content */}
                <h3 className="text-base font-bold text-text-primary mb-2 group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed group-hover:text-text-secondary transition-colors">
                  {item.description}
                </p>

              </div>
            </div>
          ))}

        </div>

        {/* Mobile / Tablet Vertical Workflow */}
        <div className="lg:hidden space-y-4 relative">
          {/* Vertical Connecting Track */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border-dark -z-0" />

          {steps.map((item) => (
            <div
              key={item.step}
              className="relative z-10 flex items-start gap-4 p-4 sm:p-5 rounded-xl bg-bg-card border border-border-dark hover:border-brand-primary/40 transition-colors"
            >
              {/* Step Icon Badge */}
              <div className="w-12 h-12 rounded-xl bg-bg-elevated border border-border-dark flex items-center justify-center shrink-0 text-brand-primary shadow-md">
                {item.icon}
              </div>

              {/* Text Info */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-text-primary">
                    {item.title}
                  </h3>
                  <span className="text-xs font-mono font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20">
                    Step {item.step}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
