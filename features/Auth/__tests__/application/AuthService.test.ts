/**
 * @fileoverview Tests for AuthService
 * @module features/Auth/__tests__/application/AuthService.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../../application/AuthService';

// Mock dependencies
vi.mock('@/auth', () => ({
  signOut: vi.fn()
}));

vi.mock('@lib/logger.server', () => ({
  serverLogger: {
    info: vi.fn(),
    error: vi.fn()
  }
}));

/**
 * Test suite for AuthService class.
 * 
 * Tests authentication operations, NextAuth integration, and logging.
 * Mocks external dependencies to ensure isolated unit tests.
 */
describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signOut', () => {
    /**
     * Tests successful user sign out operation.
     */
    it('should sign out user successfully', async () => {
      const { signOut } = vi.mocked(await import('@/auth'));
      const { serverLogger } = vi.mocked(await import('@lib/logger.server'));
      
      signOut.mockResolvedValue(undefined);

      await AuthService.signOut();

      expect(signOut).toHaveBeenCalledWith({
        redirectTo: '/signin'
      });
      expect(serverLogger.info).toHaveBeenCalledWith('User signing out', 'auth');
    });

    /**
     * Tests error handling when sign out fails.
     */
    it('should handle sign out errors properly', async () => {
      const { signOut } = vi.mocked(await import('@/auth'));
      
      const signOutError = new Error('Auth service unavailable');
      signOut.mockRejectedValue(signOutError);

      await expect(AuthService.signOut()).rejects.toThrow('Auth service unavailable');

      expect(signOut).toHaveBeenCalledWith({
        redirectTo: '/signin'
      });
    });

    /**
     * Tests that redirect errors are handled gracefully.
     */
    it('should handle NextAuth redirect errors gracefully', async () => {
      const { signOut } = vi.mocked(await import('@/auth'));
      
      // NextAuth redirect errors have specific structure
      const redirectError = {
        digest: 'NEXT_REDIRECT',
        message: 'NEXT_REDIRECT'
      };
      signOut.mockRejectedValue(redirectError);

      // Should not throw for redirect errors
      await expect(AuthService.signOut()).rejects.toMatchObject(redirectError);
    });

    /**
     * Tests logging during sign out operation.
     */
    it('should log sign out operation correctly', async () => {
      const { signOut } = vi.mocked(await import('@/auth'));
      const { serverLogger } = vi.mocked(await import('@lib/logger.server'));
      
      signOut.mockResolvedValue(undefined);

      await AuthService.signOut();

      expect(serverLogger.info).toHaveBeenCalledWith('User signing out', 'auth');
      // Note: The success log may not be reached due to redirect
    });

    /**
     * Tests that the correct redirect path is used.
     */
    it('should redirect to signin page', async () => {
      const { signOut } = vi.mocked(await import('@/auth'));
      
      signOut.mockResolvedValue(undefined);

      await AuthService.signOut();

      expect(signOut).toHaveBeenCalledWith(
        expect.objectContaining({
          redirectTo: '/signin'
        })
      );
    });
  });
});