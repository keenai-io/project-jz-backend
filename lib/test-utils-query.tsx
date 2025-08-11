/**
 * @fileoverview Test utilities for TanStack Query
 * @module lib/test-utils-query
 */

import { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * Creates a test QueryClient with optimized settings for testing
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Turn off retries to make tests faster
        retry: false,
        // Turn off cache time to ensure fresh data in tests
        gcTime: 0,
        // Turn off stale time for immediate updates in tests
        staleTime: 0,
        // Don't refetch on window focus during tests
        refetchOnWindowFocus: false,
        // Don't refetch on reconnect during tests
        refetchOnReconnect: false,
        // Don't refetch on mount during tests
        refetchOnMount: false,
      },
      mutations: {
        // Turn off retries for faster tests
        retry: false,
      },
    },
  });
}

/**
 * Test wrapper that provides QueryClient context
 */
interface QueryWrapperProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

export function QueryWrapper({ 
  children, 
  queryClient = createTestQueryClient() 
}: QueryWrapperProps): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * Enhanced render function with QueryClient provider
 */
interface RenderWithQueryOptions extends RenderOptions {
  queryClient?: QueryClient;
}

export function renderWithQuery(
  ui: ReactElement,
  options: RenderWithQueryOptions = {}
) {
  const { queryClient = createTestQueryClient(), ...renderOptions } = options;

  function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return (
      <QueryWrapper queryClient={queryClient}>
        {children}
      </QueryWrapper>
    );
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/**
 * Mock implementations for common query scenarios
 */
export const queryMocks = {
  /**
   * Mock successful query
   */
  mockSuccessfulQuery: function<T>(data: T) {
    return {
      data,
      error: null,
      isLoading: false,
      isError: false,
      isSuccess: true,
      status: 'success' as const,
      refetch: vi.fn(),
      fetchStatus: 'idle' as const,
    };
  },

  /**
   * Mock loading query
   */
  mockLoadingQuery: () => ({
    data: undefined,
    error: null,
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'pending' as const,
    refetch: vi.fn(),
    fetchStatus: 'fetching' as const,
  }),

  /**
   * Mock error query
   */
  mockErrorQuery: (error: Error) => ({
    data: undefined,
    error,
    isLoading: false,
    isError: true,
    isSuccess: false,
    status: 'error' as const,
    refetch: vi.fn(),
    fetchStatus: 'idle' as const,
  }),

  /**
   * Mock successful mutation
   */
  mockSuccessfulMutation: function<T>(data?: T) {
    return {
      data: data || null,
      error: null,
      isError: false,
      isSuccess: true,
      isPending: false,
      isIdle: false,
      status: 'success' as const,
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue(data),
      reset: vi.fn(),
      variables: undefined,
    };
  },

  /**
   * Mock pending mutation
   */
  mockPendingMutation: () => ({
    data: null,
    error: null,
    isError: false,
    isSuccess: false,
    isPending: true,
    isIdle: false,
    status: 'pending' as const,
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    reset: vi.fn(),
    variables: undefined,
  }),

  /**
   * Mock error mutation
   */
  mockErrorMutation: (error: Error) => ({
    data: null,
    error,
    isError: true,
    isSuccess: false,
    isPending: false,
    isIdle: false,
    status: 'error' as const,
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockRejectedValue(error),
    reset: vi.fn(),
    variables: undefined,
  }),
};

/**
 * Helper to mock query hooks for testing
 */
export function mockQueryHook<T>(
  mockImplementation: () => T
) {
  return vi.fn().mockImplementation(mockImplementation);
}

/**
 * Helper to create mock query data
 */
export const createMockQueryData = {
  configuration: (overrides = {}) => ({
    id: 'test-config-1',
    name: 'Test Configuration',
    seo: {
      temperature: 75,
      useImages: true,
      bannedWords: ['test', 'mock'],
    },
    image: {
      rotationDirection: 'clockwise' as const,
      rotationDegrees: 90,
      flipImage: false,
      enableWatermark: false,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    ...overrides,
  }),

  configurationForm: (overrides = {}) => ({
    seo: {
      temperature: 50,
      useImages: true,
      bannedWords: ['cheap', 'fake'],
    },
    image: {
      rotationDirection: 'clockwise' as const,
      rotationDegrees: 25,
      flipImage: false,
      enableWatermark: false,
    },
    ...overrides,
  }),

  categorizationRequest: (overrides = {}) => [
    {
      product_number: 12345,
      original_product_name: 'Test Product',
      original_keywords: ['test', 'product'],
      original_main_image_link: 'https://example.com/image.jpg',
      ...overrides,
    },
  ],

  categorizationResponse: (overrides = {}) => [
    {
      product_number: 12345,
      original_product_name: 'Test Product',
      original_keywords: ['test', 'product'],
      original_main_image_link: 'https://example.com/image.jpg',
      hashtags: ['#test'],
      sales_status: 'On Sale',
      matched_categories: ['Category 1'],
      product_name: 'Enhanced Test Product',
      keywords: ['enhanced', 'test', 'product'],
      main_image_link: 'https://example.com/enhanced-image.jpg',
      category_number: '12345',
      brand: 'Test Brand',
      manufacturer: 'Test Manufacturer',
      model_name: 'Test Model',
      detailed_description_editing: null,
      ...overrides,
    },
  ],
};

/**
 * Test helper to wait for queries to settle
 */
export async function waitForQueryToSettle(queryClient: QueryClient): Promise<void> {
  // Wait for all queries to finish loading
  await new Promise(resolve => {
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      const queries = queryClient.getQueryCache().getAll();
      const isAnyQueryFetching = queries.some(query => query.state.fetchStatus === 'fetching');
      
      if (!isAnyQueryFetching) {
        unsubscribe();
        resolve(void 0);
      }
    });
  });
}