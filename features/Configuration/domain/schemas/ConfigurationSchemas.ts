import { z } from 'zod';

/**
 * Branded type for configuration IDs to ensure type safety
 */
export const ConfigurationIdSchema = z.string().uuid().brand<'ConfigurationId'>();
export type ConfigurationId = z.infer<typeof ConfigurationIdSchema>;

/**
 * SEO Configuration Schema
 * Defines the structure for SEO-related settings
 */
export const SeoConfigurationSchema = z.object({
  /** Temperature setting from 0 to 10 (whole numbers only) */
  temperature: z.number().int().min(0).max(10).default(5),
  
  /** Whether to use images in SEO optimization */
  useImages: z.boolean().default(true),
  
  /** List of words to be banned from product names */
  bannedWords: z.array(z.string().min(1)).default([]),
});

export type SeoConfiguration = z.infer<typeof SeoConfigurationSchema>;

/**
 * Image Rotation Enum
 */
export const ImageRotationDirectionSchema = z.enum(['clockwise', 'counter-clockwise']);
export type ImageRotationDirection = z.infer<typeof ImageRotationDirectionSchema>;

/**
 * Image Configuration Schema
 * Defines the structure for image processing settings
 */
export const ImageConfigurationSchema = z.object({
  /** Rotation direction */
  rotationDirection: ImageRotationDirectionSchema.default('clockwise'),
  
  /** Rotation degrees (any number, default 25) */
  rotationDegrees: z.number().min(-360).max(360).default(25),
  
  /** Whether to flip the image */
  flipImage: z.boolean().default(false),
  
  /** Whether to add watermark */
  enableWatermark: z.boolean().default(false),
  
  /** Watermark image file (optional) */
  watermarkImage: z.string().optional(),
});

export type ImageConfiguration = z.infer<typeof ImageConfigurationSchema>;

/**
 * Complete Configuration Schema
 * Combines all configuration sections
 */
export const ConfigurationSchema = z.object({
  /** Unique identifier for the configuration */
  id: ConfigurationIdSchema.optional(),
  
  /** Configuration name/title */
  name: z.string().min(1).max(100).default('Default Configuration'),
  
  /** SEO-related settings */
  seo: SeoConfigurationSchema,
  
  /** Image processing settings */
  image: ImageConfigurationSchema,
  
  /** Creation timestamp */
  createdAt: z.date().default(() => new Date()),
  
  /** Last update timestamp */
  updatedAt: z.date().default(() => new Date()),
});

export type Configuration = z.infer<typeof ConfigurationSchema>;

/**
 * Configuration Form Schema
 * Used for form validation (excludes auto-generated fields and name)
 */
export const ConfigurationFormSchema = ConfigurationSchema.omit({
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
});

export type ConfigurationForm = z.infer<typeof ConfigurationFormSchema>;

/**
 * Default banned words list
 * Standard list of words that should be filtered from product names
 */
export const DEFAULT_BANNED_WORDS = [
  'cheap',
  'fake',
  'imitation',
  'knockoff',
  'replica',
  'counterfeit',
  'used',
  'damaged',
  'broken',
  'defective',
] as const;

/**
 * Configuration validation utilities
 */
export const ConfigurationValidation = {
  /**
   * Validates a complete configuration object
   */
  validateConfiguration: (data: unknown): Configuration => {
    return ConfigurationSchema.parse(data);
  },
  
  /**
   * Validates form data for configuration
   */
  validateConfigurationForm: (data: unknown): ConfigurationForm => {
    return ConfigurationFormSchema.parse(data);
  },
  
  /**
   * Validates SEO configuration
   */
  validateSeoConfiguration: (data: unknown): SeoConfiguration => {
    return SeoConfigurationSchema.parse(data);
  },
  
  /**
   * Validates image configuration
   */
  validateImageConfiguration: (data: unknown): ImageConfiguration => {
    return ImageConfigurationSchema.parse(data);
  },
};