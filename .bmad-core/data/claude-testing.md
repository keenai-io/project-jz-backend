# Testing & Quality Assurance Guidelines

This file provides specialized guidance for testing strategies, quality assurance, and test-driven development.

## Core Testing Philosophy

### TDD & Quality First

- **Preferably create tests BEFORE implementation (TDD)**
- **Break complex tasks into smaller, testable units**
- **MUST test user behavior** not implementation details
- **MINIMUM 80% code coverage** - NO EXCEPTIONS

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

## 📋 Test File Structure

### Co-located Test Organization

```
features/
└── [FeatureName]/
    ├── __tests__/         # Co-located tests
    │   ├── [Component].test.tsx
    │   ├── [Hook].test.ts
    │   └── [Service].test.ts
    ├── presentation/      # Feature components
    ├── hooks/             # Feature-specific hooks
    └── application/       # Business logic & services

app/
├── actions/
│   ├── __tests__/         # Server action tests
│   │   └── [action].test.ts
│   └── [action].ts
└── components/
    └── ui/
        ├── __tests__/
        │   └── Button.test.tsx
        └── Button.tsx
```

## 🧪 Test Examples (WITH MANDATORY DOCUMENTATION)

### Component Testing

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

    render(<UserProfile onUpdate={onUpdate} />);

    const input = screen.getByLabelText(/name/i);
    await user.type(input, 'John Doe');
    await user.click(screen.getByRole('button', {name: /save/i}));

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({name: 'John Doe'})
    );
  });

  /**
   * Tests error handling when update fails.
   */
  it('should display error message when update fails', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn().mockRejectedValue(new Error('Update failed'));

    render(<UserProfile onUpdate={onUpdate} />);

    const input = screen.getByLabelText(/name/i);
    await user.type(input, 'John Doe');
    await user.click(screen.getByRole('button', {name: /save/i}));

    expect(await screen.findByText(/update failed/i)).toBeInTheDocument();
  });

  /**
   * Tests loading state during form submission.
   */
  it('should show loading state during form submission', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<UserProfile onUpdate={onUpdate} />);

    const input = screen.getByLabelText(/name/i);
    await user.type(input, 'John Doe');
    await user.click(screen.getByRole('button', {name: /save/i}));

    expect(screen.getByText(/saving/i)).toBeInTheDocument();
  });
});
```

### Hook Testing

```typescript
/**
 * @fileoverview Tests for useUserData hook
 * @module hooks/__tests__/useUserData.test
 */

import {describe, it, expect, vi} from 'vitest';
import {renderHook, waitFor} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useUserData} from '../useUserData';

/**
 * Test suite for useUserData hook.
 *
 * Tests data fetching, caching, error handling, and loading states.
 */
describe('useUserData', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  /**
   * Tests successful data fetching.
   */
  it('should fetch user data successfully', async () => {
    const mockUserData = { id: '1', name: 'John Doe', email: 'john@example.com' };
    vi.mocked(getUserDataFromAPI).mockResolvedValue(mockUserData);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUserData(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUserData);
  });

  /**
   * Tests error handling during data fetching.
   */
  it('should handle fetch errors gracefully', async () => {
    const mockError = new Error('Failed to fetch user data');
    vi.mocked(getUserDataFromAPI).mockRejectedValue(mockError);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUserData(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });
});
```

### Server Action Testing

```typescript
/**
 * @fileoverview Tests for createUser server action
 * @module actions/__tests__/createUser.test
 */

import {describe, it, expect, vi} from 'vitest';
import {createUser} from '../createUser';

// Mock auth function
vi.mock('@/auth', () => ({
  auth: vi.fn()
}));

// Mock database
vi.mock('@/lib/db', () => ({
  user: {
    create: vi.fn()
  }
}));

/**
 * Test suite for createUser server action.
 *
 * Tests authentication, validation, and database operations.
 */
