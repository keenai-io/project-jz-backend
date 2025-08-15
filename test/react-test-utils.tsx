/**
 * @fileoverview React testing utilities
 * @module test/react-test-utils
 */

import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

/**
 * Creates a test QueryClient with safe defaults for testing
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  });
}

/**
 * Test wrapper with QueryClient provider
 */
interface TestWrapperProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

export function TestWrapper({ children, queryClient }: TestWrapperProps): ReactElement {
  const client = queryClient || createTestQueryClient();
  
  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * Custom render function with QueryClient provider
 */
export function renderWithQueryClient(
  ui: ReactElement,
  options?: RenderOptions & { queryClient?: QueryClient }
): ReturnType<typeof render> {
  const { queryClient, ...renderOptions } = options || {};
  
  return render(ui, {
    wrapper: ({ children }) => (
      <TestWrapper queryClient={queryClient}>
        {children}
      </TestWrapper>
    ),
    ...renderOptions,
  });
}

/**
 * Enhanced render function for components that need multiple providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions & { 
    queryClient?: QueryClient;
    // Add other providers as needed
  }
): ReturnType<typeof render> {
  const { queryClient, ...renderOptions } = options || {};
  
  return render(ui, {
    wrapper: ({ children }) => (
      <TestWrapper queryClient={queryClient}>
        {children}
      </TestWrapper>
    ),
    ...renderOptions,
  });
}

/**
 * Utility to wait for async operations in tests
 */
export const waitForAsync = async (ms = 0): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Mock user event with proper await patterns
 */
export async function mockUserEvent() {
  const userEvent = await import('@testing-library/user-event');
  return userEvent.default.setup();
}

/**
 * Helper to suppress act warnings for specific operations
 */
export function suppressActWarnings<T>(fn: () => T): T {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    if (message.includes('act(')) {
      return; // Suppress act warnings
    }
    originalError(...args);
  };
  
  try {
    return fn();
  } finally {
    console.error = originalError;
  }
}

// Export common testing library utilities
export {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  cleanup,
} from '@testing-library/react';

export { vi } from 'vitest';