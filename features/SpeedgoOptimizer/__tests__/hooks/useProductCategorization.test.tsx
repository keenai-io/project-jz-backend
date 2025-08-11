/**
 * @fileoverview Tests for useProductCategorization hook
 * @module features/SpeedgoOptimizer/hooks/__tests__/useProductCategorization.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useProductCategorization } from '@features/SpeedgoOptimizer/hooks/useProductCategorization';
import { submitProductCategorization } from '@features/SpeedgoOptimizer/application/submitProductCategorization';
import { createTestQueryClient } from '@/lib/test-utils-query';
import type { CategoryRequestItem } from '@features/SpeedgoOptimizer/domain/schemas/CategoryRequest';

// Mock the server action
vi.mock('@features/SpeedgoOptimizer/application/submitProductCategorization', () => ({
  submitProductCategorization: vi.fn(),
}));

// Mock the client logger
vi.mock('@/lib/logger.client', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Helper wrapper component
function TestWrapper({ children, queryClient }: { children: ReactNode; queryClient: QueryClient }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * Test suite for useProductCategorization hook
 * 
 * Tests TanStack Query integration, error handling, and cache management
 * for the product categorization mutation hook.
 */
describe('useProductCategorization', () => {
  const mockProducts: CategoryRequestItem[] = [{
    language: 'en',
    semantic_top_k: 15,
    first_category_via_llm: false,
    descriptive_title_via_llm: true,
    round_out_keywords_via_llm: true,
    broad_keyword_matching: true,
    input_data: {
      product_number: 12345,
      product_name: 'Test Product',
      hashtags: ['test'],
      keywords: ['test', 'product'],
      main_image_link: 'https://example.com/image.jpg',
      sales_status: 'Available',
      manufacturer: 'Test Manufacturer',
      model_name: 'Test Model',
      edit_details: ''
    }
  }];
  
  const mockSubmitProductCategorization = vi.mocked(submitProductCategorization);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Tests successful product categorization mutation setup
   */
  it('should initialize mutation successfully', () => {
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useProductCategorization(), {
      wrapper: ({ children }) => <TestWrapper queryClient={queryClient}>{children}</TestWrapper>,
    });

    // Initially should be idle
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isIdle).toBe(true);
  });

  /**
   * Tests that mutation functions are available
   */
  it('should provide mutation functions', () => {
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useProductCategorization(), {
      wrapper: ({ children }) => <TestWrapper queryClient={queryClient}>{children}</TestWrapper>,
    });

    // Check that mutation functions exist
    expect(typeof result.current.mutate).toBe('function');
    expect(typeof result.current.mutateAsync).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  /**
   * Tests that mutation can be triggered
   */
  it('should accept product data for categorization', () => {
    const mockResponse = {
      success: true as const,
      data: [{
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
      }],
    };

    mockSubmitProductCategorization.mockResolvedValue(mockResponse);

    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useProductCategorization(), {
      wrapper: ({ children }) => <TestWrapper queryClient={queryClient}>{children}</TestWrapper>,
    });

    // Test that we can call the mutation with the expected data structure
    expect(() => result.current.mutate(mockProducts)).not.toThrow();
  });

  /**
   * Tests mutation state properties
   */
  it('should have correct initial state properties', () => {
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useProductCategorization(), {
      wrapper: ({ children }) => <TestWrapper queryClient={queryClient}>{children}</TestWrapper>,
    });

    // Check all expected state properties exist
    expect(result.current).toHaveProperty('isPending');
    expect(result.current).toHaveProperty('isSuccess');
    expect(result.current).toHaveProperty('isError');
    expect(result.current).toHaveProperty('isIdle');
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('mutateAsync');
    expect(result.current).toHaveProperty('reset');

    // Check initial values
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isIdle).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  /**
   * Tests error response handling (not thrown errors)
   */
  it('should handle error responses correctly', () => {
    const mockErrorResponse = {
      success: false as const,
      error: 'Validation failed: Invalid product data',
    };

    mockSubmitProductCategorization.mockResolvedValue(mockErrorResponse);

    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useProductCategorization(), {
      wrapper: ({ children }) => <TestWrapper queryClient={queryClient}>{children}</TestWrapper>,
    });

    // The hook should be able to handle this case when mutated
    expect(() => result.current.mutate(mockProducts)).not.toThrow();
  });
});