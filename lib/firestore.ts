import { getFirestore } from 'firebase-admin/firestore'
import { getApps } from 'firebase-admin/app'
import type { Firestore } from 'firebase-admin/firestore'

/**
 * Get Firestore instance
 * 
 * Returns the initialized Firestore instance for the default Firebase app.
 * Throws an error if Firebase is not properly initialized.
 * 
 * @returns {Firestore} The Firestore database instance
 * @throws {Error} If Firebase is not initialized
 */
export function getFirestoreInstance(): Firestore {
  const apps = getApps()
  if (apps.length === 0) {
    throw new Error('Firebase not initialized. Ensure Firebase Admin is properly configured.')
  }
  
  return getFirestore(apps[0]!, process.env.FIRESTORE_DATABASE_ID || '(default)')
}