'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { 
  ConfigurationForm, 
  Configuration,
  ConfigurationId
} from '@features/Configuration/domain/schemas/ConfigurationSchemas';
import { ConfigurationValidation } from '@features/Configuration/domain/schemas/ConfigurationSchemas';
import { queryKeys, invalidationPatterns } from '@/lib/query-invalidation';
import clientLogger from '@/lib/logger.client';

// Mock API functions - replace with actual API calls
const configurationApi = {
  /**
   * Fetch all configurations
   */
  async getConfigurations(): Promise<Configuration[]> {
    // Mock implementation - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockConfigurations: Configuration[] = [
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' as ConfigurationId,
        name: 'Default Configuration',
        seo: {
          temperature: 50,
          useImages: true,
          bannedWords: ['cheap', 'fake', 'counterfeit']
        },
        image: {
          rotationDirection: 'clockwise',
          rotationDegrees: 25,
          flipImage: false,
          enableWatermark: false
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    return mockConfigurations;
  },

  /**
   * Fetch a specific configuration by ID
   */
  async getConfiguration(id: string): Promise<Configuration> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock implementation - replace with actual API call
    const configurations = await this.getConfigurations();
    const config = configurations.find(c => c.id === id);
    
    if (!config) {
      throw new Error(`Configuration with ID ${id} not found`);
    }
    
    return config;
  },

  /**
   * Create a new configuration
   */
  async createConfiguration(data: ConfigurationForm): Promise<Configuration> {
    // Validate the data
    const validatedData = ConfigurationValidation.validateConfigurationForm(data);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock implementation - replace with actual API call  
    const newConfiguration: Configuration = {
      id: crypto.randomUUID() as ConfigurationId,
      name: `Configuration ${Date.now()}`,
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    clientLogger.info('Configuration created', 'configuration', {
      configId: newConfiguration.id
    });
    
    return newConfiguration;
  },

  /**
   * Update an existing configuration
   */
  async updateConfiguration(id: ConfigurationId | string, data: ConfigurationForm): Promise<Configuration> {
    // Validate the data
    const validatedData = ConfigurationValidation.validateConfigurationForm(data);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock implementation - replace with actual API call
    const updatedConfiguration: Configuration = {
      id: id as ConfigurationId,
      name: `Updated Configuration ${Date.now()}`,
      ...validatedData,
      createdAt: new Date(Date.now() - 86400000), // Yesterday
      updatedAt: new Date()
    };
    
    clientLogger.info('Configuration updated', 'configuration', {
      configId: id
    });
    
    return updatedConfiguration;
  },

  /**
   * Delete a configuration
   */
  async deleteConfiguration(id: ConfigurationId | string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    clientLogger.info('Configuration deleted', 'configuration', {
      configId: id
    });
    
    // Mock implementation - in real app, make API call
  }
};

// Use centralized query keys
const QUERY_KEYS = queryKeys.configurations;

/**
 * Hook to fetch all configurations
 */
export function useConfigurations() {
  return useQuery({
    queryKey: QUERY_KEYS.all,
    queryFn: () => configurationApi.getConfigurations(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}

/**
 * Hook to fetch a specific configuration
 */
export function useConfiguration(id: ConfigurationId | string) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => configurationApi.getConfiguration(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    enabled: !!id, // Only run if id is provided
  });
}

/**
 * Hook to create a new configuration
 */
export function useCreateConfiguration() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ConfigurationForm) => configurationApi.createConfiguration(data),
    
    onMutate: async (newConfig) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.all });
      
      // Snapshot the previous value
      const previousConfigs = queryClient.getQueryData<Configuration[]>(QUERY_KEYS.all);
      
      // Optimistically update the cache
      queryClient.setQueryData<Configuration[]>(
        QUERY_KEYS.all,
        (old) => {
          const optimisticConfig: Configuration = {
            id: `temp-${Date.now()}` as ConfigurationId,
            name: 'Creating...',
            ...newConfig,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          return old ? [...old, optimisticConfig] : [optimisticConfig];
        }
      );
      
      return { previousConfigs };
    },
    
    onError: (err, _newConfig, context) => {
      // If the mutation fails, roll back to the previous value
      if (context?.previousConfigs) {
        queryClient.setQueryData(QUERY_KEYS.all, context.previousConfigs);
      }
      
      clientLogger.error('Failed to create configuration', err as Error, 'configuration');
    },
    
    onSuccess: (data) => {
      // Use centralized invalidation pattern
      invalidationPatterns.onConfigurationMutation(queryClient, 'create', data.id);
      
      clientLogger.info('Configuration created successfully', 'configuration', {
        configId: data.id
      });
    },
    
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });
}

