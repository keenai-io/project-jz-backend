import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/signin',
    error: '/error',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnSignIn = nextUrl.pathname.includes('/signin');
      const isOnProtectedRoute = !nextUrl.pathname.includes('/signin') && 
                                !nextUrl.pathname.includes('/api/auth') &&
                                !nextUrl.pathname.startsWith('/_next') &&
                                !nextUrl.pathname.startsWith('/static');

      // Allow access to auth routes when not logged in
      if (!isLoggedIn && isOnSignIn) {
        return true;
      }

      // Redirect to signin if not logged in and trying to access protected route
      if (!isLoggedIn && isOnProtectedRoute) {
        return false;
      }

      // Allow access to all routes when logged in
      return true;
    },
    async signIn({ account, user }) {
      // Allow OAuth sign in
      if (account?.provider === 'google') {
        console.log('[AUTH] Google OAuth sign-in', {
          userId: user?.id,
          email: user?.email,
        });
        return true;
      }
      return false;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, token }) {
      // Enhance session with user role and enabled status from token
      if (token.role !== undefined && token.enabled !== undefined) {
        session.user = {
          ...session.user,
          role: token.role as 'admin' | 'user',
          enabled: token.enabled as boolean,
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      // For Edge Runtime compatibility, we'll set default values here
      // The enhanced Firestore adapter handles user creation with proper defaults
      if (user) {
        token.role = user.role ?? 'user';
        token.enabled = user.enabled ?? false; // New users require admin approval
      }
      
      return token;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;