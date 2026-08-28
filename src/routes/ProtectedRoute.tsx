import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ShieldLogo } from '../assets/logo/ShieldLogo';

interface RouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<RouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center space-y-4">
        <ShieldLogo size={40} />
        <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
          <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
          <span>Verifying Authorized Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export const PublicOnlyRoute: React.FC<RouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center space-y-4">
        <ShieldLogo size={40} />
        <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
          <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
          <span>Checking Session...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
