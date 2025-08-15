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
})