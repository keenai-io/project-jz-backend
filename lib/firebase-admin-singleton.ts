import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

/**
 * Firebase Admin SDK Singleton
 * 
 * Based on: https://medium.com/@itself_tools/avoiding-multiple-instances-of-firebase-in-next-js-a-simple-guide-a9363d1a902a
 * Uses globalThis to prevent multiple instances across Next.js hot reloads
 */

// Extend globalThis to include our Firebase instances
declare global {
  var firebaseAdmin: App | undefined
  var firestoreAdmin: Firestore | undefined
}

/**
 * Get or initialize Firebase Admin App
 * Uses globalThis caching to prevent reinitialization during HMR
 */
export function getFirebaseAdminApp(): App {
  // Return cached app if available
  if (globalThis.firebaseAdmin) {
    return globalThis.firebaseAdmin
  }

  // Check if Firebase Admin SDK already has apps (fallback)
  const existingApps = getApps()
  if (existingApps.length > 0 && existingApps[0]) {
    globalThis.firebaseAdmin = existingApps[0]
    return existingApps[0]
  }

  // Initialize new app
  let app: App

  // In development mode with emulators, use project from .firebaserc
  if (process.env.NODE_ENV === 'development' && 
      (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST)) {
    
    console.log('🔧 Initializing Firebase Admin for emulator mode')
    
    app = initializeApp({
      projectId: 'demo-project', // Match the project in .firebaserc
      // No credential needed for emulator mode
    })
  } else {
    // Production mode - use environment variables only
    const hasFirebaseEnvVars = process.env.FIREBASE_PROJECT_ID && 
                               process.env.FIREBASE_CLIENT_EMAIL && 
                               process.env.FIREBASE_PRIVATE_KEY

    if (hasFirebaseEnvVars) {
      // Use individual environment variables
      app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      })
    } else {
      throw new Error("Firebase credentials not properly configured. Please provide FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.")
    }
  }

  // Cache in globalThis
  globalThis.firebaseAdmin = app
  return app
}

/**
 * Get or initialize Firestore instance
 * Uses globalThis caching to prevent reinitialization during HMR
 */
export function getFirestoreAdminInstance(): Firestore {
  // Return cached instance if available
  if (globalThis.firestoreAdmin) {
    return globalThis.firestoreAdmin
  }

  const app = getFirebaseAdminApp()
  
  // Use (default) database for emulators, configured database for production
  const isEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;
  const databaseId = isEmulator ? '(default)' : (process.env.FIRESTORE_DATABASE_ID || '(default)')
  
  const firestore = getFirestore(app, databaseId)
  
  // Log emulator usage (only first time)
  if (process.env.NODE_ENV === 'development' && process.env.FIRESTORE_EMULATOR_HOST) {
    console.log('🗄️ Using Firestore emulator at', process.env.FIRESTORE_EMULATOR_HOST, 'with database:', databaseId)
  }
  
  // Cache in globalThis
  globalThis.firestoreAdmin = firestore
  return firestore
}