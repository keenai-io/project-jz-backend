/**
 * AdminLayout Component
 * 
 * Layout wrapper for admin pages with navigation and styling.
 * Provides consistent admin interface design and navigation.
 */

'use client'

import { ReactElement, ReactNode } from 'react'
import { useIntlayer } from 'next-intlayer'
import { Heading } from '@/app/components/ui/heading'
import { Text } from '@/app/components/ui/text'
import { Divider } from '@/app/components/ui/divider'
import { UsersIcon } from '@heroicons/react/24/outline'

/**
 * Props for AdminLayout component
 */
interface AdminLayoutProps {
  /** Page title */
  title: string
  
  /** Optional page description */
  description?: string
  
  /** Main content to render */
  children: ReactNode
  
  /** Optional sidebar content */
  sidebar?: ReactNode
  
  /** Optional header actions */
  headerActions?: ReactNode
  
  /** Custom className for the main container */
  className?: string
}

/**
 * AdminLayout Component
 * 
 * Provides a consistent layout for admin pages with:
 * - Page header with title and description
 * - Optional sidebar navigation
 * - Main content area with proper spacing
 * - Responsive design
 */
export function AdminLayout({
  title,
  description,
  children,
  sidebar,
  headerActions,
  className,
}: AdminLayoutProps): ReactElement {
  const content = useIntlayer<'admin-layout'>('admin-layout')

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col ${className}`}>
      {/* Admin Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <UsersIcon className="h-4 w-4" />
              <span>{content.breadcrumb.admin.value}</span>
              <span>/</span>
              <span className="text-gray-900 dark:text-white">{title}</span>
            </div>

            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <Heading level={1} className="text-gray-900 dark:text-white">
                  {title}
                </Heading>
                {description && (
                  <Text className="mt-2 text-gray-600 dark:text-gray-300">
                    {description}
                  </Text>
                )}
              </div>
              
              {headerActions && (
                <div className="flex items-center space-x-3">
                  {headerActions}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
        <div className={`${sidebar ? 'lg:grid lg:grid-cols-4 lg:gap-8' : ''} flex-1 ${sidebar ? '' : 'flex flex-col'}`}>
          {/* Sidebar */}
          {sidebar && (
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <Heading level={3} className="text-gray-900 dark:text-white mb-4">
                  {content.sidebar.title.value}
                </Heading>
                <Divider className="mb-4" />
                {sidebar}
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className={`${sidebar ? 'lg:col-span-3' : ''} ${sidebar ? 'mt-8 lg:mt-0' : 'flex-1'} ${sidebar ? '' : 'flex flex-col'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow flex-1 flex flex-col">
              <div className="p-6 flex-1 flex flex-col">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {content.footer.adminPanel.value}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {content.footer.version.value}
            </Text>
          </div>
        </div>
      </footer>
    </div>
  )
}

/**
 * AdminPageHeader Component
 * 
 * Reusable header component for admin pages
 */
interface AdminPageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function AdminPageHeader({ 
  title, 
  description, 
  actions 
}: AdminPageHeaderProps): ReactElement {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <Heading level={2} className="text-gray-900 dark:text-white">
          {title}
        </Heading>
        {description && (
          <Text className="mt-1 text-gray-600 dark:text-gray-300">
            {description}
          </Text>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center space-x-3">
          {actions}
        </div>
      )}
    </div>
  )
}

/**
 * AdminSection Component
 * 
 * Reusable section component for admin content
 */
interface AdminSectionProps {
  title?: string
  children: ReactNode
  className?: string
}

export function AdminSection({ 
  title, 
  children, 
  className 
}: AdminSectionProps): ReactElement {
  return (
    <div className={`${className}`}>
      {title && (
        <>
          <Heading level={3} className="text-gray-900 dark:text-white mb-4">
            {title}
          </Heading>
          <Divider className="mb-6" />
        </>
      )}
      {children}
    </div>
  )
}