import React from 'react';
import { 
  UserCheck, 
  Sparkles, 
  Search, 
  TrendingUp, 
  Sliders, 
  Compass, 
  FileEdit, 
  FileText,
  Shield,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

export const HumanInLoop: React.FC = () => {
  const capabilities = [
    {
      icon: <Search className="w-5 h-5" />,
      title: 'Finding analysis',
      description: 'Rapid contextual assessment of vulnerability mechanics, CWE categories, and root cause dynamics.',
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Risk interpretation',
      description: 'Translates technical flaws into tangible business impact and realistic threat models.',
    },
    {
      icon: <Sliders className="w-5 h-5" />,
      title: 'Prioritization',
      description: 'Data-backed ranking recommendations based on ease of exploitation, asset exposure, and severity.',
    },
    {
      icon: <Compass className="w-5 h-5" />,
      title: 'Test suggestions',
      description: 'Provides authorized testing methodologies and boundary conditions for manual validation.',
    },
    {
      icon: <FileEdit className="w-5 h-5" />,
      title: 'Documentation',
      description: 'Structures reproducible steps, impact summaries, and technical evidence logs seamlessly.',
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: 'Report generation',
      description: 'Synthesizes findings into comprehensive, executive and technical security deliverables.',
    },
  ];

  return (
    <section id="security" className="py-20 md:py-28 relative bg-bg-surface/40 border-t border-border-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="brand" size="md" dot>
            Governance & Safety Model
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text-primary tracking-tight">
            Human-in-the-loop security
          </h2>
          <p className="text-base sm:text-lg font-medium text-brand-hover">
            AI assists the security tester — it does not replace the tester.
          </p>
          <p className="text-sm text-text-muted max-w-2xl mx-auto leading-relaxed">
            Our platform guarantees that human security professionals remain in complete control of testing scope, verification decisions, and final remediation dispatch.
          </p>
        </div>

        {/* 6 Core Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {capabilities.map((cap) => (
            <Card
              key={cap.title}
              variant="default"
              hoverEffect
              className="p-5 sm:p-6 bg-bg-card border-border-dark hover:border-brand-primary/40 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary">
                  {cap.icon}
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  {cap.title}
                </h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  {cap.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border-dark/50 flex items-center gap-1.5 text-[11px] font-mono text-brand-hover">
                <Sparkles className="w-3 h-3 text-brand-primary" />
                <span>AI ASSISTED</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Model Architecture Dual Matrix: AI Co-Pilot vs Human Control */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 sm:p-8 rounded-2xl bg-bg-card border border-border-dark">
          
          {/* AI Co-Pilot Role (Purple Accents) */}
          <div className="space-y-4 p-5 rounded-xl bg-bg-elevated/60 border border-brand-primary/30">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-brand-primary/20 text-brand-primary border border-brand-primary/40">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">AI Co-Pilot Role</h3>
                <p className="text-xs text-text-muted">Analytical & Drafting Assistance</p>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                <span>Accelerates vulnerability analysis and root cause identification</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                <span>Suggests remediation strategies according to industry standards (OWASP, NIST)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                <span>Generates structured draft reports, saving hours of manual documentation</span>
              </li>
            </ul>
          </div>

          {/* Human Tester Role (Green/Shield Accents) */}
          <div className="space-y-4 p-5 rounded-xl bg-bg-elevated/60 border border-[#22C55E]/30">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Human Tester Role</h3>
                <p className="text-xs text-text-muted">Sole Authority & Testing Execution</p>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                <span>Manually conducts and approves all authorized security testing activities</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                <span>Reviews and validates all AI-generated suggestions before acceptance</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                <span>Maintains full legal authorization, scope compliance, and operational governance</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
};
