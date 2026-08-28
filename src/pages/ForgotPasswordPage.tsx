import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';

export const ForgotPasswordPage: React.FC = () => {
  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Recover access to your security testing co-pilot account."
      footerText="Remembered your password?"
      footerLink={{
        text: 'Sign In',
        to: '/login',
      }}
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
};
