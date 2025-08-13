'use server'

import { serverLogger } from '@lib/logger.server';
import { AuthService } from '@features/Auth/server';

/**
 * Server action to sign out the current user
 * 
 * Delegates to AuthService for business logic.
 */
export async function signOutAction(): Promise<void> {
  try {
    // Delegate to AuthService for business logic
    await AuthService.signOut();
  } catch (error) {
    // NextAuth signOut throws redirect errors as part of normal operation
    // Check if it's a NEXT_REDIRECT error which is expected
    if (error && typeof error === 'object' && 'digest' in error && 
        typeof error.digest === 'string' && error.digest.includes('NEXT_REDIRECT')) {
      throw error; // Re-throw redirect errors to allow them to work
    }
    serverLogger.error('Sign out error', error instanceof Error ? error : new Error(String(error)), 'auth');
    throw new Error('Failed to sign out');
  }
}