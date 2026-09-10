import React from 'react';

interface ShieldLogoProps {
  className?: string;
  size?: number;
}

export const ShieldLogo: React.FC<ShieldLogoProps> = ({ className = '', size = 32 }) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center flex-shrink-0 group ${className}`} 
      style={{ width: size, height: size }}
    >
      <img
        src="/logo.png"
        alt="AI Red Team Assistant Emblem"
        className="w-full h-full object-contain object-center transform group-hover:scale-105 transition-transform duration-200"
        loading="eager"
      />
    </div>
  );
};
