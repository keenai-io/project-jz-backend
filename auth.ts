import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { FirestoreAdapter } from "@auth/firebase-adapter"
import { cert } from "firebase-admin/app"
import { authConfig } from "./auth.config"
import { env } from "@lib/env"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: FirestoreAdapter({
    credential: cert(env.GOOGLE_APPLICATION_CREDENTIALS),
  }),
  providers: [
    Google
  ],
})