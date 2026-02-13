import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { AuthPanel } from './AuthPanel';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui';

type AuthMode = 'login' | 'register';

type Props = {
  open: boolean;
  mode: AuthMode;
  onOpenChange: (open: boolean) => void;
  onModeChange: (mode: AuthMode) => void;
  onAuthSuccess: () => void;
};

export function AuthDialog({ open, mode, onOpenChange, onModeChange, onAuthSuccess }: Props) {
  const { t: translate } = useTranslation(['auth', 'app']);
  const navigate = useNavigate();
  const title = mode === 'login' ? translate('auth:loginTitle') : translate('auth:registerTitle');
  const description =
    mode === 'login'
      ? translate('auth:loginDescription')
      : translate('auth:registerDescription');
  const highlights = [
    translate('app:featureTasks'),
    translate('app:featureFiles'),
    translate('app:featureSecurity'),
  ];

  const toForgotPassword = () => {
    onOpenChange(false);
    void navigate({ to: '/forgot-password' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-border/90 bg-card p-0 sm:max-w-4xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="edu-auth-side hidden p-7 lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-3">
              <span className="edu-chip w-fit">{translate('app:title')}</span>
              <h3 className="text-3xl font-semibold leading-tight">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            <ul className="space-y-2.5">
              {highlights.map((item) => (
                <li key={item} className="edu-auth-step flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>

          <div className="p-4 sm:p-6 lg:p-7">
            <AuthPanel onAuth={onAuthSuccess} mode={mode} onModeChange={onModeChange} />
            {mode === 'login' && (
              <Button variant="link" className="mt-3 w-full text-muted-foreground" onClick={toForgotPassword}>
                {translate('auth:forgotPasswordLink')}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
