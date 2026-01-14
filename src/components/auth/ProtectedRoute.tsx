import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireLevel?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireLevel = true }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { data: profile, isLoading: profileLoading } = useUserProfile();

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // إذا كان المستخدم لم يحدد مستواه بعد وليس في صفحة الاختبار
  if (requireLevel && profile && !profile.current_level && location.pathname !== '/placement-test') {
    return <Navigate to="/placement-test" replace />;
  }

  return <>{children}</>;
};
