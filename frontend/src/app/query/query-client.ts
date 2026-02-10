import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 30000,
      gcTime: 300000,
    },
    mutations: {
      retry: 0,
    },
  },
  queryCache: new QueryCache(),
  mutationCache: new MutationCache(),
});