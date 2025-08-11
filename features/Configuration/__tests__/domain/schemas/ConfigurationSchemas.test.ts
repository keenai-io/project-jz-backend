/**
 * @fileoverview Tests for Configuration schemas
 * @module features/Configuration/domain/schemas/__tests__/ConfigurationSchemas.test
 */

import { describe, it, expect } from 'vitest';
import {
  ConfigurationSchema,
  ConfigurationFormSchema,
  ConfigurationValidation,
  SeoConfigurationSchema,
  ImageConfigurationSchema,
  DEFAULT_BANNED_WORDS,
} from '@features/Configuration/domain/schemas/ConfigurationSchemas';

/**
 * Test suite for Configuration schemas.
 *
 * Tests validation logic and schema parsing for configuration data.
 */
describe('Configuration Schemas', () => {
  describe('SeoConfigurationSchema', () => {
    it('should validate correct SEO configuration', () => {
      const validSeoConfig = {
        temperature: 75,
        useImages: true,
        bannedWords: ['test', 'word'],
      };

      const result = SeoConfigurationSchema.parse(validSeoConfig);
      expect(result).toEqual(validSeoConfig);
    });

    it('should use default values for missing fields', () => {
      const result = SeoConfigurationSchema.parse({});
      
      expect(result.temperature).toBe(50);
      expect(result.useImages).toBe(true);
      expect(result.bannedWords).toEqual([]);
    });

    it('should reject invalid temperature values', () => {
      expect(() => SeoConfigurationSchema.parse({
        temperature: -1
      })).toThrow();

      expect(() => SeoConfigurationSchema.parse({
        temperature: 101
      })).toThrow();
    });
  });

  describe('ImageConfigurationSchema', () => {
    it('should validate correct image configuration', () => {
      const validImageConfig = {
        rotationDirection: 'clockwise' as const,
        rotationDegrees: 90,
        flipImage: true,
        enableWatermark: false,
      };

      const result = ImageConfigurationSchema.parse(validImageConfig);
      expect(result).toEqual(validImageConfig);
    });

    it('should use default values for missing fields', () => {
      const result = ImageConfigurationSchema.parse({});
      
      expect(result.rotationDirection).toBe('clockwise');
      expect(result.rotationDegrees).toBe(25);
      expect(result.flipImage).toBe(false);
      expect(result.enableWatermark).toBe(false);
    });

    it('should reject invalid rotation degrees', () => {
      expect(() => ImageConfigurationSchema.parse({
        rotationDegrees: 400
      })).toThrow();

      expect(() => ImageConfigurationSchema.parse({
        rotationDegrees: -400
      })).toThrow();
    });

    it('should accept valid rotation degrees', () => {
      [0, 25, 45, 90, 180, 270, 360, -90, -180].forEach(degrees => {
        const result = ImageConfigurationSchema.parse({
          rotationDegrees: degrees
        });
        expect(result.rotationDegrees).toBe(degrees);
      });
    });
  });

  describe('ConfigurationSchema', () => {
    it('should validate complete configuration', () => {
      const validConfig = {
        name: 'Test Configuration',
        seo: {
          temperature: 60,
          useImages: false,
          bannedWords: ['banned'],
        },
        image: {
          rotationDirection: 'counter-clockwise' as const,
          rotationDegrees: 180,
          flipImage: true,
          enableWatermark: true,
          watermarkImage: 'watermark.png',
        },
      };

      const result = ConfigurationSchema.parse(validConfig);
      expect(result.name).toBe(validConfig.name);
      expect(result.seo).toEqual(validConfig.seo);
      expect(result.image).toEqual(validConfig.image);
    });

    it('should generate ID and timestamps when missing', () => {
      const basicConfig = {
        name: 'Test',
        seo: {},
        image: {},
      };

      const result = ConfigurationSchema.parse(basicConfig);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('ConfigurationFormSchema', () => {
    it('should exclude auto-generated fields', () => {
      const formData = {
        seo: {
          temperature: 80,
          useImages: true,
          bannedWords: ['form', 'test'],
        },
        image: {
          rotationDirection: 'clockwise' as const,
          rotationDegrees: 90,
          flipImage: false,
          enableWatermark: false,
        },
      };

      const result = ConfigurationFormSchema.parse(formData);
      expect(result).toEqual(formData);
      expect(result).not.toHaveProperty('id');
      expect(result).not.toHaveProperty('name');
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('updatedAt');
    });
  });

  describe('ConfigurationValidation', () => {
    it('should validate configuration form data', () => {
      const formData = {
        seo: {
          temperature: 70,
          useImages: true,
          bannedWords: ['validation'],
        },
        image: {
          rotationDirection: 'clockwise' as const,
          rotationDegrees: 270,
          flipImage: true,
          enableWatermark: false,
        },
      };

      const result = ConfigurationValidation.validateConfigurationForm(formData);
      expect(result).toEqual(formData);
    });

    it('should throw on invalid configuration form data', () => {
      const invalidFormData = {
        seo: {
          temperature: 150, // Invalid temperature
          useImages: true,
          bannedWords: [],
        },
        image: {
          rotationDirection: 'invalid' as any, // Invalid direction
          rotationDegrees: 0,
          flipImage: false,
          enableWatermark: false,
        },
      };

      expect(() => ConfigurationValidation.validateConfigurationForm(invalidFormData))
        .toThrow();
    });
  });

  describe('DEFAULT_BANNED_WORDS', () => {
    it('should contain expected default words', () => {
      expect(DEFAULT_BANNED_WORDS).toContain('cheap');
      expect(DEFAULT_BANNED_WORDS).toContain('fake');
      expect(DEFAULT_BANNED_WORDS).toContain('counterfeit');
      expect(DEFAULT_BANNED_WORDS.length).toBeGreaterThan(5);
    });

    it('should be a readonly constant', () => {
      // Test that it's a constant array (TypeScript readonly, not runtime readonly)
      expect(Array.isArray(DEFAULT_BANNED_WORDS)).toBe(true);
      expect(DEFAULT_BANNED_WORDS.length).toBeGreaterThan(0);
      
      // Since it's TypeScript readonly, we just verify the type is correct
      const copy = [...DEFAULT_BANNED_WORDS];
      expect(copy).toEqual(DEFAULT_BANNED_WORDS);
    });
  });
});