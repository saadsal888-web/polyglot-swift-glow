import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface GuestAllowedRouteProps {
  children: React.ReactNode;
}

/**
 * A route wrapper that allows both authenticated and guest users.
 * Unlike ProtectedRoute, this doesn't redirect to /auth.
 * The child component is responsible for handling guest vs. authenticated user logic.
 */
export const GuestAllowedRoute: React.FC<GuestAllowedRouteProps> = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};
