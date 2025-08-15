/**
 * @fileoverview Tests for ConfigurationService
 * @module features/Configuration/__tests__/application/ConfigurationService.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigurationService } from '../../application/ConfigurationService';
import { ConfigurationForm } from '../../domain/schemas/ConfigurationSchemas';
import { ZodError } from 'zod';

// Mock dependencies
vi.mock('@lib/firestore', () => ({
  getFirestoreInstance: vi.fn()
}));

vi.mock('@lib/logger.server', () => ({
  serverLogger: {
    info: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('../../domain/schemas/ConfigurationSchemas', () => ({
  ConfigurationValidation: {
    validateConfigurationForm: vi.fn()
  }
}));

/**
 * Test suite for ConfigurationService class.
 * 
 * Tests CRUD operations, validation, error handling, and Firestore integration.
 * Mocks external dependencies to ensure isolated unit tests.
 */
describe('ConfigurationService', () => {
  const mockDb = {
    collection: vi.fn().mockReturnThis(),
    doc: vi.fn().mockReturnThis(),
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn()
  };

  const mockConfigRef = {
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn()
  };

  const validConfigData: ConfigurationForm = {
    apiEndpoint: 'https://api.example.com',
    maxRetries: 3,
    timeout: 5000,
    enableLogging: true,
    categories: ['electronics', 'clothing'],
    defaultCategory: 'general'
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Setup Firestore mock chain
    mockDb.collection.mockReturnValue(mockDb);
    mockDb.doc.mockReturnValue(mockConfigRef);
    
    const { getFirestoreInstance } = vi.mocked(await import('@lib/firestore'));
    getFirestoreInstance.mockReturnValue(mockDb as any);
  });

  describe('saveUserConfiguration', () => {
    /**
     * Tests successful configuration save operation.
     */
    it('should save valid configuration successfully', async () => {
      const { ConfigurationValidation } = vi.mocked(await import('../../domain/schemas/ConfigurationSchemas'));
      ConfigurationValidation.validateConfigurationForm.mockReturnValue(validConfigData);
      
      mockConfigRef.set.mockResolvedValue(undefined);

      await ConfigurationService.saveUserConfiguration('user@example.com', validConfigData);

      expect(ConfigurationValidation.validateConfigurationForm).toHaveBeenCalledWith(validConfigData);
      expect(mockDb.collection).toHaveBeenCalledWith('configurations');
      expect(mockDb.doc).toHaveBeenCalledWith('user@example.com');
      expect(mockConfigRef.set).toHaveBeenCalledWith(
        expect.objectContaining({
          ...validConfigData,
          userId: 'user@example.com',
          updatedAt: expect.any(Date),
          createdAt: expect.any(Date)
        }),
        { merge: true }
      );
    });

    /**
     * Tests validation error handling during save.
     */
    it('should throw error when validation fails', async () => {
      const { ConfigurationValidation } = vi.mocked(await import('../../domain/schemas/ConfigurationSchemas'));
      const validationError = new ZodError([]);
      ConfigurationValidation.validateConfigurationForm.mockImplementation(() => {
        throw validationError;
      });

      await expect(
        ConfigurationService.saveUserConfiguration('user@example.com', validConfigData)
      ).rejects.toThrow();

      expect(mockConfigRef.set).not.toHaveBeenCalled();
    });

    /**
     * Tests Firestore error handling during save.
     */
    it('should throw error when Firestore save fails', async () => {
      const { ConfigurationValidation } = vi.mocked(await import('../../domain/schemas/ConfigurationSchemas'));
      ConfigurationValidation.validateConfigurationForm.mockReturnValue(validConfigData);
      
      const firestoreError = new Error('Firestore write failed');
      mockConfigRef.set.mockRejectedValue(firestoreError);

      await expect(
        ConfigurationService.saveUserConfiguration('user@example.com', validConfigData)
      ).rejects.toThrow('Firestore write failed');
    });

    /**
     * Tests logging during successful save.
     */
    it('should log save operation correctly', async () => {
      const { ConfigurationValidation } = vi.mocked(await import('../../domain/schemas/ConfigurationSchemas'));
      const { serverLogger } = vi.mocked(await import('@lib/logger.server'));
      
      ConfigurationValidation.validateConfigurationForm.mockReturnValue(validConfigData);
      mockConfigRef.set.mockResolvedValue(undefined);

      await ConfigurationService.saveUserConfiguration('user@example.com', validConfigData);

      expect(serverLogger.info).toHaveBeenCalledWith(
        'Saving user configuration',
        'configuration',
        { userId: 'user@example.com', configKeys: Object.keys(validConfigData) }
      );
      expect(serverLogger.info).toHaveBeenCalledWith(
        'Configuration saved successfully',
        'configuration',
        expect.objectContaining({
          userId: 'user@example.com',
          documentPath: 'configurations/user@example.com',
          dataKeys: expect.any(Array)
        })
      );
    });
  });

  describe('getUserConfiguration', () => {
    /**
     * Tests successful configuration retrieval.
     */
    it('should retrieve existing configuration successfully', async () => {
      const { ConfigurationValidation } = vi.mocked(await import('../../domain/schemas/ConfigurationSchemas'));
      
      const firestoreData = {
        ...validConfigData,
        userId: 'user@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockDocSnapshot = {
        exists: true,
        data: () => firestoreData
      };

      mockConfigRef.get.mockResolvedValue(mockDocSnapshot);
      ConfigurationValidation.validateConfigurationForm.mockReturnValue(validConfigData);

      const result = await ConfigurationService.getUserConfiguration('user@example.com');

      expect(result).toEqual(validConfigData);
      expect(mockDb.collection).toHaveBeenCalledWith('configurations');
      expect(mockDb.doc).toHaveBeenCalledWith('user@example.com');
      expect(ConfigurationValidation.validateConfigurationForm).toHaveBeenCalledWith(validConfigData);
    });

    /**
     * Tests handling of non-existent configuration.
     */
    it('should return null when configuration does not exist', async () => {
      const mockDocSnapshot = {
        exists: false,
        data: () => null
      };

      mockConfigRef.get.mockResolvedValue(mockDocSnapshot);

      const result = await ConfigurationService.getUserConfiguration('user@example.com');

      expect(result).toBeNull();
    });

    /**
     * Tests handling of empty document data.
     */
    it('should return null when document data is empty', async () => {
      const mockDocSnapshot = {
        exists: true,
        data: () => null
      };

      mockConfigRef.get.mockResolvedValue(mockDocSnapshot);

      const result = await ConfigurationService.getUserConfiguration('user@example.com');

      expect(result).toBeNull();
    });

    /**
     * Tests validation error handling during retrieval.
     */
    it('should throw error when retrieved data validation fails', async () => {
      const { ConfigurationValidation } = vi.mocked(await import('../../domain/schemas/ConfigurationSchemas'));
      
      const invalidData = { invalid: 'data' };
      const mockDocSnapshot = {
        exists: true,
        data: () => invalidData
      };

      mockConfigRef.get.mockResolvedValue(mockDocSnapshot);
      
      const validationError = new ZodError([]);
      ConfigurationValidation.validateConfigurationForm.mockImplementation(() => {
        throw validationError;
      });

      await expect(
        ConfigurationService.getUserConfiguration('user@example.com')
      ).rejects.toThrow();
    });

    /**
     * Tests Firestore error handling during retrieval.
     */
    it('should throw error when Firestore get fails', async () => {
      const firestoreError = new Error('Firestore read failed');
      mockConfigRef.get.mockRejectedValue(firestoreError);

      await expect(
        ConfigurationService.getUserConfiguration('user@example.com')
      ).rejects.toThrow('Firestore read failed');
    });

    /**
     * Tests logging during successful retrieval.
     */
    it('should log retrieval operation correctly', async () => {
      const { ConfigurationValidation } = vi.mocked(await import('../../domain/schemas/ConfigurationSchemas'));
      const { serverLogger } = vi.mocked(await import('@lib/logger.server'));
      
      const mockDocSnapshot = {
        exists: true,
        data: () => validConfigData
      };

      mockConfigRef.get.mockResolvedValue(mockDocSnapshot);
      ConfigurationValidation.validateConfigurationForm.mockReturnValue(validConfigData);

      await ConfigurationService.getUserConfiguration('user@example.com');

      expect(serverLogger.info).toHaveBeenCalledWith(
        'Fetching user configuration',
        'configuration',
        { userId: 'user@example.com' }
      );
      expect(serverLogger.info).toHaveBeenCalledWith(
        'Configuration fetched successfully',
        'configuration',
        { userId: 'user@example.com' }
      );
    });
  });

  describe('deleteUserConfiguration', () => {
    /**
     * Tests successful configuration deletion.
     */
    it('should delete configuration successfully', async () => {
      mockConfigRef.delete.mockResolvedValue(undefined);

      await ConfigurationService.deleteUserConfiguration('user@example.com');

      expect(mockDb.collection).toHaveBeenCalledWith('configurations');
      expect(mockDb.doc).toHaveBeenCalledWith('user@example.com');
      expect(mockConfigRef.delete).toHaveBeenCalled();
    });

    /**
     * Tests Firestore error handling during deletion.
     */
    it('should throw error when Firestore delete fails', async () => {
      const firestoreError = new Error('Firestore delete failed');
      mockConfigRef.delete.mockRejectedValue(firestoreError);

      await expect(
        ConfigurationService.deleteUserConfiguration('user@example.com')
      ).rejects.toThrow('Firestore delete failed');
    });

    /**
     * Tests logging during successful deletion.
     */
    it('should log deletion operation correctly', async () => {
      const { serverLogger } = vi.mocked(await import('@lib/logger.server'));
      
      mockConfigRef.delete.mockResolvedValue(undefined);

      await ConfigurationService.deleteUserConfiguration('user@example.com');

      expect(serverLogger.info).toHaveBeenCalledWith(
        'Deleting user configuration',
        'configuration',
        { userId: 'user@example.com' }
      );
      expect(serverLogger.info).toHaveBeenCalledWith(
        'Configuration deleted successfully',
        'configuration',
        { userId: 'user@example.com' }
      );
    });
  });
});