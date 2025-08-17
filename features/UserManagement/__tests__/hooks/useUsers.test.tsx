/**
 * @fileoverview Tests for useUsers hook
 * @module features/UserManagement/__tests__/hooks/useUsers.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactElement } from 'react';

// Mock client logger - must be at top level
vi.mock('@/lib/logger.client', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }
}));

// Mock server actions - must be at top level
vi.mock('@/app/actions/user-management', () => ({
  getAllUsers: vi.fn()
}));

import { 
  useUsers, 
  useUsersByRole, 
  useUsersByStatus, 
  useCachedUsers,
  userQueryKeys 
} from '../../hooks/useUsers';
import { getAllUsers } from '@/app/actions/user-management';
import logger from '@/lib/logger.client';
import type { UserListResponse, UserListQuery } from '../../domain/schemas/userManagement';

/**
 * Test suite for useUsers hook and related user query hooks.
 * 
 * Tests query functionality, caching, error handling, retry logic,
 * and integration with TanStack Query.
 */
describe('useUsers Hook', () => {
  let queryClient: QueryClient;

  const mockUserListResponse: UserListResponse = {
    users: [
      {
        id: 'user-1',
        displayName: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        enabled: true,
        lastLogin: 'Aug 15, 2023',
        createdAt: 'Aug 1, 2023',
      },
      {
        id: 'admin-1',
        displayName: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        enabled: true,
        lastLogin: null,
        createdAt: 'Jul 30, 2023',
      }
    ],
    nextCursor: 'next-page-token',
  };

  const wrapper = ({ children }: { children: ReactElement }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { 
          retry: false,
          staleTime: 0,
          cacheTime: 0
        },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('userQueryKeys', () => {
    /**
     * Tests query key factory generates correct keys.
     */
    it('should generate correct query keys', () => {
      expect(userQueryKeys.all).toEqual(['users']);
      expect(userQueryKeys.lists()).toEqual(['users', 'list']);
      expect(userQueryKeys.list({ limit: 10 })).toEqual(['users', 'list', { limit: 10 }]);
      expect(userQueryKeys.stats()).toEqual(['users', 'stats']);
    });

    /**
     * Tests query keys are unique for different parameters.
     */
    it('should generate unique keys for different query parameters', () => {
      const key1 = userQueryKeys.list({ role: 'admin', enabled: true });
      const key2 = userQueryKeys.list({ role: 'user', enabled: false });
      const key3 = userQueryKeys.list({ limit: 20, cursor: 'abc' });

      expect(key1).not.toEqual(key2);
      expect(key2).not.toEqual(key3);
      expect(key1).not.toEqual(key3);
    });
  });

  describe('useUsers', () => {
    /**
     * Tests successful user list fetching with default parameters.
     */
    it('should fetch users successfully with default parameters', async () => {
      vi.mocked(getAllUsers).mockResolvedValue(mockUserListResponse);

      const { result } = renderHook(() => useUsers(), { wrapper });

      // Initially loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockUserListResponse);
      expect(result.current.isError).toBe(false);

      expect(vi.mocked(getAllUsers)).toHaveBeenCalledWith({});
      expect(vi.mocked(logger).info).toHaveBeenCalledWith(
        'Fetching users list',
        'query',
        expect.objectContaining({
          query: { limit: undefined, role: undefined, enabled: undefined }
        })
      );
      expect(vi.mocked(logger).info).toHaveBeenCalledWith(
        'Successfully fetched users list',
        'query',
        expect.objectContaining({
          userCount: 2,
          hasNextPage: true
        })
      );
    });

    /**
     * Tests user list fetching with custom query parameters.
     */
    it('should fetch users with custom query parameters', async () => {
      const customQuery: UserListQuery = {
        limit: 5,
        role: 'admin',
        enabled: true,
        cursor: 'test-cursor'
      };

      vi.mocked(getAllUsers).mockResolvedValue(mockUserListResponse);

      const { result } = renderHook(() => useUsers(customQuery), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(vi.mocked(getAllUsers)).toHaveBeenCalledWith(customQuery);
      expect(vi.mocked(logger).info).toHaveBeenCalledWith(
        'Fetching users list',
        'query',
        expect.objectContaining({
          query: { limit: 5, role: 'admin', enabled: true }
        })
      );
    });

    /**
     * Tests user list fetching with custom options.
     */
    it('should respect custom query options', async () => {
      vi.mocked(getAllUsers).mockResolvedValue(mockUserListResponse);

      const { result } = renderHook(
        () => useUsers({}, { 
          enabled: false,
          staleTime: 10000,
          refetchInterval: 5000
        }), 
        { wrapper }
      );

      // Should not fetch when disabled
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(vi.mocked(getAllUsers)).not.toHaveBeenCalled();
    });

    /**
     * Tests error handling and logging.
     */
    it.skip('should handle errors properly', async () => {
      const testError = new Error('Server error');
      vi.mocked(getAllUsers).mockRejectedValue(testError);

      const { result } = renderHook(() => useUsers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, { timeout: 2000 });

      expect(result.current.error).toEqual(testError);
      expect(result.current.data).toBeUndefined();

      expect(vi.mocked(logger).error).toHaveBeenCalledWith(
        'Failed to fetch users list',
        testError,
        'query',
        expect.objectContaining({ query: {} })
      );
    });

    /**
     * Tests handling of non-Error objects.
     */
    it.skip('should handle non-Error objects as errors', async () => {
      vi.mocked(getAllUsers).mockRejectedValue('String error');

      const { result } = renderHook(() => useUsers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, { timeout: 2000 });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('String error');

      expect(vi.mocked(logger).error).toHaveBeenCalledWith(
        'Failed to fetch users list',
        expect.any(Error),
        'query',
        expect.any(Object)
      );
    });

    /**
     * Tests retry logic for authentication errors.
     */
    it('should not retry on authentication errors', async () => {
      const authError = new Error('Unauthorized access');
      vi.mocked(getAllUsers).mockRejectedValue(authError);

      const { result } = renderHook(() => useUsers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Should only be called once (no retries)
      expect(vi.mocked(getAllUsers)).toHaveBeenCalledTimes(1);
      expect(vi.mocked(logger).warn).toHaveBeenCalledWith(
        'Authentication error in users query, not retrying',
        'query',
        expect.objectContaining({
          error: 'Unauthorized access'
        })
      );
    });

    /**
     * Tests retry logic for redirect errors.
     */
    it('should not retry on redirect errors', async () => {
      const redirectError = new Error('redirect to /signin');
      vi.mocked(getAllUsers).mockRejectedValue(redirectError);

      const { result } = renderHook(() => useUsers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(vi.mocked(getAllUsers)).toHaveBeenCalledTimes(1);
      expect(vi.mocked(logger).warn).toHaveBeenCalledWith(
        'Authentication error in users query, not retrying',
        'query',
        expect.objectContaining({
          error: 'redirect to /signin'
        })
      );
    });

    /**
     * Tests retry logic for network errors.
     */
    it.skip('should retry on network errors', async () => {
      const networkError = new Error('Network error');
      vi.mocked(getAllUsers)
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce(mockUserListResponse);

      // Enable retries for this test
      const testQueryClient = new QueryClient({
        defaultOptions: {
          queries: { 
            retry: (failureCount, error) => {
              // Use the same retry logic as the hook
              if (error?.message?.includes('Unauthorized') || error?.message?.includes('redirect')) {
                return false;
              }
              return failureCount < 3;
            },
            retryDelay: 50, // Fast retries for testing
          },
        },
      });

      const testWrapper = ({ children }: { children: ReactElement }) => (
        <QueryClientProvider client={testQueryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useUsers(), { wrapper: testWrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 3000 });

      // Should have retried and eventually succeeded
      expect(vi.mocked(getAllUsers)).toHaveBeenCalledTimes(3);
      expect(result.current.data).toEqual(mockUserListResponse);
    });

    /**
     * Tests query caching behavior.
     */
    it('should cache query results properly', async () => {
      vi.mocked(getAllUsers).mockResolvedValue(mockUserListResponse);

      const { result: result1 } = renderHook(() => useUsers({ limit: 10 }), { wrapper });
      
      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
      });

      // Second hook with same parameters should use cached data
      const { result: result2 } = renderHook(() => useUsers({ limit: 10 }), { wrapper });

      expect(result2.current.data).toEqual(mockUserListResponse);
      expect(result2.current.isLoading).toBe(false);
      
      // Should only have called the API once
      expect(vi.mocked(getAllUsers)).toHaveBeenCalledTimes(1);
    });

    /**
     * Tests that different query parameters create separate cache entries.
     */
    it('should create separate cache entries for different queries', async () => {
      vi.mocked(getAllUsers).mockResolvedValue(mockUserListResponse);

      const { result: result1 } = renderHook(() => useUsers({ role: 'admin' }), { wrapper });
      const { result: result2 } = renderHook(() => useUsers({ role: 'user' }), { wrapper });

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
        expect(result2.current.isSuccess).toBe(true);
      });

      // Should have called API twice with different parameters
      expect(vi.mocked(getAllUsers)).toHaveBeenCalledTimes(2);
      expect(vi.mocked(getAllUsers)).toHaveBeenCalledWith({ role: 'admin' });
      expect(vi.mocked(getAllUsers)).toHaveBeenCalledWith({ role: 'user' });
    });
  });

  describe('useUsersByRole', () => {
    /**
     * Tests filtering users by role.
     */
    it('should fetch users filtered by role', async () => {
      vi.mocked(getAllUsers).mockResolvedValue(mockUserListResponse);

      const { result } = renderHook(() => useUsersByRole('admin'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(vi.mocked(getAllUsers)).toHaveBeenCalledWith({ role: 'admin' });
      expect(result.current.data).toEqual(mockUserListResponse);
    });

    /**
     * Tests custom options with role filtering.
     */
    it('should respect custom options', async () => {
      vi.mocked(getAllUsers).mockResolvedValue(mockUserListResponse);

      const { result } = renderHook(
        () => useUsersByRole('user', { enabled: false }), 
        { wrapper }
      );

      expect(result.current.isLoading).toBe(false);
      expect(vi.mocked(getAllUsers)).not.toHaveBeenCalled();
    });
  });

  describe('useUsersByStatus', () => {
    /**
     * Tests filtering users by enabled status.
     */
    it('should fetch users filtered by enabled status', async () => {
      vi.mocked(getAllUsers).mockResolvedValue(mockUserListResponse);

      const { result } = renderHook(() => useUsersByStatus(true), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(vi.mocked(getAllUsers)).toHaveBeenCalledWith({ enabled: true });
      expect(result.current.data).toEqual(mockUserListResponse);
    });

    /**
     * Tests filtering disabled users.
     */
    it('should fetch disabled users', async () => {
      vi.mocked(getAllUsers).mockResolvedValue(mockUserListResponse);

      const { result } = renderHook(() => useUsersByStatus(false), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(vi.mocked(getAllUsers)).toHaveBeenCalledWith({ enabled: false });
    });
  });

  describe('useCachedUsers', () => {
    /**
     * Tests retrieving cached user data without triggering fetch.
     */
    it('should return cached data without triggering fetch', () => {
      // Pre-populate cache
      queryClient.setQueryData(
        userQueryKeys.list({}), 
        mockUserListResponse
      );

      const { result } = renderHook(() => useCachedUsers(), { wrapper });

      expect(result.current).toEqual(mockUserListResponse);
      expect(vi.mocked(getAllUsers)).not.toHaveBeenCalled();
    });

    /**
     * Tests returning undefined when no cached data exists.
     */
    it('should return undefined when no cached data exists', () => {
      const { result } = renderHook(() => useCachedUsers(), { wrapper });

      expect(result.current).toBeUndefined();
      expect(vi.mocked(getAllUsers)).not.toHaveBeenCalled();
    });

    /**
     * Tests retrieving cached data with specific query parameters.
     */
    it('should return cached data for specific query', () => {
      const specificQuery = { role: 'admin' as const };
      
      // Pre-populate cache with specific query
      queryClient.setQueryData(
        userQueryKeys.list(specificQuery), 
        mockUserListResponse
      );

      const { result } = renderHook(() => useCachedUsers(specificQuery), { wrapper });

      expect(result.current).toEqual(mockUserListResponse);
    });
  });

  describe('Hook Integration', () => {
    /**
     * Tests multiple hooks working together.
     */
    it('should handle multiple hooks with shared cache', async () => {
      vi.mocked(getAllUsers).mockResolvedValue(mockUserListResponse);

      // Start general users query
      const { result: generalResult } = renderHook(() => useUsers(), { wrapper });
      
      await waitFor(() => {
        expect(generalResult.current.isSuccess).toBe(true);
      });

      // Start role-specific query
      const { result: adminResult } = renderHook(() => useUsersByRole('admin'), { wrapper });
      
      await waitFor(() => {
        expect(adminResult.current.isSuccess).toBe(true);
      });

      // Should have made two separate API calls
      expect(vi.mocked(getAllUsers)).toHaveBeenCalledTimes(2);
      expect(vi.mocked(getAllUsers)).toHaveBeenCalledWith({});
      expect(vi.mocked(getAllUsers)).toHaveBeenCalledWith({ role: 'admin' });

      // Both should have data
      expect(generalResult.current.data).toEqual(mockUserListResponse);
      expect(adminResult.current.data).toEqual(mockUserListResponse);
    });

    /**
     * Tests error handling across multiple hooks.
     */
    it.skip('should handle errors independently across hooks', async () => {
      const error = new Error('API Error');
      vi.mocked(getAllUsers)
        .mockResolvedValueOnce(mockUserListResponse) // First call succeeds
        .mockRejectedValueOnce(error); // Second call fails

      const { result: result1 } = renderHook(() => useUsers({ role: 'admin' }), { wrapper });
      const { result: result2 } = renderHook(() => useUsers({ role: 'user' }), { wrapper });

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
        expect(result2.current.isError).toBe(true);
      }, { timeout: 2000 });

      expect(result1.current.data).toEqual(mockUserListResponse);
      expect(result2.current.error).toEqual(error);
    });

    /**
     * Tests stale time behavior.
     */
    it('should respect stale time configuration', async () => {
      vi.mocked(getAllUsers).mockResolvedValue(mockUserListResponse);

      // Short stale time
      const { result } = renderHook(
        () => useUsers({}, { staleTime: 100 }), 
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(vi.mocked(getAllUsers)).toHaveBeenCalledTimes(1);

      // Wait for stale time to pass
      await new Promise(resolve => setTimeout(resolve, 150));

      // Trigger refetch by creating another hook with same query
      const { result: result2 } = renderHook(
        () => useUsers({}, { staleTime: 100 }), 
        { wrapper }
      );

      await waitFor(() => {
        expect(result2.current.isSuccess).toBe(true);
      });

      // Should have refetched due to stale data
      expect(vi.mocked(getAllUsers)).toHaveBeenCalledTimes(2);
    });
  });
});