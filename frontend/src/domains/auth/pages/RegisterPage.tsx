import { Navigate } from '@tanstack/react-router';
import { useAuth } from '@/domains/auth/hooks/use-auth';

export default function RegisterPage() {
  const auth = useAuth();

  if (auth.isAuthenticated) {
    return <Navigate to="/courses" />;
  }

  return <Navigate to="/" search={{ auth: 'register' } as never} replace />;
}
