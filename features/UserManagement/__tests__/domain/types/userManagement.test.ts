/**
 * @fileoverview Tests for UserManagement domain types
 * @module features/UserManagement/__tests__/domain/types/userManagement.test
 */

import { describe, it, expect } from 'vitest';
import {
  type UserManagementUser,
  type UserListItem,
  type UserStatusUpdate,
  type UserStatusUpdateResponse,
  type UserListQuery,
  type UserListResponse,
  type AdminUser,
  type ServerActionContext,
  type UserRole,
  userRoleSchema,
} from '../../../domain/types/userManagement';

/**
 * Test suite for UserManagement domain types.
 * 
 * Tests type definitions, type inference from schemas, and type compatibility.
 * These tests ensure TypeScript types work correctly and maintain consistency.
 */
describe('UserManagement Domain Types', () => {

  describe('Type Definitions', () => {
    /**
     * Tests that UserRole type accepts valid values.
     */
    it('should define UserRole type correctly', () => {
      const adminRole: UserRole = 'admin';
      const userRole: UserRole = 'user';
      
      expect(adminRole).toBe('admin');
      expect(userRole).toBe('user');
      
      // TypeScript compilation test - these should not cause type errors
      const roles: UserRole[] = ['admin', 'user'];
      expect(roles).toHaveLength(2);
    });

    /**
     * Tests UserManagementUser type structure.
     */
    it('should define UserManagementUser type correctly', () => {
      const user: UserManagementUser = {
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

      expect(user.id).toBe('user-123');
      expect(user.role).toBe('user');
      expect(user.enabled).toBe(true);
    });

    /**
     * Tests UserManagementUser with null optional fields.
     */
    it('should allow null values for optional fields in UserManagementUser', () => {
      const userWithNulls: UserManagementUser = {
        id: 'user-123',
        name: null,
        email: 'john@example.com',
        image: null,
        role: 'admin',
        enabled: false,
        lastLogin: null,
        createdAt: null,
        updatedAt: null,
      };

      expect(userWithNulls.name).toBe(null);
      expect(userWithNulls.image).toBe(null);
      expect(userWithNulls.lastLogin).toBe(null);
    });

    /**
     * Tests UserListItem type structure.
     */
    it('should define UserListItem type correctly', () => {
      const listItem: UserListItem = {
        id: 'user-123',
        displayName: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        enabled: true,
        lastLogin: '2023-08-15T10:30:00Z',
        createdAt: '2023-08-01T00:00:00Z',
      };

      expect(listItem.displayName).toBe('John Doe');
      expect(listItem.lastLogin).toBe('2023-08-15T10:30:00Z');
    });

    /**
     * Tests UserListItem with null date fields.
     */
    it('should allow null date fields in UserListItem', () => {
      const listItemWithNulls: UserListItem = {
        id: 'user-123',
        displayName: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        enabled: true,
        lastLogin: null,
        createdAt: null,
      };

      expect(listItemWithNulls.lastLogin).toBe(null);
      expect(listItemWithNulls.createdAt).toBe(null);
    });

    /**
     * Tests UserStatusUpdate type structure.
     */
    it('should define UserStatusUpdate type correctly', () => {
      const enableUpdate: UserStatusUpdate = {
        userId: 'user-123',
        enabled: true,
      };

      const disableUpdate: UserStatusUpdate = {
        userId: 'user-456',
        enabled: false,
      };

      expect(enableUpdate.enabled).toBe(true);
      expect(disableUpdate.enabled).toBe(false);
    });

    /**
     * Tests UserStatusUpdateResponse type structure.
     */
    it('should define UserStatusUpdateResponse type correctly', () => {
      const successResponse: UserStatusUpdateResponse = {
        success: true,
        user: {
          id: 'user-123',
          displayName: 'John Doe',
          email: 'john@example.com',
          role: 'user',
          enabled: true,
          lastLogin: '2023-08-15T10:30:00Z',
          createdAt: '2023-08-01T00:00:00Z',
        },
      };

      const errorResponse: UserStatusUpdateResponse = {
        success: false,
        error: 'User not found',
      };

      const minimalResponse: UserStatusUpdateResponse = {
        success: true,
      };

      expect(successResponse.success).toBe(true);
      expect(successResponse.user).toBeDefined();
      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBe('User not found');
      expect(minimalResponse.user).toBeUndefined();
    });

    /**
     * Tests UserListQuery type structure.
     */
    it('should define UserListQuery type correctly', () => {
      const fullQuery: UserListQuery = {
        limit: 50,
        cursor: 'next-page-token',
        role: 'admin',
        enabled: true,
      };

      const partialQuery: UserListQuery = {
        limit: 25,
      };

      const emptyQuery: UserListQuery = {};

      expect(fullQuery.limit).toBe(50);
      expect(fullQuery.role).toBe('admin');
      expect(partialQuery.cursor).toBeUndefined();
      expect(Object.keys(emptyQuery)).toHaveLength(0);
    });

    /**
     * Tests UserListResponse type structure.
     */
    it('should define UserListResponse type correctly', () => {
      const response: UserListResponse = {
        users: [
          {
            id: 'user-1',
            displayName: 'John Doe',
            email: 'john@example.com',
            role: 'user',
            enabled: true,
            lastLogin: '2023-08-15T10:30:00Z',
            createdAt: '2023-08-01T00:00:00Z',
          },
        ],
        nextCursor: 'next-page-token',
        totalCount: 100,
      };

      const minimalResponse: UserListResponse = {
        users: [],
      };

      expect(response.users).toHaveLength(1);
      expect(response.nextCursor).toBe('next-page-token');
      expect(minimalResponse.nextCursor).toBeUndefined();
    });

    /**
     * Tests AdminUser type structure.
     */
    it('should define AdminUser type correctly', () => {
      const admin: AdminUser = {
        role: 'admin',
        enabled: true,
      };

      expect(admin.role).toBe('admin');
      expect(admin.enabled).toBe(true);

      // TypeScript should enforce literal types
      // These would cause compilation errors if uncommented:
      // const invalidAdmin1: AdminUser = { role: 'user', enabled: true };
      // const invalidAdmin2: AdminUser = { role: 'admin', enabled: false };
    });

    /**
     * Tests ServerActionContext type structure.
     */
    it('should define ServerActionContext type correctly', () => {
      const context: ServerActionContext = {
        user: {
          id: 'user-123',
          email: 'admin@example.com',
          role: 'admin',
          enabled: true,
        },
      };

      expect(context.user.id).toBe('user-123');
      expect(context.user.role).toBe('admin');
      expect(context.user.enabled).toBe(true);
    });
  });

  describe('Type Schema Integration', () => {
    /**
     * Tests that userRoleSchema export works correctly.
     */
    it('should export userRoleSchema correctly', () => {
      expect(userRoleSchema.parse('admin')).toBe('admin');
      expect(userRoleSchema.parse('user')).toBe('user');
      expect(() => userRoleSchema.parse('invalid')).toThrow();
    });

    /**
     * Tests type compatibility between UserManagementUser and UserListItem.
     */
    it('should allow transformation between UserManagementUser and UserListItem', () => {
      const userDoc: UserManagementUser = {
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

      // Transform UserManagementUser to UserListItem
      const listItem: UserListItem = {
        id: userDoc.id,
        displayName: userDoc.name || 'Unknown User',
        email: userDoc.email,
        role: userDoc.role,
        enabled: userDoc.enabled,
        lastLogin: userDoc.lastLogin ? '2023-08-15T10:30:00Z' : null,
        createdAt: userDoc.createdAt ? '2023-08-01T00:00:00Z' : null,
      };

      expect(listItem.id).toBe(userDoc.id);
      expect(listItem.displayName).toBe('John Doe');
      expect(listItem.role).toBe(userDoc.role);
    });

    /**
     * Tests UserRole type compatibility with schema enum.
     */
    it('should maintain UserRole type compatibility with schema', () => {
      const roles: UserRole[] = ['admin', 'user'];
      
      roles.forEach(role => {
        // Should parse without error
        const parsedRole = userRoleSchema.parse(role);
        expect(parsedRole).toBe(role);
        
        // Type should be assignable
        const typedRole: UserRole = parsedRole as UserRole;
        expect(typedRole).toBe(role);
      });
    });
  });

  describe('Type Utility Functions', () => {
    /**
     * Tests type guard functions for role checking.
     */
    it('should support type guard functions', () => {
      const isAdmin = (user: { role: UserRole }): user is { role: 'admin' } => {
        return user.role === 'admin';
      };

      const isUser = (user: { role: UserRole }): user is { role: 'user' } => {
        return user.role === 'user';
      };

      const adminUser = { role: 'admin' as UserRole };
      const regularUser = { role: 'user' as UserRole };

      expect(isAdmin(adminUser)).toBe(true);
      expect(isAdmin(regularUser)).toBe(false);
      expect(isUser(regularUser)).toBe(true);
      expect(isUser(adminUser)).toBe(false);
    });

    /**
     * Tests type utility for enabled status checking.
     */
    it('should support enabled status type utilities', () => {
      const isEnabled = (user: { enabled: boolean }): boolean => {
        return user.enabled;
      };

      const enabledUser = { enabled: true };
      const disabledUser = { enabled: false };

      expect(isEnabled(enabledUser)).toBe(true);
      expect(isEnabled(disabledUser)).toBe(false);
    });

    /**
     * Tests type compatibility with common operations.
     */
    it('should support common type operations', () => {
      // Test array operations
      const users: UserListItem[] = [
        {
          id: 'user-1',
          displayName: 'John Doe',
          email: 'john@example.com',
          role: 'user',
          enabled: true,
          lastLogin: null,
          createdAt: null,
        },
        {
          id: 'user-2',
          displayName: 'Jane Admin',
          email: 'jane@example.com',
          role: 'admin',
          enabled: true,
          lastLogin: null,
          createdAt: null,
        },
      ];

      // Filter operations
      const admins = users.filter((user): user is UserListItem & { role: 'admin' } => 
        user.role === 'admin'
      );
      const enabledUsers = users.filter(user => user.enabled);

      expect(admins).toHaveLength(1);
      expect(admins[0].role).toBe('admin');
      expect(enabledUsers).toHaveLength(2);

      // Map operations
      const userIds = users.map(user => user.id);
      const displayNames = users.map(user => user.displayName);

      expect(userIds).toEqual(['user-1', 'user-2']);
      expect(displayNames).toEqual(['John Doe', 'Jane Admin']);

      // Find operations
      const adminUser = users.find(user => user.role === 'admin');
      expect(adminUser?.displayName).toBe('Jane Admin');
    });
  });

  describe('Type Constraints and Validations', () => {
    /**
     * Tests that types enforce proper constraints.
     */
    it('should enforce type constraints at compile time', () => {
      // These tests verify TypeScript compilation behavior
      // They would cause compilation errors if types are wrong

      const statusUpdate: UserStatusUpdate = {
        userId: 'user-123',
        enabled: true,
      };

      // Valid assignments
      expect(statusUpdate.userId).toBeTypeOf('string');
      expect(statusUpdate.enabled).toBeTypeOf('boolean');

      // Role constraints
      const userRole: UserRole = 'user';
      const adminRole: UserRole = 'admin';
      
      expect(['admin', 'user']).toContain(userRole);
      expect(['admin', 'user']).toContain(adminRole);
    });

    /**
     * Tests optional vs required field handling.
     */
    it('should handle optional vs required fields correctly', () => {
      // UserListQuery - all fields optional
      const emptyQuery: UserListQuery = {};
      const partialQuery: UserListQuery = { limit: 10 };
      const fullQuery: UserListQuery = {
        limit: 50,
        cursor: 'token',
        role: 'admin',
        enabled: true,
      };

      expect(emptyQuery).toBeDefined();
      expect(partialQuery.limit).toBe(10);
      expect(fullQuery.role).toBe('admin');

      // UserStatusUpdate - all fields required
      const update: UserStatusUpdate = {
        userId: 'user-123',
        enabled: false,
      };

      expect(update.userId).toBeDefined();
      expect(update.enabled).toBeDefined();
    });

    /**
     * Tests null vs undefined handling.
     */
    it('should handle null vs undefined correctly', () => {
      // UserListItem allows null for optional date fields
      const userWithNullDates: UserListItem = {
        id: 'user-123',
        displayName: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        enabled: true,
        lastLogin: null,
        createdAt: null,
      };

      expect(userWithNullDates.lastLogin).toBe(null);
      expect(userWithNullDates.createdAt).toBe(null);

      // UserListResponse allows undefined for optional fields
      const responseWithUndefined: UserListResponse = {
        users: [],
        // nextCursor and totalCount are undefined (not set)
      };

      expect(responseWithUndefined.nextCursor).toBeUndefined();
      expect(responseWithUndefined.totalCount).toBeUndefined();
    });
  });
});