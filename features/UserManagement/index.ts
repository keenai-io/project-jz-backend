/**
 * UserManagement Feature - Public API
 * 
 * This is the only entry point for importing from the UserManagement feature.
 * All external code must import through this file to maintain proper
 * vertical slice architecture boundaries.
 */

// Presentation Components
export { UserManagementTable } from './presentation/UserManagementTable'
export { UserStatusToggle } from './presentation/UserStatusToggle'
export { AdminLayout } from './presentation/AdminLayout'

// Custom Hooks
export { useUsers } from './hooks/useUsers'
export { useUserStatusMutation } from './hooks/useUserStatusMutation'

// Types
export type { UserManagementUser, UserListItem, UserStatusUpdate } from './domain/types/userManagement'

// Schemas (for external validation if needed)
export { userListItemSchema, userStatusUpdateSchema } from './domain/schemas/userManagement'