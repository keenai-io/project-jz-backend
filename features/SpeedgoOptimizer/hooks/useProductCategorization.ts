'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitProductCategorization } from '@features/SpeedgoOptimizer/application/submitProductCategorization';
import type { CategoryRequestItem } from '@features/SpeedgoOptimizer/domain/schemas/CategoryRequest';
import type { CategoryResponse } from '@features/SpeedgoOptimizer/domain/schemas/CategoryResponse';
import clientLogger from '@/lib/logger.client';

type ProductCategorizationResult = {
  success: true;
  data: CategoryResponse;
} | {
  success: false;
  error: string;
}

interface ProductCategorizationError {
  message: string;
  cause?: unknown;
}

/**
 * Hook for product categorization with TanStack Query
 * 
 * Provides optimized server state management for product categorization,
 * including proper error handling, loading states, and cache invalidation.
 */
export function useProductCategorization() {
  const queryClient = useQueryClient();

  return useMutation<
    ProductCategorizationResult,
    ProductCategorizationError,
    CategoryRequestItem[]
  >({
    mutationKey: ['product-categorization'],
    
    mutationFn: async (products: CategoryRequestItem[]): Promise<ProductCategorizationResult> => {
      clientLogger.info('Starting product categorization mutation', 'categorization', {
        productCount: products.length
      });

      try {
        const result = await submitProductCategorization(products);
        
        if (result.success) {
          clientLogger.info('Product categorization completed successfully', 'categorization', {
            processedProducts: result.data.length
          });
        } else {
          clientLogger.warn('Product categorization failed', 'categorization', {
            error: result.error
          });
        }

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during categorization';
        clientLogger.error('Product categorization mutation failed', error as Error, 'categorization');
        
        throw new Error(errorMessage);
      }
    },

    // Optimistic updates and cache management
    onMutate: async (products: CategoryRequestItem[]) => {
      // Log the start of the mutation
      clientLogger.debug('Product categorization mutation started', 'categorization', {
        productCount: products.length
      });

      // Could implement optimistic updates here if needed
      // For now, we'll just log the mutation start
    },

    onSuccess: (result, products) => {
      if (result.success) {
        // Invalidate and refetch any related queries
        // For example, if we had a query for categorization history
        queryClient.invalidateQueries({
          queryKey: ['categorization-history']
        });

        clientLogger.info('Product categorization mutation succeeded', 'categorization', {
          productCount: products.length,
          resultCount: result.data.length
        });
      }
    },

    onError: (error, products) => {
      clientLogger.error('Product categorization mutation error', new Error(error.message), 'categorization', {
        productCount: products.length,
        error: error.message
      });

      // Could show toast notification or handle error UI here
    },

    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry on validation errors (client-side errors)
      if (error.message.includes('validation') || error.message.includes('invalid')) {
        return false;
      }
      
      // Retry up to 2 times for network/server errors
      return failureCount < 2;
    },

    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
