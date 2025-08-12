'use server'

import { auth } from '@/auth'
import { getFirestoreInstance } from '@lib/firestore'
import { serverLogger } from '@lib/logger.server'
import { 
  ConfigurationForm, 
  ConfigurationValidation 
} from '@features/Configuration/domain/schemas/ConfigurationSchemas'
import { redirect } from 'next/navigation'

/**
 * Server action to save user configuration to Firestore
 * 
 * Validates the configuration data and saves it to the user's document
 * in the 'configurations' collection. Each user has a single configuration document.
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

    serverLogger.info('Saving user configuration', 'configuration', { 
      userId: session.user.email,
      configKeys: Object.keys(configData) 
    })

    // Validate configuration data with Zod
    const validatedConfig = ConfigurationValidation.validateConfigurationForm(configData)

    // Get Firestore instance
    const db = getFirestoreInstance()
    
    // Save to Firestore with user email as document ID
    const configRef = db.collection('configurations').doc(session.user.email)
    
    const configDocument = {
      ...validatedConfig,
      userId: session.user.email,
      updatedAt: new Date(),
      createdAt: new Date() // Will be overwritten if document exists
    }

    // Use merge: true to update existing document or create new one
    await configRef.set(configDocument, { merge: true })

    serverLogger.info('Configuration saved successfully', 'configuration', { 
      userId: session.user.email 
    })

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
 * Retrieves the user's configuration document from the 'configurations' collection.
 * Returns null if no configuration exists.
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

    serverLogger.info('Fetching user configuration', 'configuration', { 
      userId: session.user.email 
    })

    // Get Firestore instance
    const db = getFirestoreInstance()
    
    // Get configuration document
    const configRef = db.collection('configurations').doc(session.user.email)
    const configDoc = await configRef.get()

    if (!configDoc.exists) {
      serverLogger.info('No configuration found for user', 'configuration', { 
        userId: session.user.email 
      })
      return null
    }

    const configData = configDoc.data()
    if (!configData) {
      return null
    }

    // Remove Firestore-specific fields before validation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId: _userId, createdAt: _createdAt, updatedAt: _updatedAt, ...cleanConfig } = configData

    // Validate the configuration data
    const validatedConfig = ConfigurationValidation.validateConfigurationForm(cleanConfig)

    serverLogger.info('Configuration fetched successfully', 'configuration', { 
      userId: session.user.email 
    })

    return validatedConfig

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
 * Removes the user's configuration document from the 'configurations' collection.
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

    serverLogger.info('Deleting user configuration', 'configuration', { 
      userId: session.user.email 
    })

    // Get Firestore instance
    const db = getFirestoreInstance()
    
    // Delete configuration document
    const configRef = db.collection('configurations').doc(session.user.email)
    await configRef.delete()

    serverLogger.info('Configuration deleted successfully', 'configuration', { 
      userId: session.user.email 
    })

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