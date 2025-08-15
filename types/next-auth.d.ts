/**
 * @fileoverview NextAuth type extensions for User Access Control
 * 
 * This module extends the default NextAuth types to include role and enabled
 * fields in the session and JWT token for the User Access Control system.
 */

import type { DefaultSession, DefaultUser, DefaultJWT } from 'next-auth';
import type { UserRole } from './auth';

declare module 'next-auth' {
  /**
   * Extended Session interface that includes role and enabled fields
   */
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
      enabled: boolean;
    } & DefaultSession['user'];
  }

  /**
   * Extended User interface for the adapter
   */
  interface User extends DefaultUser {
    role?: UserRole;
    enabled?: boolean;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extended JWT interface that includes role and enabled fields
   */
  interface JWT extends DefaultJWT {
    role?: UserRole;
    enabled?: boolean;
  }
}