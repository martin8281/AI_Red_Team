import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, AlertCircle, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../ui/Button';
import { PasswordInput } from './PasswordInput';

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Return to previous target route or fallback to /dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address format.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await login({
        email: email.trim(),
        password,
        rememberMe,
      });

      if (response.success) {
        navigate(from, { replace: true });
      } else {
        setErrors({ general: response.error || 'Authentication failed.' });
      }
    } catch {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick filler for tester convenience during verification
  const handleFillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('RedTeam@2026');
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* General Error Banner */}
      {errors.general && (
        <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-start gap-2 text-xs text-[#EF4444] animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* Email Input */}
      <div className="space-y-1.5 text-left">
        <label
          htmlFor="login-email"
          className="block text-xs font-semibold text-text-secondary tracking-wide"
        >
          Email Address
        </label>
        <div className="relative rounded-lg shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
            <Mail className="h-4 w-4" />
          </div>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tester@redteam.local"
            className={`block w-full pl-9 pr-3 py-2.5 bg-bg-elevated text-text-primary text-sm rounded-lg border transition-all duration-200 placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary ${
              errors.email
                ? 'border-[#EF4444] focus:ring-[#EF4444]/30 focus:border-[#EF4444]'
                : 'border-border-dark hover:border-border-subtle'
            }`}
          />
        </div>
        {errors.email && (
          <p className="text-[11px] text-[#EF4444] font-medium animate-in fade-in duration-200">
            {errors.email}
          </p>
        )}
      </div>

      {/* Password Input */}
      <PasswordInput
        id="login-password"
        label="Password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="••••••••••••"
      />

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none text-text-secondary hover:text-text-primary">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded bg-bg-elevated border-border-dark text-brand-primary focus:ring-brand-primary/50 focus:ring-offset-bg-main"
          />
          <span>Remember me</span>
        </label>

        <Link
          to="/forgot-password"
          className="text-xs text-brand-hover hover:underline focus:outline-none focus:ring-1 focus:ring-brand-primary rounded"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          disabled={isSubmitting}
          icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
        >
          {isSubmitting ? 'Authenticating...' : 'Sign In'}
        </Button>
      </div>

      {/* Demo Credentials Quick-Select Pill */}
      <div className="pt-3 border-t border-border-dark/60">
        <div className="flex items-center justify-between text-[11px] text-text-muted mb-2">
          <span className="flex items-center gap-1 font-mono">
            <KeyRound className="w-3 h-3 text-brand-primary" />
            Quick Demo Accounts:
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={() => handleFillDemo('tester@redteam.local')}
            className="py-1 px-2 rounded bg-bg-surface hover:bg-bg-elevated border border-border-dark hover:border-brand-primary/40 text-text-secondary text-center transition-colors"
          >
            Tester
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo('lead@redteam.local')}
            className="py-1 px-2 rounded bg-bg-surface hover:bg-bg-elevated border border-border-dark hover:border-brand-primary/40 text-text-secondary text-center transition-colors"
          >
            Lead
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo('viewer@redteam.local')}
            className="py-1 px-2 rounded bg-bg-surface hover:bg-bg-elevated border border-border-dark hover:border-brand-primary/40 text-text-secondary text-center transition-colors"
          >
            Viewer
          </button>
        </div>
      </div>
    </form>
  );
};
