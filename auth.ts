import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { authConfig } from "./auth.config"
import { FirestoreAdapter } from "@auth/firebase-adapter"
import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app"
import { getFirestoreInstance } from "@lib/firestore"

// Initialize Firebase Admin if not already initialized
function getFirebaseApp() {
  if (getApps().length === 0) {
    // Check if we have individual environment variables
    const hasFirebaseEnvVars = process.env.FIREBASE_PROJECT_ID && 
                               process.env.FIREBASE_CLIENT_EMAIL && 
                               process.env.FIREBASE_PRIVATE_KEY;

    if (hasFirebaseEnvVars) {
      // Use individual environment variables
      return initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      })
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use service account credentials file
      return initializeApp({
        credential: applicationDefault(),
      })
    } else {
      throw new Error("Firebase credentials not properly configured. Please provide either individual environment variables or GOOGLE_APPLICATION_CREDENTIALS path.")
    }
  } else {
    return getApps()[0]!; // We know it exists because length > 0
  }
}

// Ensure Firebase is initialized before creating the adapter
getFirebaseApp()

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: FirestoreAdapter(getFirestoreInstance()),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    })
  ],
  debug: true
})