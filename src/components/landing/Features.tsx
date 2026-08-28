import React from 'react';
import { Cpu, BarChart3, Layers, FileText, CheckCircle2 } from 'lucide-react';
import { FeatureCard } from './FeatureCard';
import { Badge } from '../ui/Badge';

export const Features: React.FC = () => {
  const features = [
    {
      icon: <Cpu className="w-6 h-6" />,
      title: 'AI-Powered Analysis',
      description: 'Context-aware AI assistance for understanding security findings, CWE classifications, attack vectors, and underlying root causes.',
      tag: 'CORE ENGINE',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Risk Prioritization',
      description: 'Identify and prioritize vulnerabilities based on real-world security impact, exploitability metrics, and asset criticality.',
      tag: 'SCORING',
    },
    {
      icon: <Layers className="w-6 h-6" />,
      title: 'Finding Management',
      description: 'Organize vulnerabilities, raw evidence, severity ratings, business impact assessments, and actionable remediation steps in unified workspaces.',
      tag: 'WORKFLOW',
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Report Generation',
      description: 'Generate structured, executive-ready, and technical security assessment reports tailored for stakeholders, engineers, and auditors.',
      tag: 'REPORTING',
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 relative bg-bg-surface/50 border-t border-b border-border-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14 md:mb-18">
          <Badge variant="brand" size="md">
            Capabilities & Features
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text-primary tracking-tight">
            Engineered for Authorized Red Teams
          </h2>
          <p className="text-sm sm:text-base text-text-muted">
            High-density security tooling designed to supercharge your assessment lifecycle from initial finding ingestion to final stakeholder reporting.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => (
            <FeatureCard
              key={feat.title}
              icon={feat.icon}
              title={feat.title}
              description={feat.description}
              tag={feat.tag}
            />
          ))}
        </div>

        {/* Feature Bottom Callout / Assurance */}
        <div className="mt-12 p-4 sm:p-5 rounded-xl bg-bg-card border border-border-dark flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-[#22C55E]" />
            <span className="text-xs sm:text-sm text-text-secondary">
              Strictly non-intrusive: All AI models function as analytical co-pilots with no external exploit automation.
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
            <CheckCircle2 className="w-4 h-4 text-brand-primary" />
            <span>ENTERPRISE_READY</span>
          </div>
        </div>

      </div>
    </section>
  );
};
