'use server';

import {
  CategoryRequestSchema,
  type CategoryRequestItem
} from "@features/SpeedgoOptimizer/domain/schemas/CategoryRequest";
import {
  CategoryResponseSchema,
  CategoryErrorResponseSchema,
  type CategoryResponse
} from "@features/SpeedgoOptimizer/domain/schemas/CategoryResponse";
import serverLogger from "@/lib/logger.server";
import { ZodError } from "zod";
import { formatError, createValidationErrorMessage, formatFastApiError } from "@/lib/zod-error-formatter";

/**
 * Server action to submit product data for categorization
 * 
 * @param products - Array of product data to categorize
 * @returns Promise containing categorization results or error
 */
export async function submitProductCategorization(
  products: CategoryRequestItem[]
): Promise<{ success: true; data: CategoryResponse } | { success: false; error: string }> {
  const startTime = Date.now();
  const apiUrl = 'https://product-categorizer-364702430350.us-central1.run.app/match';
  
  try {
    serverLogger.info(`Starting product categorization for ${products.length} products`, 'categorization', {
      productCount: products.length,
      products
    });

    // Validate input data
    const validationResult = CategoryRequestSchema.safeParse(products);
    if (!validationResult.success) {
      const validationError = createValidationErrorMessage(
        'Product data [submitProductCategorization.ts:35]', 
        validationResult.error,
        { maxErrors: 5, includePath: true }
      );
      
      serverLogger.error('Input validation failed [submitProductCategorization.ts:35]', validationResult.error, 'categorization', {
        productCount: products.length,
        validationError
      });
      
      return {
        success: false,
        error: validationError
      };
    }
    
    const validatedRequest = validationResult.data;
    serverLogger.debug('Input validation successful', 'categorization');
    
    // Call the categorization API
    serverLogger.debug(`Making API request to ${apiUrl}`, 'api');

    const requestBody = JSON.stringify(validatedRequest);

    // Debug log the request structure
    serverLogger.debug('API request details', 'api', {
      isArray: Array.isArray(validatedRequest),
      itemCount: validatedRequest.length,
      firstItemStructure: validatedRequest[0] ? Object.keys(validatedRequest[0]) : 'N/A',
      requestBody,
      bodyLength: requestBody.length,
      bodyPreview: requestBody.substring(0, 200) + (requestBody.length > 200 ? '...' : '')
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      // Try to parse error response
      let errorMessage = `API request failed with status ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        const parsedError = CategoryErrorResponseSchema.safeParse(errorData);
        if (parsedError.success) {
          // Handle FastAPI validation error format
          if ('detail' in parsedError.data) {
            errorMessage = `API validation failed:\n${formatFastApiError(parsedError.data.detail)}`;
          }
          // Handle generic error format
          else if ('error' in parsedError.data) {
            errorMessage = parsedError.data.error;
          }
        } else if (typeof errorData === 'object') {
          // Fallback for unparseable error formats
          if (errorData.detail && Array.isArray(errorData.detail)) {
            errorMessage = `API validation error: ${errorData.detail[0]?.msg || 'Unknown validation error'}`;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        }
      } catch (parseError) {
        serverLogger.error('Failed to parse error response [submitProductCategorization.ts:108]', parseError as Error, 'api');
      }

      serverLogger.apiError('POST', apiUrl, new Error(errorMessage), response.status);
      serverLogger.categorization('submission failed', products.length, duration, false);

      return {
        success: false,
        error: errorMessage
      };
    }

    // Parse and validate response
    const responseData = await response.json();

    // Log the raw response for debugging
    serverLogger.debug('Raw API response received', 'categorization', {
      responseType: typeof responseData,
      isArray: Array.isArray(responseData),
      responseLength: Array.isArray(responseData) ? responseData.length : 'N/A',
      firstItemKeys: Array.isArray(responseData) && responseData.length > 0
        ? Object.keys(responseData[0] || {})
        : 'N/A',
      sampleResponse: Array.isArray(responseData) && responseData.length > 0
        ? responseData[0]
        : responseData
    });

    const responseValidation = CategoryResponseSchema.safeParse(responseData);
    if (!responseValidation.success) {
      const responseError = createValidationErrorMessage(
        'API response [submitProductCategorization.ts:136]',
        responseValidation.error,
        { maxErrors: 3, includePath: true }
      );
      
      serverLogger.error('API response validation failed [submitProductCategorization.ts:136]', responseValidation.error, 'api', {
        duration,
        statusCode: response.status,
        responseData: Array.isArray(responseData) ? responseData.slice(0, 2) : responseData
      });
      
      return {
        success: false,
        error: `API returned invalid response format: ${responseError}`
      };
    }

    const validatedResponse = responseValidation.data;
    serverLogger.apiRequest('POST', apiUrl, duration, response.status);
    serverLogger.categorization('submission completed', products.length, duration, true);

    return {
      success: true,
      data: validatedResponse
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorObj = error instanceof Error ? error : new Error('Unknown error');
    
    serverLogger.error('Error in submitProductCategorization [submitProductCategorization.ts:169]', errorObj, 'categorization', {
      productCount: products.length,
      duration
    });
    serverLogger.categorization('submission error', products.length, duration, false);
    
    // Format errors based on their type for better user experience
    if (error instanceof ZodError) {
      const userFriendlyError = createValidationErrorMessage('Product data [submitProductCategorization.ts:177]', error, {
        maxErrors: 3,
        includePath: true
      });
      return {
        success: false,
        error: userFriendlyError
      };
    }
    
    const userFriendlyError = formatError(error, 'Failed to submit products for categorization [submitProductCategorization.ts:187]');
    return {
      success: false,
      error: userFriendlyError
    };
  }
}