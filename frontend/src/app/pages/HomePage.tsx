import { Navigate } from '@tanstack/react-router';
import { useAuth } from '@/domains/auth/hooks/use-auth';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/todos' : '/login'} />;
}
