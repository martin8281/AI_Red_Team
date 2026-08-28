import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../ui/Button';

export const ForgotPasswordForm: React.FC = () => {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError('Please enter your account email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address format.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await forgotPassword({ email: email.trim() });
      if (response.success) {
        setSuccessMessage(
          response.message ||
            `If an account matches ${email.trim()}, a secure password reset link has been dispatched.`
        );
      } else {
        setError(response.error || 'Failed to request password reset.');
      }
    } catch {
      setError('An error occurred while requesting password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successMessage) {
    return (
      <div className="space-y-5 text-center py-2 animate-in fade-in duration-300">
        <div className="w-14 h-14 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center mx-auto text-[#22C55E]">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-bold text-text-primary">
            Reset Link Dispatched
          </h3>
          <p className="text-xs text-text-muted leading-relaxed max-w-xs mx-auto">
            {successMessage}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-bg-elevated border border-border-dark text-[11px] text-text-secondary">
          <span>Note: In this preview phase, email dispatch is simulated. No actual emails will be transmitted.</span>
        </div>

        <div className="pt-2">
          <Button
            to="/login"
            variant="primary"
            size="md"
            fullWidth
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-start gap-2 text-xs text-[#EF4444] animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <p className="text-xs text-text-muted text-left">
        Enter your authorized account email and we will generate a secure reset link.
      </p>

      {/* Email Input */}
      <div className="space-y-1.5 text-left">
        <label
          htmlFor="forgot-email"
          className="block text-xs font-semibold text-text-secondary tracking-wide"
        >
          Account Email
        </label>
        <div className="relative rounded-lg shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
            <Mail className="h-4 w-4" />
          </div>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tester@redteam.local"
            className="block w-full pl-9 pr-3 py-2.5 bg-bg-elevated text-text-primary text-sm rounded-lg border border-border-dark hover:border-border-subtle transition-all duration-200 placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2 space-y-2.5">
        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          disabled={isSubmitting}
          icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
        >
          {isSubmitting ? 'Sending Request...' : 'Send Reset Link'}
        </Button>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </form>
  );
};
