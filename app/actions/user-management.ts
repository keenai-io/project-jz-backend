/**
 * User Management Server Actions
 * 
 * Server-side actions for admin user management operations.
 * Uses firebase-admin-singleton for privileged Firestore operations.
 */

'use server'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { serverLogger } from '@/lib/logger.server'
import { UserManagementService } from '@/features/UserManagement/application/userManagementService'
import {
  userStatusUpdateSchema,
  userListQuerySchema,
  type UserListItem,
  type UserListResponse,
  type UserStatusUpdateResponse,
} from '@/features/UserManagement/domain/schemas/userManagement'

// Create service instance
const userManagementService = new UserManagementService()

/**
 * Verify admin access for user management operations
 */
async function verifyAdminAccess(operation: string): Promise<{ userId: string; email: string }> {
  const session = await auth()
  
  if (!session?.user) {
    serverLogger.warn('Unauthorized user management access attempt', 'auth', { operation })
    redirect('/signin')
  }

  if (session.user.role !== 'admin' || !session.user.enabled) {
    serverLogger.warn('Non-admin user attempted user management operation', 'auth', { 
      operation,
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
      enabled: session.user.enabled 
    })
    redirect('/')
  }

  serverLogger.info('Admin user management access verified', 'auth', { 
    operation,
    adminUserId: session.user.id,
    adminEmail: session.user.email 
  })

  return {
    userId: session.user.id!,
    email: session.user.email!,
  }
}

/**
 * Get all users for admin management interface
 */
export async function getAllUsers(queryParams?: {
  limit?: number
  cursor?: string
  role?: 'admin' | 'user'
  enabled?: boolean
}): Promise<UserListResponse> {
  const admin = await verifyAdminAccess('getAllUsers')
  
  try {
    // Validate query parameters
    const validatedQuery = queryParams 
      ? userListQuerySchema.parse(queryParams)
      : {}
    
    serverLogger.info('Fetching all users for admin', 'system', { 
      adminUserId: admin.userId,
      query: validatedQuery 
    })

    const result = await userManagementService.getUsers(validatedQuery)
    
    serverLogger.info('Successfully fetched users for admin', 'system', { 
      adminUserId: admin.userId,
      userCount: result.users.length,
      hasNextPage: !!result.nextCursor 
    })
    
    return result
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error))
    serverLogger.error('Failed to fetch users for admin', errorObj, 'system', { 
      adminUserId: admin.userId,
      queryParams 
    })
    throw new Error(`Failed to fetch users: ${errorObj.message}`)
  }
}

/**
 * Update user enabled status
 */
export async function updateUserStatus(
  userId: string, 
  enabled: boolean
): Promise<UserStatusUpdateResponse> {
  const admin = await verifyAdminAccess('updateUserStatus')
  
  try {
    // Validate input parameters
    const validatedUpdate = userStatusUpdateSchema.parse({ userId, enabled })
    
    serverLogger.info('Updating user status', 'system', { 
      adminUserId: admin.userId,
      targetUserId: validatedUpdate.userId,
      newStatus: validatedUpdate.enabled 
    })

    // Prevent admin from disabling themselves
    if (validatedUpdate.userId === admin.userId && !validatedUpdate.enabled) {
      serverLogger.warn('Admin attempted to disable their own account', 'system', { 
        adminUserId: admin.userId 
      })
      return {
        success: false,
        error: 'Cannot disable your own admin account',
      }
    }

    const updatedUser = await userManagementService.updateUserStatus(
      validatedUpdate.userId, 
      validatedUpdate.enabled
    )
    
    serverLogger.info('Successfully updated user status', 'system', { 
      adminUserId: admin.userId,
      targetUserId: validatedUpdate.userId,
      targetUserEmail: updatedUser.email,
      newStatus: validatedUpdate.enabled 
    })
    
    return {
      success: true,
      user: updatedUser,
    }
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error))
    serverLogger.error('Failed to update user status', errorObj, 'system', { 
      adminUserId: admin.userId,
      targetUserId: userId,
      enabled 
    })
    
    return {
      success: false,
      error: errorObj.message,
    }
  }
}

/**
 * Get a single user by ID (for admin operations)
 */
export async function getUserById(userId: string): Promise<UserListItem | null> {
  const admin = await verifyAdminAccess('getUserById')
  
  try {
    serverLogger.info('Fetching user by ID for admin', 'system', { 
      adminUserId: admin.userId,
      targetUserId: userId 
    })

    const user = await userManagementService.getUserById(userId)
    
    if (user) {
      serverLogger.info('Successfully fetched user by ID for admin', 'system', { 
        adminUserId: admin.userId,
        targetUserId: userId,
        targetUserEmail: user.email 
      })
    } else {
      serverLogger.warn('User not found for admin query', 'system', { 
        adminUserId: admin.userId,
        targetUserId: userId 
      })
    }
    
    return user
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error))
    serverLogger.error('Failed to fetch user by ID for admin', errorObj, 'system', { 
      adminUserId: admin.userId,
      targetUserId: userId 
    })
    throw new Error(`Failed to fetch user: ${errorObj.message}`)
  }
}

/**
 * Get user statistics for admin dashboard
 */
export async function getUserStats(): Promise<{
  totalUsers: number
  enabledUsers: number
  disabledUsers: number
  adminUsers: number
}> {
  const admin = await verifyAdminAccess('getUserStats')
  
  try {
    serverLogger.info('Fetching user statistics for admin', 'system', { 
      adminUserId: admin.userId 
    })

    const stats = await userManagementService.getUserStats()
    
    serverLogger.info('Successfully fetched user statistics for admin', 'system', { 
      adminUserId: admin.userId,
      ...stats 
    })
    
    return stats
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error))
    serverLogger.error('Failed to fetch user statistics for admin', errorObj, 'system', { 
      adminUserId: admin.userId 
    })
    throw new Error(`Failed to fetch user statistics: ${errorObj.message}`)
  }
}