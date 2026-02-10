import { Navigate, useNavigate } from '@tanstack/react-router';
import { AuthPanel } from '@/domains/auth/ui/AuthPanel';
import { useAuth } from '@/domains/auth/hooks/use-auth';

export default function RegisterPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  if (auth.isAuthenticated) {
    return <Navigate to="/todos" />;
  }

  const onAuth = () => {
    auth.setAuthenticated(true);
    navigate({ to: '/todos' });
  };

  return (
    <section className="flex justify-center">
      <AuthPanel
        onAuth={onAuth}
        mode="register"
        onModeChange={() => navigate({ to: '/login' })}
      />
    </section>
  );
}
