/**
 * UserManagement Domain Schemas
 * 
 * Zod validation schemas for the UserManagement feature.
 * These schemas validate data at system boundaries and provide type inference.
 */

import { z } from 'zod'

/**
 * User role schema matching authentication system
 */
export const userRoleSchema = z.enum(['admin', 'user'])

/**
 * Firebase Timestamp schema for server-side operations
 */
export const timestampSchema = z.object({
  seconds: z.number(),
  nanoseconds: z.number(),
}).nullable().optional()

/**
 * Raw Firestore user document schema
 * Validates data coming from Firebase Admin SDK
 */
export const firestoreUserDocumentSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email(),
  image: z.string().url().nullable(),
  role: userRoleSchema,
  enabled: z.boolean(),
  lastLogin: timestampSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
})

/**
 * User list item schema for client-side display
 * Validates transformed user data
 */
export const userListItemSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  email: z.string().email(),
  role: userRoleSchema,
  enabled: z.boolean(),
  lastLogin: z.string().nullable(),
  createdAt: z.string().nullable(),
})

/**
 * User status update request schema
 * Validates incoming requests to update user status
 */
export const userStatusUpdateSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  enabled: z.boolean(),
})

/**
 * User status update response schema
 * Validates server action responses
 */
export const userStatusUpdateResponseSchema = z.object({
  success: z.boolean(),
  user: userListItemSchema.optional(),
  error: z.string().optional(),
})

/**
 * User list query parameters schema
 * Validates query parameters for user list requests
 */
export const userListQuerySchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  cursor: z.string().optional(),
  role: userRoleSchema.optional(),
  enabled: z.boolean().optional(),
})

/**
 * User list response schema
 * Validates response from user list queries
 */
export const userListResponseSchema = z.object({
  users: z.array(userListItemSchema),
  nextCursor: z.string().optional(),
  totalCount: z.number().optional(),
})

/**
 * Admin role validation schema
 * Validates that a user has admin role
 */
export const adminUserSchema = z.object({
  role: z.literal('admin'),
  enabled: z.literal(true),
})

/**
 * Server action context schema
 * Validates session data for server actions
 */
export const serverActionContextSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    role: userRoleSchema,
    enabled: z.boolean(),
  }),
})

// Type inference from schemas
export type FirestoreUserDocument = z.infer<typeof firestoreUserDocumentSchema>
export type UserListItem = z.infer<typeof userListItemSchema>
export type UserStatusUpdate = z.infer<typeof userStatusUpdateSchema>
export type UserStatusUpdateResponse = z.infer<typeof userStatusUpdateResponseSchema>
export type UserListQuery = z.infer<typeof userListQuerySchema>
export type UserListResponse = z.infer<typeof userListResponseSchema>
export type AdminUser = z.infer<typeof adminUserSchema>
export type ServerActionContext = z.infer<typeof serverActionContextSchema>