/**
 * @fileoverview Tests for submitProductCategorization server action
 * @module features/SpeedgoOptimizer/__tests__/application/submitProductCategorization.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitProductCategorization } from '../../application/submitProductCategorization';
import type { CategoryRequestItem } from '../../domain/schemas/CategoryRequest';
import { CategoryRequestSchema } from '../../domain/schemas/CategoryRequest';

// Mock the server logger
vi.mock('@/lib/logger.server', () => ({
  default: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    apiRequest: vi.fn(),
    apiError: vi.fn(),
    categorization: vi.fn(),
  },
}));

// Mock zod-error-formatter
vi.mock('@/lib/zod-error-formatter', () => ({
  formatError: vi.fn((error, message) => `${message}: ${error.message}`),
  createValidationErrorMessage: vi.fn((message, error) => `Validation error: ${message}`),
  formatFastApiError: vi.fn((detail) => `FastAPI error: ${JSON.stringify(detail)}`),
}));

// Mock the CategoryRequest schema to bypass URL validation issues in test environment
vi.mock('../../domain/schemas/CategoryRequest', async () => {
  const { z } = await import('zod');
  
  const CategoryInputDataSchema = z.object({
    product_number: z.number(),
    product_name: z.string(),
    hashtags: z.array(z.string()).default([]),
    keywords: z.array(z.string()),
    main_image_link: z.string(), // Use string instead of url() to avoid URL polyfill issues
    sales_status: z.string(),
    manufacturer: z.string().default(''),
    model_name: z.string().default(''),
    edit_details: z.string().default('')
  });

  const CategoryRequestItemSchema = z.object({
    language: z.string().default('en'),
    semantic_top_k: z.number().int().min(1).max(50).default(15),
    first_category_via_llm: z.boolean().default(false),
    descriptive_title_via_llm: z.boolean().default(true),
    round_out_keywords_via_llm: z.boolean().default(true),
    broad_keyword_matching: z.boolean().default(true),
    input_data: CategoryInputDataSchema
  });

  const CategoryRequestSchema = z.array(CategoryRequestItemSchema);
  
  return {
    CategoryRequestSchema,
    CategoryRequestItemSchema,
    CategoryInputDataSchema
  };
});

// Use the global fetch mock from setup-globals
const mockFetch = global.fetch as ReturnType<typeof vi.fn>;

/**
 * Test suite for submitProductCategorization server action.
 * 
 * Tests product categorization API integration, validation, and error handling.
 * Mocks external dependencies for isolated testing.
 */
