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

export default function AppProviders() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <AuthBootstrap />
        <CToaster />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        {import.meta.env.DEV && <TanStackRouterDevtools router={router} />}
      </QueryClientProvider>
    </Provider>
  );
}
