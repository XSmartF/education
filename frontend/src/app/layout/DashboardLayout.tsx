import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import {
  Bell,
  Globe,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import { AuthDialog } from '@/domains/auth/ui/AuthDialog';
import { authActions, canViewSidebarLink, dashboardLinks } from '@/app/config/navigation';
import { Avatar, AvatarFallback, Button, Input } from '@/shared/ui';
import { cn } from '@/shared/utils';

export default function DashboardLayout() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { t: translate, i18n } = useTranslation(['app', 'nav', 'language']);
  const location = useLocation({
    select: (value) => ({ pathname: value.pathname, searchStr: value.searchStr }),
  });

  const pathname = location.pathname;
  const visibleLinks = useMemo(
    () =>
      dashboardLinks.filter((item) =>
        canViewSidebarLink(item, { isAuthenticated: auth.isAuthenticated, roles: auth.roles })
      ),
    [auth.isAuthenticated, auth.roles]
  );
  const activeLink = visibleLinks.find((item) => item.isActive(pathname));
  const activeTitle = activeLink ? translate(activeLink.labelKey) : translate('app:title');

  const authModeFromSearch = useMemo(() => {
    const value = new URLSearchParams(location.searchStr).get('auth');
    return value === 'login' || value === 'register' ? value : null;
  }, [location.searchStr]);

  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogMode, setAuthDialogMode] = useState<'login' | 'register'>('login');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  const clearAuthSearch = () => {
    if (!authModeFromSearch) {
      return;
    }
    void navigate({ href: pathname, replace: true });
  };

  const openAuthDialog = (mode: 'login' | 'register') => {
    setAuthDialogMode(mode);
    setAuthDialogOpen(true);
    clearAuthSearch();
  };

  const onDialogChange = (open: boolean) => {
    setAuthDialogOpen(open);
    if (!open) {
      clearAuthSearch();
    }
  };

  const onAuthSuccess = () => {
    auth.setAuthenticated(true);
    setAuthDialogOpen(false);
    clearAuthSearch();
    void navigate({ to: '/' });
  };

  useEffect(() => {
    if (auth.isAuthenticated || !authModeFromSearch) {
      return;
    }

    setAuthDialogMode(authModeFromSearch);
    setAuthDialogOpen(true);
  }, [auth.isAuthenticated, authModeFromSearch]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const savedState = window.localStorage.getItem('edu.sidebar.open');
    if (savedState === '0') {
      setDesktopSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('edu.sidebar.open', desktopSidebarOpen ? '1' : '0');
  }, [desktopSidebarOpen]);

  const profileName = auth.isAuthenticated ? 'Student Workspace' : 'Guest Workspace';
  const profileRole = auth.isAuthenticated ? auth.roles.join(', ') || 'Student' : 'Published only';
  const sidebarCollapsed = !desktopSidebarOpen;

  return (
    <>
      <div
        className={cn(
          'edu-dashboard-shell',
          sidebarCollapsed && 'md:grid-cols-[5rem_minmax(0,1fr)]'
        )}
      >
        <button
          type="button"
          className={cn(
            'fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm md:hidden',
            mobileSidebarOpen ? 'block' : 'hidden'
          )}
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close menu"
        />

        <aside
          className={cn(
            'edu-dashboard-sidebar fixed inset-y-0 left-0 z-50 w-[18.5rem] -translate-x-full transition-transform duration-200 md:static md:z-auto md:w-auto md:translate-x-0',
            mobileSidebarOpen && 'translate-x-0',
            sidebarCollapsed && 'md:w-20 md:px-2'
          )}
        >
          <div className={cn('edu-dashboard-brand', sidebarCollapsed && 'md:justify-center md:px-2')}>
            <div className="edu-dashboard-logo">ED</div>
            <div className={cn(sidebarCollapsed && 'md:hidden')}>
              <p className="text-sm font-bold leading-none">Education</p>
              <p className="text-xs text-muted-foreground">{translate('app:tagline')}</p>
            </div>
            <button
              type="button"
              className="ml-auto rounded-md p-1 text-muted-foreground md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="size-4" />
            </button>
          </div>

          {!auth.isAuthenticated && !sidebarCollapsed ? (
            <div className="grid grid-cols-2 gap-2">
              <Button className="h-10 rounded-lg" onClick={() => openAuthDialog('login')}>
                {translate('nav:login')}
              </Button>
              <Button variant="outline" className="h-10 rounded-lg" onClick={() => openAuthDialog('register')}>
                {translate('nav:register')}
              </Button>
            </div>
          ) : null}

          {!auth.isAuthenticated && sidebarCollapsed && (
            <div className="mt-4 grid gap-2">
              {authActions.map((action) => (
                <Button
                  key={`collapsed-auth-${action.id}`}
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 justify-self-center"
                  onClick={() => openAuthDialog(action.mode)}
                  aria-label={translate(action.labelKey)}
                >
                  <action.icon className="size-4" />
                </Button>
              ))}
            </div>
          )}

          <div className="edu-dashboard-nav">
            <p className={cn('edu-dashboard-nav-label', sidebarCollapsed && 'md:hidden')}>
              {auth.isAuthenticated ? 'Subjects' : 'Published'}
            </p>
            {visibleLinks.map((item) => (
              <Link
                key={item.id}
                to={item.to}
                className={cn(
                  'edu-dashboard-nav-item',
                  item.isActive(pathname) && 'edu-dashboard-nav-item-active',
                  sidebarCollapsed && 'md:justify-center md:px-2'
                )}
                aria-label={translate(item.labelKey)}
              >
                <item.icon className="size-4" />
                <span className={cn(sidebarCollapsed && 'md:hidden')}>{translate(item.labelKey)}</span>
              </Link>
            ))}

            {!auth.isAuthenticated && !sidebarCollapsed && (
              <div className="mt-4 space-y-1.5">
                <p className="edu-dashboard-nav-label">Account</p>
                {authActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className={cn(
                      'edu-dashboard-nav-item w-full text-left',
                      authDialogOpen && authDialogMode === action.mode && 'edu-dashboard-nav-item-active'
                    )}
                    onClick={() => openAuthDialog(action.mode)}
                  >
                    <action.icon className="size-4" />
                    <span>{translate(action.labelKey)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="edu-dashboard-sidebar-footer">
            <div className={cn('edu-language-switch', sidebarCollapsed && 'md:px-2')}>
              <Globe className="size-4 text-muted-foreground" />
              <button
                type="button"
                className={cn('edu-language-btn', sidebarCollapsed && 'md:hidden')}
                onClick={() => void i18n.changeLanguage('vi')}
              >
                {translate('language:vi')}
              </button>
              <button
                type="button"
                className={cn('edu-language-btn', sidebarCollapsed && 'md:hidden')}
                onClick={() => void i18n.changeLanguage('en')}
              >
                {translate('language:en')}
              </button>
              {sidebarCollapsed && (
                <button
                  type="button"
                  className="mx-auto rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => void i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')}
                  aria-label="Toggle language"
                >
                  {i18n.language === 'vi' ? 'VI' : 'EN'}
                </button>
              )}
            </div>

            {auth.isAuthenticated && (
              sidebarCollapsed ? (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 justify-self-center"
                  onClick={() => void auth.signOut()}
                  aria-label={translate('nav:logout')}
                >
                  <LogOut className="size-4" />
                </Button>
              ) : (
                <Button variant="outline" className="h-10 w-full rounded-lg" onClick={() => void auth.signOut()}>
                  {translate('nav:logout')}
                </Button>
              )
            )}
          </div>
        </aside>

        <section className="edu-dashboard-main">
          <header className="edu-dashboard-header">
            <div className="edu-dashboard-header-top">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-9 w-9 md:hidden" onClick={() => setMobileSidebarOpen(true)}>
                  <Menu className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden h-9 w-9 md:inline-flex"
                  onClick={() => setDesktopSidebarOpen((previous) => !previous)}
                  aria-label={desktopSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                  {desktopSidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
                </Button>
                <h1 className="text-xl font-semibold sm:text-2xl">{activeTitle}</h1>
              </div>

              <div className="edu-dashboard-header-actions">
                <div className="relative w-full min-w-0 sm:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="edu-search-input" placeholder="Search lessons, decks, tasks..." />
                </div>
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg">
                  <Bell className="size-4" />
                </Button>
                <div className="edu-profile-pill">
                  <Avatar className="size-8 border border-border/80">
                    <AvatarFallback className="bg-primary/15 text-primary">ED</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{profileName}</p>
                    <p className="truncate text-xs text-muted-foreground">{profileRole}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="edu-dashboard-content">
            <Outlet />
          </main>
        </section>
      </div>

      <AuthDialog
        open={authDialogOpen}
        mode={authDialogMode}
        onOpenChange={onDialogChange}
        onModeChange={setAuthDialogMode}
        onAuthSuccess={onAuthSuccess}
      />
    </>
  );
}
