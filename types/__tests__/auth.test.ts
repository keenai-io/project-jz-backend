/**
 * @fileoverview Tests for authentication type guards and schemas
 * @module types/__tests__/auth.test
 */

import { describe, it, expect } from 'vitest';
import {
  UserRoleSchema,
  UserEnabledSchema,
  FirestoreUserSchema,
  SessionUserSchema,
  EnhancedSessionSchema,
  UserStatusUpdateSchema,
  UserCreationSchema,
  isAdmin,
  isUserEnabled,
  canAccessAdmin,
  canAccessFeatures,
  type SessionUser,
} from '../auth';

describe('Auth Types and Schemas', () => {
  describe('UserRoleSchema', () => {
    it('should accept valid role values', () => {
      expect(UserRoleSchema.parse('admin')).toBe('admin');
      expect(UserRoleSchema.parse('user')).toBe('user');
    });

    it('should reject invalid role values', () => {
      expect(() => UserRoleSchema.parse('invalid')).toThrow();
      expect(() => UserRoleSchema.parse('')).toThrow();
      expect(() => UserRoleSchema.parse(null)).toThrow();
    });
  });

  describe('UserEnabledSchema', () => {
    it('should accept boolean values', () => {
      expect(UserEnabledSchema.parse(true)).toBe(true);
      expect(UserEnabledSchema.parse(false)).toBe(false);
    });

    it('should reject non-boolean values', () => {
      expect(() => UserEnabledSchema.parse('true')).toThrow();
      expect(() => UserEnabledSchema.parse(1)).toThrow();
      expect(() => UserEnabledSchema.parse(null)).toThrow();
    });
  });

  describe('FirestoreUserSchema', () => {
    it('should parse valid user data with all fields', () => {
      const validUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        image: null, // Use null to avoid URL validation issues
        emailVerified: new Date(),
        role: 'admin' as const,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
      };

      const result = FirestoreUserSchema.parse(validUser);
      expect(result).toEqual(validUser);
    });

    it('should apply default values for role and enabled', () => {
      const minimalUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
        emailVerified: null,
      };

      const result = FirestoreUserSchema.parse(minimalUser);
      expect(result.role).toBe('user');
      expect(result.enabled).toBe(false);
    });

    it('should require id field', () => {
      const invalidUser = {
        email: 'test@example.com',
        name: 'Test User',
      };

      expect(() => FirestoreUserSchema.parse(invalidUser)).toThrow();
    });

    it('should validate email format', () => {
      const invalidUser = {
        id: 'user123',
        email: 'invalid-email',
        name: 'Test User',
        image: null,
        emailVerified: null,
      };

      expect(() => FirestoreUserSchema.parse(invalidUser)).toThrow();
    });
  });

  describe('SessionUserSchema', () => {
    it('should parse valid session user data', () => {
      const validSessionUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        image: null, // Use null instead of URL to avoid validation issues
        role: 'admin' as const,
        enabled: true,
      };

      const result = SessionUserSchema.parse(validSessionUser);
      expect(result).toEqual(validSessionUser);
    });

    it('should require role and enabled fields', () => {
      const invalidUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
      };

      expect(() => SessionUserSchema.parse(invalidUser)).toThrow();
    });
  });

  describe('EnhancedSessionSchema', () => {
    it('should parse valid enhanced session', () => {
      const validSession = {
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          image: null,
          role: 'user' as const,
          enabled: true,
        },
        expires: '2024-12-31T23:59:59.999Z',
      };

      const result = EnhancedSessionSchema.parse(validSession);
      expect(result).toEqual(validSession);
    });
  });

  describe('UserStatusUpdateSchema', () => {
    it('should parse valid status updates', () => {
      const validUpdate = {
        userId: 'user123',
        enabled: false,
        role: 'admin' as const,
      };

      const result = UserStatusUpdateSchema.parse(validUpdate);
      expect(result).toEqual(validUpdate);
    });

    it('should allow partial updates', () => {
      const partialUpdate = {
        userId: 'user123',
        enabled: false,
      };

      const result = UserStatusUpdateSchema.parse(partialUpdate);
      expect(result).toEqual(partialUpdate);
    });

    it('should require userId', () => {
      const invalidUpdate = {
        enabled: false,
      };

      expect(() => UserStatusUpdateSchema.parse(invalidUpdate)).toThrow();
    });
  });

  describe('UserCreationSchema', () => {
    it('should parse user creation data with defaults', () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        image: null,
      };

      const result = UserCreationSchema.parse(userData);
      expect(result.role).toBe('user');
      expect(result.enabled).toBe(true);
    });
  });
});

