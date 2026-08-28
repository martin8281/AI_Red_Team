import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { RegisterForm } from '../components/auth/RegisterForm';

export const RegisterPage: React.FC = () => {
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Register as an authorized security tester or lead."
      footerText="Already have an authorized account?"
      footerLink={{
        text: 'Sign In',
        to: '/login',
      }}
    >
      <RegisterForm />
    </AuthLayout>
  );
};
