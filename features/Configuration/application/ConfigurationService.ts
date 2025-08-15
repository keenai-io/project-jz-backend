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
   * @param userEmail - The authenticated user's email
   * @param configData - The configuration form data to save
   * @throws {Error} If validation or save fails
   */
  static async saveUserConfiguration(
    userEmail: string, 
    configData: ConfigurationForm
  ): Promise<void> {
    serverLogger.info('Saving user configuration', 'configuration', { 
      userId: userEmail,
      configKeys: Object.keys(configData) 
    })

    // Validate configuration data with Zod
    const validatedConfig = ConfigurationValidation.validateConfigurationForm(configData)

    // Get Firestore instance
    const db = getFirestoreInstance()
    
    // Save to Firestore with user email as document ID
    const configRef = db.collection('configurations').doc(userEmail)
    
    const configDocument = {
      ...validatedConfig,
      userId: userEmail,
      updatedAt: new Date(),
      createdAt: new Date() // Will be overwritten if document exists
    }

    // Use merge: true to update existing document or create new one
    await configRef.set(configDocument, { merge: true })

    serverLogger.info('Configuration saved successfully', 'configuration', { 
      userId: userEmail,
      documentPath: `configurations/${userEmail}`,
      dataKeys: Object.keys(configDocument)
    })
  }

  /**
   * Get user configuration from Firestore
   * 
   * @param userEmail - The authenticated user's email
   * @returns {Promise<ConfigurationForm | null>} The user's configuration or null
   * @throws {Error} If fetch fails
   */
  static async getUserConfiguration(userEmail: string): Promise<ConfigurationForm | null> {
    serverLogger.info('Fetching user configuration', 'configuration', { 
      userId: userEmail 
    })

    // Get Firestore instance
    const db = getFirestoreInstance()
    
    // Get configuration document
    const configRef = db.collection('configurations').doc(userEmail)
    const configDoc = await configRef.get()

    serverLogger.info('Document fetch result', 'configuration', { 
      userId: userEmail,
      documentPath: `configurations/${userEmail}`,
      exists: configDoc.exists,
      hasData: !!configDoc.data()
    })

    if (!configDoc.exists) {
      serverLogger.info('No configuration found for user', 'configuration', { 
        userId: userEmail 
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
      userId: userEmail 
    })

    return validatedConfig
  }

  /**
   * Delete user configuration from Firestore
   * 
   * @param userEmail - The authenticated user's email
   * @throws {Error} If delete fails
   */
  static async deleteUserConfiguration(userEmail: string): Promise<void> {
    serverLogger.info('Deleting user configuration', 'configuration', { 
      userId: userEmail 
    })

    // Get Firestore instance
    const db = getFirestoreInstance()
    
    // Delete configuration document
    const configRef = db.collection('configurations').doc(userEmail)
    await configRef.delete()

    serverLogger.info('Configuration deleted successfully', 'configuration', { 
      userId: userEmail 
    })
  }
}