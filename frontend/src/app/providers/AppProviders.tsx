import React from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import { router } from '../routes/router';
import { store } from '../store/store';
import { queryClient } from '../query/query-client';

import { CToaster } from '@/shared/components';
import { AuthBootstrap } from '@/domains/auth/ui/AuthBootstrap';
import { useAppSelector } from '@/app/store/hooks';

export default function AppProviders() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppShell />
      </QueryClientProvider>
    </Provider>
  );
}

function AppShell() {
  const bootstrapping = useAppSelector(
    (state) => state.auth.bootstrapping ?? false
  );

  return (
    <>
      <AuthBootstrap />
      {!bootstrapping && <RouterProvider router={router} />}
      <CToaster />

      <BootstrappingOverlay loading={bootstrapping} />

      {import.meta.env.DEV && (
        <>
          <ReactQueryDevtools initialIsOpen={false} />
          <TanStackRouterDevtools router={router} />
        </>
      )}
    </>
  );
}

function BootstrappingOverlay({ loading }: { loading: boolean }) {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="space-y-2 text-center">
        <div className="mx-auto h-8 w-32 animate-pulse rounded bg-muted/40" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
