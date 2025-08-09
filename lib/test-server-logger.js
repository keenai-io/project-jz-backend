/**
 * Quick test for server logger to verify Winston colorization works
 * Run with: node lib/test-server-logger.js
 */

const { default: serverLogger } = require('./logger.server.ts');

console.log('🧪 Testing Server Logger...');

// Test all log levels
serverLogger.info('Server logger info test', 'system', { testType: 'node-script' });
serverLogger.warn('Server logger warning test', 'system');
serverLogger.error('Server logger error test', new Error('Test error'), 'system');
serverLogger.debug('Server logger debug test', 'system');

// Test specialized methods
serverLogger.apiRequest('GET', '/test-api', 150, 200);
serverLogger.categorization('test-categorization', 5, 1000, true);

console.log('✅ Server logger test completed!');