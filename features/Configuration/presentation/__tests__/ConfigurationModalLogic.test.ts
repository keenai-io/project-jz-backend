/**
 * @fileoverview Tests for ConfigurationModal business logic
 * @module features/Configuration/presentation/__tests__/ConfigurationModalLogic.test
 */

import { describe, it, expect } from 'vitest';
import { 
  ConfigurationFormSchema,
  DEFAULT_BANNED_WORDS,
  type ConfigurationForm 
} from '../../domain/schemas/ConfigurationSchemas';

/**
 * Test suite for ConfigurationModal business logic.
 *
 * Tests validation rules and data transformation without UI dependencies.
 * Focuses on the core business rules and schema validation.
 */
describe('ConfigurationModal Business Logic', () => {
  /**
   * Tests configuration form validation with valid data
   */
  it('should validate valid configuration form data', () => {
    const validConfig: ConfigurationForm = {
      seo: {
        temperature: 75,
        useImages: true,
        bannedWords: ['word1', 'word2'],
      },
      image: {
        rotationDirection: 'clockwise',
        rotationDegrees: 90,
        flipImage: false,
        enableWatermark: true,
        watermarkImage: 'watermark.png',
      },
    };

    const result = ConfigurationFormSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
    
    if (result.success) {
      expect(result.data.seo.temperature).toBe(75);
      expect(result.data.image.rotationDegrees).toBe(90);
    }
  });

  /**
   * Tests validation with invalid temperature range
   */
  it('should reject configuration with invalid temperature', () => {
    const invalidConfig: ConfigurationForm = {
      seo: {
        temperature: 150, // Invalid: > 100
        useImages: true,
        bannedWords: [...DEFAULT_BANNED_WORDS],
      },
      image: {
        rotationDirection: 'clockwise',
        rotationDegrees: 90,
        flipImage: false,
        enableWatermark: false,
      },
    };

    const result = ConfigurationFormSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      expect(result.error.issues).toBeDefined();
      expect(result.error.issues.some(issue => 
        issue.path.includes('temperature')
      )).toBe(true);
    }
  });

  /**
   * Tests validation with invalid rotation degrees
   */
  it('should reject configuration with invalid rotation degrees', () => {
    const invalidConfig: ConfigurationForm = {
      seo: {
        temperature: 50,
        useImages: true,
        bannedWords: [...DEFAULT_BANNED_WORDS],
      },
      image: {
        rotationDirection: 'clockwise',
        rotationDegrees: 400, // Invalid: exceeds max of 360
        flipImage: false,
        enableWatermark: false,
      },
    };

    const result = ConfigurationFormSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      expect(result.error.issues).toBeDefined();
      expect(result.error.issues.some(issue => 
        issue.path.includes('rotationDegrees')
      )).toBe(true);
    }
  });


  /**
   * Tests default banned words are provided
   */
  it('should have default banned words available', () => {
    expect(DEFAULT_BANNED_WORDS).toBeDefined();
    expect(Array.isArray(DEFAULT_BANNED_WORDS)).toBe(true);
    expect(DEFAULT_BANNED_WORDS.length).toBeGreaterThan(0);
    
    // Check that common banned words are included
    expect(DEFAULT_BANNED_WORDS.includes('cheap')).toBe(true);
    expect(DEFAULT_BANNED_WORDS.includes('fake')).toBe(true);
  });

  /**
   * Tests configuration with minimal valid data
   */
  it('should accept configuration with minimal valid data', () => {
    const minimalConfig: ConfigurationForm = {
      seo: {
        temperature: 0,
        useImages: false,
        bannedWords: [],
      },
      image: {
        rotationDirection: 'clockwise',
        rotationDegrees: 0,
        flipImage: false,
        enableWatermark: false,
      },
    };

    const result = ConfigurationFormSchema.safeParse(minimalConfig);
    expect(result.success).toBe(true);
  });

  /**
   * Tests configuration with maximum valid values
   */
  it('should accept configuration with maximum valid values', () => {
    const maximalConfig: ConfigurationForm = {
      seo: {
        temperature: 100,
        useImages: true,
        bannedWords: ['word1', 'word2', 'word3', 'word4', 'word5'],
      },
      image: {
        rotationDirection: 'counter-clockwise',
        rotationDegrees: 270,
        flipImage: true,
        enableWatermark: true,
        watermarkImage: 'very-long-watermark-filename-with-special-chars-123.png',
      },
    };

    const result = ConfigurationFormSchema.safeParse(maximalConfig);
    expect(result.success).toBe(true);
    
    if (result.success) {
      expect(result.data.seo.temperature).toBe(100);
      expect(result.data.image.rotationDegrees).toBe(270);
      expect(result.data.image.rotationDirection).toBe('counter-clockwise');
    }
  });
});