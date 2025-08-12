/**
 * @fileoverview Tests for auth server actions
 * @module app/actions/__tests__/auth.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signOutAction } from '../auth';

// Mock the NextAuth signOut function
vi.mock('@/auth', () => ({
  signOut: vi.fn(),
}));

// Mock the server logger
vi.mock('@lib/logger.server', () => ({
  serverLogger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

import { signOut } from '@/auth';
import { serverLogger } from '@lib/logger.server';

/**
 * Test suite for authentication server actions
 * 
 * Tests the signOut server action functionality including
 * successful signout and error handling.
 */
describe('Auth Server Actions', () => {
  const mockSignOut = vi.mocked(signOut);
  const mockServerLogger = vi.mocked(serverLogger);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signOutAction', () => {
    /**
     * Tests successful signout
     */
    it('should call NextAuth signOut with correct redirect', async () => {
      mockSignOut.mockResolvedValue(undefined);

      await signOutAction();

      expect(mockSignOut).toHaveBeenCalledWith({
        redirectTo: '/signin'
      });
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    /**
     * Tests signout error handling
     */
    it('should handle signout errors correctly', async () => {
      const signOutError = new Error('Network error');
      mockSignOut.mockRejectedValue(signOutError);

      await expect(signOutAction()).rejects.toThrow('Failed to sign out');
      
      expect(mockSignOut).toHaveBeenCalledWith({
        redirectTo: '/signin'
      });
      expect(mockServerLogger.error).toHaveBeenCalledWith(
        'Sign out error',
        signOutError,
        'auth'
      );
    });

    /**
     * Tests that signout action is a server action
     */
    it('should be a server function', () => {
      // Server actions should be functions
      expect(typeof signOutAction).toBe('function');
    });
  });
});