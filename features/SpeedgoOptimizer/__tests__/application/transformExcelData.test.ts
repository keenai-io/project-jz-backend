/**
 * @fileoverview Tests for transformExcelData functions
 * @module features/SpeedgoOptimizer/__tests__/application/transformExcelData.test
 */

// Early TextEncoder polyfill for this specific test file
if (typeof global.TextEncoder === 'undefined') {
  const util = require('util');
  global.TextEncoder = util.TextEncoder;
  global.TextDecoder = util.TextDecoder;
}

import { describe, it, expect, vi } from 'vitest';
import { transformExcelDataToCategorizationRequest } from '@features/SpeedgoOptimizer';
import { RowData } from '@tanstack/table-core';
import { Locales } from 'intlayer';
import { ZodError } from 'zod';

// Mock dependencies
vi.mock('@features/SpeedgoOptimizer/domain/schemas/CategoryRequest', () => ({
  CategoryRequestItemSchema: {
    parse: vi.fn()
  }
}));

vi.mock('@/lib/zod-error-formatter', () => ({
  createValidationErrorMessage: vi.fn()
}));

/**
 * Test suite for transformExcelData functions.
 * 
 * Tests Excel data transformation, validation, error handling, and keyword parsing.
 * Mocks external dependencies to ensure isolated unit tests.
 */
