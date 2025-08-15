# Architecture & Design Guidelines

This file provides specialized guidance for system architecture, design patterns, and project structure decisions.

## Core Architecture Philosophy

### Design Principles

- **Dependency Inversion**: High-level modules should not depend on low-level modules. Both should depend on abstractions.
- **Open/Closed Principle**: Software entities should be open for extension but closed for modification.
- **Vertical Slice Architecture**: Organize by features, not layers
- **Component-First**: Build with reusable, composable components with single responsibility
- **Fail Fast**: Validate inputs early, throw errors immediately

### Context Awareness

- When implementing features, always check existing patterns first
- Prefer composition over inheritance in all designs
- Use existing utilities before creating new ones
- Check for similar functionality in other domains/features

## 🏗️ Project Structure (Vertical Slice Architecture)

### Recommended Project Structure

```
project root
├── app/                   # Next.js App Router
│   ├── components/            # Shared UI components
│   │   ├── ui/                # Base Tailwind Catalyst components
│   │   ├── common/            # Application-specific shared components
│   │   ├── error-boundaries/  # Error boundary components
│   │   └── providers/         # React context providers
│   ├── [locale]/          # Locale-specific routes used by next-intlayer
│   │   ├── layout.content.ts  # next-intlayer translations for layout 
│   │   ├── layout.tsx         # Locale-aware layout
│   │   ├── ClientLayout.tsx   # Client-side layout wrapper
│   │   ├── page.tsx           # Home page
│   │   ├── page.content.ts    # Home translations
│   │   └── [routes]/          # Feature-specific route groups
│   ├── actions/           # Server Actions
│   │   ├── __tests__/         # Server action tests
│   │   └── [action].ts        # Individual server actions
│   ├── api/               # API routes
│   │   └── auth/              # NextAuth.js API routes
│   ├── layout.tsx         # Root layout
│   ├── favicon.ico   
│   └── globals.css        # Global styles
├── features/              # Feature-based modules (RECOMMENDED)
│   └── [FeatureName]/
│       ├── __tests__/         # Co-located tests
│       ├── presentation/      # Feature components
│       │   └── [Component].content.ts # co-located next-intlayer translations
│       ├── hooks/             # Feature-specific hooks
│       ├── application/       # Business logic & services
│       ├── domain/
│       │   ├── schemas/       # Zod validation schemas
│       │   └── types/         # Feature-specific TypeScript types
│       └── index.ts           # Public API
├── lib/                   # Core utilities and configurations
│   ├── env.ts             # Environment validation
│   ├── logger.client.ts   # Client-side logger
│   ├── logger.server.ts   # Server-side logger
│   ├── query-client.ts    # TanStack Query client
│   ├── query-invalidation.ts # Query cache management
│   └── zod-error-formatter.ts # Error formatting utilities
├── types/                 # Shared TypeScript types
│   ├── auth.ts            # Authentication types
│   ├── api.ts             # API response types
│   └── common.ts          # Common application types
├── test/                  # Test configuration
│   └── setup.ts           # Vitest setup
├── public/                # Public assets
├── auth.ts                # Auth.js v5 configuration
├── auth.config.ts         # Auth.js v5 config
├── middleware.ts          # Next.js middleware
├── intlayer.config.ts     # Intlayer i18n configuration
├── vitest.config.ts       # Vitest configuration
└── tsconfig.json          # TypeScript configuration
```

## 🧱 Code Structure & Modularity

### File and Component Limits

- **Never create a file longer than 500 lines of code.** If approaching this limit, refactor by splitting into modules or helper files.
- **Components should be under 200 lines** for better maintainability.
- **Functions should be short and focused sub 50 lines** and have a single responsibility.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.

### Feature-Based Organization

Each feature should be self-contained with:

```
features/UserManagement/
├── __tests__/
│   ├── UserProfile.test.tsx
│   ├── useUserData.test.ts
│   └── userService.test.ts
├── presentation/
│   ├── UserProfile.tsx
│   ├── UserProfile.content.ts
│   ├── UserList.tsx
│   └── components/
├── hooks/
│   ├── useUserData.ts
│   └── useUserMutations.ts
├── application/
│   ├── userService.ts
│   └── userQueries.ts
├── domain/
│   ├── schemas/
│   │   └── userSchemas.ts
│   └── types/
│       └── userTypes.ts
└── index.ts  # Public exports
```

## 🎯 TypeScript Configuration (STRICT REQUIREMENTS)

