/**
 * Admin Users Page
 * 
 * Main page for user management interface.
 * Displays user list with management controls for admins.
 */

import { ReactElement } from 'react'
import { AdminUsersView } from '@/features/UserManagement'

/**
 * Admin Users Page Component
 * 
 * Server component that renders the user management interface.
 * Protected by middleware to ensure only admins can access.
 */
export default function AdminUsersPage(): ReactElement {
  return <AdminUsersView />
}

/**
 * Page metadata for SEO and browser tab
 */
export const metadata = {
  title: 'User Management | Admin Panel',
  description: 'Manage user accounts, roles, and access permissions',
}