describe('Auth Type Guards', () => {
  const adminUser: SessionUser = {
    id: 'admin123',
    email: 'admin@example.com',
    name: 'Admin User',
    image: null,
    role: 'admin',
    enabled: true,
  };

  const regularUser: SessionUser = {
    id: 'user123',
    email: 'user@example.com',
    name: 'Regular User',
    image: null,
    role: 'user',
    enabled: true,
  };

  const disabledUser: SessionUser = {
    id: 'disabled123',
    email: 'disabled@example.com',
    name: 'Disabled User',
    image: null,
    role: 'user',
    enabled: false,
  };

  const disabledAdmin: SessionUser = {
    id: 'disabledadmin123',
    email: 'disabledadmin@example.com',
    name: 'Disabled Admin',
    image: null,
    role: 'admin',
    enabled: false,
  };

  describe('isAdmin', () => {
    it('should return true for admin users', () => {
      expect(isAdmin(adminUser)).toBe(true);
      expect(isAdmin(disabledAdmin)).toBe(true);
    });

    it('should return false for non-admin users', () => {
      expect(isAdmin(regularUser)).toBe(false);
      expect(isAdmin(disabledUser)).toBe(false);
    });

    it('should return false for null/undefined users', () => {
      expect(isAdmin(null)).toBe(false);
      expect(isAdmin(undefined)).toBe(false);
    });
  });

  describe('isUserEnabled', () => {
    it('should return true for enabled users', () => {
      expect(isUserEnabled(adminUser)).toBe(true);
      expect(isUserEnabled(regularUser)).toBe(true);
    });

    it('should return false for disabled users', () => {
      expect(isUserEnabled(disabledUser)).toBe(false);
      expect(isUserEnabled(disabledAdmin)).toBe(false);
    });

    it('should return false for null/undefined users', () => {
      expect(isUserEnabled(null)).toBe(false);
      expect(isUserEnabled(undefined)).toBe(false);
    });
  });

  describe('canAccessAdmin', () => {
    it('should return true for enabled admin users', () => {
      expect(canAccessAdmin(adminUser)).toBe(true);
    });

    it('should return false for disabled admin users', () => {
      expect(canAccessAdmin(disabledAdmin)).toBe(false);
    });

    it('should return false for enabled regular users', () => {
      expect(canAccessAdmin(regularUser)).toBe(false);
    });

    it('should return false for disabled regular users', () => {
      expect(canAccessAdmin(disabledUser)).toBe(false);
    });

    it('should return false for null/undefined users', () => {
      expect(canAccessAdmin(null)).toBe(false);
      expect(canAccessAdmin(undefined)).toBe(false);
    });
  });

  describe('canAccessFeatures', () => {
    it('should return true for all enabled users regardless of role', () => {
      expect(canAccessFeatures(adminUser)).toBe(true);
      expect(canAccessFeatures(regularUser)).toBe(true);
    });

    it('should return false for all disabled users regardless of role', () => {
      expect(canAccessFeatures(disabledUser)).toBe(false);
      expect(canAccessFeatures(disabledAdmin)).toBe(false);
    });

    it('should return false for null/undefined users', () => {
      expect(canAccessFeatures(null)).toBe(false);
      expect(canAccessFeatures(undefined)).toBe(false);
    });
  });
});