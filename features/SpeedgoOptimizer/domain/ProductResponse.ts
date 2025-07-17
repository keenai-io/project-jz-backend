import {z} from "zod";

const ProductResponseSchema = z.object({
  // Copied directly from request, renamed
  product_number: z.number().describe("Copied directly from request"),
  original_product_name: z.string().describe("Copied directly from request"),
  original_keywords: z.array(z.string()).describe("Copied directly from request"),
  original_main_image_link: z.string().url().describe("Copied directly from request"),
  hashtags: z.array(z.string()).default([]).describe("Copied directly from request (likely empty)"),
  sales_status: z.string().describe("Copied directly from request"),
  matched_categories: z.array(z.string()).default([]).describe("List of matched categories"),

  // Transformed fields
  product_name: z.string().describe("LLM-derived SEO name using original name and image URL"),
  keywords: z.array(z.string()).describe("Up to 10 randomly selected tags from Tag.xlsx Column E based on semantic category match"),
  main_image_link: z.url().describe("Transformed image with rotation & watermark, uploaded publicly"),
  category_number: z.string().describe(
    "Reference tag.xlsx. Pull over the associated category number (tag.xlsx Column H) with the semantically matched category"
  ),
  brand: z.string().optional().nullable().describe("Left blank as per spec"),
  manufacturer: z.string().optional().nullable().describe("Left blank as per spec"),
  model_name: z.string().optional().nullable().describe("Left blank as per spec"),
  detailed_description_editing: z.string().optional().nullable().describe("Left blank as per spec"),
});

export default ProductResponseSchema;
