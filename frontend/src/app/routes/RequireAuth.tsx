import React from 'react';
import { Navigate } from '@tanstack/react-router';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import type { AccessRole } from '@/app/config/navigation';
import { canAccessByRole } from '@/app/config/navigation';

type RequireAuthProps = {
  Component: React.ComponentType<unknown>;
  requireAuth?: boolean;
  allowedRoles?: AccessRole[];
  unauthenticatedRedirectTo?: '/login' | '/';
  unauthorizedRedirectTo?: '/';
};

export default function RequireAuth({
  Component,
  requireAuth = true,
  allowedRoles,
  unauthenticatedRedirectTo = '/login',
  unauthorizedRedirectTo = '/',
}: RequireAuthProps) {
  const auth = useAuth();

  if (auth.isBootstrapping) {
    return null;
  }

  if (requireAuth && !auth.isAuthenticated) {
    return <Navigate to={unauthenticatedRedirectTo} replace />;
  }

  if (requireAuth && !canAccessByRole(auth.roles, allowedRoles)) {
    return <Navigate to={unauthorizedRedirectTo} replace />;
  }

  return <Component />;
}
