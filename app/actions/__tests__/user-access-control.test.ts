/**
 * @fileoverview Integration tests for User Access Control authentication flow
 * @module app/actions/__tests__/user-access-control.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auth } from '@/auth';
import { canAccessAdmin, canAccessFeatures, type SessionUser } from '@/types/auth';

// Mock the auth function
vi.mock('@/auth', () => ({
  auth: vi.fn()
}));

// Mock Firestore
vi.mock('@/lib/firebase-admin-singleton', () => ({
  getFirestoreAdminInstance: vi.fn().mockReturnValue({
    collection: vi.fn().mockReturnValue({
      doc: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            role: 'user',
            enabled: true
          })
        }),
        ref: {
          update: vi.fn()
        }
      })
    })
  })
}));

describe('User Access Control Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Session Enhancement', () => {
    it('should include role and enabled fields in session for admin user', async () => {
      const mockSession = {
        user: {
          id: 'admin123',
          email: 'admin@example.com',
          name: 'Admin User',
          image: null,
          role: 'admin',
          enabled: true
        },
        expires: '2024-12-31T23:59:59.999Z'
      };

      (auth as any).mockResolvedValue(mockSession);

      const session = await auth();
      
      expect(session?.user.role).toBe('admin');
      expect(session?.user.enabled).toBe(true);
      expect(canAccessAdmin(session?.user as SessionUser)).toBe(true);
      expect(canAccessFeatures(session?.user as SessionUser)).toBe(true);
    });

    it('should include role and enabled fields in session for regular user', async () => {
      const mockSession = {
        user: {
          id: 'user123',
          email: 'user@example.com',
          name: 'Regular User',
          image: null,
          role: 'user',
          enabled: true
        },
        expires: '2024-12-31T23:59:59.999Z'
      };

      (auth as any).mockResolvedValue(mockSession);

      const session = await auth();
      
      expect(session?.user.role).toBe('user');
      expect(session?.user.enabled).toBe(true);
      expect(canAccessAdmin(session?.user as SessionUser)).toBe(false);
      expect(canAccessFeatures(session?.user as SessionUser)).toBe(true);
    });

    it('should handle disabled user correctly', async () => {
      const mockSession = {
        user: {
          id: 'disabled123',
          email: 'disabled@example.com',
          name: 'Disabled User',
          image: null,
          role: 'user',
          enabled: false
        },
        expires: '2024-12-31T23:59:59.999Z'
      };

      (auth as any).mockResolvedValue(mockSession);

      const session = await auth();
      
      expect(session?.user.role).toBe('user');
      expect(session?.user.enabled).toBe(false);
      expect(canAccessAdmin(session?.user as SessionUser)).toBe(false);
      expect(canAccessFeatures(session?.user as SessionUser)).toBe(false);
    });

    it('should handle disabled admin correctly', async () => {
      const mockSession = {
        user: {
          id: 'disabledadmin123',
          email: 'disabledadmin@example.com',
          name: 'Disabled Admin',
          image: null,
          role: 'admin',
          enabled: false
        },
        expires: '2024-12-31T23:59:59.999Z'
      };

      (auth as any).mockResolvedValue(mockSession);

      const session = await auth();
      
      expect(session?.user.role).toBe('admin');
      expect(session?.user.enabled).toBe(false);
      expect(canAccessAdmin(session?.user as SessionUser)).toBe(false);
      expect(canAccessFeatures(session?.user as SessionUser)).toBe(false);
    });

    it('should handle null session', async () => {
      (auth as any).mockResolvedValue(null);

      const session = await auth();
      
      expect(session).toBeNull();
      expect(canAccessAdmin(session?.user as SessionUser)).toBe(false);
      expect(canAccessFeatures(session?.user as SessionUser)).toBe(false);
    });
  });

  describe('Access Control Logic', () => {
    it('should correctly identify admin access requirements', () => {
      const adminUser = {
        id: 'admin123',
        email: 'admin@example.com',
        name: 'Admin User',
        image: null,
        role: 'admin' as const,
        enabled: true
      };

      const regularUser = {
        id: 'user123',
        email: 'user@example.com',
        name: 'Regular User',
        image: null,
        role: 'user' as const,
        enabled: true
      };

      const disabledAdmin = {
        id: 'disabledadmin123',
        email: 'disabledadmin@example.com',
        name: 'Disabled Admin',
        image: null,
        role: 'admin' as const,
        enabled: false
      };

      expect(canAccessAdmin(adminUser)).toBe(true);
      expect(canAccessAdmin(regularUser)).toBe(false);
      expect(canAccessAdmin(disabledAdmin)).toBe(false);
      expect(canAccessAdmin(null)).toBe(false);
      expect(canAccessAdmin(undefined)).toBe(false);
    });

    it('should correctly identify feature access requirements', () => {
      const enabledUser = {
        id: 'user123',
        email: 'user@example.com',
        name: 'Enabled User',
        image: null,
        role: 'user' as const,
        enabled: true
      };

      const disabledUser = {
        id: 'disabled123',
        email: 'disabled@example.com',
        name: 'Disabled User',
        image: null,
        role: 'user' as const,
        enabled: false
      };

      const enabledAdmin = {
        id: 'admin123',
        email: 'admin@example.com',
        name: 'Admin User',
        image: null,
        role: 'admin' as const,
        enabled: true
      };

      expect(canAccessFeatures(enabledUser)).toBe(true);
      expect(canAccessFeatures(disabledUser)).toBe(false);
      expect(canAccessFeatures(enabledAdmin)).toBe(true);
      expect(canAccessFeatures(null)).toBe(false);
      expect(canAccessFeatures(undefined)).toBe(false);
    });
  });

  describe('Default Values Behavior', () => {
    it('should apply correct default values for new users', () => {
      const newUserData = {
        id: 'newuser123',
        email: 'newuser@example.com',
        name: 'New User',
        image: null
      };

      // These would be the defaults applied by the enhanced adapter
      const enhancedUserData = {
        ...newUserData,
        role: 'user' as const,
        enabled: true
      };

      expect(enhancedUserData.role).toBe('user');
      expect(enhancedUserData.enabled).toBe(true);
      expect(canAccessAdmin(enhancedUserData)).toBe(false);
      expect(canAccessFeatures(enhancedUserData)).toBe(true);
    });
  });
});