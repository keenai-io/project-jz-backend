# CLAUDE.md

This file provides comprehensive guidance to Claude Code when working with Next.js 15 applications with React 19 and
TypeScript.

## Core Development Philosophy

### KISS (Keep It Simple, Stupid)

Simplicity should be a key goal in design. Choose straightforward solutions over complex ones whenever possible. Simple
solutions are easier to understand, maintain, and debug.

### YAGNI (You Aren't Gonna Need It)

Avoid building functionality on speculation. Implement features only when they are needed, not when you anticipate they
might be useful in the future.

### Design Principles

- **Dependency Inversion**: High-level modules should not depend on low-level modules. Both should depend on
  abstractions.
- **Open/Closed Principle**: Software entities should be open for extension but closed for modification.
- **Vertical Slice Architecture**: Organize by features, not layers
- **Component-First**: Build with reusable, composable components with single responsibility
- **Fail Fast**: Validate inputs early, throw errors immediately

## 🤖 AI Assistant Guidelines

### Context Awareness

- When implementing features, always check existing patterns first
- Prefer composition over inheritance in all designs
- Use existing utilities before creating new ones
- Check for similar functionality in other domains/features

### Common Pitfalls to Avoid

- Creating duplicate functionality
- Overwriting existing tests
- Modifying core frameworks without explicit instruction
- Adding dependencies without checking existing alternatives

### Workflow Patterns

- Preferably create tests BEFORE implementation (TDD)
- Use "think hard" for architecture decisions
- Break complex tasks into smaller, testable units
- Validate understanding before implementation

### Search Command Requirements

**CRITICAL**: Always use `rg` (ripgrep) instead of traditional `grep` and `find` commands:

```bash
# ❌ Don't use grep
grep -r "pattern" .

# ✅ Use rg instead
rg "pattern"

# ❌ Don't use find with name
find . -name "*.tsx"

# ✅ Use rg with file filtering
rg --files | rg "\.tsx$"
# or
rg --files -g "*.tsx"
```

**Enforcement Rules:**

```
(
    r"^grep\b(?!.*\|)",
    "Use 'rg' (ripgrep) instead of 'grep' for better performance and features",
),
(
    r"^find\s+\S+\s+-name\b",
    "Use 'rg --files | rg pattern' or 'rg --files -g pattern' instead of 'find -name' for better performance",
),
```

## 🧱 Code Structure & Modularity

### File and Component Limits

- **Never create a file longer than 500 lines of code.** If approaching this limit, refactor by splitting into modules
  or helper files.
- **Components should be under 200 lines** for better maintainability.
- **Functions should be short and focused sub 50 lines** and have a single responsibility.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.

## 🚀 Next.js 15 & React 19 Key Features

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
  return <div>Content < /div>;
}

// ❌ FORBIDDEN: Legacy JSX namespace
function MyComponent(): JSX.Element {  // Cannot find namespace 'JSX'
  return <div>Content < /div>;
}
```

## 🏗️ Project Structure (Vertical Slice Architecture)

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

## 🎯 TypeScript Configuration (STRICT REQUIREMENTS)

### MUST Follow These Compiler Options

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": [
      "dom",
      "dom.iterable",
      "es6"
    ],
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
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./*"
      ],
      "@components/*": [
        "./app/components/*"
      ],
      "@features/*": [
        "./features/*"
      ],
      "@lib/*": [
        "./lib/*"
      ]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".intlayer/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### MANDATORY Type Requirements

- **NEVER use `any` type** - use `unknown` if type is truly unknown
- **MUST have explicit return types** for all functions and components
- **MUST use proper generic constraints** for reusable components
- **MUST use type inference from Zod schemas** using `z.infer<typeof schema>`
- **NEVER use `@ts-ignore`** or `@ts-expect-error` - fix the type issue properly

## 📦 Package Management & Dependencies

### Essential Next.js 15 Dependencies

```json
{
  "dependencies": {
    "@auth/firebase-adapter": "^2.10.0",
    "@headlessui/react": "^2.2.4",
    "@heroicons/react": "^2.2.0",
    "@tanstack/react-form": "^1.19.0",
    "@tanstack/react-query": "^5.83.0",
    "@tanstack/react-table": "^8.21.3",
    "clsx": "^2.1.1",
    "firebase-admin": "^12.7.0",
    "framer-motion": "^12.23.0",
    "intlayer": "^5.6.0",
    "next": "15.4.6",
    "next-auth": "^5.0.0-beta.29",
    "next-intlayer": "^5.6.0",
    "react": "19.1.1",
    "react-dom": "19.1.1",
    "react-dropzone": "^14.3.8",
    "react-error-boundary": "^6.0.0",
    "winston": "^3.17.0",
    "xlsx": "https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz",
    "zod": "^4.0.5"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@tanstack/react-query-devtools": "^5.84.2",
    "@testing-library/jest-dom": "^6.6.4",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^20",
    "@types/react": "19.1.9",
    "@types/react-dom": "19.1.7",
    "@types/xlsx": "^0.0.35",
    "@vitejs/plugin-react": "^5.0.0",
    "@vitest/coverage-v8": "^3.2.4",
    "eslint": "^9",
    "eslint-config-next": "15.4.6",
    "jsdom": "^26.1.0",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^3.2.4"
  }
}
```

### Recommended Additional Dependencies

```bash
# UI and Styling
npm install clsx tailwind-merge

