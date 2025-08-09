import {z} from "zod";

// Schema for the input_data object within each categorization request
export const CategoryInputDataSchema = z.object({
  product_number: z.number().describe("Unique product identifier"),
  product_name: z.string().describe("Product name/title"),
  hashtags: z.array(z.string()).default([]).describe("Product hashtags"),
  keywords: z.array(z.string()).describe("Product keywords for categorization"),
  main_image_link: z.url().describe("URL to the main product image"),
  sales_status: z.string().describe("Current sales status (e.g. 'On Sale')"),
  manufacturer: z.string().default("").describe("Product manufacturer"),
  model_name: z.string().default("").describe("Product model name"),
  edit_details: z.string().default("").describe("Additional edit details")
});

// Schema for individual categorization request item
export const CategoryRequestItemSchema = z.object({
  language: z.enum(["en", "ko"]).default("en").describe("Language for categorization"),
  semantic_top_k: z.number().int().min(1).max(50).default(15).describe("Number of semantic matches to consider"),
  first_category_via_llm: z.boolean().default(false).describe("Use LLM for first category determination"),
  descriptive_title_via_llm: z.boolean().default(true).describe("Use LLM for descriptive title generation"),
  round_out_keywords_via_llm: z.boolean().default(true).describe("Use LLM to enhance keywords"),
  broad_keyword_matching: z.boolean().default(true).describe("Enable broad keyword matching"),
  input_data: CategoryInputDataSchema
});

// Schema for the complete request array
export const CategoryRequestSchema = z.array(CategoryRequestItemSchema);

// TypeScript types derived from schemas
export type CategoryInputData = z.infer<typeof CategoryInputDataSchema>;
export type CategoryRequestItem = z.infer<typeof CategoryRequestItemSchema>;
export type CategoryRequest = z.infer<typeof CategoryRequestSchema>;