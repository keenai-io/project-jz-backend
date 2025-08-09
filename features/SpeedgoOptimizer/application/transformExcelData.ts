import {type CategoryRequestItem, CategoryRequestItemSchema} from "@features/SpeedgoOptimizer/domain/schemas/CategoryRequest";
import {RowData} from "@tanstack/table-core";
import { ZodError } from "zod";
import { createValidationErrorMessage } from "@/lib/zod-error-formatter";

/**
 * Transforms processed Excel data into format expected by categorization API
 * 
 * @param excelData - Array of row data from processed Excel file
 * @returns Array of CategoryRequestItem objects ready for API submission
 * @throws Error with human-readable message if validation fails
 */
export function transformExcelDataToCategorizationRequest(excelData: RowData[]): CategoryRequestItem[] {
  const transformedData = excelData.slice(2).map((row, index) => {
    // Extract data from Excel columns (assuming standard column layout)
    // Skip the header row (index 0) with slice(1)
    const rowData = row as Record<string, unknown>;
    const productNumber = parseInt(String(rowData.A || '')) || (index + 1);
    const productName = String(rowData.B || '');
    const hashtags = parseKeywords(String(rowData.C || ''));
    const keywords = parseKeywords(String(rowData.D || ''));
    const mainImageLink = String(rowData.E || '');
    const salesStatus = String(rowData.F || 'Unknown');

    const item = {
      language: "ko" as const,
      semantic_top_k: 15,
      first_category_via_llm: false,
      descriptive_title_via_llm: true,
      round_out_keywords_via_llm: true,
      broad_keyword_matching: true,
      input_data: {
        product_number: productNumber,
        product_name: productName,
        hashtags: hashtags,
        keywords: keywords,
        main_image_link: mainImageLink,
        sales_status: salesStatus,
        manufacturer: "",
        model_name: "",
        edit_details: ""
      }
    };

    // Validate each item to ensure it meets schema requirements
    try {
      CategoryRequestItemSchema.parse(item);
    } catch (error) {
      if (error instanceof ZodError) {
        const humanReadableError = createValidationErrorMessage(
          `Excel row ${index + 5} (Product: "${productName}")`, 
          error,
          { maxErrors: 3, includePath: true }
        );
        throw new Error(`${humanReadableError} [transformExcelData.ts:55]`);
      }
      throw error;
    }

    return item;
  });

  return transformedData;
}

/**
 * Parses keywords from a string, handling various delimiters
 * 
 * @param keywordsString - String containing keywords separated by commas, semicolons, or newlines
 * @returns Array of trimmed keywords
 */
function parseKeywords(keywordsString: string | undefined | null): string[] {
  if (!keywordsString) return [];
  
  return keywordsString
    .split(/[,;|\n]/)
    .map(keyword => keyword.trim())
    .filter(keyword => keyword.length > 0);
}