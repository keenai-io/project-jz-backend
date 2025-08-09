/**
 * Export categorization results to Excel (.xlsx) format
 * 
 * Provides functionality to export processed product categorization data
 * to a formatted Excel file for further analysis or record keeping.
 */

import * as XLSX from 'xlsx';
import { CategoryResponseItem } from "@features/SpeedgoOptimizer/domain/schemas/CategoryResponse";
import clientLogger from "@/lib/logger.client";

/**
 * Configuration for Excel export formatting
 */
interface ExportConfig {
  /** Filename for the exported file (without extension) */
  filename?: string;
  /** Include timestamps in filename */
  includeTimestamp?: boolean;
  /** Custom column mapping for headers */
  columnMapping?: Record<string, string>;
  /** Maximum width for text columns */
  maxColumnWidth?: number;
}

/**
 * Default configuration for Excel export
 */
const DEFAULT_CONFIG: Required<ExportConfig> = {
  filename: 'categorization-results',
  includeTimestamp: true,
  columnMapping: {
    product_number: 'Product Number',
    original_product_name: 'Original Product Name',
    product_name: 'Optimized Product Name',
    original_keywords: 'Original Keywords',
    keywords: 'Enhanced Keywords',
    matched_categories: 'Categories',
    sales_status: 'Sales Status',
    category_number: 'Category ID',
    brand: 'Brand',
    manufacturer: 'Manufacturer',
    model_name: 'Model Name',
    main_image_link: 'Image URL',
    hashtags: 'Hashtags'
  },
  maxColumnWidth: 50
};

/**
 * Transforms categorization results into Excel-friendly format
 * 
 * @param results - Array of categorization results to transform
 * @param config - Export configuration options
 * @returns Array of objects formatted for Excel export
 */
function transformResultsForExcel(
  results: CategoryResponseItem[], 
  config: Required<ExportConfig>
): Record<string, unknown>[] {
  return results.map((result, index) => {
    const transformedRow: Record<string, unknown> = {};
    
    // Add row number for reference
    transformedRow['#'] = index + 1;
    
    // Transform each field according to column mapping
    Object.entries(config.columnMapping).forEach(([key, header]) => {
      const value = result[key as keyof CategoryResponseItem];
      
      if (Array.isArray(value)) {
        // Handle arrays by joining with semicolons
        transformedRow[header] = value.length > 0 ? value.join('; ') : '';
      } else if (value === null || value === undefined) {
        // Handle null/undefined values
        transformedRow[header] = '';
      } else {
        // Handle regular values with length limiting
        const stringValue = String(value);
        transformedRow[header] = stringValue.length > config.maxColumnWidth 
          ? `${stringValue.substring(0, config.maxColumnWidth)}...`
          : stringValue;
      }
    });
    
    // Add computed fields
    transformedRow['Keywords Count'] = Array.isArray(result.keywords) ? result.keywords.length : 0;
    transformedRow['Categories Count'] = Array.isArray(result.matched_categories) ? result.matched_categories.length : 0;
    transformedRow['Export Date'] = new Date().toISOString().split('T')[0];
    
    return transformedRow;
  });
}

/**
 * Generates filename with optional timestamp
 * 
 * @param config - Export configuration
 * @returns Generated filename with extension
 */
function generateFilename(config: Required<ExportConfig>): string {
  let filename = config.filename;
  
  if (config.includeTimestamp) {
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')
      .substring(0, 19); // YYYY-MM-DDTHH-MM-SS
    filename = `${filename}-${timestamp}`;
  }
  
  return `${filename}.xlsx`;
}

/**
 * Applies Excel formatting and styling to the workbook
 * 
 * @param workbook - XLSX workbook to format
 * @param worksheetName - Name of the worksheet to format
 */
