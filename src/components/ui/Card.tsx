import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass';
  hoverEffect?: boolean;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverEffect = false,
  interactive = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-bg-card border-border-dark',
    elevated: 'bg-bg-elevated border-border-dark shadow-card-dark',
    glass: 'bg-[#0B1220]/80 backdrop-blur-md border-border-dark shadow-card-dark',
  };

  const hoverStyles = hoverEffect
    ? 'transition-all duration-300 hover:border-border-subtle hover:bg-bg-elevated hover:shadow-purple-subtle'
    : '';

  const interactiveStyles = interactive
    ? 'cursor-pointer active:scale-[0.99] transition-transform'
    : '';

  return (
    <div
      className={`rounded-xl border p-6 text-text-primary ${variantStyles[variant]} ${hoverStyles} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
