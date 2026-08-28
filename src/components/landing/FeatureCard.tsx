import React from 'react';
import { Card } from '../ui/Card';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tag?: string;
  badgeContent?: React.ReactNode;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  tag,
  badgeContent,
}) => {
  return (
    <Card
      variant="default"
      hoverEffect
      className="group relative flex flex-col justify-between h-full p-6 sm:p-7 bg-bg-card border-border-dark hover:border-brand-primary/40 transition-all duration-300"
    >
      {/* Subtle top card glow on hover */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-brand-primary/0 to-transparent group-hover:via-brand-primary/70 transition-all duration-500 rounded-t-xl" />

      <div className="space-y-4">
        {/* Header / Icon */}
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary/20 group-hover:text-brand-hover group-hover:scale-105 transition-all duration-300">
            {icon}
          </div>
          {tag && (
            <span className="text-[11px] font-mono font-medium text-text-muted bg-bg-surface px-2.5 py-1 rounded-md border border-border-dark">
              {tag}
            </span>
          )}
          {badgeContent}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-text-primary group-hover:text-white transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-text-muted leading-relaxed group-hover:text-text-secondary transition-colors">
          {description}
        </p>
      </div>

      {/* Footer subtle accent */}
      <div className="pt-5 mt-4 border-t border-border-dark/60 flex items-center justify-between text-xs text-text-muted">
        <span className="font-mono text-[11px]">ASSISTANT_FEATURE</span>
        <span className="text-brand-primary group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </Card>
  );
};