function applyExcelFormatting(workbook: XLSX.WorkBook, worksheetName: string): void {
  const worksheet = workbook.Sheets[worksheetName];
  if (!worksheet) return;
  
  // Set column widths for better readability
  const columnWidths = [
    { wpx: 50 },   // Row number
    { wpx: 120 },  // Product Number
    { wpx: 200 },  // Original Product Name
    { wpx: 250 },  // Optimized Product Name
    { wpx: 180 },  // Original Keywords
    { wpx: 200 },  // Enhanced Keywords
    { wpx: 150 },  // Categories
    { wpx: 100 },  // Sales Status
    { wpx: 100 },  // Category ID
    { wpx: 100 },  // Brand
    { wpx: 100 },  // Manufacturer
    { wpx: 100 },  // Model Name
    { wpx: 200 },  // Image URL
    { wpx: 120 },  // Hashtags
    { wpx: 80 },   // Keywords Count
    { wpx: 80 },   // Categories Count
    { wpx: 100 },  // Export Date
  ];
  
  worksheet['!cols'] = columnWidths;
  
  // Add autofilter to the data range
  worksheet['!autofilter'] = { ref: worksheet['!ref'] || 'A1' };
}

/**
 * Exports categorization results to Excel file and triggers download
 * 
 * @param results - Array of categorization results to export
 * @param config - Optional export configuration
 * @throws Error if export fails
 * 
 * @example
 * ```typescript
 * const results = await getCategorization();
 * await exportCategorizationResultsToExcel(results, {
 *   filename: 'my-products',
 *   includeTimestamp: true
 * });
 * ```
 */
export async function exportCategorizationResultsToExcel(
  results: CategoryResponseItem[],
  config: Partial<ExportConfig> = {}
): Promise<void> {
  const startTime = Date.now();
  
  try {
    // Validate input
    if (!results || results.length === 0) {
      throw new Error('No results to export');
    }
    
    clientLogger.info('Starting Excel export', 'file', {
      resultCount: results.length,
      config
    });
    
    // Merge with default configuration
    const finalConfig: Required<ExportConfig> = {
      ...DEFAULT_CONFIG,
      ...config
    };
    
    // Transform data for Excel format
    const excelData = transformResultsForExcel(results, finalConfig);
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheetName = 'Categorization Results';
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);
    
    // Apply formatting
    applyExcelFormatting(workbook, worksheetName);
    
    // Generate filename
    const filename = generateFilename(finalConfig);
    
    // Write file and trigger download
    XLSX.writeFile(workbook, filename, {
      bookType: 'xlsx',
      type: 'binary',
      compression: true
    });
    
    const duration = Date.now() - startTime;
    
    clientLogger.fileProcessing(filename, 'export completed', 'success', {
      resultCount: results.length,
      duration,
      filesize: 'unknown' // XLSX library doesn't provide file size
    });
    
    clientLogger.info(`Successfully exported ${results.length} results to ${filename}`, 'file', {
      duration,
      filename
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorObj = error instanceof Error ? error : new Error('Unknown export error');
    
    clientLogger.error('Failed to export categorization results [exportCategorizationResults.ts]', errorObj, 'file', {
      resultCount: results.length,
      duration,
      config
    });
    
    // Re-throw with enhanced error message
    throw new Error(`Export failed: ${errorObj.message}`);
  }
}

/**
 * Validates if export is supported in the current environment
 * 
 * @returns True if export is supported
 */
export function isExportSupported(): boolean {
  // Check if we're in a browser environment with necessary APIs
  return typeof window !== 'undefined' && 
         typeof document !== 'undefined' && 
         typeof Blob !== 'undefined';
}

/**
 * Gets estimated file size for export (rough calculation)
 * 
 * @param results - Array of categorization results
 * @returns Estimated file size in bytes
 */
export function getEstimatedExportSize(results: CategoryResponseItem[]): number {
  if (!results || results.length === 0) return 0;
  
  // Rough calculation: average 2KB per product + overhead
  const baseSize = 5000; // Base Excel file overhead
  const avgProductSize = 2000; // Average bytes per product
  
  return baseSize + (results.length * avgProductSize);
}

/**
 * Formats file size for display
 * 
 * @param bytes - Size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}