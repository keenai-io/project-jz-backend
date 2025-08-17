/**
 * @fileoverview Tests for Enhanced Firestore Adapter
 * @module lib/__tests__/enhanced-firestore-adapter.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEnhancedFirestoreAdapter } from '../enhanced-firestore-adapter';
import type { Adapter, AdapterUser } from 'next-auth/adapters';

// Mock the dependencies
vi.mock('@auth/firebase-adapter', () => ({
  FirestoreAdapter: vi.fn(),
}));

vi.mock('../firebase-admin-singleton', () => ({
  getFirestoreAdminInstance: vi.fn(() => ({})),
}));

vi.mock('../logger.server', () => ({
  serverLogger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

import { FirestoreAdapter } from '@auth/firebase-adapter';
import { serverLogger } from '../logger.server';

const mockFirestoreAdapter = vi.mocked(FirestoreAdapter);

// Create mock functions
const mockCreateUser = vi.fn();
const mockGetUser = vi.fn();
const mockGetUserByEmail = vi.fn();

// Create a mock base adapter
const mockBaseAdapter: Partial<Adapter> = {
  createUser: mockCreateUser,
  getUser: mockGetUser,
  getUserByEmail: mockGetUserByEmail,
  getUserByAccount: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  linkAccount: vi.fn(),
  unlinkAccount: vi.fn(),
  createSession: vi.fn(),
  getSessionAndUser: vi.fn(),
  updateSession: vi.fn(),
  deleteSession: vi.fn(),
  createVerificationToken: vi.fn(),
  useVerificationToken: vi.fn(),
};

describe('Enhanced Firestore Adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFirestoreAdapter.mockReturnValue(mockBaseAdapter as Adapter);
  });

  describe('createUser override', () => {
    it('should create user with default role and enabled fields', async () => {
      const inputUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.png',
        emailVerified: new Date('2024-01-01')
      };

      const expectedUser = {
        ...inputUser,
        role: 'user',
        enabled: false,
        lastLogin: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      };

      mockCreateUser.mockResolvedValue(inputUser as AdapterUser);

      const adapter = createEnhancedFirestoreAdapter();
      
      await adapter.createUser!(inputUser as AdapterUser);

      expect(mockCreateUser).toHaveBeenCalledWith(expectedUser);
      expect(serverLogger.info).toHaveBeenCalledWith(
        'Creating user with enhanced fields',
        'auth',
        {
          userId: inputUser.id,
          email: inputUser.email
        }
      );
      expect(serverLogger.info).toHaveBeenCalledWith(
        'User created successfully with enhanced fields',
        'auth',
        {
          userId: inputUser.id,
          role: 'user',
          enabled: false
        }
      );
    });

    it('should handle errors during user creation', async () => {
      const inputUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const error = new Error('Database error');
      mockCreateUser.mockRejectedValue(error);

      const adapter = createEnhancedFirestoreAdapter();

      await expect(adapter.createUser!(inputUser as AdapterUser)).rejects.toThrow('Database error');
      
      expect(serverLogger.error).toHaveBeenCalledWith(
        'Failed to create user with enhanced fields',
        error,
        'auth',
        { userId: inputUser.id }
      );
    });

    it('should work when base adapter does not have createUser', () => {
      const adapterWithoutCreateUser = { ...mockBaseAdapter };
      delete adapterWithoutCreateUser.createUser;
      
      mockFirestoreAdapter.mockReturnValue(adapterWithoutCreateUser as Adapter);

      const adapter = createEnhancedFirestoreAdapter();
      
      expect(adapter.createUser).toBeUndefined();
    });
  });

  describe('getUser override', () => {
    it('should return user with default fields when missing', async () => {
      const userFromDb = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        // Missing role and enabled fields
      };

      const expectedUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        enabled: false
      };

      mockGetUser.mockResolvedValue(userFromDb as AdapterUser);

      const adapter = createEnhancedFirestoreAdapter();
      
      const result = await adapter.getUser!('user123');

      expect(result).toEqual(expectedUser);
    });

    it('should preserve existing role and enabled fields', async () => {
      const userFromDb = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        enabled: true,
      };

      mockGetUser.mockResolvedValue(userFromDb as any);

      const adapter = createEnhancedFirestoreAdapter();
      
      const result = await adapter.getUser!('user123');

      expect(result).toEqual(userFromDb);
    });

    it('should return null when user not found', async () => {
      mockGetUser.mockResolvedValue(null);

      const adapter = createEnhancedFirestoreAdapter();
      
      const result = await adapter.getUser!('nonexistent');

      expect(result).toBeNull();
    });

    it('should work when base adapter does not have getUser', () => {
      const adapterWithoutGetUser = { ...mockBaseAdapter };
      delete adapterWithoutGetUser.getUser;
      
      mockFirestoreAdapter.mockReturnValue(adapterWithoutGetUser as Adapter);

      const adapter = createEnhancedFirestoreAdapter();
      
      expect(adapter.getUser).toBeUndefined();
    });
  });

  describe('getUserByEmail override', () => {
    it('should return user with default fields when missing', async () => {
      const userFromDb = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const expectedUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        enabled: false
      };

      mockGetUserByEmail.mockResolvedValue(userFromDb as AdapterUser);

      const adapter = createEnhancedFirestoreAdapter();
      
      const result = await adapter.getUserByEmail!('test@example.com');

      expect(result).toEqual(expectedUser);
    });

    it('should handle enabled field being false explicitly', async () => {
      const userFromDb = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        enabled: false, // Explicitly set to false
      };

      mockGetUserByEmail.mockResolvedValue(userFromDb as any);

      const adapter = createEnhancedFirestoreAdapter();
      
      const result = await adapter.getUserByEmail!('test@example.com');

      expect(result).toEqual(userFromDb);
    });

    it('should return null when user not found', async () => {
      mockGetUserByEmail.mockResolvedValue(null);

      const adapter = createEnhancedFirestoreAdapter();
      
      const result = await adapter.getUserByEmail!('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should work when base adapter does not have getUserByEmail', () => {
      const adapterWithoutGetUserByEmail = { ...mockBaseAdapter };
      delete adapterWithoutGetUserByEmail.getUserByEmail;
      
      mockFirestoreAdapter.mockReturnValue(adapterWithoutGetUserByEmail as Adapter);

      const adapter = createEnhancedFirestoreAdapter();
      
      expect(adapter.getUserByEmail).toBeUndefined();
    });
  });

  describe('adapter initialization', () => {
    it('should call FirestoreAdapter with correct instance', () => {
      createEnhancedFirestoreAdapter();
      
      expect(mockFirestoreAdapter).toHaveBeenCalledWith({});
    });

    it('should return adapter with all base methods', () => {
      const adapter = createEnhancedFirestoreAdapter();
      
      // Verify that all base adapter methods are preserved
      expect(adapter.getUserByAccount).toBe(mockBaseAdapter.getUserByAccount);
      expect(adapter.updateUser).toBe(mockBaseAdapter.updateUser);
      expect(adapter.deleteUser).toBe(mockBaseAdapter.deleteUser);
      expect(adapter.linkAccount).toBe(mockBaseAdapter.linkAccount);
      expect(adapter.unlinkAccount).toBe(mockBaseAdapter.unlinkAccount);
      expect(adapter.createSession).toBe(mockBaseAdapter.createSession);
      expect(adapter.getSessionAndUser).toBe(mockBaseAdapter.getSessionAndUser);
      expect(adapter.updateSession).toBe(mockBaseAdapter.updateSession);
      expect(adapter.deleteSession).toBe(mockBaseAdapter.deleteSession);
      expect(adapter.createVerificationToken).toBe(mockBaseAdapter.createVerificationToken);
      expect(adapter.useVerificationToken).toBe(mockBaseAdapter.useVerificationToken);
    });
  });
});