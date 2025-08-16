/**
 * UserManagementTable Component
 * 
 * Displays a table of users with management controls for admins.
 * Uses existing Table component and integrates with UserStatusToggle.
 */

'use client'

import { ReactElement, useState } from 'react'
import { useIntlayer } from 'next-intlayer'
import { 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableHeader, 
  TableCell 
} from '@/app/components/ui/table'
import { Badge } from '@/app/components/ui/badge'
import { Text } from '@/app/components/ui/text'
import { Button } from '@/app/components/ui/button'
import { UserStatusToggle } from './UserStatusToggle'
import { useUsers } from '../hooks/useUsers'
import type { UserListItem, UserListQuery } from '../domain/types/userManagement'

/**
 * Props for UserManagementTable component
 */
interface UserManagementTableProps {
  /** Optional filter for the user list */
  filter?: UserListQuery
  
  /** Optional limit for number of users to display */
  limit?: number
  
  /** Callback when user status is updated */
  onUserStatusChange?: (userId: string, enabled: boolean) => void
  
  /** Whether to show pagination controls */
  showPagination?: boolean
  
  /** Custom className for styling */
  className?: string
}

/**
 * UserManagementTable Component
 * 
 * Renders a responsive table of users with status toggles and role badges.
 * Integrates with TanStack Query for data fetching and real-time updates.
 */
export function UserManagementTable({
  filter = {},
  limit = 50,
  onUserStatusChange,
  showPagination = true,
  className,
}: UserManagementTableProps): ReactElement {
  const content = useIntlayer<'user-management-table'>('user-management-table')
  const [currentQuery, setCurrentQuery] = useState<UserListQuery>({
    ...filter,
    limit,
  })

  // Fetch users with the current query
  const { 
    data: userListResponse, 
    isLoading, 
    isError, 
    error,
    refetch,
  } = useUsers(currentQuery)

  const users = userListResponse?.users || []
  const nextCursor = userListResponse?.nextCursor

  /**
   * Handle pagination - load next page
   */
  const handleNextPage = (): void => {
    if (nextCursor) {
      setCurrentQuery((prev: UserListQuery) => ({ ...prev, cursor: nextCursor }))
    }
  }

  /**
   * Handle pagination - load previous page
   */
  const handlePreviousPage = (): void => {
    // Note: Previous page implementation would require storing cursor history
    // For now, we'll reset to first page
    setCurrentQuery((prev: UserListQuery) => ({ ...prev, cursor: undefined }))
  }

  /**
   * Handle user status change from toggle
   */
  const handleStatusChange = (userId: string, enabled: boolean): void => {
    onUserStatusChange?.(userId, enabled)
  }

  /**
   * Render role badge with appropriate styling
   */
  const renderRoleBadge = (role: 'admin' | 'user'): ReactElement => {
    return (
      <Badge 
        color={role === 'admin' ? 'red' : 'zinc'}
        className="text-xs"
      >
        {role === 'admin' ? content.roles.admin.value : content.roles.user.value}
      </Badge>
    )
  }

  /**
   * Render status badge
   */
  const renderStatusBadge = (enabled: boolean): ReactElement => {
    return (
      <Badge 
        color={enabled ? 'green' : 'zinc'}
        className="text-xs"
      >
        {enabled ? content.status.enabled.value : content.status.disabled.value}
      </Badge>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <Text>{content.loading.value}</Text>
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 ${className}`}>
        <Text className="text-red-800 dark:text-red-200 mb-2">
          {content.error.title.value}
        </Text>
        <Text className="text-red-600 dark:text-red-300 text-sm mb-3">
          {error instanceof Error ? error.message : content.error.unknown.value}
        </Text>
        <Button 
          onClick={() => refetch()} 
          color="red" 
          className="text-sm"
        >
          {content.error.retry.value}
        </Button>
      </div>
    )
  }

  // Empty state
  if (users.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Text className="text-gray-500 dark:text-gray-400 mb-4">
          {content.empty.message.value}
        </Text>
        <Button 
          onClick={() => refetch()} 
          outline
          className="text-sm"
        >
          {content.empty.refresh.value}
        </Button>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Table Container - Flex grow to fill available space */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <Table>
            <TableHead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
              <TableRow>
                <TableHeader>{content.headers.name.value}</TableHeader>
                <TableHeader>{content.headers.email.value}</TableHeader>
                <TableHeader>{content.headers.role.value}</TableHeader>
                <TableHeader>{content.headers.status.value}</TableHeader>
                <TableHeader>{content.headers.lastLogin.value}</TableHeader>
                <TableHeader>{content.headers.actions.value}</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user: UserListItem) => (
                <TableRow key={user.id}>
                  {/* Name */}
                  <TableCell>
                    <div className="flex flex-col">
                      <Text className="font-medium text-gray-900 dark:text-white">
                        {user.displayName}
                      </Text>
                      {user.createdAt && (
                        <Text className="text-xs text-gray-500 dark:text-gray-400">
                          {content.joined.value} {user.createdAt}
                        </Text>
                      )}
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell>
                    <Text className="text-gray-600 dark:text-gray-300">
                      {user.email}
                    </Text>
                  </TableCell>

                  {/* Role */}
                  <TableCell>
                    {renderRoleBadge(user.role)}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {renderStatusBadge(user.enabled)}
                  </TableCell>

                  {/* Last Login */}
                  <TableCell>
                    <Text className="text-gray-600 dark:text-gray-300 text-sm">
                      {user.lastLogin || content.lastLogin.never.value}
                    </Text>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <UserStatusToggle
                      userId={user.id}
                      enabled={user.enabled}
                      userEmail={user.email}
                      onStatusChange={handleStatusChange}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination - Fixed at bottom */}
      {showPagination && (
        <div className="flex-shrink-0 flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {content.pagination.showing.value.replace('{count}', users.length.toString())}
          </Text>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handlePreviousPage}
              disabled={!currentQuery.cursor}
              outline
              className="text-sm"
            >
              {content.pagination.previous.value}
            </Button>
            
            <Button
              onClick={handleNextPage}
              disabled={!nextCursor}
              outline
              className="text-sm"
            >
              {content.pagination.next.value}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}