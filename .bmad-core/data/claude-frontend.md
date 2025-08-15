# Frontend Development Guidelines

This file provides specialized guidance for frontend development with Next.js 15, React 19, and TypeScript.

## Core Philosophy

### KISS & Component-First Design

- Choose straightforward solutions over complex ones
- Build with reusable, composable components with single responsibility
- Prefer composition over inheritance in all designs

## 🚀 Next.js 15 & React 19 Features

### Next.js 15 Core Features

- **Turbopack**: Fast bundler for development (stable)
- **App Router**: File-system based router with layouts and nested routing  
- **Server Components**: React Server Components for performance
- **Server Actions**: Type-safe server functions
- **Parallel Routes**: Concurrent rendering of multiple pages
- **Intercepting Routes**: Modal-like experiences

### React 19 Features

- **React Compiler**: Eliminates need for `useMemo`, `useCallback`, and `React.memo`
- **Actions**: Handle async operations with built-in pending states
- **use() API**: Simplified data fetching and context consumption
- **Document Metadata**: Native support for SEO tags
- **Enhanced Suspense**: Better loading states and error boundaries

### TypeScript Integration (MANDATORY)

- **MUST use `ReactElement` instead of `JSX.Element`** for return types
- **MUST import types from 'react'** explicitly
- **NEVER use `JSX.Element` namespace** - use React types directly

```typescript
// ✅ CORRECT: Modern React 19 typing
import {ReactElement} from 'react';

function MyComponent(): ReactElement {
  return <div>Content</div>;
}

// ❌ FORBIDDEN: Legacy JSX namespace
function MyComponent(): JSX.Element {  // Cannot find namespace 'JSX'
  return <div>Content</div>;
}
```

## 🎨 Component Guidelines (STRICT REQUIREMENTS)

### MANDATORY Component Documentation

```typescript jsx
/**
 * Button component with multiple variants and sizes.
 *
 * Provides a reusable button with consistent styling and behavior
 * across the application. Supports keyboard navigation and screen readers.
 *
 * @component
 * @example
 * ```tsx
 * <Button 
 *   variant="primary" 
 *   size="medium" 
 *   onClick={handleSubmit}
 * >
 *   Submit Form
 * </Button>
 * ```
 */
interface ButtonProps {
  /** Visual style variant of the button */
  variant: 'primary' | 'secondary';
  /** Size of the button @default 'medium' */
  size?: 'small' | 'medium' | 'large';
  /** Click handler for the button */
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Content to be rendered inside the button */
  children: React.ReactNode;
  /** Whether the button is disabled @default false */
  disabled?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({variant, size = 'medium', onClick, children, disabled = false}, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({variant, size}))}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
```

### Component Limits

- **Components should be under 200 lines** for better maintainability
- **Functions should be short and focused sub 50 lines** and have a single responsibility
- **Maximum 500 lines per file** - Split if larger

## 🌐 Internationalization with next-intlayer (MANDATORY)

### MANDATORY Component using next-intlayer

```typescript jsx
'use client'
import {useIntlayer} from "next-intlayer";

export default function Home() {
  const content = useIntlayer<'home'>("home")

  return (
    <>
      <div className="grid grid-cols-2 gap-4 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className='h-60 relative block w-full rounded-lg border-2 border-solid border-gray-300 p-12 text-center'>
          <p>{content.FilePicker.filePickerMessage}</p>
        </div>
      </div>
    </>
  )
}
```

### Content File Pattern

```typescript
// features/MyFeature/presentation/MyComponent.content.ts
import {type Dictionary, t} from "intlayer";

const myComponentContent = {
  key: "my-component", // Must be unique across app
  content: {
    title: t({
      en: "My Title",
      ko: "내 제목",
    }),
    description: t({
      en: "My description", 
      ko: "내 설명",
    }),
  },
} satisfies Dictionary;

export default myComponentContent;
```

### Intlayer TypeScript Integration (CRITICAL)

**MUST use explicit type parameters:**

```typescript
// ✅ CORRECT: With explicit type parameter
const content = useIntlayer<'my-component'>('my-component');

// ❌ WRONG: Without type parameter (causes type errors)
const content = useIntlayer('my-component');
```

**CRITICAL**: After creating or modifying content files, run:

```bash
npm run intlayer:build
```

## 🎨 Tailwind CSS Component Pattern

