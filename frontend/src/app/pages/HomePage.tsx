import { Link } from '@tanstack/react-router';
import {
  ArrowRight,
  BookOpen,
  CircleCheckBig,
  Clock3,
  FolderOpen,
  Wallet,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { t: translate } = useTranslation(['app', 'nav']);

  if (!isAuthenticated) {
    return (
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="edu-panel p-0">
          <CardHeader className="space-y-3 border-b border-border p-5">
            <span className="edu-chip w-fit">{translate('app:title')}</span>
            <CardTitle className="text-3xl leading-tight">{translate('app:heroTitle')}</CardTitle>
            <p className="text-sm text-muted-foreground">{translate('app:heroDescription')}</p>
          </CardHeader>

          <CardContent className="space-y-3 p-5">
            <div className="edu-surface-soft flex items-start gap-2 p-3 text-sm">
              <CircleCheckBig className="mt-0.5 size-4 text-primary" />
              <span>{translate('app:featureCourses')}</span>
            </div>
            <div className="edu-surface-soft flex items-start gap-2 p-3 text-sm">
              <CircleCheckBig className="mt-0.5 size-4 text-primary" />
              <span>{translate('app:featureMarketplace')}</span>
            </div>
            <div className="edu-surface-soft flex items-start gap-2 p-3 text-sm">
              <CircleCheckBig className="mt-0.5 size-4 text-primary" />
              <span>{translate('app:featureWallet')}</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button asChild className="gap-2">
                <Link to="/login">
                  {translate('nav:login')}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/register">{translate('nav:register')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="edu-panel h-fit">
          <CardHeader className="p-0">
            <CardTitle className="text-base">Modules</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 p-0 pt-3 text-sm">
            <div className="edu-surface-soft p-3">{translate('app:featureCourses')}</div>
            <div className="edu-surface-soft p-3">{translate('app:featureMarketplace')}</div>
            <div className="edu-surface-soft p-3">{translate('app:featureWallet')}</div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <Card className="edu-panel p-0">
        <CardHeader className="space-y-2 border-b border-border p-5">
          <span className="edu-chip w-fit">Workspace</span>
          <CardTitle className="text-2xl">Continue your learning flow</CardTitle>
          <p className="text-sm text-muted-foreground">
            Pick one main action and keep momentum with short, focused sessions.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
          <Button asChild className="h-10 justify-between">
            <Link to="/courses">
              <span className="inline-flex items-center gap-2">
                <BookOpen className="size-4" />
                Courses
              </span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-10 justify-between">
            <Link to="/decks">
              <span className="inline-flex items-center gap-2">
                <FolderOpen className="size-4" />
                Decks
              </span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-10 justify-between">
            <Link to="/marketplace">
              <span className="inline-flex items-center gap-2">
                <Wallet className="size-4" />
                Marketplace
              </span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <div className="edu-surface-soft flex items-center gap-2 px-3 py-2.5 text-sm">
            <Clock3 className="size-4 text-muted-foreground" />
            Next review in 45 minutes
          </div>
        </CardContent>
      </Card>

      <Card className="edu-panel h-fit">
        <CardHeader className="p-0">
          <CardTitle className="text-base">Today</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 p-0 pt-3">
          <div className="edu-surface-soft p-3">
            <p className="text-xs text-muted-foreground">Modules completed</p>
            <p className="mt-1 text-xl font-semibold">3</p>
          </div>
          <div className="edu-surface-soft p-3">
            <p className="text-xs text-muted-foreground">Deck reviews</p>
            <p className="mt-1 text-xl font-semibold">12</p>
          </div>
          <div className="edu-surface-soft p-3">
            <p className="text-xs text-muted-foreground">Focus score</p>
            <p className="mt-1 text-xl font-semibold">82%</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
