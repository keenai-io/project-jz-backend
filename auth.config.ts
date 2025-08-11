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
    async signIn({ account }) {
      // Allow OAuth sign in
      if (account?.provider === 'google') {
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
    async session({ session }) {
      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;