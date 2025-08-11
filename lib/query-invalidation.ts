'use client'

import { useQueryClient, QueryClient } from '@tanstack/react-query';
import clientLogger from '@/lib/logger.client';

/**
 * Query invalidation strategies and utilities
 * 
 * Provides centralized query invalidation logic to maintain
 * data consistency across the application.
 */

// Query key factories for consistent key generation
export const queryKeys = {
  // Configuration queries
  configurations: {
    all: ['configurations'] as const,
    lists: () => [...queryKeys.configurations.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.configurations.lists(), { filters }] as const,
    details: () => [...queryKeys.configurations.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.configurations.details(), id] as const,
  },
  
  // Product categorization queries
  categorization: {
    all: ['categorization'] as const,
    history: () => [...queryKeys.categorization.all, 'history'] as const,
    results: () => [...queryKeys.categorization.all, 'results'] as const,
    exports: () => [...queryKeys.categorization.all, 'exports'] as const,
  },
  
  // User/session queries
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    settings: () => [...queryKeys.user.all, 'settings'] as const,
    preferences: () => [...queryKeys.user.all, 'preferences'] as const,
  },
} as const;

/**
 * Hook for centralized query invalidation
 */
export function useQueryInvalidation() {
  const queryClient = useQueryClient();

  return {
    /**
     * Invalidate all configuration-related queries
     */
    invalidateConfigurations: async (options?: { onSuccess?: () => void }) => {
      clientLogger.debug('Invalidating configuration queries', 'query');
      
      await queryClient.invalidateQueries({
        queryKey: queryKeys.configurations.all,
      });
      
      options?.onSuccess?.();
    },

    /**
     * Invalidate specific configuration by ID
     */
    invalidateConfiguration: async (id: string, options?: { onSuccess?: () => void }) => {
      clientLogger.debug('Invalidating specific configuration', 'query', { configId: id });
      
      await queryClient.invalidateQueries({
        queryKey: queryKeys.configurations.detail(id),
      });
      
      // Also invalidate the list to ensure consistency
      await queryClient.invalidateQueries({
        queryKey: queryKeys.configurations.lists(),
      });
      
      options?.onSuccess?.();
    },

    /**
     * Invalidate categorization-related queries
     */
    invalidateCategorization: async (options?: { onSuccess?: () => void }) => {
      clientLogger.debug('Invalidating categorization queries', 'query');
      
      await queryClient.invalidateQueries({
        queryKey: queryKeys.categorization.all,
      });
      
      options?.onSuccess?.();
    },

    /**
     * Invalidate user-related queries
     */
    invalidateUser: async (options?: { onSuccess?: () => void }) => {
      clientLogger.debug('Invalidating user queries', 'query');
      
      await queryClient.invalidateQueries({
        queryKey: queryKeys.user.all,
      });
      
      options?.onSuccess?.();
    },

    /**
     * Smart invalidation based on mutation type
     */
    invalidateByMutationType: async (mutationType: string, entityId?: string) => {
      clientLogger.debug('Smart invalidation triggered', 'query', { 
        mutationType, 
        entityId 
      });

      switch (mutationType) {
        case 'configuration-create':
        case 'configuration-update':
        case 'configuration-delete':
          await queryClient.invalidateQueries({
            queryKey: queryKeys.configurations.all,
          });
          if (entityId) {
            await queryClient.invalidateQueries({
              queryKey: queryKeys.configurations.detail(entityId),
            });
          }
          break;

        case 'categorization-submit':
          await queryClient.invalidateQueries({
            queryKey: queryKeys.categorization.history(),
          });
          await queryClient.invalidateQueries({
            queryKey: queryKeys.categorization.results(),
          });
          break;

        case 'user-profile-update':
        case 'user-settings-update':
          await queryClient.invalidateQueries({
            queryKey: queryKeys.user.all,
          });
          break;

        default:
          clientLogger.warn('Unknown mutation type for invalidation', 'query', { 
            mutationType 
          });
      }
    },

    /**
     * Remove specific queries from cache
     */
    removeQueries: {
      configuration: (id: string) => {
        clientLogger.debug('Removing configuration from cache', 'query', { configId: id });
        queryClient.removeQueries({
          queryKey: queryKeys.configurations.detail(id),
        });
      },
      
      allConfigurations: () => {
        clientLogger.debug('Removing all configuration queries from cache', 'query');
        queryClient.removeQueries({
          queryKey: queryKeys.configurations.all,
        });
      },
    },

    /**
     * Prefetch related queries
     */
    prefetchRelated: {
      /**
       * Prefetch configuration list when viewing/editing a specific configuration
       */
      configurationContext: async () => {
        await queryClient.prefetchQuery({
          queryKey: queryKeys.configurations.lists(),
          queryFn: async () => {
            // This would be replaced with actual API call
            return [];
          },
          staleTime: 1000 * 60 * 5, // 5 minutes
        });
      },
    },

    /**
     * Reset all queries (use with caution)
     */
    resetAllQueries: async () => {
      clientLogger.warn('Resetting all queries', 'query');
      await queryClient.resetQueries();
    },

    /**
     * Clear all cached data
     */
    clearCache: () => {
      clientLogger.warn('Clearing all query cache', 'query');
      queryClient.clear();
    },
  };
}

/**
 * Global query invalidation utilities (for use outside React components)
 */
export class QueryInvalidationManager {
  private static queryClient: QueryClient | null = null;

  static setQueryClient(client: QueryClient): void {
    this.queryClient = client;
  }

  /**
   * Invalidate queries from outside React components
   */
  static async invalidate(queryKey: readonly unknown[]): Promise<void> {
    if (!this.queryClient) {
      clientLogger.error('QueryClient not set in QueryInvalidationManager', new Error('QueryClient not initialized'), 'query');
      return;
    }

    await this.queryClient.invalidateQueries({ queryKey });
  }

  /**
   * Remove queries from outside React components
   */
  static remove(queryKey: readonly unknown[]): void {
    if (!this.queryClient) {
      clientLogger.error('QueryClient not set in QueryInvalidationManager', new Error('QueryClient not initialized'), 'query');
      return;
    }

    this.queryClient.removeQueries({ queryKey });
  }
}

/**
 * Invalidation patterns for common scenarios
 */
export const invalidationPatterns = {
  /**
   * When a configuration is created/updated/deleted
   */
  onConfigurationMutation: (queryClient: QueryClient, mutationType: 'create' | 'update' | 'delete', configId?: string) => {
    const invalidations = [
      queryClient.invalidateQueries({ queryKey: queryKeys.configurations.all }),
    ];

    if (configId && mutationType !== 'create') {
      invalidations.push(
        queryClient.invalidateQueries({ queryKey: queryKeys.configurations.detail(configId) })
      );
    }

    return Promise.all(invalidations);
  },

  /**
   * When categorization is completed
   */
  onCategorizationComplete: (queryClient: QueryClient) => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.categorization.history() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.categorization.results() }),
    ]);
  },

  /**
   * When user data changes
   */
  onUserDataChange: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
  },
} as const;