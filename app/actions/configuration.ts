'use server'

import { auth } from '@/auth'
import { serverLogger } from '@lib/logger.server'
import { ConfigurationForm } from '@features/Configuration'
import { ConfigurationService } from '@features/Configuration/server'
import { redirect } from 'next/navigation'

/**
 * Server action to save user configuration to Firestore
 * 
 * Handles authentication and delegates to ConfigurationService for business logic.
 * 
 * @param configData - The configuration form data to save
 * @throws {Error} If user is not authenticated or save fails
 */
export async function saveUserConfiguration(configData: ConfigurationForm): Promise<void> {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.email) {
      serverLogger.warn('Attempted to save configuration without authentication', 'auth')
      redirect('/signin')
    }

    // Delegate to ConfigurationService for business logic
    await ConfigurationService.saveUserConfiguration(session.user.email, configData)

  } catch (error) {
    // Handle NextAuth redirects properly
    if (error && typeof error === 'object' && 'digest' in error && 
        typeof error.digest === 'string' && error.digest.includes('NEXT_REDIRECT')) {
      throw error // Re-throw redirect errors
    }

    serverLogger.error(
      'Failed to save user configuration', 
      error instanceof Error ? error : new Error(String(error)), 
      'configuration'
    )
    throw new Error('Failed to save configuration')
  }
}

/**
 * Server action to get user configuration from Firestore
 * 
 * Handles authentication and delegates to ConfigurationService for business logic.
 * 
 * @returns {Promise<ConfigurationForm | null>} The user's configuration or null
 * @throws {Error} If user is not authenticated or fetch fails
 */
export async function getUserConfiguration(): Promise<ConfigurationForm | null> {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.email) {
      serverLogger.warn('Attempted to get configuration without authentication', 'auth')
      redirect('/signin')
    }

    // Delegate to ConfigurationService for business logic
    return await ConfigurationService.getUserConfiguration(session.user.email)

  } catch (error) {
    // Handle NextAuth redirects properly
    if (error && typeof error === 'object' && 'digest' in error && 
        typeof error.digest === 'string' && error.digest.includes('NEXT_REDIRECT')) {
      throw error // Re-throw redirect errors
    }

    serverLogger.error(
      'Failed to get user configuration', 
      error instanceof Error ? error : new Error(String(error)), 
      'configuration'
    )
    throw new Error('Failed to fetch configuration')
  }
}

/**
 * Server action to delete user configuration from Firestore
 * 
 * Handles authentication and delegates to ConfigurationService for business logic.
 * 
 * @throws {Error} If user is not authenticated or delete fails
 */
export async function deleteUserConfiguration(): Promise<void> {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.email) {
      serverLogger.warn('Attempted to delete configuration without authentication', 'auth')
      redirect('/signin')
    }

    // Delegate to ConfigurationService for business logic
    await ConfigurationService.deleteUserConfiguration(session.user.email)

  } catch (error) {
    // Handle NextAuth redirects properly
    if (error && typeof error === 'object' && 'digest' in error && 
        typeof error.digest === 'string' && error.digest.includes('NEXT_REDIRECT')) {
      throw error // Re-throw redirect errors
    }

    serverLogger.error(
      'Failed to delete user configuration', 
      error instanceof Error ? error : new Error(String(error)), 
      'configuration'
    )
    throw new Error('Failed to delete configuration')
  }
}