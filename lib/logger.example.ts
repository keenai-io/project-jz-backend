/**
 * Example usage of the Winston logger
 * 
 * This file demonstrates how to use the logger throughout the application
 * Run with: npx tsx lib/logger.example.ts
 */

import appLogger from './logger';

function demonstrateLogger(): void {
  console.log('🚀 Winston Logger Demo\n');

  // Basic logging levels
  appLogger.error('This is an error message', new Error('Sample error'), 'system');
  appLogger.warn('This is a warning message', 'system');
  appLogger.info('This is an info message', 'system');
  appLogger.debug('This is a debug message (only visible in development)', 'system');

  // Context-specific logging
  appLogger.info('User authentication successful', 'auth', {
    userId: 'user-123',
    method: 'email',
    timestamp: new Date().toISOString()
  });

  // API logging
  appLogger.apiRequest('GET', '/api/products', 245, 200);
  appLogger.apiError('POST', '/api/orders', new Error('Validation failed'), 400);

  // File processing
  appLogger.fileProcessing('products.xlsx', 'upload', 'success', {
    fileSize: 1024000,
    rowCount: 150
  });

  // Categorization specific logging
  appLogger.categorization('batch processing', 25, 3000, true);

  console.log('\n✅ Logger demonstration complete!');
  console.log('Check logs/ directory for file outputs in production');
}

// Run the demo
demonstrateLogger();