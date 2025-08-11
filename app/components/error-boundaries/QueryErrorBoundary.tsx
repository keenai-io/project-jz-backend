'use client'

import { ReactElement, ReactNode, ErrorInfo } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { Button } from '@components/ui/button';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/16/solid';
import clientLogger from '@/lib/logger.client';

interface QueryErrorBoundaryProps {
  children: ReactNode;
  /** Optional fallback component for specific error handling */
  fallback?: ReactElement;
  /** Optional callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Error Fallback Component for Query Errors
 * 
 * Provides a user-friendly error display with retry functionality
 * specifically designed for TanStack Query errors.
 */
function QueryErrorFallback({ error, resetErrorBoundary }: FallbackProps): ReactElement {
  // Determine error type and show appropriate message
  const isNetworkError = error.message.includes('fetch') || 
                        error.message.includes('network') ||
                        error.message.includes('Failed to fetch');
                        
  const isValidationError = error.message.includes('validation') || 
                           error.message.includes('invalid') ||
                           error.message.includes('schema');

  const getErrorMessage = (): string => {
    if (isNetworkError) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }
    
    if (isValidationError) {
      return 'There was an issue with the data format. Please refresh the page or contact support if the problem persists.';
    }
    
    // Generic error message
    return 'Something went wrong while loading the data. Please try again.';
  };

  const getErrorTitle = (): string => {
    if (isNetworkError) {
      return 'Connection Error';
    }
    
    if (isValidationError) {
      return 'Data Error';
    }
    
    return 'Error Loading Data';
  };

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
      <div className="flex flex-col items-center max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        
        <div className="space-y-2">
          <Heading level={3} className="text-gray-900 dark:text-gray-100">
            {getErrorTitle()}
          </Heading>
          <Text className="text-gray-600 dark:text-gray-400">
            {getErrorMessage()}
          </Text>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="w-full">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              Technical Details
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-left overflow-auto max-h-32">
              {error.message}
            </pre>
          </details>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={resetErrorBoundary}
            color="blue"
            className="flex items-center gap-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Try Again
          </Button>
          
          <Button 
            onClick={() => window.location.reload()}
            outline
          >
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Query Error Boundary Component
 * 
 * Wraps components that use TanStack Query and provides graceful error handling
 * with automatic error logging and user-friendly error displays.
 */
export function QueryErrorBoundary({ 
  children, 
  fallback, 
  onError 
}: QueryErrorBoundaryProps): ReactElement {
  const handleError = (error: Error, errorInfo: ErrorInfo): void => {
    // Log the error
    clientLogger.error('Query Error Boundary caught error', error, 'query', {
      componentStack: errorInfo.componentStack || '',
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack
    });
    
    // Call custom error handler if provided
    onError?.(error, errorInfo);
  };

  return (
    <ErrorBoundary
      FallbackComponent={fallback ? () => fallback : QueryErrorFallback}
      onError={handleError}
      onReset={() => {
        // Clear any stale query cache if needed
        // This could trigger a refetch of failed queries
        clientLogger.info('Query Error Boundary reset', 'query');
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Lightweight Query Error Boundary for specific components
 * 
 * Use this for wrapping individual query-dependent components
 * where you want minimal error handling.
 */
export function LightQueryErrorBoundary({ children }: { children: ReactNode }): ReactElement {
  return (
    <QueryErrorBoundary
      fallback={
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          <Text>Unable to load this content. Please try refreshing the page.</Text>
        </div>
      }
    >
      {children}
    </QueryErrorBoundary>
  );
}