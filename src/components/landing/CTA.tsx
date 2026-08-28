import React from 'react';
import { ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const CTA: React.FC = () => {
  return (
    <section className="py-20 md:py-28 relative bg-bg-main overflow-hidden border-t border-border-dark">
      
      {/* Background purple accent flare */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-primary/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        <div className="p-8 sm:p-12 md:p-16 rounded-3xl bg-bg-card border border-border-dark shadow-2xl relative overflow-hidden">
          
          {/* Subtle top border gradient */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent" />

          <div className="max-w-2xl mx-auto space-y-6">
            
            <div className="inline-flex items-center justify-center">
              <Badge variant="brand" size="md">
                Phase 1 Preview Ready
              </Badge>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight leading-tight">
              Ready to enhance your security testing workflow?
            </h2>

            <p className="text-sm sm:text-base text-text-muted leading-relaxed">
              AI-powered assistance for authorized security professionals.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                to="/register"
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Get Started
              </Button>
              <Button
                to="/login"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                Sign In
              </Button>
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                <span>Authorized Security Professionals</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-brand-primary" />
                <span>Zero Autonomous Exploits</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
