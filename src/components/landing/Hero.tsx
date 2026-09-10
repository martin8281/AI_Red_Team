import React from 'react';
import { ArrowRight, ShieldCheck, Lock, Terminal, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SecurityPreview } from './SecurityPreview';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-grid-pattern bg-radial-gradient">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Copy & Actions */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-left">
            
            {/* Top Pill Tag */}
            <div className="inline-flex items-center gap-2">
              <Badge variant="brand" size="md" dot>
                Enterprise AI Co-pilot
              </Badge>
              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-text-muted">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                Authorized Assessments Only
              </span>
            </div>

            {/* Headline & Subheading */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary leading-[1.15]">
                <span className="block"><span className="text-brand-primary">AI</span> <span className="text-[#e00000]">RED</span> <span className="text-white">TEAM</span></span>
                <span className="block text-white">
                  ASSISTANT
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl font-medium text-text-secondary">
                Your intelligent co-pilot for authorized security testing.
              </p>
            </div>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-xl">
              Analyze vulnerabilities, prioritize risks, understand findings, and generate professional security reports with AI-assisted workflows.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Button
                to="/register"
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Get Started
              </Button>
              <Button
                to="/login"
                variant="outline"
                size="lg"
              >
                Sign In
              </Button>
            </div>

            {/* Trust & Model Highlights */}
            <div className="pt-6 border-t border-border-dark grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Lock className="w-4 h-4 text-brand-primary shrink-0" />
                <span>Human-in-the-loop model</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Terminal className="w-4 h-4 text-brand-primary shrink-0" />
                <span>No autonomous attacks</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Sparkles className="w-4 h-4 text-brand-primary shrink-0" />
                <span>Context-aware assistance</span>
              </div>
            </div>

          </div>

          {/* Right Column: AI Security Visualization */}
          <div className="lg:col-span-6 w-full flex justify-center lg:justify-end">
            <SecurityPreview />
          </div>

        </div>
      </div>
    </section>
  );
};
