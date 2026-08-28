import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your authorized security testing workspace."
      footerText="Don't have an authorized account?"
      footerLink={{
        text: 'Request Onboarding / Register',
        to: '/register',
      }}
    >
      <LoginForm />
    </AuthLayout>
  );
};
