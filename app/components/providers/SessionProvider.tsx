'use client'

import { ReactElement, ReactNode } from 'react';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';

interface SessionProviderProps {
  children: ReactNode;
  session?: Session | null;
}

/**
 * Session provider component that wraps the NextAuth SessionProvider
 * 
 * Provides authentication session context throughout the application
 * and ensures that session state is available to all child components.
 */
export function SessionProvider({ children, session }: SessionProviderProps): ReactElement {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}