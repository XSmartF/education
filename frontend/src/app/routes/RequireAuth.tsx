import React from 'react';
import { Navigate } from '@tanstack/react-router';
import { useAuth } from '@/domains/auth/hooks/use-auth';

type RequireAuthProps = {
  Component: React.ComponentType<unknown>;
};

export default function RequireAuth({ Component }: RequireAuthProps) {
  const auth = useAuth();

  if (auth.isBootstrapping) return null;
  if (!auth.isAuthenticated) return <Navigate to="/login" />;

  return <Component />;
}
