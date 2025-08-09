/**
 * Quick test to verify the logger works correctly
 * This can be run in both server and client environments
 */

import appLogger from './logger';

export function testLogger(): void {
  console.log('🧪 Testing logger in current environment...\n');

  // Test basic logging
  appLogger.info('Logger test started', 'system');
  appLogger.warn('Test warning message', 'system');
  appLogger.debug('Debug message (dev only)', 'system');

  // Test with metadata
  appLogger.info('Test with metadata', 'system', {
    testData: 'example',
    timestamp: new Date().toISOString()
  });

  // Test error logging
  try {
    throw new Error('Test error for logging');
  } catch (error) {
    appLogger.error('Caught test error', error as Error, 'system');
  }

  // Test specialized methods
  appLogger.apiRequest('GET', '/api/test', 100, 200);
  appLogger.fileProcessing('test.xlsx', 'validation', 'success', { rows: 10 });
  appLogger.categorization('test batch', 5, 2000, true);

  console.log('\n✅ Logger test completed!');
  console.log(`Environment: ${typeof window === 'undefined' ? 'Server' : 'Client'}`);
}