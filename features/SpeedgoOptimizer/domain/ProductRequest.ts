import {z} from "zod";

const ProductRequestSchema = z.object({
  product_number: z.number().describe("Unique product ID"),
  product_name: z.string().describe("Name of the product"),
  hashtags: z.array(z.string()).default([]).describe("List of hashtags (likely empty)"),
  keywords: z.array(z.string()).describe("List of product keywords"),
  main_image_link: z.url().describe("URL to the main product image"),
  sales_status: z.string().describe("Current sales status of the product (e.g., On Sale)"),
  manufacturer: z.string().optional().nullable().describe("Manufacturer field from original file, may be empty"),
  model_name: z.string().optional().nullable().describe("Model name field from original file, may be empty"),
  edit_details: z.string().optional().nullable().describe("Edit details field from original file, may be empty"),
  language: z.enum(["korean", "english"]).default("english").describe("Language of the product"),
  first_category_via_llm: z.boolean().default(false).describe("Whether the first category was determined via LLM"),
  descriptive_title_via_llm: z.boolean().default(true).describe("Whether the descriptive title was determined via LLM"),
  round_out_keywords_via_llm: z.boolean().default(true).describe("Whether the tags were determined via LLM"),
  broad_keyword_matching: z.boolean().default(true).describe("Whether to use broad keyword matching"),
});

export default ProductRequestSchema;
