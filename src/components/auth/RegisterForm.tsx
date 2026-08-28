import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, CheckCircle2, XCircle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { SecurityRole } from '../../auth/auth.types';
import { Button } from '../ui/Button';
import { PasswordInput } from './PasswordInput';

export const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<SecurityRole>('Security Tester');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    role?: string;
    terms?: string;
    general?: string;
  }>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password rule evaluation
  const passRules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const isPasswordValid = passRules.length && passRules.upper && passRules.lower && passRules.number;

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (!isPasswordValid) {
      newErrors.password = 'Password does not meet all security complexity requirements.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirmation password is required.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the authorized security testing terms and rules of engagement.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        role,
        acceptTerms,
      });

      if (response.success) {
        setSuccessMessage(response.message || 'Registration successful! Redirecting to sign in...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setErrors({ general: response.error || 'Registration failed.' });
      }
    } catch {
      setErrors({ general: 'An unexpected error occurred during registration.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Success banner */}
      {successMessage && (
        <div className="p-3 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-start gap-2 text-xs text-[#22C55E] animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* General Error Banner */}
      {errors.general && (
        <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-start gap-2 text-xs text-[#EF4444] animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1.5 text-left">
        <label
          htmlFor="register-name"
          className="block text-xs font-semibold text-text-secondary tracking-wide"
        >
          Full Name
        </label>
        <div className="relative rounded-lg shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
            <User className="h-4 w-4" />
          </div>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jane Doe"
            className={`block w-full pl-9 pr-3 py-2.5 bg-bg-elevated text-text-primary text-sm rounded-lg border transition-all duration-200 placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary ${
              errors.name
                ? 'border-[#EF4444] focus:ring-[#EF4444]/30 focus:border-[#EF4444]'
                : 'border-border-dark hover:border-border-subtle'
            }`}
          />
        </div>
        {errors.name && (
          <p className="text-[11px] text-[#EF4444] font-medium">{errors.name}</p>
        )}
      </div>

      {/* Email Address */}
      <div className="space-y-1.5 text-left">
        <label
          htmlFor="register-email"
          className="block text-xs font-semibold text-text-secondary tracking-wide"
        >
          Work Email
        </label>
        <div className="relative rounded-lg shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
            <Mail className="h-4 w-4" />
          </div>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tester@company.security"
            className={`block w-full pl-9 pr-3 py-2.5 bg-bg-elevated text-text-primary text-sm rounded-lg border transition-all duration-200 placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary ${
              errors.email
                ? 'border-[#EF4444] focus:ring-[#EF4444]/30 focus:border-[#EF4444]'
                : 'border-border-dark hover:border-border-subtle'
            }`}
          />
        </div>
        {errors.email && (
          <p className="text-[11px] text-[#EF4444] font-medium">{errors.email}</p>
        )}
      </div>

      {/* Security Role (Security Tester [default], Security Lead, Viewer — NO ADMIN) */}
      <div className="space-y-1.5 text-left">
        <label
          htmlFor="register-role"
          className="block text-xs font-semibold text-text-secondary tracking-wide"
        >
          Security Role
        </label>
        <div className="relative rounded-lg shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
            <Shield className="h-4 w-4" />
          </div>
          <select
            id="register-role"
            value={role}
            onChange={(e) => setRole(e.target.value as SecurityRole)}
            className="block w-full pl-9 pr-8 py-2.5 bg-bg-elevated text-text-primary text-sm rounded-lg border border-border-dark hover:border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all duration-200 appearance-none cursor-pointer"
          >
            <option value="Security Tester">Security Tester (Default)</option>
            <option value="Security Lead">Security Lead</option>
            <option value="Viewer">Viewer</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-muted text-xs">
            ▼
          </div>
        </div>
        <p className="text-[10px] text-text-muted">
          Administrative accounts are managed exclusively through internal authorization.
        </p>
      </div>

      {/* Password */}
      <PasswordInput
        id="register-password"
        label="Password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="••••••••••••"
      />

      {/* Password Strength Checklist */}
      {password && (
        <div className="p-3 rounded-lg bg-bg-elevated border border-border-dark space-y-1.5 text-[11px]">
          <span className="font-semibold text-text-secondary block mb-1">
            Password Requirements:
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <div className={`flex items-center gap-1.5 ${passRules.length ? 'text-[#22C55E]' : 'text-text-muted'}`}>
              {passRules.length ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              <span>8+ Characters</span>
            </div>
            <div className={`flex items-center gap-1.5 ${passRules.upper ? 'text-[#22C55E]' : 'text-text-muted'}`}>
              {passRules.upper ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              <span>Uppercase Letter</span>
            </div>
            <div className={`flex items-center gap-1.5 ${passRules.lower ? 'text-[#22C55E]' : 'text-text-muted'}`}>
              {passRules.lower ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              <span>Lowercase Letter</span>
            </div>
            <div className={`flex items-center gap-1.5 ${passRules.number ? 'text-[#22C55E]' : 'text-text-muted'}`}>
              {passRules.number ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              <span>Number (0-9)</span>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Password */}
      <PasswordInput
        id="register-confirm-password"
        label="Confirm Password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
        placeholder="••••••••••••"
      />

      {/* Terms & Authorization Acceptance */}
      <div className="pt-1 text-left space-y-1">
        <label className="flex items-start gap-2 cursor-pointer select-none text-xs text-text-secondary hover:text-text-primary">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded bg-bg-elevated border-border-dark text-brand-primary focus:ring-brand-primary/50 focus:ring-offset-bg-main"
          />
          <span className="leading-snug">
            I confirm that I am an authorized security professional and agree to use this co-pilot strictly within approved scopes and rules of engagement.
          </span>
        </label>
        {errors.terms && (
          <p className="text-[11px] text-[#EF4444] font-medium pl-6">{errors.terms}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-3">
        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          disabled={isSubmitting}
          icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
        >
          {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
        </Button>
      </div>
    </form>
  );
};
