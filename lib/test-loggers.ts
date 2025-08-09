/**
 * Test script to verify both client and server loggers work correctly
 * 
 * Client logger: Safe for browser use, console-based output
 * Server logger: Winston-based with file output (server-side only)
 */

// Test client logger (always safe to import)
import clientLogger from './logger.client';

console.log('🧪 Testing Client Logger (Browser-Safe)');
clientLogger.info('Client logger test', 'system', { testType: 'client' });
clientLogger.warn('Client warning test', 'system');
clientLogger.error('Client error test', new Error('Test error'), 'system');

// Test server logger (only safe on server-side)
// This will only work when running in Node.js environment
if (typeof window === 'undefined') {
  console.log('\n🧪 Testing Server Logger (Server-Only)');
  
  // Dynamic import to prevent client-side bundling issues
  import('./logger.server').then(({ default: serverLogger }) => {
    serverLogger.info('Server logger test', 'system', { testType: 'server' });
    serverLogger.warn('Server warning test', 'system');
    serverLogger.error('Server error test', new Error('Test error'), 'system');
    serverLogger.apiRequest('GET', '/test', 100, 200);
    
    console.log('✅ All logger tests completed!');
  }).catch((error) => {
    console.error('❌ Server logger test failed:', error);
  });
} else {
  console.log('\n⚠️ Skipping server logger test (browser environment)');
  console.log('✅ Client logger test completed!');
}