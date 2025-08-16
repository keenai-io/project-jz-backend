/**
 * UserManagement Domain Types
 * 
 * Type definitions for the UserManagement feature.
 * These types are inferred from Zod schemas to ensure consistency.
 */

// Re-export types inferred from schemas
export type {
  FirestoreUserDocument as UserManagementUser,
  UserListItem,
  UserStatusUpdate,
  UserStatusUpdateResponse,
  UserListQuery,
  UserListResponse,
  AdminUser,
  ServerActionContext,
} from '../schemas/userManagement'

// Re-export the user role type for convenience
export { userRoleSchema } from '../schemas/userManagement'
export type UserRole = 'admin' | 'user'