### MUST Follow These Compiler Options

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{"name": "next"}],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@components/*": ["./app/components/*"],
      "@features/*": ["./features/*"],
      "@lib/*": ["./lib/*"]
    }
  }
}
```

### MANDATORY Type Requirements

- **NEVER use `any` type** - use `unknown` if type is truly unknown
- **MUST have explicit return types** for all functions and components
- **MUST use proper generic constraints** for reusable components
- **MUST use type inference from Zod schemas** using `z.infer<typeof schema>`
- **NEVER use `@ts-ignore`** or `@ts-expect-error` - fix the type issue properly

## 🔄 State Management Architecture (STRICT HIERARCHY)

### MUST Follow This State Hierarchy

1. **Local State**: `useState` ONLY for component-specific state
2. **Context**: For cross-component state within a single feature
3. **URL State**: MUST use search params for shareable state
4. **Server State**: MUST use TanStack Query for ALL API data
5. **Global State**: Zustand ONLY when truly needed app-wide

### State Management Decision Tree

```
Is the state component-specific?
├─ YES → Use useState
└─ NO
   └─ Is it shared within a feature?
      ├─ YES → Use React Context
      └─ NO
         └─ Should it be shareable via URL?
            ├─ YES → Use search params
            └─ NO
               └─ Is it server data?
                  ├─ YES → Use TanStack Query
                  └─ NO → Use Zustand (rarely needed)
```

### Context Pattern

```typescript
// Feature-specific context
interface UserFeatureContextType {
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
}

const UserFeatureContext = createContext<UserFeatureContextType | undefined>(undefined);

export function UserFeatureProvider({ children }: { children: React.ReactNode }) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  return (
    <UserFeatureContext.Provider value={{
      selectedUserId,
      setSelectedUserId,
      viewMode,
      setViewMode
    }}>
      {children}
    </UserFeatureContext.Provider>
  );
}

export function useUserFeature() {
  const context = useContext(UserFeatureContext);
  if (!context) {
    throw new Error('useUserFeature must be used within UserFeatureProvider');
  }
  return context;
}
```

## 🔄 Query Architecture Patterns

### Query Key Patterns

**MUST use consistent query key naming**:

```typescript
// ✅ CORRECT - Hierarchical and descriptive
export const queryKeys = {
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  userPosts: (id: string) => ['users', id, 'posts'] as const,
  configurations: ['configurations'] as const,
  userConfiguration: ['userConfiguration'] as const,
}

// Usage
const { data } = useQuery({
  queryKey: queryKeys.user('123'),
  queryFn: () => getUser('123')
})
```

### Query Hook Architecture

```typescript
// Base query hook
export function useUserData() {
  return useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      serverLogger.info('Fetching user data', 'api')
      const data = await getUserDataFromAPI()
      serverLogger.info('User data fetched', 'api', { hasData: !!data })
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    select: (data) => data ?? null,
  })
}

// Mutation hook
export function useUserDataMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userData: UserData) => {
      await saveUserDataToAPI(userData)
      return userData
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['userData'] })
      const previousData = queryClient.getQueryData(['userData'])
      queryClient.setQueryData(['userData'], newData)
      return { previousData }
    },
    onError: (error, newData, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['userData'], context.previousData)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userData'] })
    },
  })
}
```

## 🚀 Performance Architecture

### Bundle Optimization Strategy

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      // Turbopack configuration
    },
  },
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  webpack: (config, {dev, isServer}) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
    }
    return config;
  },
};

module.exports = nextConfig;
```

### Component Architecture Patterns

```typescript
// Lazy loading for large components
const LazyDashboard = lazy(() => import('./Dashboard'));

function App() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <LazyDashboard />
    </Suspense>
  );
}

// Dynamic imports for feature modules
const FeatureModule = dynamic(
  () => import('@features/ComplexFeature'),
  { 
    loading: () => <FeatureSkeleton />,
    ssr: false // Client-side only if needed
  }
);
```

## 🛡️ Error Architecture Patterns

### Error Boundary Structure

```typescript
// Feature-level error boundary
export class FeatureErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactElement },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; fallback?: ReactElement }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    serverLogger.error('Feature error boundary caught error', error, 'ui', { errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <FeatureErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

### Error Handling Architecture

```typescript
// Centralized error types
export class ApiError extends Error {
  constructor(message: string, public statusCode: number, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Error handling utility
export function handleError(error: unknown, context: LogContext): never {
  if (error instanceof ApiError) {
    serverLogger.error(`API Error: ${error.message}`, error, context, { statusCode: error.statusCode });
  } else if (error instanceof ValidationError) {
    serverLogger.error(`Validation Error: ${error.message}`, error, context, { field: error.field });
  } else {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    serverLogger.error(`Unexpected Error: ${errorObj.message}`, errorObj, context);
  }
  
  throw error;
}
```

## Architecture FORBIDDEN Practices

- ❌ **Don't create circular dependencies** between features
- ❌ **Don't exceed file size limits** (500 lines per file)
- ❌ **Don't mix concerns** - keep business logic separate from UI
- ❌ **Don't create god components** - break down large components
- ❌ **Don't prop drill** beyond 2 levels - use context or state management
- ❌ **Don't create tightly coupled modules** - use dependency injection
- ❌ **Don't ignore the state hierarchy** - follow prescribed patterns
- ❌ **Don't create duplicate functionality** across features

## Architecture Checklist

- [ ] Features organized in vertical slices
- [ ] Files under size limits (500 lines, 200 for components)
- [ ] Clear separation of concerns (presentation/application/domain)
- [ ] Proper TypeScript configuration with strict settings
- [ ] State management follows hierarchy (local → context → URL → server → global)
- [ ] Error boundaries implemented at feature level
- [ ] Query keys follow consistent naming conventions
- [ ] Dependencies properly abstracted and injected
- [ ] No circular dependencies between features
- [ ] Performance optimizations in place (lazy loading, code splitting)

---

*Specialized for architecture and design patterns*
*For complete guidelines, see main CLAUDE.md*