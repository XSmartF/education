import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { Home, Languages, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import { AuthDialog } from '@/domains/auth/ui/AuthDialog';
import { authActions, dashboardLinks } from '@/app/config/navigation';
import {
  Button,
  Separator,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/shared/ui';

export default function DashboardLayout() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { t: translate, i18n } = useTranslation(['app', 'nav', 'language']);
  const location = useLocation({
    select: (value) => ({ pathname: value.pathname, searchStr: value.searchStr }),
  });
  const pathname = location.pathname;
  const authModeFromSearch = useMemo(() => {
    const value = new URLSearchParams(location.searchStr).get('auth');
    return value === 'login' || value === 'register' ? value : null;
  }, [location.searchStr]);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogMode, setAuthDialogMode] = useState<'login' | 'register'>('login');

  const setLanguage = (lng: 'vi' | 'en') => {
    void i18n.changeLanguage(lng);
  };

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

  const onAuthSuccess = () => {
    auth.setAuthenticated(true);
    setAuthDialogOpen(false);
    clearAuthSearch();
    void navigate({ to: '/courses' });
  };

  const onDialogChange = (open: boolean) => {
    setAuthDialogOpen(open);
    if (!open) {
      clearAuthSearch();
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated || !authModeFromSearch) {
      return;
    }

    setAuthDialogMode(authModeFromSearch);
    setAuthDialogOpen(true);
  }, [auth.isAuthenticated, authModeFromSearch]);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/'} size="lg">
                <Link to="/">
                  <Home />
                  <span>{translate('app:title')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{translate('app:title')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {dashboardLinks.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild isActive={item.isActive(pathname)}>
                      <Link to={item.to}>
                        <item.icon />
                        <span>{translate(item.labelKey)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {!auth.isAuthenticated && (
            <SidebarGroup>
              <SidebarGroupLabel>{translate('nav:login')}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {authActions.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={authDialogOpen && authDialogMode === item.mode}
                        onClick={() => openAuthDialog(item.mode)}
                      >
                        <item.icon />
                        <span>{translate(item.labelKey)}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter className="p-2">
          <div className="flex items-center gap-1 rounded-md border bg-background p-1">
            <Languages className="size-4 text-muted-foreground" />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 flex-1"
              onClick={() => setLanguage('vi')}
            >
              {translate('language:vi')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 flex-1"
              onClick={() => setLanguage('en')}
            >
              {translate('language:en')}
            </Button>
          </div>
          {auth.isAuthenticated && (
            <Button variant="outline" className="w-full justify-start gap-2" onClick={auth.signOut}>
              <LogOut className="size-4" />
              <span>{translate('nav:logout')}</span>
            </Button>
          )}
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="relative min-h-screen bg-gradient-to-b from-muted/20 via-background to-background">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.15),transparent_60%)]" />
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">
              <Link to="/">{translate('app:title')}</Link>
            </h1>
            <p className="truncate text-xs text-muted-foreground">{translate('app:tagline')}</p>
          </div>
        </header>

        <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
      <AuthDialog
        open={authDialogOpen}
        mode={authDialogMode}
        onOpenChange={onDialogChange}
        onModeChange={setAuthDialogMode}
        onAuthSuccess={onAuthSuccess}
      />
    </SidebarProvider>
  );
}