Reference: [Tailwind Catalyst Documentation](https://catalyst.tailwindui.com/docs)

- Use the base components defined
- **MUST USE @components/ui/link for Links with locale awareness**

```typescript jsx
"use client"

import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import React, {forwardRef} from 'react'
import {Link} from './link'

const styles = {
  base: [
    'relative isolate inline-flex items-baseline justify-center gap-x-2 rounded-lg border text-base/6 font-semibold',
    'px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)] sm:text-sm/6',
  ],
  // ... more styles
}

export const Button = forwardRef(function Button(
  {color, outline, plain, className, children, ...props}: ButtonProps,
  ref: React.ForwardedRef<HTMLElement>
) {
  let classes = clsx(
    className,
    styles.base,
    outline ? styles.outline : plain ? styles.plain : clsx(styles.solid, styles.colors[color ?? 'dark/zinc'])
  )

  return 'href' in props ? (
    <Link {...props} className={classes} ref={ref as React.ForwardedRef<HTMLAnchorElement>}>
      {children}
    </Link>
  ) : (
    <Headless.Button {...props} className={clsx(classes, 'cursor-default')} ref={ref}>
      {children}
    </Headless.Button>
  )
})
```

## 🔄 State Management (STRICT HIERARCHY)

### MUST Follow This State Hierarchy

1. **Local State**: `useState` ONLY for component-specific state
2. **Context**: For cross-component state within a single feature
3. **URL State**: MUST use search params for shareable state
4. **Server State**: MUST use TanStack Query for ALL API data
5. **Global State**: Zustand ONLY when truly needed app-wide

## 🔄 TanStack Form + Query Integration (MANDATORY PATTERNS)

### Form Initialization with Query Data

**MUST follow this pattern** for forms that load data from APIs:

```typescript
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'

function MyFormComponent() {
  // 1. Fetch data with useQuery
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['userData'],
    queryFn: () => getUserData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })

  // 2. Initialize form with query data OR defaults
  const form = useForm({
    defaultValues: {
      name: userData?.name ?? '',
      email: userData?.email ?? '',
      settings: userData?.settings ?? defaultSettings,
    },
    onSubmit: async ({ formApi, value }) => {
      try {
        await saveUserMutation.mutateAsync(value)
        formApi.reset() // Reset form after save
        onSuccess?.()
      } catch (error) {
        // Error handled by mutation
      }
    },
    validators: {
      onChange: ({ value }) => validateForm(value)
    }
  })

  // 3. Handle loading and error states
  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorDisplay error={error} />
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      form.handleSubmit()
    }}>
      {/* Form fields */}
    </form>
  )
}
```

### Loading State Management

**MUST handle all loading states**:

```typescript
// In component render
{isLoading && (
  <div className="flex items-center justify-center py-8">
    <div className="flex items-center space-x-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      <Text>Loading data...</Text>
    </div>
  </div>
)}

// In form submit button
<Button 
  disabled={isLoading || isSubmitting || mutation.isPending}
>
  {isSubmitting || mutation.isPending 
    ? 'Saving...' 
    : isLoading 
      ? 'Loading...'
      : 'Save'
  }
</Button>
```

## 📝 Client-Side Logging

Use `@/lib/logger.client` in:
- Client components (`'use client'` directive)
- Custom hooks that run in browser
- Browser-only event handlers
- Client-side error boundaries

```typescript
import { logger } from '@/lib/logger.client';

// Client component example
'use client'
export function MyComponent(): ReactElement {
  const handleClick = useCallback((): void => {
    try {
      // Some operation
      logger.info('User clicked button', 'ui', { buttonId: 'submit' });
    } catch (error) {
      logger.error('Button click failed', 'ui', { error, buttonId: 'submit' });
    }
  }, []);

  return <button onClick={handleClick}>Click me</button>;
}
```

**Client Logger API:**
```typescript
logger.error(message: string, context: LogContext, meta: { error: Error, [key: string]: unknown })
logger.warn(message: string, context: LogContext, meta?: Record<string, unknown>)
logger.info(message: string, context: LogContext, meta?: Record<string, unknown>)
logger.debug(message: string, context: LogContext, meta?: Record<string, unknown>)
```

## 🚀 Performance Guidelines

### Next.js 15 Optimizations

- **Use Server Components** by default for data fetching
- **Client Components** only when necessary (interactivity)
- **Dynamic imports** for large client components
- **Image optimization** with next/image
- **Font optimization** with next/font

## Frontend FORBIDDEN Practices

- ❌ **Don't use form defaultValues directly from props** - always use query data
- ❌ **Don't ignore loading states** - always show loading feedback
- ❌ **Don't skip error handling** - always display error states
- ❌ **Don't use useEffect for form initialization** - use defaultValues with query data
- ❌ **Don't exceed component size limits** (200 lines per component)
- ❌ **Don't use `JSX.Element`** - use `ReactElement` instead
- ❌ **Don't use `any` type** - use proper typing or `unknown`

## Frontend Checklist

- [ ] Component under 200 lines
- [ ] Complete JSDoc documentation
- [ ] Proper TypeScript return types (`ReactElement`)
- [ ] Loading and error states handled
- [ ] Accessibility requirements met (ARIA labels, keyboard nav)
- [ ] Intlayer content files co-located
- [ ] Client logger used appropriately
- [ ] TanStack Query patterns for data fetching
- [ ] Server/Client components used appropriately

---

*Specialized for frontend development with Next.js 15 + React 19*
*For complete guidelines, see main CLAUDE.md*