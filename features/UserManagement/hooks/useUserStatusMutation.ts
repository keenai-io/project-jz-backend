/**
 * useUserStatusMutation Hook
 * 
 * Custom hook for updating user status with optimistic updates.
 * Provides mutation state management and cache invalidation.
 */

'use client'

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import logger from '@/lib/logger.client'
import { updateUserStatus } from '@/app/actions/user-management'
import { userQueryKeys } from './useUsers'
import type { 
  UserStatusUpdateResponse, 
  UserListResponse 
} from '../domain/schemas/userManagement'

/**
 * Mutation parameters for user status update
 */
interface UserStatusMutationParams {
  userId: string
  enabled: boolean
}

/**
 * Options for the user status mutation
 */
interface UseUserStatusMutationOptions {
  onSuccess?: (data: UserStatusUpdateResponse, variables: UserStatusMutationParams) => void
  onError?: (error: Error, variables: UserStatusMutationParams) => void
  enableOptimisticUpdates?: boolean
}

/**
 * Hook for updating user enabled status with optimistic updates
 */
export function useUserStatusMutation(
  options: UseUserStatusMutationOptions = {}
): UseMutationResult<UserStatusUpdateResponse, Error, UserStatusMutationParams> {
  const queryClient = useQueryClient()
  const { 
    onSuccess, 
    onError, 
    enableOptimisticUpdates = true 
  } = options

  return useMutation({
    mutationFn: async ({ userId, enabled }: UserStatusMutationParams): Promise<UserStatusUpdateResponse> => {
      try {
        logger.info('Updating user status', 'ui', { 
          userId, 
          enabled 
        })

        const result = await updateUserStatus(userId, enabled)
        
        if (result.success) {
          logger.info('Successfully updated user status', 'ui', { 
            userId, 
            enabled,
            userEmail: result.user?.email 
          })
        } else {
          logger.error('Failed to update user status', new Error(result.error || 'Unknown error'), 'ui', { 
            userId, 
            enabled 
          })
        }
        
        return result
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error))
        logger.error('User status update mutation failed', errorObj, 'ui', { 
          userId, 
          enabled 
        })
        throw errorObj
      }
    },

    onMutate: async ({ userId, enabled }: UserStatusMutationParams) => {
      if (!enableOptimisticUpdates) return

      try {
        logger.info('Starting optimistic update for user status', 'ui', { 
          userId, 
          enabled 
        })

        // Cancel outgoing refetches for user lists
        await queryClient.cancelQueries({ queryKey: userQueryKeys.lists() })

        // Snapshot previous values for rollback
        const previousUserLists: Record<string, UserListResponse | undefined> = {}
        
        // Get all current user list queries in cache
        queryClient.getQueriesData({ queryKey: userQueryKeys.lists() })
          .forEach(([queryKey, data]) => {
            if (data) {
              previousUserLists[JSON.stringify(queryKey)] = data as UserListResponse
            }
          })

        // Optimistically update all user lists that contain this user
        queryClient.setQueriesData(
          { queryKey: userQueryKeys.lists() },
          (oldData: UserListResponse | undefined) => {
            if (!oldData) return oldData

            const updatedUsers = oldData.users.map(user => 
              user.id === userId 
                ? { ...user, enabled }
                : user
            )

            // Only update if the user was actually found
            const wasUpdated = updatedUsers.some((user, index) => 
              user.id === userId && oldData.users[index]?.enabled !== enabled
            )

            if (wasUpdated) {
              logger.info('Applied optimistic update to user list', 'ui', { 
                userId, 
                enabled,
                listLength: updatedUsers.length 
              })
            }

            return wasUpdated 
              ? { ...oldData, users: updatedUsers }
              : oldData
          }
        )

        return { previousUserLists }
      } catch (error) {
        logger.error('Error during optimistic update', error instanceof Error ? error : new Error(String(error)), 'ui', { 
          userId, 
          enabled 
        })
        return undefined
      }
    },

    onError: (error: Error, variables: UserStatusMutationParams, context) => {
      logger.error('User status mutation failed, rolling back optimistic updates', error, 'ui', { 
        userId: variables.userId,
        enabled: variables.enabled 
      })

      // Rollback optimistic updates
      if (context?.previousUserLists && enableOptimisticUpdates) {
        Object.entries(context.previousUserLists).forEach(([queryKeyStr, data]) => {
          try {
            const queryKey = JSON.parse(queryKeyStr)
            if (data) {
              queryClient.setQueryData(queryKey, data)
              logger.info('Rolled back optimistic update for query', 'ui', { 
                queryKey: queryKeyStr 
              })
            }
          } catch (parseError) {
            logger.warn('Failed to parse query key during rollback', 'ui', { 
              queryKeyStr,
              error: parseError instanceof Error ? parseError.message : String(parseError) 
            })
          }
        })
      }

      // Call custom error handler
      onError?.(error, variables)
    },

    onSuccess: (data: UserStatusUpdateResponse, variables: UserStatusMutationParams) => {
      if (data.success) {
        logger.info('User status mutation completed successfully', 'ui', { 
          userId: variables.userId,
          enabled: variables.enabled,
          userEmail: data.user?.email 
        })

        // Invalidate all user-related queries to ensure fresh data
        queryClient.invalidateQueries({ queryKey: userQueryKeys.all })
        
        // Call custom success handler
        onSuccess?.(data, variables)
      } else {
        // Treat unsuccessful responses as errors
        const error = new Error(data.error || 'Update failed')
        logger.error('User status mutation returned failure', error, 'ui', { 
          userId: variables.userId,
          enabled: variables.enabled 
        })
        
        // Call custom error handler
        onError?.(error, variables)
      }
    },

    onSettled: () => {
      // Always refetch user data after mutation settles to ensure consistency
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all })
      
      logger.info('User status mutation settled, invalidated user queries', 'ui')
    },
  })
}

/**
 * Hook for bulk user status updates (if needed in the future)
 */
export function useBulkUserStatusMutation(
  options: {
    onSuccess?: (successCount: number, failureCount: number) => void
    onError?: (error: Error) => void
  } = {}
) {
  const singleMutation = useUserStatusMutation({ enableOptimisticUpdates: false })
  
  // This would be implemented for bulk operations
  // For now, return a simplified version that processes one by one
  return {
    mutateAsync: async (updates: UserStatusMutationParams[]) => {
      logger.info('Starting bulk user status update', 'ui', { 
        updateCount: updates.length 
      })
      
      let successCount = 0
      let failureCount = 0
      
      for (const update of updates) {
        try {
          const result = await singleMutation.mutateAsync(update)
          if (result.success) {
            successCount++
          } else {
            failureCount++
          }
        } catch (error) {
          failureCount++
          logger.error('Bulk update item failed', error instanceof Error ? error : new Error(String(error)), 'ui', { 
            update 
          })
        }
      }
      
      logger.info('Bulk user status update completed', 'ui', { 
        successCount, 
        failureCount 
      })
      
      options.onSuccess?.(successCount, failureCount)
      return { successCount, failureCount }
    },
    isPending: singleMutation.isPending,
  }
}