# Form Handling and Validation
npm install react-hook-form @hookform/resolvers zod

# State Management (when needed)
npm install @tanstack/react-query zustand

# Development Tools
npm install -D @testing-library/react @testing-library/jest-dom vitest jsdom
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

### Form Validation with React Hook Form

```typescript
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';

const formSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
});

type FormData = z.infer<typeof formSchema>;

function UserForm(): ReactElement {
  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting},
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: FormData): Promise<void> => {
    // Handle validated data
  };

  return (
    <form onSubmit = {handleSubmit(onSubmit)} >
      {/* Form fields */}
      < /form>
  );
}
```

## 🧪 Testing Strategy (MANDATORY REQUIREMENTS)

### MUST Meet These Testing Standards

- **MINIMUM 80% code coverage** - NO EXCEPTIONS
- **MUST co-locate tests** with components in `__tests__` folders
- **MUST use React Testing Library** for all component tests
- **MUST test user behavior** not implementation details
- **MUST mock external dependencies** appropriately

### Test Configuration (Vitest + React Testing Library)

```typescript
// vitest.config.ts
import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
import {resolve} from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
});
```

### Test Example (WITH MANDATORY DOCUMENTATION)

```typescript
/**
 * @fileoverview Tests for UserProfile component
 * @module components/__tests__/UserProfile.test
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, userEvent} from '@testing-library/react';
import {UserProfile} from '../UserProfile';

/**
 * Test suite for UserProfile component.
 *
 * Tests user interactions, state management, and error handling.
 * Mocks external dependencies to ensure isolated unit tests.
 */
describe('UserProfile', () => {
  /**
   * Tests that user name updates correctly on form submission.
   */
  it('should update user name on form submission', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();

    render(<UserProfile onUpdate = {onUpdate}
    />);

    const input = screen.getByLabelText(/name/i);
    await user.type(input, 'John Doe');
    await user.click(screen.getByRole('button', {name: /save/i}));

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({name: 'John Doe'})
    );
  });
});
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
 *
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
        className={cn(buttonVariants({variant, size})
        )
        }
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      < /button>
    )
      ;
  }
);
Button.displayName = 'Button';

```

### MANDATORY Component using next-intlayer for translated text

