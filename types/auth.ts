/**
 * @fileoverview Authentication types for User Access Control system
 * 
 * This module defines the extended user types that include role-based access control
 * and user status management for the authentication system.
 */

import { z } from 'zod';

/**
 * User roles enumeration schema
 * 
 * Defines the available user roles in the system:
 * - 'admin': Users with administrative privileges
 * - 'user': Regular users with standard access
 */
export const UserRoleSchema = z.enum(['admin', 'user']);
export type UserRole = z.infer<typeof UserRoleSchema>;

/**
 * User enabled status schema
 * 
 * Boolean flag indicating whether a user account is enabled:
 * - true: User can access the application features
 * - false: User is disabled and cannot access features (pending approval)
 */
export const UserEnabledSchema = z.boolean();
export type UserEnabled = z.infer<typeof UserEnabledSchema>;

/**
 * Enhanced Firestore user document schema
 * 
 * Extends the standard NextAuth user document with role and enabled fields
 * for access control functionality. This schema validates the user data
 * stored in Firestore.
 */
export const FirestoreUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email().nullable(),
  name: z.string().nullable(),
  image: z.string().url().nullable(),
  emailVerified: z.date().nullable().optional(),
  
  // New fields for User Access Control
  role: UserRoleSchema.default('user'),
  enabled: UserEnabledSchema.default(false),
  
  // Optional metadata
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  lastLogin: z.date().nullable().optional(),
});
export type FirestoreUser = z.infer<typeof FirestoreUserSchema>;

/**
 * Enhanced NextAuth session user schema
 * 
 * Defines the user object structure that will be included in NextAuth sessions.
 * This is what components and pages will have access to through useSession().
 */
export const SessionUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email().nullable(),
  name: z.string().nullable(),
  image: z.string().url().nullable(),
  
  // Access control fields
  role: UserRoleSchema,
  enabled: UserEnabledSchema,
});
export type SessionUser = z.infer<typeof SessionUserSchema>;

/**
 * Enhanced NextAuth session schema
 * 
 * Extends the standard NextAuth session with role-based access control data.
 */
export const EnhancedSessionSchema = z.object({
  user: SessionUserSchema,
  expires: z.string(),
});
export type EnhancedSession = z.infer<typeof EnhancedSessionSchema>;

/**
 * User status update schema for admin operations
 * 
 * Used by admin interfaces to update user status and role.
 */
export const UserStatusUpdateSchema = z.object({
  userId: z.string().min(1),
  enabled: UserEnabledSchema.optional(),
  role: UserRoleSchema.optional(),
});
export type UserStatusUpdate = z.infer<typeof UserStatusUpdateSchema>;

/**
 * User creation data schema for new user registration
 * 
 * Defines the required data when creating a new user with default role and enabled status.
 */
export const UserCreationSchema = z.object({
  email: z.string().email(),
  name: z.string().nullable(),
  image: z.string().url().nullable(),
  role: UserRoleSchema.default('user'),
  enabled: UserEnabledSchema.default(true),
});
export type UserCreationData = z.infer<typeof UserCreationSchema>;

/**
 * Type guard to check if a user has admin role
 * 
 * @param user - The user object to check
 * @returns true if user has admin role, false otherwise
 */
export function isAdmin(user: Pick<SessionUser, 'role'> | null | undefined): boolean {
  return user?.role === 'admin';
}

/**
 * Type guard to check if a user is enabled
 * 
 * @param user - The user object to check
 * @returns true if user is enabled, false otherwise
 */
export function isUserEnabled(user: Pick<SessionUser, 'enabled'> | null | undefined): boolean {
  return user?.enabled === true;
}

/**
 * Type guard to check if a user can access admin features
 * 
 * @param user - The user object to check
 * @returns true if user is both admin and enabled, false otherwise
 */
export function canAccessAdmin(user: SessionUser | null | undefined): boolean {
  return isAdmin(user) && isUserEnabled(user);
}

/**
 * Type guard to check if a user can access standard features
 * 
 * @param user - The user object to check
 * @returns true if user is enabled (regardless of role), false otherwise
 */
export function canAccessFeatures(user: SessionUser | null | undefined): boolean {
  return isUserEnabled(user);
}