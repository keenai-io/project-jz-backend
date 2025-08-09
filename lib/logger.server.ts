/**
 * Server-only Winston logger for Node.js environments
 * Contains Winston imports that are safe to use in server actions and API routes
 */

import winston from 'winston';
import {z, ZodError} from 'zod';
import { formatZodError } from './zod-error-formatter';

// Environment validation for server logging
const serverLogEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().optional(),
});

const serverLogEnv = serverLogEnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  LOG_LEVEL: process.env.LOG_LEVEL,
  LOG_FILE: process.env.LOG_FILE,
});

/**
 * Type-safe logging interface with branded types for different log contexts
 */
export type LogContext = 'api' | 'auth' | 'db' | 'file' | 'categorization' | 'ui' | 'system';

/**
 * Custom log format for development with colors
 */
const developmentFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaString = Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : '';
    const stackString = stack ? `\n${stack}` : '';
    
    return `[${timestamp}] ${level.toUpperCase().padEnd(5)} ${message}${stackString}${metaString ? '\n' + metaString : ''}`;
  })
);

/**
 * Custom log format for production
 */
const productionFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Winston logger configuration for server-side use only
 * 
 * Development: Console output with colors and pretty formatting
 * Production: JSON structured logs with file output
 * Test: Minimal logging to avoid noise
 */
const winstonLogger = winston.createLogger({
  level: serverLogEnv.LOG_LEVEL,
  format: serverLogEnv.NODE_ENV === 'production' ? productionFormat : developmentFormat,
  defaultMeta: {
    service: 'marketplace-ai',
    environment: serverLogEnv.NODE_ENV,
    serverSide: true
  },
  transports: [
    // Console transport for all environments
    new winston.transports.Console({
      silent: serverLogEnv.NODE_ENV === 'test',
      format: serverLogEnv.NODE_ENV === 'development' ? developmentFormat : productionFormat
    }),
    
    // File transport for production or when LOG_FILE is specified
    ...(serverLogEnv.NODE_ENV === 'production' || serverLogEnv.LOG_FILE
      ? [
          new winston.transports.File({
            filename: serverLogEnv.LOG_FILE || 'logs/app.log',
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
            format: productionFormat
          }),
          new winston.transports.File({
            filename: serverLogEnv.LOG_FILE?.replace('.log', '.error.log') || 'logs/error.log',
            level: 'error',
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
            format: productionFormat
          })
        ]
      : []
    )
  ]
});

/**
 * Enhanced server logger with context-aware logging methods
 * Provides structured logging with consistent metadata
 * SERVER-ONLY: Do not import this in client components
 */
export const serverLogger = {
  /**
   * Error level logging with optional error object
   * Automatically formats ZodError instances for better readability
   * Message should include file location reference for debugging
   */
  error: (message: string, error?: Error, context?: LogContext, meta?: Record<string, unknown>): void => {
    const logMeta = {
      context,
      error: error ? {
        name: error.name,
        message: error instanceof ZodError 
          ? `Validation Error:\n\n${formatZodError(error, { groupByPath: true, includeErrorCode: true })}` 
          : error.message,
        stack: error.stack,
        ...(error instanceof ZodError && {
          validationDetails: {
            issueCount: error.issues.length,
            firstIssue: error.issues[0]?.message,
            affectedPaths: error.issues.map(issue => issue.path.join('.')).filter(path => path)
          }
        })
      } : undefined,
      ...meta
    };
    
    winstonLogger.error(message, logMeta);
  },

  /**
   * Warning level logging
   */
  warn: (message: string, context?: LogContext, meta?: Record<string, unknown>): void => {
    winstonLogger.warn(message, { context, ...meta });
  },

  /**
   * Info level logging
   */
  info: (message: string, context?: LogContext, meta?: Record<string, unknown>): void => {
    winstonLogger.info(message, { context, ...meta });
  },

  /**
   * Debug level logging (only in development)
   */
  debug: (message: string, context?: LogContext, meta?: Record<string, unknown>): void => {
    winstonLogger.debug(message, { context, ...meta });
  },

  /**
   * API request/response logging
   */
  apiRequest: (method: string, url: string, duration?: number, statusCode?: number): void => {
    winstonLogger.info('API Request', {
      context: 'api' as LogContext,
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
    winstonLogger.error('API Error', {
      context: 'api' as LogContext,
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
    winstonLogger[level](`File processing: ${action}`, {
      context: 'file' as LogContext,
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
    winstonLogger[level](`Categorization: ${action}`, {
      context: 'categorization' as LogContext,
      productCount,
      duration,
      success
    });
  }
};

// Export environment for conditional logging
export { serverLogEnv as logEnv };

// Export raw winston logger for advanced use cases
export { winstonLogger as rawLogger };

export default serverLogger;