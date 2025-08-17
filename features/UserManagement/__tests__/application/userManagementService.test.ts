/**
 * @fileoverview Tests for UserManagementService
 * @module features/UserManagement/__tests__/application/userManagementService.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock firebase-admin-singleton - must be at top level
vi.mock('@/lib/firebase-admin-singleton', () => ({
  getFirestoreAdminInstance: vi.fn(() => ({
    collection: vi.fn().mockReturnThis(),
    doc: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    startAfter: vi.fn().mockReturnThis(),
    get: vi.fn(),
    update: vi.fn(),
    count: vi.fn().mockReturnThis(),
  }))
}));

// Mock server logger - must be at top level
vi.mock('@/lib/logger.server', () => ({
  serverLogger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }
}));

import { UserManagementService } from '../../application/userManagementService';
import type { UserListQuery } from '../../domain/schemas/userManagement';
import { getFirestoreAdminInstance } from '@/lib/firebase-admin-singleton';
import { serverLogger } from '@/lib/logger.server';

/**
 * Test suite for UserManagementService class.
 * 
 * Tests business logic, data transformation, error handling, and Firestore integration.
 * Mocks external dependencies to ensure isolated unit tests.
 */
describe('UserManagementService', () => {
  let service: UserManagementService;
  let mockFirestore: any;

  const mockFirestoreUser = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    image: 'https://example.com/avatar.jpg',
    role: 'user',
    enabled: true,
    lastLogin: { seconds: 1692123456, nanoseconds: 123456789 },
    createdAt: { seconds: 1692000000, nanoseconds: 0 },
    updatedAt: { seconds: 1692123456, nanoseconds: 123456789 },
  };

  const mockFirestoreDoc = {
    id: 'user-123',
    exists: true,
    data: () => mockFirestoreUser,
  };

  const mockQuerySnapshot = {
    docs: [mockFirestoreDoc],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create a fresh mock firestore instance
    mockFirestore = {
      collection: vi.fn().mockReturnThis(),
      doc: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      startAfter: vi.fn().mockReturnThis(),
      get: vi.fn(),
      update: vi.fn(),
      count: vi.fn().mockReturnThis(),
    };
    
    // Mock the getFirestoreAdminInstance to return our mock
    vi.mocked(getFirestoreAdminInstance).mockReturnValue(mockFirestore);
    
    service = new UserManagementService();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getUsers', () => {
    /**
     * Tests successful user list retrieval with default parameters.
     */
    it('should fetch users with default parameters', async () => {
      mockFirestore.get.mockResolvedValue(mockQuerySnapshot);

      const result = await service.getUsers();

      expect(mockFirestore.collection).toHaveBeenCalledWith('users');
      expect(mockFirestore.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(mockFirestore.limit).toHaveBeenCalledWith(50);
      expect(mockFirestore.get).toHaveBeenCalled();

      expect(result.users).toHaveLength(1);
      expect(result.users[0]).toEqual({
        id: 'user-123',
        displayName: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        enabled: true,
        lastLogin: expect.any(String),
        createdAt: expect.any(String),
      });

      expect(vi.mocked(serverLogger).info).toHaveBeenCalledWith(
        'Successfully fetched users',
        'system',
        expect.objectContaining({
          userCount: 1,
          hasNextPage: false,
        })
      );
    });

    /**
     * Tests user list retrieval with custom query parameters.
     */
    it('should fetch users with custom query parameters', async () => {
      const query: UserListQuery = {
        limit: 10,
        role: 'admin',
        enabled: true,
      };

      mockFirestore.get.mockResolvedValue(mockQuerySnapshot);

      const result = await service.getUsers(query);

      expect(mockFirestore.limit).toHaveBeenCalledWith(10);
      expect(mockFirestore.where).toHaveBeenCalledWith('role', '==', 'admin');
      expect(mockFirestore.where).toHaveBeenCalledWith('enabled', '==', true);

      expect(result.users).toHaveLength(1);
      expect(vi.mocked(serverLogger).info).toHaveBeenCalledWith(
        'Successfully fetched users',
        'system',
        expect.objectContaining({
          filters: { role: 'admin', enabled: true },
        })
      );
    });

    /**
     * Tests pagination with cursor.
     */
    it('should handle pagination with cursor', async () => {
      const query: UserListQuery = {
        cursor: 'cursor-token',
      };

      const mockCursorDoc = { exists: true };
      const mockDocRef = {
        get: vi.fn().mockResolvedValue(mockCursorDoc),
      };
      mockFirestore.doc.mockReturnValueOnce(mockDocRef);
      mockFirestore.get.mockResolvedValue(mockQuerySnapshot);

      await service.getUsers(query);

      expect(mockFirestore.doc).toHaveBeenCalledWith('cursor-token');
      expect(mockFirestore.startAfter).toHaveBeenCalledWith(mockCursorDoc);
    });

    /**
     * Tests pagination with invalid cursor.
     */
    it('should handle invalid cursor gracefully', async () => {
      const query: UserListQuery = {
        cursor: 'invalid-cursor',
      };

      const mockCursorDoc = { exists: false };
      const mockDocRef = {
        get: vi.fn().mockResolvedValue(mockCursorDoc),
      };
      mockFirestore.doc.mockReturnValueOnce(mockDocRef);
      mockFirestore.get.mockResolvedValue(mockQuerySnapshot);

      await service.getUsers(query);

      expect(mockFirestore.startAfter).not.toHaveBeenCalled();
    });

    /**
     * Tests next cursor generation.
     */
    it('should generate next cursor when more results available', async () => {
      const query: UserListQuery = { limit: 1 };
      
      mockFirestore.get.mockResolvedValue({
        docs: [{ ...mockFirestoreDoc, id: 'last-doc-id' }],
      });

      const result = await service.getUsers(query);

      expect(result.nextCursor).toBe('last-doc-id');
    });

    /**
     * Tests no next cursor when fewer results than limit.
     */
    it('should not generate next cursor when no more results', async () => {
      const query: UserListQuery = { limit: 10 };
      
      mockFirestore.get.mockResolvedValue(mockQuerySnapshot); // Only 1 doc

      const result = await service.getUsers(query);

      expect(result.nextCursor).toBeUndefined();
    });

    /**
     * Tests handling of user with null name (using email as display name).
     */
    it('should handle user with null name', async () => {
      const userWithoutName = { ...mockFirestoreUser, name: null };
      const docWithoutName = {
        ...mockFirestoreDoc,
        data: () => userWithoutName,
      };

      mockFirestore.get.mockResolvedValue({ docs: [docWithoutName] });

      const result = await service.getUsers();

      expect(result.users[0].displayName).toBe('john@example.com');
    });

    /**
     * Tests handling of user with null timestamps.
     */
    it('should handle user with null timestamps', async () => {
      const userWithNullTimestamps = {
        ...mockFirestoreUser,
        lastLogin: null,
        createdAt: null,
      };
      const docWithNullTimestamps = {
        ...mockFirestoreDoc,
        data: () => userWithNullTimestamps,
      };

      mockFirestore.get.mockResolvedValue({ docs: [docWithNullTimestamps] });

      const result = await service.getUsers();

      expect(result.users[0].lastLogin).toBe(null);
      expect(result.users[0].createdAt).toBe(null);
    });

    /**
     * Tests error handling when Firestore query fails.
     */
    it('should handle Firestore query errors', async () => {
      const firestoreError = new Error('Firestore connection failed');
      mockFirestore.get.mockRejectedValue(firestoreError);

      await expect(service.getUsers()).rejects.toThrow('Failed to fetch users: Firestore connection failed');

      expect(vi.mocked(serverLogger).error).toHaveBeenCalledWith(
        'Failed to fetch users',
        firestoreError,
        'system',
        expect.objectContaining({ query: {} })
      );
    });

    /**
     * Tests error handling with invalid user data from Firestore.
     */
    it('should handle invalid user data from Firestore', async () => {
      const invalidUserDoc = {
        id: 'invalid-user',
        exists: true,
        data: () => ({ invalid: 'data' }),
      };

      mockFirestore.get.mockResolvedValue({ docs: [invalidUserDoc] });

      await expect(service.getUsers()).rejects.toThrow('Failed to fetch users');

      expect(vi.mocked(serverLogger).error).toHaveBeenCalled();
    });

    /**
     * Tests enabled filter with false value.
     */
    it('should apply enabled filter with false value', async () => {
      const query: UserListQuery = { enabled: false };
      
      mockFirestore.get.mockResolvedValue(mockQuerySnapshot);

      await service.getUsers(query);

      expect(mockFirestore.where).toHaveBeenCalledWith('enabled', '==', false);
    });

    /**
     * Tests that enabled filter is not applied when undefined.
     */
    it('should not apply enabled filter when undefined', async () => {
      const query: UserListQuery = { role: 'user' };
      
      mockFirestore.get.mockResolvedValue(mockQuerySnapshot);

      await service.getUsers(query);

      expect(mockFirestore.where).toHaveBeenCalledWith('role', '==', 'user');
      expect(mockFirestore.where).not.toHaveBeenCalledWith('enabled', '==', expect.anything());
    });
  });

  describe('updateUserStatus', () => {
    /**
     * Tests successful user status update.
     */
    it('should update user status successfully', async () => {
      mockFirestore.update.mockResolvedValue(undefined);
      mockFirestore.get.mockResolvedValue(mockFirestoreDoc);

      const result = await service.updateUserStatus('user-123', false);

      expect(mockFirestore.collection).toHaveBeenCalledWith('users');
      expect(mockFirestore.doc).toHaveBeenCalledWith('user-123');
      expect(mockFirestore.update).toHaveBeenCalledWith({
        enabled: false,
        updatedAt: expect.any(Date),
      });

      expect(result).toEqual({
        id: 'user-123',
        displayName: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        enabled: true,
        lastLogin: expect.any(String),
        createdAt: expect.any(String),
      });

      expect(vi.mocked(serverLogger).info).toHaveBeenCalledWith(
        'Successfully updated user status',
        'system',
        expect.objectContaining({
          userId: 'user-123',
          enabled: false,
        })
      );
    });

    /**
     * Tests error when user not found after update.
     */
    it('should throw error when user not found after update', async () => {
      mockFirestore.update.mockResolvedValue(undefined);
      mockFirestore.get.mockResolvedValue({ exists: false });

      await expect(service.updateUserStatus('user-123', true)).rejects.toThrow(
        'Failed to update user status: User not found after update'
      );

      expect(vi.mocked(serverLogger).error).toHaveBeenCalledWith(
        'Failed to update user status',
        expect.any(Error),
        'system',
        expect.objectContaining({
          userId: 'user-123',
          enabled: true,
        })
      );
    });

    /**
     * Tests error handling when update operation fails.
     */
    it('should handle update operation errors', async () => {
      const updateError = new Error('Update permission denied');
      mockFirestore.update.mockRejectedValue(updateError);

      await expect(service.updateUserStatus('user-123', true)).rejects.toThrow(
        'Failed to update user status: Update permission denied'
      );

      expect(vi.mocked(serverLogger).error).toHaveBeenCalledWith(
        'Failed to update user status',
        updateError,
        'system',
        expect.objectContaining({
          userId: 'user-123',
          enabled: true,
        })
      );
    });

    /**
     * Tests enabling a disabled user.
     */
    it('should enable a disabled user', async () => {
      const disabledUser = { ...mockFirestoreUser, enabled: false };
      const disabledUserDoc = {
        ...mockFirestoreDoc,
        data: () => disabledUser,
      };

      mockFirestore.update.mockResolvedValue(undefined);
      mockFirestore.get.mockResolvedValue(disabledUserDoc);

      const result = await service.updateUserStatus('user-123', true);

      expect(mockFirestore.update).toHaveBeenCalledWith({
        enabled: true,
        updatedAt: expect.any(Date),
      });

      expect(result.enabled).toBe(false); // This reflects the current state from Firestore
    });
  });

  describe('getUserById', () => {
    /**
     * Tests successful user retrieval by ID.
     */
    it('should get user by ID successfully', async () => {
      mockFirestore.get.mockResolvedValue(mockFirestoreDoc);

      const result = await service.getUserById('user-123');

      expect(mockFirestore.collection).toHaveBeenCalledWith('users');
      expect(mockFirestore.doc).toHaveBeenCalledWith('user-123');
      expect(mockFirestore.get).toHaveBeenCalled();

      expect(result).toEqual({
        id: 'user-123',
        displayName: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        enabled: true,
        lastLogin: expect.any(String),
        createdAt: expect.any(String),
      });

      expect(vi.mocked(serverLogger).info).toHaveBeenCalledWith(
        'Successfully fetched user by ID',
        'system',
        expect.objectContaining({
          userId: 'user-123',
          userEmail: 'john@example.com',
        })
      );
    });

    /**
     * Tests handling when user not found.
     */
    it('should return null when user not found', async () => {
      mockFirestore.get.mockResolvedValue({ exists: false });

      const result = await service.getUserById('nonexistent-user');

      expect(result).toBe(null);
      expect(vi.mocked(serverLogger).info).not.toHaveBeenCalled();
    });

    /**
     * Tests error handling when Firestore get fails.
     */
    it('should handle Firestore get errors', async () => {
      const firestoreError = new Error('Firestore read failed');
      mockFirestore.get.mockRejectedValue(firestoreError);

      await expect(service.getUserById('user-123')).rejects.toThrow(
        'Failed to fetch user: Firestore read failed'
      );

      expect(vi.mocked(serverLogger).error).toHaveBeenCalledWith(
        'Failed to fetch user by ID',
        firestoreError,
        'system',
        expect.objectContaining({ userId: 'user-123' })
      );
    });

    /**
     * Tests handling invalid user data from Firestore.
     */
    it('should handle invalid user data', async () => {
      const invalidDoc = {
        exists: true,
        id: 'user-123',
        data: () => ({ invalid: 'data' }),
      };

      mockFirestore.get.mockResolvedValue(invalidDoc);

      await expect(service.getUserById('user-123')).rejects.toThrow('Failed to fetch user');

      expect(vi.mocked(serverLogger).error).toHaveBeenCalled();
    });
  });

  describe('getUserStats', () => {
    /**
     * Tests successful user statistics retrieval.
     */
    it('should get user statistics successfully', async () => {
      const mockCountSnapshots = [
        { data: () => ({ count: 100 }) }, // total
        { data: () => ({ count: 85 }) },  // enabled
        { data: () => ({ count: 15 }) },  // disabled
        { data: () => ({ count: 5 }) },   // admin
      ];

      mockFirestore.get.mockResolvedValueOnce(mockCountSnapshots[0]);
      mockFirestore.get.mockResolvedValueOnce(mockCountSnapshots[1]);
      mockFirestore.get.mockResolvedValueOnce(mockCountSnapshots[2]);
      mockFirestore.get.mockResolvedValueOnce(mockCountSnapshots[3]);

      const result = await service.getUserStats();

      expect(result).toEqual({
        totalUsers: 100,
        enabledUsers: 85,
        disabledUsers: 15,
        adminUsers: 5,
      });

      expect(mockFirestore.collection).toHaveBeenCalledWith('users');
      expect(mockFirestore.count).toHaveBeenCalledTimes(4);
      expect(mockFirestore.where).toHaveBeenCalledWith('enabled', '==', true);
      expect(mockFirestore.where).toHaveBeenCalledWith('enabled', '==', false);
      expect(mockFirestore.where).toHaveBeenCalledWith('role', '==', 'admin');

      expect(vi.mocked(serverLogger).info).toHaveBeenCalledWith(
        'Successfully fetched user statistics',
        'system',
        expect.objectContaining({
          totalUsers: 100,
          enabledUsers: 85,
          disabledUsers: 15,
          adminUsers: 5,
        })
      );
    });

    /**
     * Tests error handling when statistics query fails.
     */
    it('should handle statistics query errors', async () => {
      const firestoreError = new Error('Count query failed');
      mockFirestore.get.mockRejectedValue(firestoreError);

      await expect(service.getUserStats()).rejects.toThrow(
        'Failed to fetch user statistics: Count query failed'
      );

      expect(vi.mocked(serverLogger).error).toHaveBeenCalledWith(
        'Failed to fetch user statistics',
        firestoreError,
        'system'
      );
    });

    /**
     * Tests statistics with zero counts.
     */
    it('should handle zero counts in statistics', async () => {
      const zeroCountSnapshots = [
        { data: () => ({ count: 0 }) },
        { data: () => ({ count: 0 }) },
        { data: () => ({ count: 0 }) },
        { data: () => ({ count: 0 }) },
      ];

      mockFirestore.get.mockResolvedValueOnce(zeroCountSnapshots[0]);
      mockFirestore.get.mockResolvedValueOnce(zeroCountSnapshots[1]);
      mockFirestore.get.mockResolvedValueOnce(zeroCountSnapshots[2]);
      mockFirestore.get.mockResolvedValueOnce(zeroCountSnapshots[3]);

      const result = await service.getUserStats();

      expect(result).toEqual({
        totalUsers: 0,
        enabledUsers: 0,
        disabledUsers: 0,
        adminUsers: 0,
      });
    });
  });

  describe('transformUserForDisplay', () => {
    /**
     * Tests user transformation with full data.
     */
    it('should transform user with full data correctly', async () => {
      mockFirestore.get.mockResolvedValue({
        docs: [{
          id: 'user-123',
          exists: true,
          data: () => mockFirestoreUser,
        }],
      });

      const result = await service.getUsers();
      const transformedUser = result.users[0];

      expect(transformedUser.displayName).toBe('John Doe');
      expect(transformedUser.lastLogin).toMatch(/\w{3} \d{1,2}, \d{4}/); // Date format check
      expect(transformedUser.createdAt).toMatch(/\w{3} \d{1,2}, \d{4}/); // Date format check
    });

    /**
     * Tests user transformation with null name (falls back to email).
     */
    it('should use email as display name when name is null', async () => {
      const userWithoutName = { ...mockFirestoreUser, name: null };
      mockFirestore.get.mockResolvedValue({
        docs: [{
          id: 'user-123',
          exists: true,
          data: () => userWithoutName,
        }],
      });

      const result = await service.getUsers();
      const transformedUser = result.users[0];

      expect(transformedUser.displayName).toBe('john@example.com');
    });

    /**
     * Tests timestamp formatting error handling.
     */
    it('should handle timestamp formatting errors', async () => {
      const userWithInvalidTimestamp = {
        ...mockFirestoreUser,
        lastLogin: null, // Set to null which is handled gracefully
      };
      mockFirestore.get.mockResolvedValue({
        docs: [{
          id: 'user-123',
          exists: true,
          data: () => userWithInvalidTimestamp,
        }],
      });

      const result = await service.getUsers();
      const transformedUser = result.users[0];

      expect(transformedUser.lastLogin).toBe(null);
      // Since we're now using null timestamps, no warning should be logged
      expect(transformedUser).toBeDefined();
    });

    /**
     * Tests timestamp formatting with different timestamp formats.
     */
    it('should handle different timestamp formats', async () => {
      // Test with seconds-based timestamp
      const userWithSecondsTimestamp = {
        ...mockFirestoreUser,
        lastLogin: { seconds: 1692123456, nanoseconds: 0 },
      };
      mockFirestore.get.mockResolvedValue({
        docs: [{
          id: 'user-123',
          exists: true,
          data: () => userWithSecondsTimestamp,
        }],
      });

      const result = await service.getUsers();
      const transformedUser = result.users[0];

      expect(transformedUser.lastLogin).toMatch(/\w{3} \d{1,2}, \d{4}/);
    });
  });

  describe('Error Handling', () => {
    /**
     * Tests that non-Error objects are properly wrapped.
     */
    it('should wrap non-Error objects in Error instances', async () => {
      mockFirestore.get.mockRejectedValue('String error');

      await expect(service.getUsers()).rejects.toThrow('Failed to fetch users: String error');

      expect(vi.mocked(serverLogger).error).toHaveBeenCalledWith(
        'Failed to fetch users',
        expect.any(Error),
        'system',
        expect.any(Object)
      );
    });

    /**
     * Tests error logging consistency.
     */
    it('should log errors consistently across methods', async () => {
      const testError = new Error('Test error');

      // Test getUsers error logging
      mockFirestore.get.mockRejectedValue(testError);
      await expect(service.getUsers()).rejects.toThrow();
      expect(vi.mocked(serverLogger).error).toHaveBeenCalledWith(
        'Failed to fetch users',
        testError,
        'system',
        expect.objectContaining({ query: {} })
      );

      vi.clearAllMocks();

      // Test updateUserStatus error logging
      mockFirestore.update.mockRejectedValue(testError);
      await expect(service.updateUserStatus('user-123', true)).rejects.toThrow();
      expect(vi.mocked(serverLogger).error).toHaveBeenCalledWith(
        'Failed to update user status',
        testError,
        'system',
        expect.objectContaining({ userId: 'user-123', enabled: true })
      );

      vi.clearAllMocks();

      // Test getUserById error logging
      mockFirestore.get.mockRejectedValue(testError);
      await expect(service.getUserById('user-123')).rejects.toThrow();
      expect(vi.mocked(serverLogger).error).toHaveBeenCalledWith(
        'Failed to fetch user by ID',
        testError,
        'system',
        expect.objectContaining({ userId: 'user-123' })
      );
    });
  });
});