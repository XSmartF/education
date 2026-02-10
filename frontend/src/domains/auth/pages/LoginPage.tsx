import { Navigate, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { AuthPanel } from '@/domains/auth/ui/AuthPanel';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import { CButton } from '@/shared/components';

export default function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { t: translate } = useTranslation(['auth']);

  if (auth.isAuthenticated) {
    return <Navigate to="/todos" />;
  }

  const onAuth = () => {
    auth.setAuthenticated(true);
    navigate({ to: '/todos' });
  };

  return (
    <section className="flex flex-col items-center gap-2">
      <AuthPanel
        onAuth={onAuth}
        mode="login"
        onModeChange={() => navigate({ to: '/register' })}
      />
      <CButton variant="link" onClick={() => navigate({ to: '/forgot-password' })}>
        {translate('auth:forgotPasswordLink')}
      </CButton>
    </section>
  );
}
