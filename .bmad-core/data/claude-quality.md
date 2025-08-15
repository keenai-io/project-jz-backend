# Code Quality & Review Guidelines

This file provides specialized guidance for code quality standards, review processes, and quality assurance practices.

## Core Quality Philosophy

### Quality First Approach

- **ENFORCE strict TypeScript** - ZERO compromises on type safety
- **MINIMUM 80% test coverage** - NO EXCEPTIONS
- **MUST pass ALL automated checks** - Before ANY merge
- Use "think hard" for architecture decisions
- Validate understanding before implementation

## 💅 Code Style & Quality Standards

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

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## 📝 Documentation Standards (MANDATORY)

### JSDoc Documentation Requirements

**MUST write complete JSDoc** - ALL exports must be documented

```typescript
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
```

### File Documentation Standards

```typescript
/**
 * @fileoverview User profile management components and hooks
 * @module features/UserManagement/presentation/UserProfile
 * @version 1.0.0
 * @author Development Team
 * @since 2025-01-01
 */

/**
 * Hook for managing user profile data and operations.
 * 
 * Provides CRUD operations for user profiles with proper error handling,
 * loading states, and cache invalidation.
 *
 * @returns {Object} User profile operations and state
 * @returns {User | null} returns.data - Current user profile data
 * @returns {boolean} returns.isLoading - Loading state indicator
 * @returns {Error | null} returns.error - Error state if any
 * @returns {Function} returns.updateProfile - Function to update profile
 * 
 * @example
 * ```tsx
 * function UserProfileComponent() {
 *   const { data, isLoading, error, updateProfile } = useUserProfile();
 *   
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *   
 *   return <ProfileForm user={data} onUpdate={updateProfile} />;
 * }
 * ```
 */
export function useUserProfile() {
  // Implementation
}
```

## 🎯 TypeScript Quality Standards (STRICT REQUIREMENTS)

### Type Safety Requirements

- **NEVER use `any` type** - use `unknown` if type is truly unknown
- **MUST have explicit return types** for all functions and components
- **MUST use proper generic constraints** for reusable components
- **MUST use type inference from Zod schemas** using `z.infer<typeof schema>`
- **NEVER use `@ts-ignore`** or `@ts-expect-error` - fix the type issue properly

### Type Definition Examples

```typescript
// ✅ CORRECT: Explicit return types
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ CORRECT: Proper generic constraints
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

// ✅ CORRECT: Zod schema inference
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  createdAt: z.date(),
});

type User = z.infer<typeof UserSchema>;

// ✅ CORRECT: Unknown instead of any
function handleApiResponse(response: unknown): User {
  return UserSchema.parse(response);
}

// ❌ FORBIDDEN: Any type usage
function badFunction(data: any): any {
  return data.whatever;
}
```

## 📊 Code Quality Metrics

### Complexity Limits

- **Cyclomatic complexity**: Maximum 10 per function
- **Cognitive complexity**: Maximum 15 per function
- **Function length**: Maximum 50 lines
- **Component length**: Maximum 200 lines
- **File length**: Maximum 500 lines
- **Parameter count**: Maximum 5 parameters per function

### Code Quality Tools Configuration

```typescript
// vitest.config.ts - Quality thresholds
export default defineConfig({
  test: {
    coverage: {
      threshold: {
        global: {
          branches: 80,      // MINIMUM 80%
          functions: 80,     // MINIMUM 80%
          lines: 80,         // MINIMUM 80%
          statements: 80,    // MINIMUM 80%
        },
      },
    },
  },
});
```

## 🔍 Code Review Standards

### Review Checklist Template

```markdown
## Code Review Checklist

### Functionality
- [ ] Code implements requirements correctly
- [ ] Edge cases are handled appropriately
- [ ] Error handling is comprehensive
- [ ] Performance implications considered

### Code Quality
- [ ] Code follows established patterns and conventions
- [ ] No code duplication (DRY principle)
- [ ] Functions have single responsibility
- [ ] Proper separation of concerns

### TypeScript
- [ ] No `any` types used
- [ ] All functions have explicit return types
- [ ] Proper generic constraints used
- [ ] Type inference from Zod schemas

### Testing
- [ ] Tests cover new functionality
- [ ] Tests follow AAA pattern
- [ ] Edge cases tested
- [ ] Mocks used appropriately
- [ ] Coverage threshold maintained (80%+)

### Documentation
- [ ] JSDoc comments for all public APIs
- [ ] Complex logic explained with comments
- [ ] README updated if necessary
- [ ] Breaking changes documented

### Security
- [ ] Input validation with Zod schemas
- [ ] No sensitive data in code
- [ ] Authentication/authorization proper
- [ ] No security vulnerabilities introduced

### Performance
- [ ] No unnecessary re-renders
- [ ] Proper memoization if needed
- [ ] Bundle size impact considered
- [ ] Database queries optimized
```

### Review Process Standards

1. **Automated Checks First**
   - All CI/CD checks must pass before human review
   - TypeScript compilation must succeed
   - ESLint must pass with zero warnings
   - Tests must pass with 80%+ coverage
   - Prettier formatting must be applied

2. **Human Review Requirements**
   - At least one approval required for merging
   - Security-sensitive changes require two approvals
   - Architecture changes require team discussion
   - Breaking changes require documentation update

3. **Review Response Guidelines**
   - Respond to review requests within 24 hours
   - Provide constructive, actionable feedback
   - Explain reasoning behind suggestions
   - Approve when quality standards are met

## ⚠️ CRITICAL QUALITY GUIDELINES (MUST FOLLOW ALL)

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

## 📋 Pre-commit Quality Checklist (MUST COMPLETE ALL)

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
- [ ] Forms use TanStack Query data initialization pattern
- [ ] Loading and error states handled in data-fetching components

## 🚫 Quality FORBIDDEN Practices

### Code Quality Violations

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
- **NEVER initialize forms with props/state** - use query data with defaults
- **NEVER skip loading/error states** in components that fetch data
- **NEVER forget to invalidate queries** after mutations
- **NEVER use useEffect for form data loading** - use TanStack Query patterns

### Review Anti-Patterns

- **NEVER approve code that fails quality standards**
- **NEVER merge without proper testing**
- **NEVER skip documentation requirements**
- **NEVER ignore security implications**
- **NEVER rush code reviews for "urgent" features**

## 🛠️ Quality Tools & Commands

### Quality Assurance Commands

```bash
# Type checking
npm run type-check      # Must pass with zero errors

# Linting
npm run lint            # Must pass with zero warnings
npm run lint:fix        # Fix auto-fixable issues

# Formatting
npm run format          # Apply Prettier formatting
npm run format:check    # Check if formatting is correct

# Testing
npm run test            # Run all tests
npm run test:coverage   # Run with coverage report
npm run test:watch      # Run in watch mode

# Build verification
npm run build           # Must build successfully

# Complete quality check
npm run type-check && npm run lint && npm run test:coverage && npm run build
```

### Git Hooks for Quality

```bash
# Pre-commit hook (.husky/pre-commit)
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run type-check
npm run lint
npm run format:check
npm run test:coverage
```

## Quality Metrics Dashboard

### Tracking Quality Metrics

- **Code Coverage**: Maintain 80%+ across all metrics
- **Type Coverage**: 100% (no `any` types)
- **ESLint Issues**: 0 warnings, 0 errors
- **Build Time**: Monitor and optimize
- **Bundle Size**: Track and prevent regression
- **Dependency Vulnerabilities**: Zero high/critical vulnerabilities

---

*Specialized for code quality and review standards*
*For complete guidelines, see main CLAUDE.md*