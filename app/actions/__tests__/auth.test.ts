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

import { signOut } from '@/auth';

/**
 * Test suite for authentication server actions
 * 
 * Tests the signOut server action functionality including
 * successful signout and error handling.
 */
describe('Auth Server Actions', () => {
  const mockSignOut = vi.mocked(signOut);

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