/**
 * Hook to update a configuration
 */
export function useUpdateConfiguration() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: ConfigurationId | string; data: ConfigurationForm }) => 
      configurationApi.updateConfiguration(id, data),
    
    onMutate: async ({ id, data }) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.detail(id) });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.all });
      
      // Get previous values
      const previousConfig = queryClient.getQueryData<Configuration>(QUERY_KEYS.detail(id));
      const previousConfigs = queryClient.getQueryData<Configuration[]>(QUERY_KEYS.all);
      
      // Optimistically update individual config
      queryClient.setQueryData<Configuration>(
        QUERY_KEYS.detail(id),
        (old) => old ? { ...old, ...data, updatedAt: new Date() } : undefined
      );
      
      // Optimistically update configs list
      queryClient.setQueryData<Configuration[]>(
        QUERY_KEYS.all,
        (old) => old?.map(config => 
          config.id === id ? { ...config, ...data, updatedAt: new Date() } : config
        )
      );
      
      return { previousConfig, previousConfigs };
    },
    
    onError: (err, { id }, context) => {
      // Roll back on error
      if (context?.previousConfig) {
        queryClient.setQueryData(QUERY_KEYS.detail(id), context.previousConfig);
      }
      if (context?.previousConfigs) {
        queryClient.setQueryData(QUERY_KEYS.all, context.previousConfigs);
      }
      
      clientLogger.error('Failed to update configuration', err as Error, 'configuration', { configId: id });
    },
    
    onSuccess: (data, { id }) => {
      // Update the cache with the response
      queryClient.setQueryData(QUERY_KEYS.detail(id), data);
      
      // Use centralized invalidation pattern
      invalidationPatterns.onConfigurationMutation(queryClient, 'update', id);
      
      clientLogger.info('Configuration updated successfully', 'configuration', {
        configId: id
      });
    },
    
    onSettled: (_, __, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });
}

/**
 * Hook to delete a configuration
 */
export function useDeleteConfiguration() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: ConfigurationId | string) => configurationApi.deleteConfiguration(id),
    
    onMutate: async (id) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.all });
      
      // Get previous value
      const previousConfigs = queryClient.getQueryData<Configuration[]>(QUERY_KEYS.all);
      
      // Optimistically remove from cache
      queryClient.setQueryData<Configuration[]>(
        QUERY_KEYS.all,
        (old) => old?.filter(config => config.id !== id)
      );
      
      return { previousConfigs };
    },
    
    onError: (err, id, context) => {
      // Roll back on error
      if (context?.previousConfigs) {
        queryClient.setQueryData(QUERY_KEYS.all, context.previousConfigs);
      }
      
      clientLogger.error('Failed to delete configuration', err as Error, 'configuration', { configId: id });
    },
    
    onSuccess: (_, id) => {
      // Remove individual config from cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.detail(id) });
      
      // Use centralized invalidation pattern
      invalidationPatterns.onConfigurationMutation(queryClient, 'delete', id);
      
      clientLogger.info('Configuration deleted successfully', 'configuration', {
        configId: id
      });
    },
    
    onSettled: () => {
      // Refetch configurations
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });
}

/**
 * Hook for prefetching configurations (useful for SSR)
 */
export function usePrefetchConfigurations() {
  const queryClient = useQueryClient();
  
  return {
    prefetchConfigurations: () => 
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.all,
        queryFn: () => configurationApi.getConfigurations(),
        staleTime: 1000 * 60 * 5, // 5 minutes
      }),
    
    prefetchConfiguration: (id: ConfigurationId | string) => 
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.detail(id),
        queryFn: () => configurationApi.getConfiguration(id),
        staleTime: 1000 * 60 * 5, // 5 minutes
      }),
  };
}