/**
 * @fileoverview Tests for UserManagement domain schemas
 * @module features/UserManagement/__tests__/domain/schemas/userManagement.test
 */

import { describe, it, expect } from 'vitest';
import { ZodError } from 'zod';
import {
  userRoleSchema,
  timestampSchema,
  firestoreUserDocumentSchema,
  userListItemSchema,
  userStatusUpdateSchema,
  userStatusUpdateResponseSchema,
  userListQuerySchema,
  userListResponseSchema,
  adminUserSchema,
  serverActionContextSchema,
} from '../../../domain/schemas/userManagement';

/**
 * Test suite for UserManagement domain schemas.
 * 
 * Tests comprehensive validation scenarios for all Zod schemas including
 * success cases, validation failures, edge cases, and error messages.
 */
describe('UserManagement Domain Schemas', () => {

  describe('userRoleSchema', () => {
    /**
     * Tests valid user role values.
     */
    it('should accept valid user roles', () => {
      expect(userRoleSchema.parse('admin')).toBe('admin');
      expect(userRoleSchema.parse('user')).toBe('user');
    });

    /**
     * Tests invalid user role values.
     */
    it('should reject invalid user roles', () => {
      expect(() => userRoleSchema.parse('invalid')).toThrow(ZodError);
      expect(() => userRoleSchema.parse('moderator')).toThrow(ZodError);
      expect(() => userRoleSchema.parse('')).toThrow(ZodError);
      expect(() => userRoleSchema.parse(null)).toThrow(ZodError);
      expect(() => userRoleSchema.parse(undefined)).toThrow(ZodError);
      expect(() => userRoleSchema.parse(123)).toThrow(ZodError);
    });

    /**
     * Tests error message for invalid role.
     */
    it('should provide meaningful error message for invalid role', () => {
      try {
        userRoleSchema.parse('invalid');
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.issues[0].message).toContain('Invalid option');
      }
    });
  });

  describe('timestampSchema', () => {
    /**
     * Tests valid timestamp objects.
     */
    it('should accept valid timestamp objects', () => {
      const validTimestamp = { seconds: 1692123456, nanoseconds: 123456789 };
      expect(timestampSchema.parse(validTimestamp)).toEqual(validTimestamp);
    });

    /**
     * Tests null and undefined values.
     */
    it('should accept null and undefined values', () => {
      expect(timestampSchema.parse(null)).toBe(null);
      expect(timestampSchema.parse(undefined)).toBe(undefined);
    });

    /**
     * Tests invalid timestamp structures.
     */
    it('should reject invalid timestamp structures', () => {
      expect(() => timestampSchema.parse({ seconds: 'invalid' })).toThrow(ZodError);
      expect(() => timestampSchema.parse({ nanoseconds: 123456789 })).toThrow(ZodError);
      expect(() => timestampSchema.parse({ seconds: 123, extra: 'field' })).toThrow(ZodError);
      expect(() => timestampSchema.parse('string')).toThrow(ZodError);
      expect(() => timestampSchema.parse(123)).toThrow(ZodError);
    });

    /**
     * Tests edge case values for timestamp fields.
     */
    it('should handle edge case timestamp values', () => {
      expect(timestampSchema.parse({ seconds: 0, nanoseconds: 0 })).toEqual({ seconds: 0, nanoseconds: 0 });
      expect(timestampSchema.parse({ seconds: -1, nanoseconds: 999999999 })).toEqual({ seconds: -1, nanoseconds: 999999999 });
    });
  });

  describe('firestoreUserDocumentSchema', () => {
    const validUserDocument = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      image: 'https://example.com/avatar.jpg',
      role: 'user' as const,
      enabled: true,
      lastLogin: { seconds: 1692123456, nanoseconds: 123456789 },
      createdAt: { seconds: 1692000000, nanoseconds: 0 },
      updatedAt: { seconds: 1692123456, nanoseconds: 123456789 },
    };

    /**
     * Tests valid Firestore user document.
     */
    it('should accept valid user document', () => {
      const result = firestoreUserDocumentSchema.parse(validUserDocument);
      expect(result).toEqual(validUserDocument);
    });

    /**
     * Tests user document with null optional fields.
     */
    it('should accept user document with null optional fields', () => {
      const userWithNulls = {
        ...validUserDocument,
        name: null,
        image: null,
        lastLogin: null,
        createdAt: null,
        updatedAt: null,
      };
      const result = firestoreUserDocumentSchema.parse(userWithNulls);
      expect(result).toEqual(userWithNulls);
    });

    /**
     * Tests admin user document.
     */
    it('should accept admin user document', () => {
      const adminUser = { ...validUserDocument, role: 'admin' as const };
      const result = firestoreUserDocumentSchema.parse(adminUser);
      expect(result.role).toBe('admin');
    });

    /**
     * Tests missing required fields.
     */
    it('should reject user document with missing required fields', () => {
      const { id, ...withoutId } = validUserDocument;
      expect(() => firestoreUserDocumentSchema.parse(withoutId)).toThrow(ZodError);

      const { email, ...withoutEmail } = validUserDocument;
      expect(() => firestoreUserDocumentSchema.parse(withoutEmail)).toThrow(ZodError);

      const { role, ...withoutRole } = validUserDocument;
      expect(() => firestoreUserDocumentSchema.parse(withoutRole)).toThrow(ZodError);

      const { enabled, ...withoutEnabled } = validUserDocument;
      expect(() => firestoreUserDocumentSchema.parse(withoutEnabled)).toThrow(ZodError);
    });

    /**
     * Tests invalid field types.
     */
    it('should reject user document with invalid field types', () => {
      expect(() => firestoreUserDocumentSchema.parse({
        ...validUserDocument,
        id: 123
      })).toThrow(ZodError);

      expect(() => firestoreUserDocumentSchema.parse({
        ...validUserDocument,
        email: 'invalid-email'
      })).toThrow(ZodError);

      expect(() => firestoreUserDocumentSchema.parse({
        ...validUserDocument,
        image: 'not-a-url'
      })).toThrow(ZodError);

      expect(() => firestoreUserDocumentSchema.parse({
        ...validUserDocument,
        role: 'invalid-role'
      })).toThrow(ZodError);

      expect(() => firestoreUserDocumentSchema.parse({
        ...validUserDocument,
        enabled: 'true'
      })).toThrow(ZodError);
    });
  });

  describe('userListItemSchema', () => {
    const validUserListItem = {
      id: 'user-123',
      displayName: 'John Doe',
      email: 'john@example.com',
      role: 'user' as const,
      enabled: true,
      lastLogin: '2023-08-15T10:30:00Z',
      createdAt: '2023-08-01T00:00:00Z',
    };

    /**
     * Tests valid user list item.
     */
    it('should accept valid user list item', () => {
      const result = userListItemSchema.parse(validUserListItem);
      expect(result).toEqual(validUserListItem);
    });

    /**
     * Tests user list item with null optional fields.
     */
    it('should accept user list item with null optional fields', () => {
      const userWithNulls = {
        ...validUserListItem,
        lastLogin: null,
        createdAt: null,
      };
      const result = userListItemSchema.parse(userWithNulls);
      expect(result).toEqual(userWithNulls);
    });

    /**
     * Tests admin user in list.
     */
    it('should accept admin user in list', () => {
      const adminUser = { ...validUserListItem, role: 'admin' as const };
      const result = userListItemSchema.parse(adminUser);
      expect(result.role).toBe('admin');
    });

    /**
     * Tests disabled user in list.
     */
    it('should accept disabled user in list', () => {
      const disabledUser = { ...validUserListItem, enabled: false };
      const result = userListItemSchema.parse(disabledUser);
      expect(result.enabled).toBe(false);
    });

    /**
     * Tests invalid email format.
     */
    it('should reject user list item with invalid email', () => {
      expect(() => userListItemSchema.parse({
        ...validUserListItem,
        email: 'invalid-email'
      })).toThrow(ZodError);
    });
  });

  describe('userStatusUpdateSchema', () => {
    /**
     * Tests valid status update requests.
     */
    it('should accept valid status update requests', () => {
      const enableRequest = { userId: 'user-123', enabled: true };
      expect(userStatusUpdateSchema.parse(enableRequest)).toEqual(enableRequest);

      const disableRequest = { userId: 'user-456', enabled: false };
      expect(userStatusUpdateSchema.parse(disableRequest)).toEqual(disableRequest);
    });

    /**
     * Tests invalid user ID.
     */
    it('should reject invalid user ID', () => {
      expect(() => userStatusUpdateSchema.parse({
        userId: '',
        enabled: true
      })).toThrow(ZodError);

      expect(() => userStatusUpdateSchema.parse({
        userId: null,
        enabled: true
      })).toThrow(ZodError);

      expect(() => userStatusUpdateSchema.parse({
        enabled: true
      })).toThrow(ZodError);
    });

    /**
     * Tests invalid enabled value.
     */
    it('should reject invalid enabled value', () => {
      expect(() => userStatusUpdateSchema.parse({
        userId: 'user-123',
        enabled: 'true'
      })).toThrow(ZodError);

      expect(() => userStatusUpdateSchema.parse({
        userId: 'user-123',
        enabled: 1
      })).toThrow(ZodError);

      expect(() => userStatusUpdateSchema.parse({
        userId: 'user-123'
      })).toThrow(ZodError);
    });

    /**
     * Tests custom error message for empty user ID.
     */
    it('should provide custom error message for empty user ID', () => {
      try {
        userStatusUpdateSchema.parse({ userId: '', enabled: true });
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.issues[0].message).toBe('User ID is required');
      }
    });
  });

  describe('userStatusUpdateResponseSchema', () => {
    /**
     * Tests successful response.
     */
    it('should accept successful response', () => {
      const successResponse = {
        success: true,
        user: {
          id: 'user-123',
          displayName: 'John Doe',
          email: 'john@example.com',
          role: 'user' as const,
          enabled: true,
          lastLogin: '2023-08-15T10:30:00Z',
          createdAt: '2023-08-01T00:00:00Z',
        }
      };
      const result = userStatusUpdateResponseSchema.parse(successResponse);
      expect(result).toEqual(successResponse);
    });

    /**
     * Tests error response.
     */
    it('should accept error response', () => {
      const errorResponse = {
        success: false,
        error: 'User not found'
      };
      const result = userStatusUpdateResponseSchema.parse(errorResponse);
      expect(result).toEqual(errorResponse);
    });

    /**
     * Tests minimal response.
     */
    it('should accept minimal response', () => {
      const minimalResponse = { success: true };
      const result = userStatusUpdateResponseSchema.parse(minimalResponse);
      expect(result).toEqual(minimalResponse);
    });

    /**
     * Tests invalid response structure.
     */
    it('should reject invalid response structure', () => {
      expect(() => userStatusUpdateResponseSchema.parse({})).toThrow(ZodError);
      expect(() => userStatusUpdateResponseSchema.parse({
        success: 'true'
      })).toThrow(ZodError);
    });
  });

  describe('userListQuerySchema', () => {
    /**
     * Tests valid query parameters.
     */
    it('should accept valid query parameters', () => {
      const queryParams = {
        limit: 50,
        cursor: 'next-page-token',
        role: 'admin' as const,
        enabled: true
      };
      const result = userListQuerySchema.parse(queryParams);
      expect(result).toEqual(queryParams);
    });

    /**
     * Tests empty query parameters.
     */
    it('should accept empty query parameters', () => {
      const result = userListQuerySchema.parse({});
      expect(result).toEqual({});
    });

    /**
     * Tests limit validation.
     */
    it('should validate limit boundaries', () => {
      expect(userListQuerySchema.parse({ limit: 1 })).toEqual({ limit: 1 });
      expect(userListQuerySchema.parse({ limit: 100 })).toEqual({ limit: 100 });

      expect(() => userListQuerySchema.parse({ limit: 0 })).toThrow(ZodError);
      expect(() => userListQuerySchema.parse({ limit: 101 })).toThrow(ZodError);
      expect(() => userListQuerySchema.parse({ limit: -1 })).toThrow(ZodError);
    });

    /**
     * Tests role filter validation.
     */
    it('should validate role filter', () => {
      expect(userListQuerySchema.parse({ role: 'admin' })).toEqual({ role: 'admin' });
      expect(userListQuerySchema.parse({ role: 'user' })).toEqual({ role: 'user' });

      expect(() => userListQuerySchema.parse({ role: 'invalid' })).toThrow(ZodError);
    });
  });

  describe('userListResponseSchema', () => {
    const validUserListResponse = {
      users: [
        {
          id: 'user-1',
          displayName: 'John Doe',
          email: 'john@example.com',
          role: 'user' as const,
          enabled: true,
          lastLogin: '2023-08-15T10:30:00Z',
          createdAt: '2023-08-01T00:00:00Z',
        },
        {
          id: 'user-2',
          displayName: 'Jane Admin',
          email: 'jane@example.com',
          role: 'admin' as const,
          enabled: true,
          lastLogin: null,
          createdAt: null,
        }
      ],
      nextCursor: 'next-page-token',
      totalCount: 150
    };

    /**
     * Tests valid user list response.
     */
    it('should accept valid user list response', () => {
      const result = userListResponseSchema.parse(validUserListResponse);
      expect(result).toEqual(validUserListResponse);
    });

    /**
     * Tests minimal response with empty users array.
     */
    it('should accept minimal response with empty users array', () => {
      const minimalResponse = { users: [] };
      const result = userListResponseSchema.parse(minimalResponse);
      expect(result).toEqual(minimalResponse);
    });

    /**
     * Tests response without optional fields.
     */
    it('should accept response without optional fields', () => {
      const responseWithoutOptionals = {
        users: [validUserListResponse.users[0]]
      };
      const result = userListResponseSchema.parse(responseWithoutOptionals);
      expect(result).toEqual(responseWithoutOptionals);
    });

    /**
     * Tests invalid users array.
     */
    it('should reject invalid users array', () => {
      expect(() => userListResponseSchema.parse({
        users: [{ invalid: 'user' }]
      })).toThrow(ZodError);

      expect(() => userListResponseSchema.parse({
        users: 'not-an-array'
      })).toThrow(ZodError);
    });
  });

  describe('adminUserSchema', () => {
    /**
     * Tests valid admin user.
     */
    it('should accept valid admin user', () => {
      const adminUser = { role: 'admin', enabled: true };
      const result = adminUserSchema.parse(adminUser);
      expect(result).toEqual(adminUser);
    });

    /**
     * Tests non-admin user rejection.
     */
    it('should reject non-admin user', () => {
      expect(() => adminUserSchema.parse({
        role: 'user',
        enabled: true
      })).toThrow(ZodError);
    });

    /**
     * Tests disabled admin rejection.
     */
    it('should reject disabled admin', () => {
      expect(() => adminUserSchema.parse({
        role: 'admin',
        enabled: false
      })).toThrow(ZodError);
    });

    /**
     * Tests missing fields.
     */
    it('should reject admin user with missing fields', () => {
      expect(() => adminUserSchema.parse({ role: 'admin' })).toThrow(ZodError);
      expect(() => adminUserSchema.parse({ enabled: true })).toThrow(ZodError);
    });
  });

  describe('serverActionContextSchema', () => {
    const validContext = {
      user: {
        id: 'user-123',
        email: 'admin@example.com',
        role: 'admin' as const,
        enabled: true
      }
    };

    /**
     * Tests valid server action context.
     */
    it('should accept valid server action context', () => {
      const result = serverActionContextSchema.parse(validContext);
      expect(result).toEqual(validContext);
    });

    /**
     * Tests regular user context.
     */
    it('should accept regular user context', () => {
      const userContext = {
        user: {
          ...validContext.user,
          role: 'user' as const
        }
      };
      const result = serverActionContextSchema.parse(userContext);
      expect(result).toEqual(userContext);
    });

    /**
     * Tests disabled user context.
     */
    it('should accept disabled user context', () => {
      const disabledContext = {
        user: {
          ...validContext.user,
          enabled: false
        }
      };
      const result = serverActionContextSchema.parse(disabledContext);
      expect(result).toEqual(disabledContext);
    });

    /**
     * Tests invalid context structure.
     */
    it('should reject invalid context structure', () => {
      expect(() => serverActionContextSchema.parse({})).toThrow(ZodError);
      expect(() => serverActionContextSchema.parse({ user: {} })).toThrow(ZodError);
      expect(() => serverActionContextSchema.parse({
        user: { ...validContext.user, email: 'invalid-email' }
      })).toThrow(ZodError);
    });
  });

  describe('Schema Integration', () => {
    /**
     * Tests schema compatibility between related schemas.
     */
    it('should maintain type compatibility between related schemas', () => {
      // Test that firestoreUserDocumentSchema can be transformed to userListItemSchema
      const firestoreDoc = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://example.com/avatar.jpg',
        role: 'user' as const,
        enabled: true,
        lastLogin: { seconds: 1692123456, nanoseconds: 123456789 },
        createdAt: { seconds: 1692000000, nanoseconds: 0 },
        updatedAt: { seconds: 1692123456, nanoseconds: 123456789 },
      };

      // Validate Firestore document
      const validatedFirestoreDoc = firestoreUserDocumentSchema.parse(firestoreDoc);
      expect(validatedFirestoreDoc).toEqual(firestoreDoc);

      // Transform to user list item format
      const userListItem = {
        id: validatedFirestoreDoc.id,
        displayName: validatedFirestoreDoc.name || 'Unknown User',
        email: validatedFirestoreDoc.email,
        role: validatedFirestoreDoc.role,
        enabled: validatedFirestoreDoc.enabled,
        lastLogin: validatedFirestoreDoc.lastLogin ? '2023-08-15T10:30:00Z' : null,
        createdAt: validatedFirestoreDoc.createdAt ? '2023-08-01T00:00:00Z' : null,
      };

      // Validate transformed data
      const validatedUserListItem = userListItemSchema.parse(userListItem);
      expect(validatedUserListItem).toEqual(userListItem);
    });

    /**
     * Tests error handling consistency across schemas.
     */
    it('should provide consistent error handling across schemas', () => {
      const testInvalidEmail = (schema: any, fieldPath: string[]) => {
        try {
          const testData = fieldPath.reduce((obj, path, index) => {
            if (index === fieldPath.length - 1) {
              obj[path] = 'invalid-email';
            } else {
              obj[path] = obj[path] || {};
            }
            return obj;
          }, {} as any);
          
          // Fill in required fields
          if (schema === firestoreUserDocumentSchema) {
            Object.assign(testData, {
              id: 'test-id',
              role: 'user',
              enabled: true
            });
          } else if (schema === userListItemSchema) {
            Object.assign(testData, {
              id: 'test-id',
              displayName: 'Test User',
              role: 'user',
              enabled: true,
              lastLogin: null,
              createdAt: null
            });
          } else if (schema === serverActionContextSchema) {
            testData.user = {
              id: 'test-id',
              email: 'invalid-email',
              role: 'user',
              enabled: true
            };
          }

          schema.parse(testData);
          throw new Error('Should have thrown validation error');
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          const emailErrors = zodError.issues.filter(issue => 
            issue.message.includes('email') || issue.message.includes('Invalid email')
          );
          expect(emailErrors.length).toBeGreaterThan(0);
        }
      };

      // Test email validation consistency
      testInvalidEmail(firestoreUserDocumentSchema, ['email']);
      testInvalidEmail(userListItemSchema, ['email']);
      testInvalidEmail(serverActionContextSchema, ['user', 'email']);
    });
  });
});