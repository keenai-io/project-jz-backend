'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { 
  ConfigurationForm
} from '@features/Configuration/domain/schemas/ConfigurationSchemas';
import clientLogger from '@/lib/logger.client';
import { saveUserConfiguration, getUserConfiguration } from '@/app/actions/configuration';

/**
 * React Query hook for fetching user configuration from Firestore
 * 
 * Provides cached configuration data with automatic refetching.
 */
export function useUserConfiguration() {
  return useQuery({
    queryKey: ['userConfiguration'],
    queryFn: async () => {
      clientLogger.info('Fetching user configuration', 'configuration')
      const config = await getUserConfiguration()
      clientLogger.info('User configuration fetched', 'configuration', { hasConfig: !!config })
      return config
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })
}

/**
 * React Query mutation hook for saving user configuration to Firestore
 * 
 * Provides optimistic updates and proper error handling for configuration saves.
 */
export function useUserConfigurationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (configData: ConfigurationForm) => {
      clientLogger.info('Saving user configuration', 'configuration', { configKeys: Object.keys(configData) })
      await saveUserConfiguration(configData)
      return configData
    },
    onMutate: async (newConfig) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['userConfiguration'] })

      // Snapshot the previous value
      const previousConfig = queryClient.getQueryData<ConfigurationForm>(['userConfiguration'])

      // Optimistically update to the new value
      queryClient.setQueryData(['userConfiguration'], newConfig)

      clientLogger.info('Applied optimistic update for configuration', 'configuration')

      // Return a context object with the snapshotted value
      return { previousConfig }
    },
    onError: (error, newConfig, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousConfig) {
        queryClient.setQueryData(['userConfiguration'], context.previousConfig)
      }
      
      clientLogger.error('Failed to save configuration', 
        error instanceof Error ? error : new Error(String(error)), 
        'configuration', 
        { configKeys: Object.keys(newConfig) }
      )
    },
    onSuccess: () => {
      clientLogger.info('Configuration saved successfully', 'configuration')
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['userConfiguration'] })
    },
  })
}