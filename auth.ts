import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { authConfig } from "./auth.config"
import { createEnhancedFirestoreAdapter } from "@/lib/enhanced-firestore-adapter"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: createEnhancedFirestoreAdapter(),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    })
  ],
  events: {
    async signIn({ user, account }) {
      // Update lastLogin timestamp on successful sign-in
      if (user?.id && account?.provider === 'google') {
        try {
          // Get the adapter instance to access updateLastLogin
          const adapter = createEnhancedFirestoreAdapter();
          if (adapter.updateLastLogin) {
            await adapter.updateLastLogin(user.id);
          }
        } catch (error) {
          // Log error but don't block authentication
          console.error('[AUTH] Failed to update last login via events:', error);
        }
      }
    }
  }
})