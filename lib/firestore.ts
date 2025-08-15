import type { Firestore } from 'firebase-admin/firestore'
import { getFirestoreAdminInstance } from './firebase-admin-singleton'

/**
 * Get Firestore instance
 * 
 * Returns the initialized Firestore instance using the singleton pattern.
 * This is a compatibility wrapper for existing code.
 * 
 * @returns {Firestore} The Firestore database instance
 * @throws {Error} If Firebase is not initialized
 */
export function getFirestoreInstance(): Firestore {
  return getFirestoreAdminInstance()
}