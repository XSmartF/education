import React from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import { router } from '../routes/router';
import { store } from '../store/store';
import { queryClient } from '../query/query-client';

import { Skeleton, Toaster } from '@/shared/ui';
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
      <Toaster />

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-56 space-y-3">
        <Skeleton className="mx-auto h-8 w-40" />
        <Skeleton className="mx-auto h-3 w-28" />
      </div>
    </div>
  );
}

