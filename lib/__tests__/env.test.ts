/**
 * @fileoverview Tests for environment validation
 * @module lib/__tests__/env.test
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Create a reusable schema for testing (same as in env.ts)
const createEnvSchema = () => z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  AUTH_SECRET: z.string().min(1),
  AUTH_GOOGLE_ID: z.string().min(1),
  AUTH_GOOGLE_SECRET: z.string().min(1),
  
  // Firebase Admin Configuration (Environment Variables Only)
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  FIRESTORE_DATABASE_ID: z.string().min(1).optional(), // Optional: specify database ID
});

/**
 * Test suite for environment variable validation.
 * 
 * Tests various environment configurations to ensure proper validation
 * and error handling for different deployment scenarios.
 */
describe('Environment Validation', () => {
  /**
   * Tests valid environment with individual Firebase variables.
   */
  it('should validate environment with individual Firebase variables', () => {
    const testEnv = {
      NODE_ENV: 'development' as const,
      AUTH_SECRET: 'test-secret-key-at-least-32-chars',
      AUTH_GOOGLE_ID: 'test-google-id',
      AUTH_GOOGLE_SECRET: 'test-google-secret',
      FIREBASE_PROJECT_ID: 'test-project',
      FIREBASE_CLIENT_EMAIL: 'test@example.com',
      FIREBASE_PRIVATE_KEY: 'test-private-key',
    };

    const result = createEnvSchema().parse(testEnv);

    expect(result.NODE_ENV).toBe('development');
    expect(result.AUTH_SECRET).toBe('test-secret-key-at-least-32-chars');
    expect(result.FIREBASE_PROJECT_ID).toBe('test-project');
    expect(result.FIREBASE_CLIENT_EMAIL).toBe('test@example.com');
  });


  /**
   * Tests invalid NODE_ENV value.
   */
  it('should reject invalid NODE_ENV', () => {
    const testEnv = {
      NODE_ENV: 'invalid',
      AUTH_SECRET: 'test-secret-key-at-least-32-chars',
      AUTH_GOOGLE_ID: 'test-google-id',
      AUTH_GOOGLE_SECRET: 'test-google-secret',
      FIREBASE_PROJECT_ID: 'test-project',
      FIREBASE_CLIENT_EMAIL: 'test@example.com',
      FIREBASE_PRIVATE_KEY: 'test-private-key',
    };

    expect(() => createEnvSchema().parse(testEnv)).toThrow();
  });

  /**
   * Tests missing required AUTH variables.
   */
  it('should reject missing AUTH_SECRET', () => {
    const testEnv = {
      NODE_ENV: 'development' as const,
      AUTH_GOOGLE_ID: 'test-google-id',
      AUTH_GOOGLE_SECRET: 'test-google-secret',
      FIREBASE_PROJECT_ID: 'test-project',
      FIREBASE_CLIENT_EMAIL: 'test@example.com',
      FIREBASE_PRIVATE_KEY: 'test-private-key',
    };

    expect(() => createEnvSchema().parse(testEnv)).toThrow();
  });

  /**
   * Tests missing Google OAuth variables.
   */
  it('should reject missing Google OAuth credentials', () => {
    const testEnv = {
      NODE_ENV: 'development' as const,
      AUTH_SECRET: 'test-secret-key-at-least-32-chars',
      FIREBASE_PROJECT_ID: 'test-project',
      FIREBASE_CLIENT_EMAIL: 'test@example.com',
      FIREBASE_PRIVATE_KEY: 'test-private-key',
    };

    expect(() => createEnvSchema().parse(testEnv)).toThrow();
  });

  /**
   * Tests invalid Firebase email format.
   */
  it('should reject invalid Firebase email format', () => {
    const testEnv = {
      NODE_ENV: 'development' as const,
      AUTH_SECRET: 'test-secret-key-at-least-32-chars',
      AUTH_GOOGLE_ID: 'test-google-id',
      AUTH_GOOGLE_SECRET: 'test-google-secret',
      FIREBASE_PROJECT_ID: 'test-project',
      FIREBASE_CLIENT_EMAIL: 'invalid-email',
      FIREBASE_PRIVATE_KEY: 'test-private-key',
    };

    expect(() => createEnvSchema().parse(testEnv)).toThrow();
  });

  /**
   * Tests missing Firebase configuration.
   */
  it('should reject when Firebase variables not provided', () => {
    const testEnv = {
      NODE_ENV: 'development' as const,
      AUTH_SECRET: 'test-secret-key-at-least-32-chars',
      AUTH_GOOGLE_ID: 'test-google-id',
      AUTH_GOOGLE_SECRET: 'test-google-secret',
    };

    expect(() => createEnvSchema().parse(testEnv)).toThrow();
  });

  /**
   * Tests partial Firebase configuration.
   */
  it('should reject partial Firebase configuration', () => {
    const testEnv = {
      NODE_ENV: 'development' as const,
      AUTH_SECRET: 'test-secret-key-at-least-32-chars',
      AUTH_GOOGLE_ID: 'test-google-id',
      AUTH_GOOGLE_SECRET: 'test-google-secret',
      FIREBASE_PROJECT_ID: 'test-project',
      // Missing FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY
    };

    expect(() => createEnvSchema().parse(testEnv)).toThrow();
  });

  /**
   * Tests empty string values.
   */
  it('should reject empty string values', () => {
    const testEnv = {
      NODE_ENV: 'development' as const,
      AUTH_SECRET: '',
      AUTH_GOOGLE_ID: 'test-google-id',
      AUTH_GOOGLE_SECRET: 'test-google-secret',
      FIREBASE_PROJECT_ID: 'test-project',
      FIREBASE_CLIENT_EMAIL: 'test@example.com',
      FIREBASE_PRIVATE_KEY: 'test-private-key',
    };

    expect(() => createEnvSchema().parse(testEnv)).toThrow();
  });

  /**
   * Tests optional FIRESTORE_DATABASE_ID.
   */
  it('should accept optional FIRESTORE_DATABASE_ID', () => {
    const testEnv = {
      NODE_ENV: 'development' as const,
      AUTH_SECRET: 'test-secret-key-at-least-32-chars',
      AUTH_GOOGLE_ID: 'test-google-id',
      AUTH_GOOGLE_SECRET: 'test-google-secret',
      FIREBASE_PROJECT_ID: 'test-project',
      FIREBASE_CLIENT_EMAIL: 'test@example.com',
      FIREBASE_PRIVATE_KEY: 'test-private-key',
      FIRESTORE_DATABASE_ID: 'custom-database',
    };

    const result = createEnvSchema().parse(testEnv);

    expect(result.FIRESTORE_DATABASE_ID).toBe('custom-database');
  });

  /**
   * Tests all NODE_ENV values.
   */
  it('should accept all valid NODE_ENV values', () => {
    const validEnvironments: Array<'development' | 'test' | 'production'> = ['development', 'test', 'production'];

    for (const nodeEnv of validEnvironments) {
      const testEnv = {
        NODE_ENV: nodeEnv,
        AUTH_SECRET: 'test-secret-key-at-least-32-chars',
        AUTH_GOOGLE_ID: 'test-google-id',
        AUTH_GOOGLE_SECRET: 'test-google-secret',
        FIREBASE_PROJECT_ID: 'test-project',
        FIREBASE_CLIENT_EMAIL: 'test@example.com',
        FIREBASE_PRIVATE_KEY: 'test-private-key',
      };

      const result = createEnvSchema().parse(testEnv);
      expect(result.NODE_ENV).toBe(nodeEnv);
    }
  });
});