describe('createUser', () => {
  /**
   * Tests successful user creation with valid authentication.
   */
  it('should create user when authenticated', async () => {
    const mockSession = { user: { email: 'admin@example.com' } };
    const mockUserData = { name: 'John Doe', email: 'john@example.com' };
    const mockCreatedUser = { id: '1', ...mockUserData };

    vi.mocked(auth).mockResolvedValue(mockSession);
    vi.mocked(db.user.create).mockResolvedValue(mockCreatedUser);

    await expect(createUser(mockUserData)).resolves.not.toThrow();

    expect(db.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining(mockUserData)
    });
  });

  /**
   * Tests rejection when user is not authenticated.
   */
  it('should throw error when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);

    await expect(createUser({ name: 'John', email: 'john@example.com' }))
      .rejects.toThrow('Unauthorized');
  });

  /**
   * Tests validation of input data.
   */
  it('should validate input data with Zod schema', async () => {
    const mockSession = { user: { email: 'admin@example.com' } };
    vi.mocked(auth).mockResolvedValue(mockSession);

    const invalidData = { name: '', email: 'invalid-email' };

    await expect(createUser(invalidData))
      .rejects.toThrow(); // Zod validation error
  });
});
```

## 🔄 Testing TanStack Query Integration

### Testing Query + Form Integration

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'

describe('MyFormComponent', () => {
  test('loads data and initializes form', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MyFormComponent />
      </QueryClientProvider>
    )

    expect(screen.getByText('Loading data...')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('loaded-value')).toBeInTheDocument()
    })
  })

  test('handles mutation errors gracefully', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })

    // Mock failed mutation
    vi.mocked(saveUserData).mockRejectedValue(new Error('Save failed'))

    render(
      <QueryClientProvider client={queryClient}>
        <MyFormComponent />
      </QueryClientProvider>
    )

    // Trigger form submission
    const submitButton = screen.getByRole('button', { name: /save/i })
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/save failed/i)).toBeInTheDocument()
    })
  })
})
```

## 📊 Test Coverage Requirements

### Coverage Thresholds

```typescript
// vitest.config.ts coverage configuration
coverage: {
  reporter: ['text', 'json', 'html'],
  threshold: {
    global: {
      branches: 80,      // MINIMUM 80% branch coverage
      functions: 80,     // MINIMUM 80% function coverage
      lines: 80,         // MINIMUM 80% line coverage
      statements: 80,    // MINIMUM 80% statement coverage
    },
  },
  exclude: [
    '**/*.d.ts',
    '**/*.config.*',
    '**/node_modules/**',
    '**/dist/**',
    '**/.next/**'
  ]
}
```

### Test Commands

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests for specific file
npm run test UserProfile.test.tsx
```

## 🎯 Testing Best Practices

### Test Structure (AAA Pattern)

```typescript
it('should update user name on form submission', async () => {
  // Arrange - Set up test data and mocks
  const user = userEvent.setup();
  const onUpdate = vi.fn();
  const mockUserData = { name: 'John Doe', email: 'john@example.com' };

  render(<UserProfile userData={mockUserData} onUpdate={onUpdate} />);

  // Act - Perform the action being tested
  const input = screen.getByLabelText(/name/i);
  await user.clear(input);
  await user.type(input, 'Jane Smith');
  await user.click(screen.getByRole('button', {name: /save/i}));

  // Assert - Verify the expected outcomes
  expect(onUpdate).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'Jane Smith' })
  );
});
```

### Mock Patterns

```typescript
// Mock external dependencies
vi.mock('@/lib/api', () => ({
  getUserData: vi.fn(),
  saveUserData: vi.fn()
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams()
}));

// Mock Auth.js
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: { user: { email: 'test@example.com' } },
    status: 'authenticated'
  }))
}));
```

## Testing FORBIDDEN Practices

- ❌ **Don't test implementation details** - test user behavior
- ❌ **Don't skip tests** for new functionality
- ❌ **Don't exceed coverage thresholds** - maintain 80% minimum
- ❌ **Don't mock everything** - only mock external dependencies
- ❌ **Don't write tests after implementation** - prefer TDD
- ❌ **Don't ignore failing tests** - fix immediately
- ❌ **Don't test private methods** - test public API
- ❌ **Don't hardcode test data** - use factories or fixtures

## Testing Checklist

- [ ] Tests co-located with components in `__tests__` folders  
- [ ] 80%+ code coverage maintained
- [ ] All new features have corresponding tests
- [ ] Tests follow AAA pattern (Arrange, Act, Assert)
- [ ] External dependencies properly mocked
- [ ] Error states tested
- [ ] Loading states tested
- [ ] User interactions tested with userEvent
- [ ] Server actions tested with authentication checks
- [ ] Query/mutation integration tested
- [ ] Complete JSDoc documentation for test suites

---

*Specialized for testing with Vitest + React Testing Library*
*For complete guidelines, see main CLAUDE.md*