/**
 * UserStatusToggle Component
 * 
 * Toggle switch for enabling/disabling user accounts.
 * Uses existing Switch component with optimistic updates.
 */

'use client'

import { ReactElement, useState, useCallback } from 'react'
import { useIntlayer } from 'next-intlayer'
import { Switch } from '@/app/components/ui/switch'
import { Text } from '@/app/components/ui/text'
import { useUserStatusMutation } from '../hooks/useUserStatusMutation'

/**
 * Props for UserStatusToggle component
 */
interface UserStatusToggleProps {
  /** User ID to update */
  userId: string
  
  /** Current enabled status */
  enabled: boolean
  
  /** User email for display/logging */
  userEmail: string
  
  /** Callback when status changes successfully */
  onStatusChange?: (userId: string, enabled: boolean) => void
  
  /** Whether the toggle is disabled */
  disabled?: boolean
  
  /** Custom className for styling */
  className?: string
}

/**
 * UserStatusToggle Component
 * 
 * Renders a toggle switch that allows admins to enable/disable user accounts.
 * Includes confirmation for critical actions and proper error handling.
 */
export function UserStatusToggle({
  userId,
  enabled,
  userEmail,
  onStatusChange,
  disabled = false,
  className,
}: UserStatusToggleProps): ReactElement {
  const content = useIntlayer<'user-status-toggle'>('user-status-toggle')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingAction, setPendingAction] = useState<boolean | null>(null)

  // User status mutation with optimistic updates
  const statusMutation = useUserStatusMutation({
    onSuccess: (result, variables) => {
      if (result.success) {
        onStatusChange?.(variables.userId, variables.enabled)
        setShowConfirmation(false)
        setPendingAction(null)
      } else {
        // Handle server-side validation errors
        setPendingAction(null)
        // Error will be displayed by the mutation hook
      }
    },
    onError: () => {
      setPendingAction(null)
      setShowConfirmation(false)
    },
  })

  /**
   * Handle toggle change with confirmation for disabling users
   */
  const handleToggleChange = useCallback((newEnabled: boolean): void => {
    // If disabling a user, show confirmation
    if (!newEnabled && enabled) {
      setPendingAction(newEnabled)
      setShowConfirmation(true)
      return
    }

    // For enabling users, proceed immediately
    setPendingAction(newEnabled)
    statusMutation.mutate({
      userId,
      enabled: newEnabled,
    })
  }, [userId, enabled, statusMutation])

  /**
   * Confirm the pending action
   */
  const handleConfirmAction = useCallback((): void => {
    if (pendingAction !== null) {
      statusMutation.mutate({
        userId,
        enabled: pendingAction,
      })
    }
  }, [userId, pendingAction, statusMutation])

  /**
   * Cancel the pending action
   */
  const handleCancelAction = useCallback((): void => {
    setShowConfirmation(false)
    setPendingAction(null)
  }, [])

  const isLoading = statusMutation.isPending
  const isDisabled = disabled || isLoading

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {/* Main Toggle */}
      <div className="flex items-center space-x-2">
        <Switch
          checked={enabled}
          onChange={handleToggleChange}
          disabled={isDisabled}
          color={enabled ? 'green' : 'zinc'}
          aria-label={
            enabled 
              ? content.accessibility.disableUser.value.replace('{email}', userEmail)
              : content.accessibility.enableUser.value.replace('{email}', userEmail)
          }
        />
        
        <Text className="text-sm text-gray-600 dark:text-gray-300">
          {isLoading 
            ? content.status.updating.value
            : enabled 
              ? content.status.enabled.value 
              : content.status.disabled.value
          }
        </Text>
      </div>

      {/* Error Display */}
      {statusMutation.isError && (
        <Text className="text-xs text-red-600 dark:text-red-400">
          {statusMutation.error?.message || content.error.unknown.value}
        </Text>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-lg">
            <div className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3 break-words">
                {content.confirmation.title.value}
              </Text>
              <Text className="text-gray-600 dark:text-gray-300 break-words whitespace-normal leading-relaxed">
                {pendingAction === false 
                  ? content.confirmation.disableMessage.value.replace('{email}', userEmail)
                  : content.confirmation.enableMessage.value.replace('{email}', userEmail)
                }
              </Text>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={handleCancelAction}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {content.confirmation.cancel.value}
              </button>
              
              <button
                onClick={handleConfirmAction}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md text-white font-medium transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed ${
                  pendingAction === false
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500'
                    : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500'
                }`}
              >
                {isLoading
                  ? content.confirmation.processing.value
                  : pendingAction === false
                    ? content.confirmation.disable.value
                    : content.confirmation.enable.value
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}