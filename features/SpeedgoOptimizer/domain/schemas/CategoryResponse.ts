import {z} from "zod";

// Schema for individual categorization response item - matches API response format
export const CategoryResponseItemSchema = z.object({
  product_number: z.number().describe("Original product number from request"),
  original_product_name: z.string().describe("Original product name from input"),
  original_keywords: z.array(z.string()).describe("Original keywords from input"),
  original_main_image_link: z.string().describe("Original main image link from input"),
  hashtags: z.array(z.string()).describe("Hashtags associated with the product"),
  sales_status: z.string().describe("Current sales status of the product"),
  matched_categories: z.array(z.string()).describe("Categories matched to the product"),
  product_name: z.string().describe("Enhanced/optimized product name"),
  keywords: z.array(z.string()).describe("Enhanced/optimized keywords"),
  main_image_link: z.string().describe("Main image link (may be optimized)"),
  category_number: z.string().describe("Category number/ID for the matched category"),
  brand: z.string().nullable().describe("Product brand if identified"),
  manufacturer: z.string().nullable().describe("Product manufacturer if identified"),
  model_name: z.string().nullable().describe("Product model name if identified"),
  detailed_description_editing: z.string().nullable().describe("Detailed description edits if provided")
});

// Schema for the complete response array
export const CategoryResponseSchema = z.array(CategoryResponseItemSchema).describe("Array of categorization results");

// Error detail item schema for FastAPI-style validation errors
export const ErrorDetailSchema = z.object({
  type: z.string().describe("Error type (e.g., 'list_type', 'missing')"),
  loc: z.array(z.union([z.string(), z.number()])).describe("Location path of the error"),
  msg: z.string().describe("Human-readable error message"),
  input: z.unknown().optional().describe("The input that caused the error")
});

// Error response schema for API failures (supports both formats)
export const CategoryErrorResponseSchema = z.union([
  // FastAPI validation error format
  z.object({
    detail: z.array(ErrorDetailSchema).describe("Validation error details")
  }),
  // Generic error format
  z.object({
    error: z.string().describe("Error message"),
    code: z.string().optional().describe("Error code"),
    details: z.record(z.string(), z.unknown()).optional().describe("Additional error details")
  })
]);

// TypeScript types derived from schemas
export type CategoryResponseItem = z.infer<typeof CategoryResponseItemSchema>;
export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;
export type ErrorDetail = z.infer<typeof ErrorDetailSchema>;
export type CategoryErrorResponse = z.infer<typeof CategoryErrorResponseSchema>;