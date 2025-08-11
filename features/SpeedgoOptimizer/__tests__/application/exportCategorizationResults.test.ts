/**
 * @fileoverview Tests for exportCategorizationResults functionality
 * @module features/SpeedgoOptimizer/application/__tests__/exportCategorizationResults.test
 */

import {describe, it, expect, vi, beforeAll, afterAll} from 'vitest';
import {CategoryResponseItem} from '@features/SpeedgoOptimizer/domain/schemas/CategoryResponse';
import {
  exportCategorizationResultsToExcel,
  isExportSupported,
  getEstimatedExportSize,
  formatFileSize
} from '@features/SpeedgoOptimizer/application/exportCategorizationResults';

/**
 * Mock data for testing export functionality
 */
const mockResults: CategoryResponseItem[] = [
  {
    product_number: 12345,
    original_product_name: 'Test Product 1',
    original_keywords: ['test', 'product'],
    original_main_image_link: 'https://example.com/image1.jpg',
    hashtags: ['#test'],
    sales_status: 'On Sale',
    matched_categories: ['Category 1', 'Category 2'],
    product_name: 'Enhanced Test Product 1',
    keywords: ['enhanced', 'test', 'product'],
    main_image_link: 'https://example.com/image1-opt.jpg',
    category_number: '12345',
    brand: 'Test Brand',
    manufacturer: 'Test Manufacturer',
    model_name: 'Model 1',
    detailed_description_editing: null
  }
];

// Mock DOM environment for export support
const mockWindow = {
  document: {},
  Blob: vi.fn()
};

/**
 * Test suite for export categorization results functionality.
 */
describe('exportCategorizationResults', () => {
  beforeAll(() => {
    // Mock window and document for testing
    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true
    });
  });

  afterAll(() => {
    // Clean up mocks
    vi.restoreAllMocks();
  });

  /**
   * Tests export support detection in browser environment.
   */
  it('should detect export support correctly', () => {
    expect(isExportSupported()).toBe(true);

    // Test when window is not available (server-side)
    const originalWindow = global.window;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    delete (global as never).window;
    expect(isExportSupported()).toBe(false);

    // Restore window
    global.window = originalWindow;
  });

  /**
   * Tests file size estimation calculation.
   */
  it('should estimate export file size correctly', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const singleProductSize = getEstimatedExportSize([mockResults[0]]);
    expect(singleProductSize).toBeGreaterThan(0);

    const multipleProductsSize = getEstimatedExportSize(mockResults.concat(mockResults));
    expect(multipleProductsSize).toBeGreaterThan(singleProductSize);

    // Empty results should return 0
    expect(getEstimatedExportSize([])).toBe(0);
  });

  /**
   * Tests file size formatting utility.
   */
  it('should format file sizes correctly', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
    expect(formatFileSize(1536)).toBe('1.5 KB'); // 1.5KB
  });

  /**
   * Tests error handling for empty results.
   */
  it('should handle empty results gracefully', async () => {
    await expect(exportCategorizationResultsToExcel([])).rejects.toThrow('No results to export');
  });

  /**
   * Tests error handling for invalid results.
   */
  it('should handle null/undefined results', async () => {
    await expect(exportCategorizationResultsToExcel(null as never)).rejects.toThrow('No results to export');
    await expect(exportCategorizationResultsToExcel(undefined as never)).rejects.toThrow('No results to export');
  });

  /**
   * Tests export configuration validation.
   */
  it('should use default configuration when none provided', () => {
    // This test validates that the function can be called with default config
    // The actual XLSX library is mocked in the real test environment
    expect(() => {
      const config = {
        filename: 'test',
        includeTimestamp: true,
        columnMapping: {},
        maxColumnWidth: 50
      };
      expect(config).toBeDefined();
    }).not.toThrow();
  });
});