describe('transformExcelData', () => {
  const sampleExcelData: RowData[] = [
    { A: 'Header1', B: 'Header2', C: 'Header3', D: 'Header4', E: 'Header5', F: 'Header6' },
    { A: 'SubHeader1', B: 'SubHeader2', C: 'SubHeader3', D: 'SubHeader4', E: 'SubHeader5', F: 'SubHeader6' },
    { A: '1', B: 'Product A', C: 'tag1,tag2', D: 'keyword1;keyword2', E: 'https://example.com/image1.jpg', F: 'Active' },
    { A: '2', B: 'Product B', C: 'tag3|tag4', D: 'keyword3\nkeyword4', E: 'https://example.com/image2.jpg', F: 'Inactive' },
    { A: '', B: 'Product C', C: '', D: '', E: '', F: '' }
  ];

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Mock successful validation by default
    const { CategoryRequestItemSchema } = vi.mocked(await import('@features/SpeedgoOptimizer/domain/schemas/CategoryRequest'));
    CategoryRequestItemSchema.parse.mockImplementation((item) => item);
  });

  describe('transformExcelDataToCategorizationRequest', () => {
    /**
     * Tests successful transformation of valid Excel data.
     */
    it('should transform Excel data successfully with default locale', async () => {
      const { CategoryRequestItemSchema } = vi.mocked(await import('@features/SpeedgoOptimizer/domain/schemas/CategoryRequest'));
      
      const result = transformExcelDataToCategorizationRequest(sampleExcelData);

      expect(result).toHaveLength(3); // Should skip first 2 header rows
      
      // Verify first product transformation
      expect(result[0]).toEqual({
        language: Locales.KOREAN,
        semantic_top_k: 15,
        first_category_via_llm: false,
        descriptive_title_via_llm: true,
        round_out_keywords_via_llm: true,
        broad_keyword_matching: true,
        input_data: {
          product_number: 1,
          product_name: 'Product A',
          hashtags: ['tag1', 'tag2'],
          keywords: ['keyword1', 'keyword2'],
          main_image_link: 'https://example.com/image1.jpg',
          sales_status: 'Active',
          manufacturer: '',
          model_name: '',
          edit_details: ''
        }
      });

      // Verify validation was called for each item
      expect(CategoryRequestItemSchema.parse).toHaveBeenCalledTimes(3);
    });

    /**
     * Tests transformation with custom locale.
     */
    it('should transform Excel data with custom locale', async () => {
      const result = transformExcelDataToCategorizationRequest(sampleExcelData, Locales.ENGLISH);

      expect(result[0].language).toBe(Locales.ENGLISH);
    });

    /**
     * Tests transformation with different keyword delimiters.
     */
    it('should parse keywords with various delimiters correctly', async () => {
      const result = transformExcelDataToCategorizationRequest(sampleExcelData);

      // First product: comma-separated hashtags, semicolon-separated keywords
      expect(result[0].input_data.hashtags).toEqual(['tag1', 'tag2']);
      expect(result[0].input_data.keywords).toEqual(['keyword1', 'keyword2']);

      // Second product: pipe-separated hashtags, newline-separated keywords
      expect(result[1].input_data.hashtags).toEqual(['tag3', 'tag4']);
      expect(result[1].input_data.keywords).toEqual(['keyword3', 'keyword4']);
    });

    /**
     * Tests handling of empty/missing data.
     */
    it('should handle empty/missing data correctly', async () => {
      const result = transformExcelDataToCategorizationRequest(sampleExcelData);

      // Third product has mostly empty data
      expect(result[2]).toEqual({
        language: Locales.KOREAN,
        semantic_top_k: 15,
        first_category_via_llm: false,
        descriptive_title_via_llm: true,
        round_out_keywords_via_llm: true,
        broad_keyword_matching: true,
        input_data: {
          product_number: 3, // Auto-generated since A is empty
          product_name: 'Product C',
          hashtags: [],
          keywords: [],
          main_image_link: '',
          sales_status: 'Unknown',
          manufacturer: '',
          model_name: '',
          edit_details: ''
        }
      });
    });

    /**
     * Tests product number parsing and auto-generation.
     */
    it('should parse product numbers and auto-generate when missing', async () => {
      const testData: RowData[] = [
        { A: 'Header' },
        { A: 'SubHeader' },
        { A: '100', B: 'Product 1' },
        { A: '', B: 'Product 2' },
        { A: 'invalid', B: 'Product 3' }
      ];

      const result = transformExcelDataToCategorizationRequest(testData);

      expect(result[0].input_data.product_number).toBe(100); // Parsed from string
      expect(result[1].input_data.product_number).toBe(2);   // Auto-generated (index + 1)
      expect(result[2].input_data.product_number).toBe(3);   // Auto-generated when invalid
    });

    /**
     * Tests validation error handling.
     */
    it('should throw error when validation fails', async () => {
      const { CategoryRequestItemSchema } = vi.mocked(await import('@features/SpeedgoOptimizer/domain/schemas/CategoryRequest'));
      const { createValidationErrorMessage } = vi.mocked(await import('@/lib/zod-error-formatter'));
      
      const validationError = new ZodError([]);
      CategoryRequestItemSchema.parse.mockImplementationOnce(() => {
        throw validationError;
      });
      
      createValidationErrorMessage.mockReturnValue('Validation failed: Missing required field');

      expect(() => {
        transformExcelDataToCategorizationRequest(sampleExcelData);
      }).toThrow('Validation failed: Missing required field [transformExcelData.ts:55]');

      expect(createValidationErrorMessage).toHaveBeenCalledWith(
        'Excel row 5 (Product: "Product A")',
        validationError,
        { maxErrors: 3, includePath: true }
      );
    });

    /**
     * Tests error handling for non-ZodError exceptions.
     */
    it('should re-throw non-ZodError exceptions', async () => {
      const { CategoryRequestItemSchema } = vi.mocked(await import('@features/SpeedgoOptimizer/domain/schemas/CategoryRequest'));
      
      const genericError = new Error('Unexpected error');
      CategoryRequestItemSchema.parse.mockImplementationOnce(() => {
        throw genericError;
      });

      expect(() => {
        transformExcelDataToCategorizationRequest(sampleExcelData);
      }).toThrow('Unexpected error');
    });

    /**
     * Tests transformation with empty input data.
     */
    it('should handle empty input array', async () => {
      const result = transformExcelDataToCategorizationRequest([]);

      expect(result).toEqual([]);
    });

    /**
     * Tests transformation with minimal input data.
     */
    it('should handle input with only headers', async () => {
      const minimalData: RowData[] = [
        { A: 'Header' },
        { B: 'SubHeader' }
      ];

      const result = transformExcelDataToCategorizationRequest(minimalData);

      expect(result).toEqual([]);
    });

    /**
     * Tests keyword parsing edge cases.
     */
    it('should handle keyword parsing edge cases', async () => {
      const edgeCaseData: RowData[] = [
        { A: 'Header' },
        { A: 'SubHeader' },
        { 
          A: '1', 
          B: 'Test Product', 
          C: '  tag1  ,  , tag2;  ; tag3|tag4  \n  \n tag5  ', 
          D: '', 
          E: '', 
          F: '' 
        }
      ];

      const result = transformExcelDataToCategorizationRequest(edgeCaseData);

      // Should trim whitespace and filter empty strings
      expect(result[0].input_data.hashtags).toEqual(['tag1', 'tag2', 'tag3', 'tag4', 'tag5']);
      expect(result[0].input_data.keywords).toEqual([]);
    });

    /**
     * Tests correct row indexing in error messages.
     */
    it('should provide correct row numbers in error messages', async () => {
      const { CategoryRequestItemSchema } = vi.mocked(await import('@features/SpeedgoOptimizer/domain/schemas/CategoryRequest'));
      const { createValidationErrorMessage } = vi.mocked(await import('@/lib/zod-error-formatter'));
      
      // Make the second item fail validation
      CategoryRequestItemSchema.parse
        .mockImplementationOnce((item) => item) // First item passes
        .mockImplementationOnce(() => { throw new ZodError([]); }); // Second item fails
      
      createValidationErrorMessage.mockReturnValue('Validation failed');

      expect(() => {
        transformExcelDataToCategorizationRequest(sampleExcelData);
      }).toThrow();

      // Should reference row 6 (index 1 + 5) for the second data row
      expect(createValidationErrorMessage).toHaveBeenCalledWith(
        'Excel row 6 (Product: "Product B")',
        expect.any(ZodError),
        { maxErrors: 3, includePath: true }
      );
    });
  });
});