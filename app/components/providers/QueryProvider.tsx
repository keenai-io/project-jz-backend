'use client'

import { ReactElement, ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getQueryClient } from '@/lib/query-client';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * TanStack Query Provider for Client Components
 * 
 * Provides the QueryClient to the component tree with proper SSR support.
 * Should be used to wrap client components that need query functionality.
 */
export function QueryProvider({ children }: QueryProviderProps): ReactElement {
  // NOTE: Avoid useState when initializing the query client if you don't
  // have a suspense boundary between this and the code that may
  // suspend because React will throw away the client on the initial
  // render if it suspends and there is no boundary
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools
        initialIsOpen={false}
      />
    </QueryClientProvider>
  );
}