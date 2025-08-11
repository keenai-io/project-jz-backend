'use server'

import { signOut } from '@/auth';

/**
 * Server action to sign out the current user
 * 
 * Uses NextAuth's signOut function to end the user session
 * and redirect to the sign-in page.
 */
export async function signOutAction(): Promise<void> {
  try {
    await signOut({
      redirectTo: '/signin'
    });
  } catch (error) {
    // NextAuth signOut throws redirect errors as part of normal operation
    // Check if it's a NEXT_REDIRECT error which is expected
    if (error && typeof error === 'object' && 'digest' in error && 
        typeof error.digest === 'string' && error.digest.includes('NEXT_REDIRECT')) {
      throw error; // Re-throw redirect errors to allow them to work
    }
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out');
  }
}