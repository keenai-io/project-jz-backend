import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

/**
 * Creates a new QueryClient instance with optimized settings
 * for server-side rendering and client-side hydration
 */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000, // 1 minute
        // Cache time for inactive queries (10 minutes)
        gcTime: 10 * 60 * 1000, // 10 minutes
        // Retry failed requests up to 2 times
        retry: 2,
        // Don't refetch on window focus by default (can be overridden per query)
        refetchOnWindowFocus: false,
        // Refetch on reconnect to get latest data
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Gets the QueryClient for the browser
 * Creates a singleton instance that persists across renders
 */
function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

/**
 * Server-side QueryClient factory using React cache
 * Ensures each request gets its own QueryClient instance
 */
export const getServerQueryClient = cache(makeQueryClient);

export { getQueryClient };