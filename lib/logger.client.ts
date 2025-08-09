/**
 * Client-safe logger for browser environments
 * Provides console-based logging with the same interface as the server logger
 */

import {z} from 'zod';

// Environment validation for client logging
const clientLogEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const clientLogEnv = clientLogEnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
});

/**
 * Type-safe logging interface with branded types for different log contexts
 */
export type LogContext = 'api' | 'auth' | 'db' | 'file' | 'categorization' | 'ui' | 'system';

// Note: LoggerMeta interface removed as it's not used - client logger uses inline types

/**
 * Client-side console logger that provides structured logging
 * Safe for use in React components and browser environments
 */
export const clientLogger = {
  /**
   * Error level logging with optional error object
   * Message should include file location reference for debugging
   */
  error: (message: string, error?: Error, context?: LogContext, meta?: Record<string, unknown>): void => {
    const logMeta = {
      context,
      clientSide: true,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined,
      ...meta
    };
    
    console.error(`[ERROR] ${message}`, logMeta);
  },

  /**
   * Warning level logging
   */
  warn: (message: string, context?: LogContext, meta?: Record<string, unknown>): void => {
    console.warn(`[WARN] ${message}`, { 
      context, 
      clientSide: true,
      ...meta 
    });
  },

  /**
   * Info level logging
   */
  info: (message: string, context?: LogContext, meta?: Record<string, unknown>): void => {
    console.info(`[INFO] ${message}`, { 
      context, 
      clientSide: true,
      ...meta 
    });
  },

  /**
   * Debug level logging (only in development)
   */
  debug: (message: string, context?: LogContext, meta?: Record<string, unknown>): void => {
    if (clientLogEnv.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, { 
        context, 
        clientSide: true,
        ...meta 
      });
    }
  },

  /**
   * API request/response logging
   */
  apiRequest: (method: string, url: string, duration?: number, statusCode?: number): void => {
    console.info(`[API] ${method} ${url}`, {
      context: 'api' as LogContext,
      clientSide: true,
      method,
      url,
      duration,
      statusCode
    });
  },

  /**
   * API error logging with request details
   */
  apiError: (method: string, url: string, error: Error, statusCode?: number): void => {
    console.error(`[API ERROR] ${method} ${url}`, {
      context: 'api' as LogContext,
      clientSide: true,
      method,
      url,
      statusCode,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
  },

  /**
   * File processing logging
   */
  fileProcessing: (fileName: string, action: string, result?: 'success' | 'error', meta?: Record<string, unknown>): void => {
    const level = result === 'error' ? 'error' : 'info';
    const consoleMethod = level === 'error' ? console.error : console.info;
    
    consoleMethod(`[FILE] Processing: ${action}`, {
      context: 'file' as LogContext,
      clientSide: true,
      fileName,
      action,
      result,
      ...meta
    });
  },

  /**
   * Categorization process logging
   */
  categorization: (action: string, productCount?: number, duration?: number, success?: boolean): void => {
    const level = success === false ? 'error' : 'info';
    const consoleMethod = level === 'error' ? console.error : console.info;
    
    consoleMethod(`[CATEGORIZATION] ${action}`, {
      context: 'categorization' as LogContext,
      clientSide: true,
      productCount,
      duration,
      success
    });
  }
};

export default clientLogger;