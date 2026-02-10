import { Link, Outlet } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import { CButton } from '@/shared/components';

export default function DashboardLayout() {
  const auth = useAuth();
  const { t: translate, i18n } = useTranslation(['app', 'nav', 'language']);

  const setLanguage = (lng: 'vi' | 'en') => {
    void i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-8">
        <header className="flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              <Link to="/">{translate('app:title')}</Link>
            </h1>
            <p className="text-sm text-muted-foreground">{translate('app:tagline')}</p>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <CButton asChild variant="secondary">
              <Link to="/todos">{translate('nav:todos')}</Link>
            </CButton>
            {!auth.isAuthenticated ? (
              <>
                <CButton asChild variant="ghost">
                  <Link to="/login">{translate('nav:login')}</Link>
                </CButton>
                <CButton asChild variant="ghost">
                  <Link to="/register">{translate('nav:register')}</Link>
                </CButton>
              </>
            ) : (
              <CButton variant="outline" onClick={auth.signOut}>
                {translate('nav:logout')}
              </CButton>
            )}
            <div className="flex items-center gap-1">
              <CButton variant="ghost" size="sm" onClick={() => setLanguage('vi')}>
                {translate('language:vi')}
              </CButton>
              <CButton variant="ghost" size="sm" onClick={() => setLanguage('en')}>
                {translate('language:en')}
              </CButton>
            </div>
          </nav>
        </header>

        <main className="flex flex-1 flex-col gap-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}