describe('submitProductCategorization', () => {
  
  const mockProducts: CategoryRequestItem[] = [
    {
      language: 'en',
      semantic_top_k: 15,
      first_category_via_llm: false,
      descriptive_title_via_llm: true,
      round_out_keywords_via_llm: true,
      broad_keyword_matching: true,
      input_data: {
        product_number: 1,
        product_name: 'Test Product 1',
        hashtags: ['test', 'product'],
        keywords: ['electronics', 'device'],
        main_image_link: 'https://example.com/image1.jpg',
        sales_status: 'On Sale',
        manufacturer: 'Test Brand',
        model_name: 'Model 1',
        edit_details: 'Test description 1'
      }
    },
    {
      language: 'en',
      semantic_top_k: 15,
      first_category_via_llm: false,
      descriptive_title_via_llm: true,
      round_out_keywords_via_llm: true,
      broad_keyword_matching: true,
      input_data: {
        product_number: 2,
        product_name: 'Test Product 2',
        hashtags: ['test', 'product'],
        keywords: ['electronics', 'gadget'],
        main_image_link: 'https://example.com/image2.jpg',
        sales_status: 'Available',
        manufacturer: 'Test Brand',
        model_name: 'Model 2',
        edit_details: 'Test description 2'
      }
    },
  ];

  const mockSuccessResponse = [
    {
      product_number: 1,
      original_product_name: 'Test Product 1',
      original_keywords: ['electronics', 'device'],
      original_main_image_link: 'https://example.com/image1.jpg',
      hashtags: ['test', 'product'],
      sales_status: 'On Sale',
      matched_categories: ['Electronics', 'Devices'],
      product_name: 'Enhanced Test Product 1',
      keywords: ['electronics', 'device', 'technology'],
      main_image_link: 'https://example.com/image1.jpg',
      category_number: 'ELEC001',
      brand: 'Test Brand',
      manufacturer: 'Test Brand',
      model_name: 'Model 1',
      detailed_description_editing: 'Enhanced description 1'
    },
    {
      product_number: 2,
      original_product_name: 'Test Product 2',
      original_keywords: ['electronics', 'gadget'],
      original_main_image_link: 'https://example.com/image2.jpg',
      hashtags: ['test', 'product'],
      sales_status: 'Available',
      matched_categories: ['Electronics', 'Gadgets'],
      product_name: 'Enhanced Test Product 2',
      keywords: ['electronics', 'gadget', 'tech'],
      main_image_link: 'https://example.com/image2.jpg',
      category_number: 'ELEC002',
      brand: 'Test Brand',
      manufacturer: 'Test Brand',
      model_name: 'Model 2',
      detailed_description_editing: 'Enhanced description 2'
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the global fetch mock
    mockFetch.mockReset();
    // Set default successful response
    mockFetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve([]),
        text: () => Promise.resolve('{}'),
        clone: function() { return this; },
      } as Response)
    );
  });

  /**
   * Tests successful product categorization.
   */
  it('should successfully categorize products', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockSuccessResponse),
    });

    const result = await submitProductCategorization(mockProducts);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.test.com/categorize',
      {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockProducts),
      }
    );

    expect(result).toEqual({
      success: true,
      data: mockSuccessResponse,
    });
  });

  /**
   * Tests record limit validation.
   */
  it('should reject requests with too many products', async () => {
    const tooManyProducts = Array.from({ length: 3001 }, (_, i) => ({
      language: 'en',
      semantic_top_k: 15,
      first_category_via_llm: false,
      descriptive_title_via_llm: true,
      round_out_keywords_via_llm: true,
      broad_keyword_matching: true,
      input_data: {
        product_number: i,
        product_name: `Product ${i}`,
        hashtags: ['test'],
        keywords: ['category'],
        main_image_link: 'https://example.com/image.jpg',
        sales_status: 'Available',
        manufacturer: 'Brand',
        model_name: 'Model',
        edit_details: `Description ${i}`
      }
    }));

    const result = await submitProductCategorization(tooManyProducts);

    expect(result).toEqual({
      success: false,
      error: 'Too many records: 3001. Maximum allowed is 3000 records per submission.',
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  /**
   * Tests API error response handling.
   */
  it('should handle API error responses', async () => {
    const errorResponse = {
      error: 'Service temporarily unavailable',
    };

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: () => Promise.resolve(errorResponse),
    });

    const result = await submitProductCategorization(mockProducts);

    expect(result).toEqual({
      success: false,
      error: 'Service temporarily unavailable',
    });
  });

  /**
   * Tests FastAPI validation error handling.
   */
  it('should handle FastAPI validation errors', async () => {
    const fastApiError = {
      detail: [
        {
          loc: ['body', 0, 'price'],
          msg: 'field required',
          type: 'value_error.missing',
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      statusText: 'Unprocessable Entity',
      json: () => Promise.resolve(fastApiError),
    });

    const result = await submitProductCategorization(mockProducts);

    expect(result.success).toBe(false);
    expect(result.error).toContain('API validation failed');
  });

  /**
   * Tests network error handling.
   */
  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await submitProductCategorization(mockProducts);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to submit products for categorization');
  });

  /**
   * Tests response validation error handling.
   */
  it('should handle invalid response format', async () => {
    const invalidResponse = {
      invalid: 'response format',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(invalidResponse),
    });

    const result = await submitProductCategorization(mockProducts);

    expect(result.success).toBe(false);
    expect(result.error).toContain('API returned invalid response format');
  });

  /**
   * Tests empty products array handling.
   */
  it('should handle empty products array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });

    const result = await submitProductCategorization([]);

    expect(result).toEqual({
      success: true,
      data: [],
    });
  });

  /**
   * Tests malformed error response handling.
   */
  it('should handle malformed error responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.reject(new Error('Invalid JSON')),
    });

    const result = await submitProductCategorization(mockProducts);

    expect(result.success).toBe(false);
    expect(result.error).toContain('API request failed with status 500');
  });

  /**
   * Tests timeout scenario simulation.
   */
  it('should handle request timeout', async () => {
    mockFetch.mockImplementationOnce(() => 
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 100)
      )
    );

    const result = await submitProductCategorization(mockProducts);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to submit products for categorization');
  });

  /**
   * Tests invalid product data handling.
   */
  it('should handle invalid product data', async () => {
    const invalidProducts = [
      {
        // Missing required fields - completely invalid structure
        language: 'en',
        // Missing input_data entirely which should cause validation failure
      } as any,
    ] as CategoryRequestItem[];

    const result = await submitProductCategorization(invalidProducts);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Validation error: Product data');
  });
});