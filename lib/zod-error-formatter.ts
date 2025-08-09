import {ZodError} from 'zod';

/**
 * Formats a Zod error into a human-readable message with improved stack trace readability
 *
 * @param error - The ZodError to format
 * @param options - Formatting options
 * @returns A human-readable error message with enhanced formatting
 */
export function formatZodError(
  error: ZodError,
  options: {
    /** Include the field path in the message @default true */
    includePath?: boolean;
    /** Maximum number of errors to show @default 5 */
    maxErrors?: number;
    /** Prefix for each error message @default "• " */
    bulletPoint?: string;
    /** Include error codes for debugging @default false */
    includeErrorCode?: boolean;
    /** Group errors by path for better readability @default true */
    groupByPath?: boolean;
  } = {}
): string {
  const {
    includePath = true,
    maxErrors = 5,
    bulletPoint = '• ',
    includeErrorCode = false,
    groupByPath = true
  } = options;

  const issues = error.issues.slice(0, maxErrors);
  const hasMore = error.issues.length > maxErrors;

  // Group errors by path for better organization
  const groupedIssues = groupByPath ? groupIssuesByPath(issues) : null;

  const messages = groupedIssues
    ? formatGroupedIssues(groupedIssues, includePath, includeErrorCode, bulletPoint)
    : formatIndividualIssues(issues, includePath, includeErrorCode, bulletPoint);

  let result = messages.join('\n');

  if (hasMore) {
    const remainingCount = error.issues.length - maxErrors;
    result += `\n${bulletPoint}... and ${remainingCount} more validation error${remainingCount === 1 ? '' : 's'}`;
  }

  return result;
}

/**
 * Groups Zod issues by their path for better organization
 * @param issues - Array of Zod issues
 * @returns Map of path strings to arrays of issues
 */
function groupIssuesByPath(issues: ZodError['issues']): Map<string, ZodError['issues']> {
  const grouped = new Map<string, ZodError['issues']>();

  for (const issue of issues) {
    const pathKey = issue.path.length > 0 ? issue.path.join('.') : '_root';
    const existingIssues = grouped.get(pathKey) || [];
    grouped.set(pathKey, [...existingIssues, issue]);
  }

  return grouped;
}

/**
 * Formats grouped issues with enhanced readability
 * @param groupedIssues - Map of grouped issues
 * @param includePath - Whether to include path information
 * @param includeErrorCode - Whether to include error codes
 * @param bulletPoint - Bullet point character
 * @returns Array of formatted message strings
 */
function formatGroupedIssues(
  groupedIssues: Map<string, ZodError['issues']>,
  includePath: boolean,
  includeErrorCode: boolean,
  bulletPoint: string
): string[] {
  const messages: string[] = [];

  for (const [pathKey, issues] of groupedIssues) {
    const pathDisplay = pathKey === '_root' ? 'Root level' : pathKey;

    if (includePath && issues.length > 1) {
      messages.push(`\n📍 Issues at ${pathDisplay}:`);

      for (const issue of issues) {
        const formatted = formatSingleIssue(issue, false, includeErrorCode);
        messages.push(`  ${bulletPoint}${formatted}`);
      }
    } else {
      for (const issue of issues) {
        const formatted = formatSingleIssue(issue, includePath, includeErrorCode);
        messages.push(`${bulletPoint}${formatted}`);
      }
    }
  }

  return messages;
}

/**
 * Formats individual issues without grouping
 * @param issues - Array of Zod issues
 * @param includePath - Whether to include path information
 * @param includeErrorCode - Whether to include error codes
 * @param bulletPoint - Bullet point character
 * @returns Array of formatted message strings
 */
function formatIndividualIssues(
  issues: ZodError['issues'],
  includePath: boolean,
  includeErrorCode: boolean,
  bulletPoint: string
): string[] {
  return issues.map(issue => {
    const formatted = formatSingleIssue(issue, includePath, includeErrorCode);
    return `${bulletPoint}${formatted}`;
  });
}

/**
 * Formats a single Zod issue with enhanced readability
 * @param issue - Single Zod issue
 * @param includePath - Whether to include path information
 * @param includeErrorCode - Whether to include error codes
 * @returns Formatted message string
 */
function formatSingleIssue(
  issue: ZodError['issues'][0],
  includePath: boolean,
  includeErrorCode: boolean
): string {
  const path = issue.path.length > 0 ? issue.path.join('.') : '';
  const pathPrefix = includePath && path ? `🔗 ${path}: ` : '';
  const errorCode = includeErrorCode ? ` [${issue.code}]` : '';

  // Enhanced message formatting with emojis and better descriptions
  const message = enhanceErrorMessage(issue);

  // Add received value context for better debugging
  let valueContext = '';
  if ('received' in issue && issue.received !== undefined) {
    const receivedValue = typeof issue.received === 'string' && issue.received.length > 50
      ? `${issue.received.substring(0, 50)}...`
      : String(issue.received);
    valueContext = ` (received: ${receivedValue})`;
  }

  return `${pathPrefix}${message}${valueContext}${errorCode}`;
}

