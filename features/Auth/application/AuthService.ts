import { signOut } from '@/auth';
import { serverLogger } from '@lib/logger.server';

/**
 * Auth Service
 * 
 * Contains the business logic for authentication operations.
 * This service is used by server actions and other application layer components.
 */
export class AuthService {
  /**
   * Sign out the current user
   * 
   * Uses NextAuth's signOut function to end the user session
   * and redirect to the sign-in page.
   * 
   * @throws {Error} If sign out fails (excluding redirect errors)
   */
  static async signOut(): Promise<void> {
    serverLogger.info('User signing out', 'auth');
    
    await signOut({
      redirectTo: '/signin'
    });
    
    // Note: This line may not be reached due to redirect
    serverLogger.info('User signed out successfully', 'auth');
  }
}