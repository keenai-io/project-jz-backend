import { getFirestoreInstance } from '@lib/firestore'
import { serverLogger } from '@lib/logger.server'
import { 
  ConfigurationForm, 
  ConfigurationValidation 
} from '@features/Configuration/domain/schemas/ConfigurationSchemas'

/**
 * Configuration Service
 * 
 * Contains the business logic for configuration operations.
 * This service is used by server actions and other application layer components.
 */
export class ConfigurationService {
  /**
   * Save user configuration to Firestore
   * 
   * @param userId - The authenticated user's ID
   * @param configData - The configuration form data to save
   * @throws {Error} If validation or save fails
   */
  static async saveUserConfiguration(
    userId: string, 
    configData: ConfigurationForm
  ): Promise<void> {
    serverLogger.info('Saving user configuration', 'configuration', { 
      userId: userId,
      configKeys: Object.keys(configData) 
    })

    // Validate configuration data with Zod
    const validatedConfig = ConfigurationValidation.validateConfigurationForm(configData)

    // Get Firestore instance
    const db = getFirestoreInstance()
    
    // Save to Firestore with user ID as document ID
    const configRef = db.collection('configurations').doc(userId)
    
    const configDocument = {
      ...validatedConfig,
      userId: userId,
      updatedAt: new Date(),
      createdAt: new Date() // Will be overwritten if document exists
    }

    // Use merge: true to update existing document or create new one
    await configRef.set(configDocument, { merge: true })

    serverLogger.info('Configuration saved successfully', 'configuration', { 
      userId: userId,
      documentPath: `configurations/${userId}`,
      dataKeys: Object.keys(configDocument)
    })
  }

  /**
   * Get user configuration from Firestore
   * 
   * @param userId - The authenticated user's ID
   * @returns {Promise<ConfigurationForm | null>} The user's configuration or null
   * @throws {Error} If fetch fails
   */
  static async getUserConfiguration(userId: string): Promise<ConfigurationForm | null> {
    serverLogger.info('Fetching user configuration', 'configuration', { 
      userId: userId 
    })

    // Get Firestore instance
    const db = getFirestoreInstance()
    
    // Get configuration document
    const configRef = db.collection('configurations').doc(userId)
    const configDoc = await configRef.get()

    serverLogger.info('Document fetch result', 'configuration', { 
      userId: userId,
      documentPath: `configurations/${userId}`,
      exists: configDoc.exists,
      hasData: !!configDoc.data()
    })

    if (!configDoc.exists) {
      serverLogger.info('No configuration found for user', 'configuration', { 
        userId: userId 
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
      userId: userId 
    })

    return validatedConfig
  }

  /**
   * Delete user configuration from Firestore
   * 
   * @param userId - The authenticated user's ID
   * @throws {Error} If delete fails
   */
  static async deleteUserConfiguration(userId: string): Promise<void> {
    serverLogger.info('Deleting user configuration', 'configuration', { 
      userId: userId 
    })

    // Get Firestore instance
    const db = getFirestoreInstance()
    
    // Delete configuration document
    const configRef = db.collection('configurations').doc(userId)
    await configRef.delete()

    serverLogger.info('Configuration deleted successfully', 'configuration', { 
      userId: userId 
    })
  }
}