import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `password-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="space-y-1.5 text-left">
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-text-secondary tracking-wide"
        >
          {label}
        </label>
      </div>

      <div className="relative rounded-lg shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
          <Lock className="h-4 w-4" />
        </div>

        <input
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          className={`block w-full pl-9 pr-10 py-2.5 bg-bg-elevated text-text-primary text-sm rounded-lg border transition-all duration-200 placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary ${
            error
              ? 'border-[#EF4444] focus:ring-[#EF4444]/30 focus:border-[#EF4444]'
              : 'border-border-dark hover:border-border-subtle'
          } ${className}`}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary focus:outline-none focus:text-brand-hover transition-colors"
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-text-muted hover:text-brand-hover" />
          ) : (
            <Eye className="h-4 w-4 text-text-muted hover:text-brand-hover" />
          )}
        </button>
      </div>

      {error ? (
        <p className="text-[11px] text-[#EF4444] font-medium animate-in fade-in duration-200">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-text-muted">{helperText}</p>
      ) : null}
    </div>
  );
};
