import React from 'react';
import { Severity } from '../../types/finding.types';

interface SeverityBadgeProps {
  severity: Severity;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = 'md',
  dot = true,
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-mono font-bold tracking-wide',
    md: 'text-xs px-2.5 py-1 font-mono font-bold tracking-wide',
  };

  const severityStyles: Record<Severity, { container: string; dotColor: string }> = {
    CRITICAL: {
      container: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30',
      dotColor: 'bg-[#EF4444]',
    },
    HIGH: {
      container: 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30',
      dotColor: 'bg-[#F97316]',
    },
    MEDIUM: {
      container: 'bg-[#EAB308]/10 text-[#EAB308] border-[#EAB308]/30',
      dotColor: 'bg-[#EAB308]',
    },
    LOW: {
      container: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30',
      dotColor: 'bg-[#22C55E]',
    },
    INFORMATIONAL: {
      container: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30',
      dotColor: 'bg-[#3B82F6]',
    },
  };

  const current = severityStyles[severity] || severityStyles.INFORMATIONAL;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeStyles[size]} ${current.container}`}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {severity === 'CRITICAL' && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.dotColor}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${current.dotColor}`} />
        </span>
      )}
      <span>{severity}</span>
    </span>
  );
};
