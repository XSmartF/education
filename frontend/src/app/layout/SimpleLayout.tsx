import { Outlet } from '@tanstack/react-router';
import { Compass, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SimpleLayout() {
  const { t: translate } = useTranslation('app');
  const highlights = [translate('featureCourses'), translate('featureMarketplace'), translate('featureWallet')];

  return (
    <div className="min-h-screen w-full">
      <div className="grid min-h-screen w-full lg:grid-cols-[minmax(320px,0.42fr)_1fr]">
        <aside className="edu-auth-side hidden p-8 lg:flex lg:flex-col lg:justify-between xl:p-10">
          <div className="space-y-5">
            <span className="edu-chip w-fit">
              <Sparkles className="size-3.5" />
              {translate('title')}
            </span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold leading-tight">{translate('heroTitle')}</h1>
              <p className="text-sm text-muted-foreground">{translate('heroDescription')}</p>
            </div>
          </div>

          <ul className="space-y-3 text-sm text-foreground/90">
            {highlights.map((item) => (
              <li key={item} className="edu-auth-step flex items-start gap-2">
                <Compass className="mt-0.5 size-4 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex items-center justify-center px-4 py-8 sm:px-8 lg:px-10">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
