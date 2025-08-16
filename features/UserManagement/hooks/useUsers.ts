/**
 * useUsers Hook
 * 
 * Custom hook for fetching and managing user data with TanStack Query.
 * Provides caching, loading states, and error handling for user list operations.
 */

'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import logger from '@/lib/logger.client'
import { getAllUsers } from '@/app/actions/user-management'
import type { UserListResponse, UserListQuery } from '../domain/schemas/userManagement'

/**
 * Query key factory for user-related queries
 */
export const userQueryKeys = {
  all: ['users'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: (query: UserListQuery) => [...userQueryKeys.lists(), query] as const,
  stats: () => [...userQueryKeys.all, 'stats'] as const,
} as const

/**
 * Hook for fetching user list with optional filtering and pagination
 */
export function useUsers(
  query: UserListQuery = {},
  options: {
    enabled?: boolean
    staleTime?: number
    refetchInterval?: number
  } = {}
): UseQueryResult<UserListResponse, Error> {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    refetchInterval,
  } = options

  return useQuery({
    queryKey: userQueryKeys.list(query),
    queryFn: async (): Promise<UserListResponse> => {
      try {
        logger.info('Fetching users list', 'query', { 
          query: { 
            limit: query.limit, 
            role: query.role, 
            enabled: query.enabled 
          } 
        })

        const result = await getAllUsers(query)
        
        logger.info('Successfully fetched users list', 'query', { 
          userCount: result.users.length,
          hasNextPage: !!result.nextCursor 
        })
        
        return result
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error))
        logger.error('Failed to fetch users list', errorObj, 'query', { 
          query 
        })
        throw errorObj
      }
    },
    enabled,
    staleTime,
    refetchInterval,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('redirect')) {
        logger.warn('Authentication error in users query, not retrying', 'query', { 
          error: error.message 
        })
        return false
      }
      
      // Retry up to 3 times for other errors
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook for fetching users with infinite pagination
 */
export function useInfiniteUsers(
  baseQuery: Omit<UserListQuery, 'cursor'> = {},
  options: {
    enabled?: boolean
    staleTime?: number
  } = {}
) {
  // Note: This would be implemented if infinite scrolling is needed
  // For now, we'll use regular pagination with next/previous buttons
  // Implementation would use useInfiniteQuery from TanStack Query
  
  // Placeholder implementation - return regular query for now
  return useUsers(baseQuery, options)
}

/**
 * Hook for fetching users filtered by role
 */
export function useUsersByRole(
  role: 'admin' | 'user',
  options: {
    enabled?: boolean
    staleTime?: number
  } = {}
): UseQueryResult<UserListResponse, Error> {
  return useUsers({ role }, options)
}

/**
 * Hook for fetching users filtered by enabled status
 */
export function useUsersByStatus(
  enabled: boolean,
  options: {
    enabled?: boolean
    staleTime?: number
  } = {}
): UseQueryResult<UserListResponse, Error> {
  return useUsers({ enabled }, options)
}

/**
 * Hook for getting cached user data without triggering a new fetch
 */
export function useCachedUsers(query: UserListQuery = {}): UserListResponse | undefined {
  const { data } = useUsers(query, { enabled: false })
  return data
}