refer to these urls for how to use next-intlayer:
- url: [https://intlayer.org/doc/concept/how-works-intlayer ]
  why: [Intlayer concepts]
- url: [https://intlayer.org/doc/concept/content/translation ]
  why: [Intlayer translations files]
- url: [https://intlayer.org/doc/environment/nextjs ]
  why: [Intlayer content files]
- url: [https://intlayer.org/doc/packages/next-intlayer/useIntlayer ]
  why: [Intlayer useIntLayer usage in client side or server side]

to access the string value of an IntLayerNode object, use the `.value` property


```typescript jsx
'use client'
import {useEffect, useState} from "react";
import {FileListItem, PreviewTable, ProcessSpeedgoXlsx} from "@features/SpeedgoOptimizer";
import {useDropzone} from "react-dropzone";
import {CloudArrowUpIcon} from "@heroicons/react/16/solid";
import {Button} from "@components/ui/button";
import {Text} from "@components/ui/text";
import {useIntlayer} from "next-intlayer";
import {RowData} from "@tanstack/table-core";

export default function Home() {
  const content = useIntlayer<'home'>("home")

  return (
    <>
      <div className="grid grid-cols-2 gap-4 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div
          className='h-60 relative block w-full rounded-lg border-2 border-solid border-gray-300 p-12 text-center hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden'>
          <button
            type="button"
            className="h-36 relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
          >
            <div className='flex flex-col'>
              <div className='flex justify-center align-items-center'>
                <CloudArrowUpIcon width={64}/>
              </div>
              <div>
                <input/>
                <p>{content.FilePicker.filePickerMessage}</p>
              </div>
            </div>
          </button>
        </div>

        <div className='flex flex-col justify-center items-center'>
          <Text className='text-xl'>{content.FilePicker.processMessage}</Text>
          <div><Button>{content.FilePicker.processButtonMessage}</Button></div>
        </div>
      </div>
      <div className='px-4 py-8 sm:px-6 lg:px-8'>
        <Text>{content.FilePreview.title}</Text>
        <div
          className="overflow-auto whitespace-nowrap w-full h-60 relative rounded-lg border-2 border-solid border-gray-300 p-4 text-left hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden">
          <Text>{content.FilePreview.emptyMessage}</Text>
        </div>
      </div>

    </>
  )
}


```

### Example of a next-intlayer single file that will contain multiple translations

co-locate all content files with the component that is using it
reference:
- url: [https://intlayer.org/doc/concept/content ]
  why: [Intlayer content files]
- url: [https://intlayer.org/doc/concept/per-locale-file ]
  why: [Intlayer per locale files]


```typescript
import {type Dictionary, t} from "intlayer";

const pageContent = {
  key: "home",
  content: {
    FilePicker: {
      filePickerMessage: t({
        en: "Drag and Drop to Upload, or click to select files",
      }),
      processMessage: t({
        en: "Optimize products and prepare for upload into Speedgo Transmitter"
      }),
      processButtonMessage: t({
        en: 'Process'
      }),
    },
    FilePreview: {
      title: t({
        en: 'File Viewer'
      }),
      emptyMessage: t({
        en: "Upload and select a file to view it here"
      })
    }
  },
} satisfies Dictionary;

export default pageContent;

```

### Tailwindcss Component Pattern (RECOMMENDED)

reference: 
- url: [https://catalyst.tailwindui.com/docs ]
  why: [Tailwindcss Catalyst documents]

- use the base components defined
- **MUST USE @components/ui/link for Links with locale awareness**  

```typescript jsx
"use client"

import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import React, {forwardRef} from 'react'
import {Link} from './link'

const styles = {
  base: [
    // Base
    'relative isolate inline-flex items-baseline justify-center gap-x-2 rounded-lg border text-base/6 font-semibold',
    // Sizing
    'px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)] sm:text-sm/6',
    // Focus
    'focus:not-data-focus:outline-hidden data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-500',
    // Disabled
    'data-disabled:opacity-50',
    // Icon
    '*:data-[slot=icon]:-mx-0.5 *:data-[slot=icon]:my-0.5 *:data-[slot=icon]:size-5 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:self-center *:data-[slot=icon]:text-(--btn-icon) sm:*:data-[slot=icon]:my-1 sm:*:data-[slot=icon]:size-4 forced-colors:[--btn-icon:ButtonText] forced-colors:data-hover:[--btn-icon:ButtonText]',
  ],
  solid: [
    // Optical border, implemented as the button background to avoid corner artifacts
    'border-transparent bg-(--btn-border)',
    // Dark mode: border is rendered on `after` so background is set to button background
    'dark:bg-(--btn-bg)',
    // Button background, implemented as foreground layer to stack on top of pseudo-border layer
    'before:absolute before:inset-0 before:-z-10 before:rounded-[calc(var(--radius-lg)-1px)] before:bg-(--btn-bg)',

  ],
  outline: [
    // Base
    'border-zinc-950/10 text-zinc-950 data-active:bg-zinc-950/2.5 data-hover:bg-zinc-950/2.5',
    // Dark mode
    'dark:border-white/15 dark:text-white dark:[--btn-bg:transparent] dark:data-active:bg-white/5 dark:data-hover:bg-white/5',
    // Icon
    '[--btn-icon:var(--color-zinc-500)] data-active:[--btn-icon:var(--color-zinc-700)] data-hover:[--btn-icon:var(--color-zinc-700)] dark:data-active:[--btn-icon:var(--color-zinc-400)] dark:data-hover:[--btn-icon:var(--color-zinc-400)]',
  ],
  plain: [
    // Base
    'border-transparent text-zinc-950 data-active:bg-zinc-950/5 data-hover:bg-zinc-950/5',
    // Dark mode
    'dark:text-white dark:data-active:bg-white/10 dark:data-hover:bg-white/10',
    // Icon
    '[--btn-icon:var(--color-zinc-500)] data-active:[--btn-icon:var(--color-zinc-700)] data-hover:[--btn-icon:var(--color-zinc-700)] dark:[--btn-icon:var(--color-zinc-500)] dark:data-active:[--btn-icon:var(--color-zinc-400)] dark:data-hover:[--btn-icon:var(--color-zinc-400)]',
  ],
  colors: {
    'dark/zinc': [
      'text-white [--btn-bg:var(--color-zinc-900)] [--btn-border:var(--color-zinc-950)]/90 [--btn-hover-overlay:var(--color-white)]/10',
      'dark:text-white dark:[--btn-bg:var(--color-zinc-600)] dark:[--btn-hover-overlay:var(--color-white)]/5',
      '[--btn-icon:var(--color-zinc-400)] data-active:[--btn-icon:var(--color-zinc-300)] data-hover:[--btn-icon:var(--color-zinc-300)]',
    ],
    light: [
      'text-zinc-950 [--btn-bg:white] [--btn-border:var(--color-zinc-950)]/10 [--btn-hover-overlay:var(--color-zinc-950)]/2.5 data-active:[--btn-border:var(--color-zinc-950)]/15 data-hover:[--btn-border:var(--color-zinc-950)]/15',
      'dark:text-white dark:[--btn-hover-overlay:var(--color-white)]/5 dark:[--btn-bg:var(--color-zinc-800)]',
      '[--btn-icon:var(--color-zinc-500)] data-active:[--btn-icon:var(--color-zinc-700)] data-hover:[--btn-icon:var(--color-zinc-700)] dark:[--btn-icon:var(--color-zinc-500)] dark:data-active:[--btn-icon:var(--color-zinc-400)] dark:data-hover:[--btn-icon:var(--color-zinc-400)]',
    ],
  },
}

type ButtonProps = (
  | { color?: keyof typeof styles.colors; outline?: never; plain?: never }
  | { color?: never; outline: true; plain?: never }
  | { color?: never; outline?: never; plain: true }
  ) & { className?: string; children: React.ReactNode } & (
  | Omit<Headless.ButtonProps, 'as' | 'className'>
  | Omit<React.ComponentPropsWithoutRef<typeof Link>, 'className'>
  )

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
      <Link {...props} className={classes}
            ref={ref as React.ForwardedRef<HTMLAnchorElement>}>
        <TouchTarget>{children} < /TouchTarget>
      < /Link>
    ) :
    (
      <Headless.Button {...props}
                       className={clsx(classes, 'cursor-default'
                       )
                       }
                       ref={ref}>
        <TouchTarget>{children} < /TouchTarget>
      < /Headless.Button>
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

### Server State Pattern (TanStack Query)

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

## 🔐 Authentication & Security

### Auth.js v5 Configuration (MANDATORY FOR AUTHENTICATION)

This project uses Auth.js v5 (NextAuth.js v5) for authentication. **CRITICAL**: Auth.js v5 has significant breaking changes from v4.

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

#### Client-Side Auth Usage

```typescript
// Client Components
'use client'
import { useSession } from "next-auth/react"

export function ClientComponent() {
  const { data: session, status } = useSession()
  
  if (status === "loading") return <Loading />
  if (status === "unauthenticated") return <SignIn />
  
  return <div>Welcome {session?.user?.email}</div>
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

#### CRITICAL Auth.js v5 Migration Notes

- **Session callback signature changed**: `session({ session, token })` instead of `session({ session, user })`
- **JWT callback required for persistent data**: Must use JWT callback to persist user data
- **Provider configuration updated**: Check provider-specific v5 configurations
- **TypeScript types changed**: Import types from `next-auth` directly

#### Environment Variables (Auth.js v5)

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

#### Firebase Authentication Setup (MANDATORY FOR PRODUCTION)

This project uses Firebase/Firestore as the Auth.js adapter for persistent user data. **CRITICAL**: Proper Firebase configuration is required for authentication to work.

##### Firebase Configuration Requirements

- **MUST have a Firebase project** with Firestore database enabled
- **MUST have proper service account credentials** configured
- **MUST run Firestore setup** to create required collections

##### Firestore Adapter Configuration

```typescript
// auth.ts
import { FirestoreAdapter } from "@auth/firebase-adapter"
import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  const hasFirebaseEnvVars = process.env.FIREBASE_PROJECT_ID && 
                             process.env.FIREBASE_CLIENT_EMAIL && 
                             process.env.FIREBASE_PRIVATE_KEY;

  if (hasFirebaseEnvVars) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    initializeApp({
      credential: applicationDefault(),
    })
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: FirestoreAdapter(getFirestore()),
  // ... other config
})
```

##### Environment Variables for Firebase

```bash
# Method 1: Individual environment variables (recommended for production)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIRESTORE_DATABASE_ID=(default)  # Optional: specify database ID, defaults to "(default)"

# Method 2: Service account credentials file (good for development)
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
FIRESTORE_DATABASE_ID=your-database-id  # Optional: if using non-default database
```

##### Firebase Setup Commands

```bash
# Install dotenv if not already present (required for setup script)
npm install --save-dev dotenv

# Setup Firestore collections for Auth.js
npm run setup:firestore

# Verify your Firebase configuration
npm run type-check  # Should pass without Firebase credential errors
```

##### Troubleshooting Firebase Authentication Errors

**Common Error**: `Error: 5 NOT_FOUND` - Firestore database not found

**Solutions**:
1. **Verify Firebase project exists and has Firestore enabled**:
   - Go to Firebase Console > Project Settings
   - Ensure Firestore Database is created (not just Realtime Database)
   - Note the database ID (usually "(default)" for first database)

2. **Create Firestore Database if missing**:
   - Go to Firebase Console > Firestore Database
   - Click "Create database"
   - Choose security rules (test mode for development)
   - Select a location (cannot be changed later)

3. **Check database ID configuration**:
   ```bash
   # In your .env.local file, specify the correct database ID
   FIRESTORE_DATABASE_ID=(default)  # or your specific database ID
   ```

4. **Verify credentials are properly configured**:
   ```bash
   # Test Firebase connection with environment variables loaded
   node -r dotenv/config -e "console.log('Project:', process.env.FIREBASE_PROJECT_ID); console.log('Database:', process.env.FIRESTORE_DATABASE_ID || '(default)');" dotenv_config_path=.env.local
   ```

5. **Run Firestore setup script with environment variables**:
   ```bash
   # The setup script now loads .env.local automatically
   npm run setup:firestore
   
   # Or run directly with environment variables
   GOOGLE_APPLICATION_CREDENTIALS=./credentials.json npm run setup:firestore
   ```

6. **Verify service account permissions**:
   - Service account needs "Firestore Service Agent" role
   - Go to Firebase Console > IAM & Admin > IAM
   - Check that your service account has proper permissions

7. **Check for multiple databases**:
   - If you have multiple Firestore databases in your project
   - Ensure `FIRESTORE_DATABASE_ID` matches the exact database ID
   - Database IDs are case-sensitive

**Common Error**: `AdapterError` with Firebase connection failures

**Solutions**:
1. **Check network connectivity** to Firebase endpoints
2. **Verify private key format** (newlines properly escaped)
3. **Ensure project ID matches** your Firebase project exactly
4. **Check for quota limits** in Firebase Console

##### Required Firestore Collections

Auth.js requires these collections (automatically created by setup script):
- `users` - Store user profile information
- `accounts` - Store linked OAuth provider accounts
- `sessions` - Store active user sessions
- `verification_tokens` - Store email verification tokens

##### Development vs Production Setup

**Development**:
- Use `credentials.json` file for simplicity
- Set `GOOGLE_APPLICATION_CREDENTIALS=./credentials.json`

**Production**:
- Use individual environment variables for security
- Never commit `credentials.json` to repository
- Use encrypted secrets in deployment platform

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

## 🚀 Performance Guidelines

### Next.js 15 Optimizations

- **Use Server Components** by default for data fetching
- **Client Components** only when necessary (interactivity)
- **Dynamic imports** for large client components
- **Image optimization** with next/image
- **Font optimization** with next/font

### Bundle Optimization

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
  // Bundle analyzer
  webpack: (config, {dev, isServer}) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
    }
    return config;
  },
};

module.exports = nextConfig;
```

## 💅 Code Style & Quality

### ESLint Configuration (MANDATORY)

```javascript
// eslint.config.mjs
import {dirname} from "path";
import {fileURLToPath} from "url";
import {FlatCompat} from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "error",
      "no-console": ["error", {"allow": ["warn", "error"]}],
      "react/function-component-definition": ["error", {
        "namedComponents": "arrow-function"
      }],
    },
  },
];

export default eslintConfig;
```

## 📝 Logging Guidelines (MANDATORY)

### MUST Follow These Logging Rules

- **NEVER use `console.log`, `console.error`, or `console.warn`** - Use structured loggers
- **MUST use appropriate logger** based on execution environment (see decision matrix below)
- **MUST provide context** for all log messages using available LogContext values
- **MUST handle errors with structured logging** - never swallow errors silently
- **MUST use proper error types** - convert unknown errors to Error instances
- **NEVER log sensitive data** - passwords, tokens, API keys, or PII

### Logger Selection Decision Matrix

| Code Location | Directive | Logger | Import |
|---------------|-----------|--------|---------|
| Client Components | `'use client'` | Client Logger | `@/lib/logger.client` |
| Custom Hooks | `'use client'` | Client Logger | `@/lib/logger.client` |
| Server Actions | `'use server'` | Server Logger | `@/lib/logger.server` |
| API Routes | N/A (server) | Server Logger | `@/lib/logger.server` |
| Middleware | N/A (server) | Server Logger | `@/lib/logger.server` |
| Server Components | N/A (server) | Server Logger | `@/lib/logger.server` |
| Utilities (client) | Used by client | Client Logger | `@/lib/logger.client` |
| Utilities (server) | Used by server | Server Logger | `@/lib/logger.server` |

**Rule of Thumb**: If your file has `'use client'` directive or runs in browser, use Client Logger. Otherwise, use Server Logger.

### Client Logger Usage (Client Components & Hooks)

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

### Server Logger Usage (Server Actions, API Routes, Middleware)

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

### Log Contexts (MUST USE APPROPRIATE CONTEXT)

Available contexts for both loggers:
- `'api'` - API routes, external API calls
- `'auth'` - Authentication, authorization
- `'db'` - Database operations
- `'file'` - File operations, uploads, processing
- `'categorization'` - Product categorization logic
- `'ui'` - User interface interactions, component events
- `'system'` - System-level operations, startup, configuration
- `'query'` - TanStack Query operations
- `'configuration'` - Configuration management

### Environment-Specific Behavior

**Development:**
- Enhanced console output with colors and source file locations
- Debug level enabled
- Pretty-printed objects and stack traces

**Production:**
- JSON structured logs
- File logging enabled (`logs/app.log`, `logs/error.log`)
- Optimized for log aggregation systems

**Test:**
- Minimal logging to reduce noise
- Silent mode for console output

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

// ✅ CORRECT: Client component error handling
'use client'
export function ClientComponent(): ReactElement {
  const [error, setError] = useState<Error | null>(null);

  const handleAction = useCallback(async (): Promise<void> => {
    try {
      await clientOperation();
      logger.info('Client operation completed', 'ui');
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      logger.error('Client operation failed', 'ui', { error: errorObj });
      setError(errorObj);
    }
  }, []);

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return <button onClick={handleAction}>Execute</button>;
}
```

## 📋 Development Commands

```json
{
  "scripts": {
    "dev": "NODE_OPTIONS='--inspect' next dev --turbopack --experimental-https",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "type-check": "tsc --noEmit"
  }
}
```

### Recommended Additional Scripts

```json
{
  "scripts": {
    "lint:fix": "next lint --fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "validate": "npm run type-check && npm run lint && npm run test:coverage",
    "intlayer:build": "node node_modules/intlayer-cli/dist/cjs/index.cjs build"
  }
}
```

## 🌐 Intlayer Internationalization (MANDATORY)

### Building Intlayer Dictionaries

This project uses Intlayer for internationalization. **CRITICAL**: The `npx intlayer build` command may not work due to binary symlink issues.

#### MUST Use This Command for Building Dictionaries

```bash
# ✅ CORRECT: Use the npm script
npm run intlayer:build

# ❌ AVOID: This may fail due to missing binary symlinks
npx intlayer build
```

#### Intlayer Build Process

- **MUST run `npm run intlayer:build`** after creating or modifying `.content.ts` files
- **MUST build dictionaries** before running the development server or building for production
- **Dictionaries are generated** in the `.intlayer/` directory
- **MUST include intlayer build** in your CI/CD pipeline

#### Integration with Development Workflow

```json
{
  "scripts": {
    "dev": "npm run intlayer:build && NODE_OPTIONS='--inspect' next dev --turbopack --experimental-https",
    "build": "npm run intlayer:build && next build",
    "intlayer:build": "node node_modules/intlayer-cli/dist/cjs/index.cjs build"
  }
}
```

#### Content File Structure (MANDATORY PATTERNS)

All translation content files MUST follow this pattern:

```typescript
// [Component].content.ts
import {type Dictionary, t} from "intlayer";

const content = {
  key: "unique-component-key", // MUST be unique across the application
  content: {
    SectionName: {
      messageKey: t({
        en: "English translation",
        ko: "Korean translation", // Add all supported locales
      }),
    },
  },
} satisfies Dictionary;

export default content;
```

#### Troubleshooting Intlayer Build Issues

**Common Issues:**
1. **Binary not found**: Use `npm run intlayer:build` instead of `npx intlayer build`
2. **Dictionary conflicts**: Ensure all `key` values are unique across content files
3. **Missing locales**: Verify all content files include translations for all configured locales
4. **Build order**: Always build dictionaries before Next.js build

**Debug Commands:**
```bash
# Check Intlayer configuration
cat intlayer.config.ts

# Verify content files structure
find . -name "*.content.ts" -type f

# Manual build with verbose output
node node_modules/intlayer-cli/dist/cjs/index.cjs build --verbose
```

## ⚠️ CRITICAL GUIDELINES (MUST FOLLOW ALL)

1. **ENFORCE strict TypeScript** - ZERO compromises on type safety
2. **VALIDATE everything with Zod** - ALL external data must be validated
3. **MINIMUM 80% test coverage** - NO EXCEPTIONS
4. **MUST co-locate related files** - Tests MUST be in `__tests__` folders
5. **MAXIMUM 500 lines per file** - Split if larger
6. **MAXIMUM 200 lines per component** - Refactor if larger
7. **MUST handle ALL states** - Loading, error, empty, and success
8. **MUST use semantic commits** - feat:, fix:, docs:, refactor:, test:
9. **MUST write complete JSDoc** - ALL exports must be documented
10. **NEVER use `any` type** - Use proper typing or `unknown`
11. **MUST pass ALL automated checks** - Before ANY merge
12. **MUST update all error messages to reflect current location**

## 📋 Pre-commit Checklist (MUST COMPLETE ALL)

- [ ] TypeScript compiles with ZERO errors (`npm run type-check`)
- [ ] Tests written and passing with 80%+ coverage (`npm run test:coverage`)
- [ ] ESLint passes with ZERO warnings (`npm run lint`)
- [ ] Prettier formatting applied (`npm run format`)
- [ ] All components have complete JSDoc documentation
- [ ] Zod schemas validate ALL external data
- [ ] ALL states handled (loading, error, empty, success)
- [ ] Error boundaries implemented for features
- [ ] Accessibility requirements met (ARIA labels, keyboard nav)
- [ ] No console.log statements in production code
- [ ] Environment variables validated with Zod
- [ ] Component files under 200 lines
- [ ] No prop drilling beyond 2 levels
- [ ] Server/Client components used appropriately

### FORBIDDEN Practices

- **NEVER use `any` type** (except library declaration merging with comments)
- **NEVER skip tests** for new functionality
- **NEVER ignore TypeScript errors** with `@ts-ignore`
- **NEVER trust external data** without Zod validation
- **NEVER use `JSX.Element`** - use `ReactElement` instead
- **NEVER store sensitive data** in localStorage or client state
- **NEVER use dangerouslySetInnerHTML** without sanitization
- **NEVER exceed file/component size limits**
- **NEVER prop drill** beyond 2 levels - use context or state management
- **NEVER commit** without passing all quality checks

---

*This guide is optimized for Next.js 15 with React 19. Keep it updated as frameworks evolve.*
*Focus on type safety, performance, and maintainability in all development decisions.*
*Last updated: January 2025*
