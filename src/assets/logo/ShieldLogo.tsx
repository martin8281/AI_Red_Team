import React from 'react';

interface ShieldLogoProps {
  className?: string;
  size?: number;
}

export const ShieldLogo: React.FC<ShieldLogoProps> = ({ className = '', size = 28 }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-brand-primary"
      >
        <path
          d="M12 2L3 6.5V11.5C3 16.75 6.84 21.6 12 22.8C17.16 21.6 21 16.75 21 11.5V6.5L12 2Z"
          fill="#101827"
          stroke="#8B5CF6"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 6.5V17.5M8 10L12 6.5L16 10M8.5 14L12 11.5L15.5 14"
          stroke="#A78BFA"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="1.5" fill="#8B5CF6" />
      </svg>
      {/* Subtle core glow */}
      <div className="absolute inset-0 bg-brand-primary/20 blur-sm rounded-full -z-10" />
    </div>
  );
};
