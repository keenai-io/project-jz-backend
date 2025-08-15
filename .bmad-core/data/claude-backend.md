# Backend Development Guidelines

This file provides specialized guidance for backend development with Next.js 15, Server Actions, API routes, and data management.

## Core Philosophy

### KISS & Fail Fast Design

- Choose straightforward solutions over complex ones
- **Fail Fast**: Validate inputs early, throw errors immediately
- **MUST validate ALL external data**: API responses, form inputs, URL params, environment variables

## 🏗️ Backend Project Structure

```
project root
├── app/
│   ├── actions/           # Server Actions
│   │   ├── __tests__/         # Server action tests
│   │   └── [action].ts        # Individual server actions
│   ├── api/               # API routes
│   │   └── auth/              # NextAuth.js API routes
│   └── middleware.ts      # Next.js middleware
├── features/
│   └── [FeatureName]/
│       ├── application/       # Business logic & services
│       ├── domain/
│       │   ├── schemas/       # Zod validation schemas
│       │   └── types/         # Feature-specific TypeScript types
├── lib/                   # Core utilities and configurations
│   ├── env.ts             # Environment validation
│   ├── logger.server.ts   # Server-side logger
│   └── zod-error-formatter.ts # Error formatting utilities
├── auth.ts                # Auth.js v5 configuration
├── auth.config.ts         # Auth.js v5 config
```

## 🛡️ Data Validation with Zod (MANDATORY FOR ALL EXTERNAL DATA)

### MUST Follow These Validation Rules

- **MUST validate ALL external data**: API responses, form inputs, URL params, environment variables
- **MUST use branded types**: For all IDs and domain-specific values
- **MUST fail fast**: Validate at system boundaries, throw errors immediately
- **MUST use type inference**: Always derive TypeScript types from Zod schemas

### Schema Example (MANDATORY PATTERNS)

```typescript
import {z} from 'zod';

// MUST use branded types for ALL IDs
const UserIdSchema = z.string().uuid().brand<'UserId'>();
type UserId = z.infer<typeof UserIdSchema>;

// Environment validation (REQUIRED)
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);

// API response validation
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    error: z.string().optional(),
    timestamp: z.string().datetime(),
  });
```

## 🔐 Authentication & Security

### Auth.js v5 Configuration (MANDATORY FOR AUTHENTICATION)

**CRITICAL**: Auth.js v5 has significant breaking changes from v4.

#### MUST Follow These Auth.js v5 Patterns

- **MUST use the new `auth()` function** instead of `getServerSession`
- **MUST configure auth in `auth.ts`** at project root (not `[...nextauth].ts`)
- **MUST use middleware for route protection** instead of HOCs
- **MUST handle sessions with new API structure**

#### Auth.js v5 Configuration Example

```typescript
// auth.ts (project root)
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
```

```typescript
// auth.config.ts
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }
      return true
    },
  },
  providers: [], // Add providers here
} satisfies NextAuthConfig
```

#### Server-Side Auth Usage

```typescript
// Server Components & Actions
import { auth } from '@/auth'

export default async function Dashboard() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  return <div>Welcome {session.user.email}</div>
}

// Server Actions
'use server'
export async function getUserData() {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  // Proceed with authenticated logic
}
```

#### Middleware Configuration

```typescript
// middleware.ts
import { auth } from "@/auth"

export default auth((req) => {
  // req.auth contains the session
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### Environment Variables (Auth.js v5)

```typescript
// lib/env.ts - Update for Auth.js v5
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32), // Changed from NEXTAUTH_SECRET
  AUTH_URL: z.string().url(), // Changed from NEXTAUTH_URL
  // Provider-specific variables...
});
```

## 🔐 Security Requirements (MANDATORY)

### Input Validation (MUST IMPLEMENT ALL)

- **MUST sanitize ALL user inputs** with Zod before processing
- **MUST validate file uploads**: type, size, and content
- **MUST prevent XSS** with proper escaping
- **MUST implement CSRF protection** for forms
- **NEVER use dangerouslySetInnerHTML** without sanitization

### Environment Variables (MUST VALIDATE)

```typescript
// lib/env.ts
import {z} from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

## 🔄 Server Actions Integration

### Server Actions Pattern

```typescript
// Server Action
'use server'
export async function saveUserData(data: UserData): Promise<void> {
  const session = await auth()
  if (!session?.user?.email) {
    redirect('/signin')
  }

  const validatedData = UserDataSchema.parse(data)
  await saveToDatabase(validatedData)
}
```

## 📝 Server-Side Logging (MANDATORY)

### MUST Follow These Logging Rules

- **NEVER use `console.log`, `console.error`, or `console.warn`** - Use structured loggers
- **MUST use server logger** for all server-side code
- **MUST provide context** for all log messages using available LogContext values
- **MUST handle errors with structured logging** - never swallow errors silently

