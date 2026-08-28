import React from 'react';

export type SeverityType = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type BadgeVariant = SeverityType | 'brand' | 'neutral' | 'outline';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  dot = false,
  pulse = false,
  children,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium tracking-wide',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wide',
  };

  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    critical: {
      container: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30',
      dot: 'bg-[#EF4444]',
    },
    high: {
      container: 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30',
      dot: 'bg-[#F97316]',
    },
    medium: {
      container: 'bg-[#EAB308]/10 text-[#EAB308] border-[#EAB308]/30',
      dot: 'bg-[#EAB308]',
    },
    low: {
      container: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30',
      dot: 'bg-[#22C55E]',
    },
    info: {
      container: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30',
      dot: 'bg-[#3B82F6]',
    },
    brand: {
      container: 'bg-[#8B5CF6]/15 text-[#A78BFA] border-[#8B5CF6]/40',
      dot: 'bg-[#8B5CF6]',
    },
    neutral: {
      container: 'bg-[#1E293B]/60 text-[#CBD5E1] border-[#1E293B]',
      dot: 'bg-[#94A3B8]',
    },
    outline: {
      container: 'bg-transparent text-[#94A3B8] border-[#1E293B]',
      dot: 'bg-[#64748B]',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-colors ${sizeStyles[size]} ${currentVariant.container} ${className}`}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentVariant.dot}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${currentVariant.dot}`} />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
};