/**
 * Enhances Zod error messages with better descriptions and emojis
 * @param issue - Zod issue to enhance
 * @returns Enhanced error message
 */
function enhanceErrorMessage(issue: ZodError['issues'][0]): string {
  let message = issue.message;

  // Handle specific error codes with enhanced messages and emojis
  switch (issue.code) {
    case 'invalid_type':
      if ('expected' in issue && 'received' in issue) {
        message = `❌ Expected ${issue.expected} but received ${issue.received}`;
      }
      break;
    case 'too_small':
      if ('minimum' in issue) {
        message = `📏 Value must be at least ${issue.minimum} ${issue.inclusive ? '(inclusive)' : '(exclusive)'}`;
      }
      break;
    case 'too_big':
      if ('maximum' in issue) {
        message = `📏 Value must be at most ${issue.maximum} ${issue.inclusive ? '(inclusive)' : '(exclusive)'}`;
      }
      break;
    case 'invalid_union':
      message = `🔄 Value doesn't match any of the expected formats`;
      break;
    case 'custom':
      // Keep custom messages as-is but add an emoji
      message = `⚠️  ${message}`;
      break;
    default:
      // Generic cleanup for other messages based on message content
      if (message.includes('Invalid email')) {
        message = `📧 ${message}`;
      } else if (message.includes('Invalid url')) {
        message = `🌐 ${message}`;
      } else if (message.includes('Invalid date')) {
        message = `📅 ${message}`;
      } else if (message.includes('Invalid string')) {
        message = `📝 ${message}`;
      } else if (message.includes('Invalid enum value')) {
        message = `🎯 ${message}`;
      } else if (message.includes('Invalid input')) {
        message = `❌ ${message.replace('Invalid input: ', '')}`;
      } else if (message.includes('expected') && message.includes('received')) {
        message = message.replace('expected', '❌ Expected').replace('received', 'but received');
      } else if (!message.includes('❌') && !message.includes('📝') && !message.includes('🎯')) {
        message = `❌ ${message}`;
      }
  }

  return message;
}

/**
 * Creates a formatted error message for validation failures
 *
 * @param context - Context where the validation failed (e.g., 'Product data', 'API request')
 * @param error - The ZodError that occurred
 * @param options - Formatting options
 * @returns A complete error message with context
 */
export function createValidationErrorMessage(
  context: string,
  error: ZodError,
  options?: Parameters<typeof formatZodError>[1]
): string {
  const formattedErrors = formatZodError(error, {
    groupByPath: true,
    includeErrorCode: false,
    ...options
  });
  return `🚫 ${context} validation failed:\n\n${formattedErrors}`;
}

/**
 * Formats FastAPI-style validation errors into human-readable messages
 *
 * @param errorDetails - Array of FastAPI error detail objects
 * @param options - Formatting options
 * @returns A formatted error message
 */
export function formatFastApiError(
  errorDetails: Array<{
    type: string;
    loc: (string | number)[];
    msg: string;
    input?: unknown;
  }>,
  options: {
    bulletPoint?: string;
    includePath?: boolean;
    maxErrors?: number;
  } = {}
): string {
  const {bulletPoint = '• ', includePath = true, maxErrors = 5} = options;

  const details = errorDetails.slice(0, maxErrors);
  const hasMore = errorDetails.length > maxErrors;

  const messages = details.map(detail => {
    const location = includePath && detail.loc.length > 0
      ? `${detail.loc.join('.')}: `
      : '';

    // Make common FastAPI messages more user-friendly
    let message = detail.msg;
    if (message === 'Input should be a valid list') {
      message = 'Expected an array but received an object';
    } else if (message.includes('field required')) {
      message = 'This field is required';
    }

    return `${location}${message}`;
  });

  let result = messages.map(msg => `${bulletPoint}${msg}`).join('\n');

  if (hasMore) {
    const remainingCount = errorDetails.length - maxErrors;
    result += `\n${bulletPoint}... and ${remainingCount} more validation error${remainingCount === 1 ? '' : 's'}`;
  }

  return result;
}

/**
 * Safely formats any error into a human-readable message
 * Handles ZodError, FastAPI errors, regular Error, and unknown error types
 *
 * @param error - The error to format
 * @param context - Optional context for the error
 * @returns A human-readable error message
 */
export function formatError(error: unknown, context?: string): string {
  const prefix = context ? `${context}: ` : '';

  if (error instanceof ZodError) {
    return `${prefix}Validation failed:\n${formatZodError(error)}`;
  }

  // Handle FastAPI error format
  if (typeof error === 'object' && error !== null && 'detail' in error) {
    const errorObj = error as { detail: never };
    if (Array.isArray(errorObj.detail)) {
      return `${prefix}API validation failed:\n${formatFastApiError(errorObj.detail)}`;
    }
  }

  if (error instanceof Error) {
    return `${prefix}${error.message}`;
  }

  if (typeof error === 'string') {
    return `${prefix}${error}`;
  }

  return `${prefix}An unknown error occurred`;
}