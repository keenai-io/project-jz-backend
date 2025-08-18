/**
 * Admin Users View Component
 * 
 * Main view for the admin user management interface.
 * Encapsulates the layout and table components for user management.
 */

import { ReactElement } from 'react';
import { AdminLayout } from './AdminLayout';
import { UserManagementTable } from './UserManagementTable';

/**
 * AdminUsersView Component
 * 
 * Complete admin users management view that combines layout and table.
 * This is the main entry point for the user management feature.
 */
export function AdminUsersView(): ReactElement {
  return (
    <AdminLayout
      title="User Management"
      description="Manage user accounts, roles, and access permissions"
    >
      <UserManagementTable />
    </AdminLayout>
  );
}