# Logging System for Marketplace AI

A comprehensive, type-safe logging solution with separate client and server loggers, designed for Next.js 15 applications.

## Features

- ✅ **Environment-aware configuration** - Different settings for dev, test, and production
- ✅ **Client-safe design** - Dynamic Winston import prevents file system errors in browser
- ✅ **Type-safe logging contexts** - Predefined contexts for different application areas
- ✅ **Structured logging** - Consistent JSON output with metadata
- ✅ **File and console outputs** - Console for development, files for production (server-only)
- ✅ **Performance tracking** - Built-in timing for API calls and operations
- ✅ **Error handling** - Proper error object handling and stack traces
- ✅ **Zod validation** - Environment variables validated at startup

## Quick Start

### Client Components (Browser)
```typescript
import clientLogger from '@/lib/logger.client';

// Use in React components and client-side code
clientLogger.info('User clicked button', 'ui', { buttonId: 'submit' });
clientLogger.error('Form validation failed', error, 'ui');
```

### Server Actions & API Routes
```typescript
import serverLogger from '@/lib/logger.server';

// Use in server actions, API routes, and Node.js code
serverLogger.info('User authenticated', 'auth', { userId: '123' });
serverLogger.apiRequest('POST', '/api/products', 250, 201);
```

### Important Usage Rules
- **Never import `logger.server.ts` in client components** - it contains Winston and will cause fs module errors
- **Always use `logger.client.ts` in client-side code** - it's browser-safe
- **Use `logger.server.ts` only in server actions and API routes** - it has full Winston functionality

## Configuration

Set environment variables to control logging behavior:

```bash
# Logging level (error, warn, info, debug)
LOG_LEVEL=info

# Custom log file path
LOG_FILE=logs/custom.log

# Environment (development, test, production)
NODE_ENV=production
```

## Log Contexts

- `api` - API requests and responses
- `auth` - Authentication and authorization
- `db` - Database operations
- `file` - File processing operations
- `categorization` - Product categorization processes
- `ui` - User interface events
- `system` - General system events

## Output Formats

### Development
```
[2025-01-08 10:30:45.123] INFO  User authentication successful
{
  "context": "auth",
  "userId": "user-123",
  "method": "email"
}
```

### Production
```json
{
  "timestamp": "2025-01-08 10:30:45.123",
  "level": "info",
  "message": "User authentication successful",
  "service": "marketplace-ai",
  "environment": "production",
  "context": "auth",
  "userId": "user-123",
  "method": "email"
}
```

## File Outputs

In production **server-side only**, logs are written to:
- `logs/app.log` - All log levels
- `logs/error.log` - Error level only

Files are automatically rotated:
- Maximum 10MB per file
- Keep 5 historical files
- JSON format for easy parsing

## Client vs Server Logging

The logger automatically detects the environment and adapts:

### Server-side (Node.js)
- File logging enabled in production
- Full Winston features available
- Performance optimized for server workloads

### Client-side (Browser)
- Console logging only (file system not available)
- Logs marked with `clientSide: true` for identification
- Reduced overhead for browser performance

```typescript
// This works the same in both environments
appLogger.info('User action completed', 'ui', { action: 'file_upload' });

// Server output: logs to file + console
// Client output: console only with clientSide flag
```

## Integration Examples

### Server Actions
```typescript
import appLogger from '@/lib/logger';

export async function myServerAction() {
  try {
    appLogger.info('Starting server action', 'api');
    // ... your code
    appLogger.info('Server action completed', 'api');
  } catch (error) {
    appLogger.error('Server action failed', error, 'api');
  }
}
```

### API Routes
```typescript
import appLogger from '@/lib/logger';

export async function GET(request: Request) {
  const start = Date.now();
  try {
    // ... your code
    const duration = Date.now() - start;
    appLogger.apiRequest('GET', request.url, duration, 200);
  } catch (error) {
    appLogger.apiError('GET', request.url, error);
  }
}
```

## Testing

Test the loggers to verify they work correctly:

```bash
# Test both client and server loggers
npx tsx lib/test-loggers.ts

# Test server logger only (Node.js)
node lib/test-server-logger.js
```

## Best Practices

1. **Use appropriate log levels**: Error for failures, warn for issues, info for events, debug for development
2. **Include context**: Always specify the context parameter for better log organization
3. **Add metadata**: Include relevant data in the metadata object for debugging
4. **Don't log sensitive data**: Avoid logging passwords, tokens, or personal information
5. **Use structured data**: Pass objects instead of concatenating strings

## Performance

The logger is optimized for production use:
- Minimal overhead in production
- Async file writing
- Log level filtering
- Silent in test environment