### Server Logger Usage

Use `@/lib/logger.server` in:
- Server actions (`'use server'` directive)
- API route handlers (`app/api/**/route.ts`)
- Middleware (`middleware.ts`)
- Server components (when logging is needed)
- Server-side utilities

```typescript
import { serverLogger } from '@/lib/logger.server';

// Server action example
'use server'
export async function createUser(userData: UserData): Promise<void> {
  try {
    const user = await db.user.create({ data: userData });
    serverLogger.info('User created successfully', 'auth', { userId: user.id });
  } catch (error) {
    serverLogger.error('Failed to create user', error instanceof Error ? error : new Error(String(error)), 'auth', { userData: userData.email });
    throw new Error('User creation failed');
  }
}

// API route example
export async function POST(request: Request): Promise<Response> {
  try {
    const data = await request.json();
    // Process data
    serverLogger.info('API request processed', 'api', { endpoint: '/api/users' });
    return Response.json({ success: true });
  } catch (error) {
    serverLogger.error('API request failed', error instanceof Error ? error : new Error(String(error)), 'api', { endpoint: '/api/users' });
    return Response.json({ error: 'Request failed' }, { status: 500 });
  }
}
```

**Server Logger API:**
```typescript
serverLogger.error(message: string, error: Error, context?: LogContext, meta?: Record<string, unknown>)
serverLogger.warn(message: string, context?: LogContext, meta?: Record<string, unknown>)
serverLogger.info(message: string, context?: LogContext, meta?: Record<string, unknown>)
serverLogger.debug(message: string, context?: LogContext, meta?: Record<string, unknown>)

// Specialized methods
serverLogger.apiRequest(method: string, url: string, duration?: number, statusCode?: number)
serverLogger.apiError(method: string, url: string, error: Error, statusCode?: number)
serverLogger.fileProcessing(fileName: string, action: string, result?: 'success' | 'error', meta?: Record<string, unknown>)
serverLogger.categorization(action: string, productCount?: number, duration?: number, success?: boolean)
```

### Error Handling with Loggers

```typescript
// ✅ CORRECT: Server action error handling
export async function serverAction(): Promise<void> {
  try {
    await someOperation();
  } catch (error) {
    // Handle NextAuth redirects properly
    if (error && typeof error === 'object' && 'digest' in error && 
        typeof error.digest === 'string' && error.digest.includes('NEXT_REDIRECT')) {
      throw error; // Re-throw redirect errors
    }
    serverLogger.error('Operation failed', error instanceof Error ? error : new Error(String(error)), 'system');
    throw new Error('Operation failed');
  }
}
```

### Log Contexts (MUST USE APPROPRIATE CONTEXT)

Available contexts for server logger:
- `'api'` - API routes, external API calls
- `'auth'` - Authentication, authorization
- `'db'` - Database operations
- `'file'` - File operations, uploads, processing
- `'categorization'` - Product categorization logic
- `'system'` - System-level operations, startup, configuration
- `'query'` - TanStack Query operations
- `'configuration'` - Configuration management

## 🔄 Server State Pattern (TanStack Query Server Integration)

```typescript
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';

function useUser(id: UserId) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await fetch(`/api/users/${id}`);

      if (!response.ok) {
        throw new ApiError('Failed to fetch user', response.status);
      }

      const data = await response.json();
      return userSchema.parse(data);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: UpdateUserData) => {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new ApiError('Failed to update user', response.status);
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({queryKey: ['user']});
    },
  });
}
```

## Backend FORBIDDEN Practices

- ❌ **NEVER trust external data** without Zod validation
- ❌ **NEVER use `console.log`** - use structured server logger
- ❌ **NEVER ignore TypeScript errors** with `@ts-ignore`
- ❌ **NEVER store sensitive data** in localStorage or client state
- ❌ **NEVER use dangerouslySetInnerHTML** without sanitization
- ❌ **NEVER skip authentication checks** in protected routes
- ❌ **NEVER log sensitive data** - passwords, tokens, API keys, or PII
- ❌ **NEVER use `any` type** - use proper typing or `unknown`

## Backend Checklist

- [ ] All external data validated with Zod schemas
- [ ] Server logger used instead of console methods
- [ ] Authentication implemented with Auth.js v5 patterns
- [ ] Environment variables validated
- [ ] Proper error handling with structured logging
- [ ] Security measures implemented (input validation, CSRF protection)
- [ ] Server Actions properly typed and authenticated
- [ ] API routes follow response schema patterns
- [ ] Middleware configured for route protection
- [ ] No sensitive data in logs

---

*Specialized for backend development with Next.js 15 + Server Actions*
*For complete guidelines, see main CLAUDE.md*