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
import React from 'react';

export default function AppProviders() {
  const bootstrapping = useAppSelector((s) => s.auth.bootstrapping ?? false);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap />
        {!bootstrapping && <RouterProvider router={router} />}
        <CToaster />
        <BootstrappingOverlay />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        {import.meta.env.DEV && <TanStackRouterDevtools router={router} />}
      </QueryClientProvider>
    </Provider>
  );
}

function BootstrappingOverlay() {
  const bootstrapping = useAppSelector((s) => s.auth.bootstrapping ?? false);
  if (!bootstrapping) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
      <div className="space-y-2 text-center">
        <div className="mx-auto h-8 w-32 animate-pulse rounded bg-muted/40" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
