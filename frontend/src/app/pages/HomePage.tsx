import { Link, Navigate } from '@tanstack/react-router';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { t: translate } = useTranslation(['app', 'nav']);
  const features = [
    translate('app:featureCourses'),
    translate('app:featureMarketplace'),
    translate('app:featureWallet'),
  ];

  if (isAuthenticated) {
    return <Navigate to="/courses" />;
  }

  return (
    <Card className="relative max-w-3xl overflow-hidden border-primary/20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent" />
      <CardHeader className="relative space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {translate('app:title')}
        </p>
        <CardTitle className="text-2xl">{translate('app:heroTitle')}</CardTitle>
        <p className="text-sm text-muted-foreground">{translate('app:heroDescription')}</p>
      </CardHeader>
      <CardContent className="relative space-y-6">
        <ul className="grid gap-2">
          {features.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-foreground/90">
              <CheckCircle2 className="size-4 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/login">{translate('nav:login')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/register">{translate('nav:register')}</Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{translate('app:guestHint')}</p>
      </CardContent>
    </Card>
  );
}
