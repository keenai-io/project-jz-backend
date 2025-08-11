/**
 * Client-safe logger for browser environments with winston-dev-console inspired formatting
 * Provides enhanced console-based logging with source location and improved readability
 * Mimics winston-dev-console pattern but optimized for browser environments
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
export type LogContext = 'api' | 'auth' | 'db' | 'file' | 'categorization' | 'ui' | 'system' | 'query' | 'configuration';

/**
 * Enhanced client logger formatting inspired by winston-dev-console
 * Provides source location tracking and improved console output formatting
 */
interface ClientLoggerOptions {
  showTimestamps?: boolean;
  addLineSeparation?: boolean;
  maxObjectDepth?: number;
  includeSourceLocation?: boolean;
}

const defaultOptions: Required<ClientLoggerOptions> = {
  showTimestamps: false, // Usually noise in browser dev tools
  addLineSeparation: true,
  maxObjectDepth: 3,
  includeSourceLocation: true
};

/**
 * Gets the caller information for source location tracking
 */
function getCallerInfo(): { fileName: string; lineNumber: string; functionName: string } | null {
  try {
    throw new Error();
  } catch (e) {
    const error = e as Error;
    const stack = error.stack?.split('\n')[3] || '';
    
    // Parse stack trace for file location
    const match = stack.match(/\/([^/]+):([0-9]+):[0-9]+/);
    const functionMatch = stack.match(/at\s+([^\s]+)/);
    
    return {
      fileName: match?.[1] || 'unknown',
      lineNumber: match?.[2] || '0',
      functionName: functionMatch?.[1]?.replace(/^Object\./, '') || 'anonymous'
    };
  }
}

/**
 * Formats console output with winston-dev-console inspired styling
 */
function formatLogMessage(
  level: string,
  message: string,
  _meta?: Record<string, unknown>,
  options: Required<ClientLoggerOptions> = defaultOptions
): { message: string; args: unknown[] } {
  const timestamp = new Date().toISOString();
  const caller = options.includeSourceLocation ? getCallerInfo() : null;
  
  // Level styling for browser console
  const levelStyles: Record<string, string> = {
    error: 'color: #dc2626; font-weight: bold',
    warn: 'color: #d97706; font-weight: bold', 
    info: 'color: #2563eb; font-weight: bold',
    debug: 'color: #059669; font-weight: bold'
  };
  
  let formattedMessage = `%c[${level.toUpperCase()}]%c ${message}`;
  const args: unknown[] = [
    levelStyles[level] || 'font-weight: bold',
    'font-weight: normal'
  ];
  
  // Add timestamp if enabled
  if (options.showTimestamps) {
    const timeOnly = timestamp.split('T')[1]?.split('.')[0] || '';
    formattedMessage += ` %c${timeOnly}%c`;
    args.push('color: #6b7280; font-size: 0.85em', 'color: inherit');
  }
  
  // Add source location if available
  if (caller && options.includeSourceLocation) {
    const location = `at ${caller.fileName}:${caller.lineNumber}`;
    const funcName = caller.functionName !== 'anonymous' ? ` [${caller.functionName}]` : '';
    formattedMessage += `\n%c   ${location}${funcName}%c`;
    args.push('color: #6b7280; font-style: italic; font-size: 0.9em', 'color: inherit');
  }
  
  // Add line separation if enabled
  if (options.addLineSeparation) {
    formattedMessage += '\n';
  }
  
  return { message: formattedMessage, args };
}

/**
 * Client-side console logger that provides structured logging with enhanced formatting
 * Safe for use in React components and browser environments
 */
export const clientLogger = {
  /**
   * Error level logging with optional error object
   * Enhanced with source location tracking and improved formatting
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
    
    const formatted = formatLogMessage('error', message, logMeta);
    console.error(formatted.message, ...formatted.args, logMeta);
  },

  /**
   * Warning level logging with enhanced formatting
   */
  warn: (message: string, context?: LogContext, meta?: Record<string, unknown>): void => {
    const logMeta = { 
      context, 
      clientSide: true,
      ...meta 
    };
    
    const formatted = formatLogMessage('warn', message, logMeta);
    console.warn(formatted.message, ...formatted.args, logMeta);
  },

  /**
   * Info level logging with enhanced formatting
   */
  info: (message: string, context?: LogContext, meta?: Record<string, unknown>): void => {
    const logMeta = { 
      context, 
      clientSide: true,
      ...meta 
    };
    
    const formatted = formatLogMessage('info', message, logMeta);
    console.info(formatted.message, ...formatted.args, logMeta);
  },

  /**
   * Debug level logging with enhanced formatting (only in development)
   */
  debug: (message: string, context?: LogContext, meta?: Record<string, unknown>): void => {
    if (clientLogEnv.NODE_ENV === 'development') {
      const logMeta = { 
        context, 
        clientSide: true,
        ...meta 
      };
      
      const formatted = formatLogMessage('debug', message, logMeta);
      console.debug(formatted.message, ...formatted.args, logMeta);
    }
  },

  /**
   * API request/response logging with enhanced formatting
   */
  apiRequest: (method: string, url: string, duration?: number, statusCode?: number): void => {
    const logMeta = {
      context: 'api' as LogContext,
      clientSide: true,
      method,
      url,
      duration,
      statusCode
    };
    
    const formatted = formatLogMessage('info', `${method} ${url}`, logMeta);
    console.info(formatted.message, ...formatted.args, logMeta);
  },

  /**
   * API error logging with request details and enhanced formatting
   */
  apiError: (method: string, url: string, error: Error, statusCode?: number): void => {
    const logMeta = {
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
    };
    
    const formatted = formatLogMessage('error', `API ERROR ${method} ${url}`, logMeta);
    console.error(formatted.message, ...formatted.args, logMeta);
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