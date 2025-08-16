/**
 * UserManagement Application Service
 * 
 * Business logic layer for user management operations.
 * Handles data transformation and business rules.
 */

import { getFirestoreAdminInstance } from '@/lib/firebase-admin-singleton'
import { serverLogger } from '@/lib/logger.server'
import {
  firestoreUserDocumentSchema,
  userListItemSchema,
  type UserListItem,
  type FirestoreUserDocument as UserManagementUser,
  type UserListQuery,
  type UserListResponse,
} from '../domain/schemas/userManagement'

/**
 * UserManagement Service Class
 * 
 * Provides business logic for user management operations including:
 * - Fetching user lists with formatting
 * - Updating user status
 * - Data transformation between Firestore and client formats
 */
export class UserManagementService {
  private firestore = getFirestoreAdminInstance()

  /**
   * Fetch all users with optional filtering and pagination
   */
  async getUsers(query: UserListQuery = {}): Promise<UserListResponse> {
    try {
      const { limit = 50, cursor, role, enabled } = query
      
      let firestoreQuery = this.firestore
        .collection('users')
        .orderBy('createdAt', 'desc')
        .limit(limit)

      // Apply filters
      if (role) {
        firestoreQuery = firestoreQuery.where('role', '==', role)
      }
      
      if (enabled !== undefined) {
        firestoreQuery = firestoreQuery.where('enabled', '==', enabled)
      }

      // Apply pagination cursor
      if (cursor) {
        const cursorDoc = await this.firestore.collection('users').doc(cursor).get()
        if (cursorDoc.exists) {
          firestoreQuery = firestoreQuery.startAfter(cursorDoc)
        }
      }

      const snapshot = await firestoreQuery.get()
      
      const users: UserListItem[] = []
      
      for (const doc of snapshot.docs) {
        const userData = { id: doc.id, ...doc.data() }
        
        // Validate the raw Firestore data
        const validatedUser = firestoreUserDocumentSchema.parse(userData)
        
        // Transform to display format
        const userListItem = this.transformUserForDisplay(validatedUser)
        users.push(userListItem)
      }

      // Determine next cursor
      const nextCursor = snapshot.docs.length === limit 
        ? snapshot.docs[snapshot.docs.length - 1]?.id
        : undefined

      serverLogger.info('Successfully fetched users', 'system', { 
        userCount: users.length, 
        hasNextPage: !!nextCursor,
        filters: { role, enabled } 
      })

      return {
        users,
        nextCursor,
        // Note: totalCount not implemented for performance reasons
        // Can be added later if needed
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error))
      serverLogger.error('Failed to fetch users', errorObj, 'system', { 
        query 
      })
      throw new Error(`Failed to fetch users: ${errorObj.message}`)
    }
  }

  /**
   * Update user enabled status
   */
  async updateUserStatus(userId: string, enabled: boolean): Promise<UserListItem> {
    try {
      // Update the user document
      await this.firestore
        .collection('users')
        .doc(userId)
        .update({
          enabled,
          updatedAt: new Date(),
        })

      // Fetch the updated user
      const updatedDoc = await this.firestore
        .collection('users')
        .doc(userId)
        .get()

      if (!updatedDoc.exists) {
        throw new Error('User not found after update')
      }

      const userData = { id: updatedDoc.id, ...updatedDoc.data() }
      const validatedUser = firestoreUserDocumentSchema.parse(userData)
      
      const updatedUser = this.transformUserForDisplay(validatedUser)
      
      serverLogger.info('Successfully updated user status', 'system', { 
        userId, 
        enabled, 
        userEmail: updatedUser.email 
      })
      
      return updatedUser
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error))
      serverLogger.error('Failed to update user status', errorObj, 'system', { 
        userId, 
        enabled 
      })
      throw new Error(`Failed to update user status: ${errorObj.message}`)
    }
  }

  /**
   * Get a single user by ID
   */
  async getUserById(userId: string): Promise<UserListItem | null> {
    try {
      const doc = await this.firestore
        .collection('users')
        .doc(userId)
        .get()

      if (!doc.exists) {
        return null
      }

      const userData = { id: doc.id, ...doc.data() }
      const validatedUser = firestoreUserDocumentSchema.parse(userData)
      
      const user = this.transformUserForDisplay(validatedUser)
      
      serverLogger.info('Successfully fetched user by ID', 'system', { 
        userId, 
        userEmail: user.email 
      })
      
      return user
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error))
      serverLogger.error('Failed to fetch user by ID', errorObj, 'system', { userId })
      throw new Error(`Failed to fetch user: ${errorObj.message}`)
    }
  }

  /**
   * Transform Firestore user document to display format
   */
  private transformUserForDisplay(user: UserManagementUser): UserListItem {
    const displayName = user.name || user.email
    const lastLogin = this.formatTimestamp(user.lastLogin)
    const createdAt = this.formatTimestamp(user.createdAt)

    const transformed = {
      id: user.id,
      displayName,
      email: user.email,
      role: user.role,
      enabled: user.enabled,
      lastLogin,
      createdAt,
    }

    // Validate the transformed data
    return userListItemSchema.parse(transformed)
  }

  /**
   * Format Firebase Timestamp to readable string
   */
  private formatTimestamp(timestamp: any): string | null {
    if (!timestamp) return null
    
    try {
      // Handle Firebase Admin SDK Timestamp
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (error) {
      serverLogger.warn('Error formatting timestamp', 'system', { 
        timestamp, 
        error: error instanceof Error ? error.message : String(error) 
      })
      return null
    }
  }

  /**
   * Get user statistics for admin dashboard
   */
  async getUserStats(): Promise<{
    totalUsers: number
    enabledUsers: number
    disabledUsers: number
    adminUsers: number
  }> {
    try {
      const [totalSnapshot, enabledSnapshot, disabledSnapshot, adminSnapshot] = await Promise.all([
        this.firestore.collection('users').count().get(),
        this.firestore.collection('users').where('enabled', '==', true).count().get(),
        this.firestore.collection('users').where('enabled', '==', false).count().get(),
        this.firestore.collection('users').where('role', '==', 'admin').count().get(),
      ])

      const stats = {
        totalUsers: totalSnapshot.data().count,
        enabledUsers: enabledSnapshot.data().count,
        disabledUsers: disabledSnapshot.data().count,
        adminUsers: adminSnapshot.data().count,
      }
      
      serverLogger.info('Successfully fetched user statistics', 'system', stats)
      
      return stats
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error))
      serverLogger.error('Failed to fetch user statistics', errorObj, 'system')
      throw new Error(`Failed to fetch user statistics: ${errorObj.message}`)
    }
  }
}