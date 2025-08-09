name: "Base PRP Template v2 - Context-Rich with Validation Loops"
description: |

## Purpose

Template optimized for AI agents to implement features with sufficient context and self-validation capabilities to achieve working code through iterative refinement.

## Core Principles

1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance

---

## Goal

Create a new nextjs server action that is based off of the following curl command 
```shell
curl -X 'POST' \
  'https://product-categorizer-364702430350.us-central1.run.app/match' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '[
    {
      "language": "en",
      "semantic_top_k": 15,
      "keyword_match_results": 1,
      "first_category_via_llm": false,
      "descriptive_title_via_llm": true,
      "round_out_keywords_via_llm": true,
      "broad_keyword_matching": true,
      "input_data": {
        "product_number": 55778307,
        "product_name": "[G&G] BB Capybara Folding Fan Round One-Touch Fan Character Gift Portable Mini",
        "hashtags": [],
        "keywords": [
          "Mini fan",
          "Summer fan",
          "Children'\''s fan",
          "Daycare gift",
          "Portable fan",
          "Folding fan",
          "Event gift",
          "Group gift",
          "Character fan",
          "Round fan"
        ],
        "main_image_link": "https://cdn1.domeggook.com/upload/item/2025/03/25/174289361156F8883460872E340EB338/174289361156F8883460872E340EB338_img_760?hash=608bbb64df4d7d6aaa00e43832f4548e",
        "sales_status": "On Sale"
      }
    },
    {
      "language": "en",
      "semantic_top_k": 15,
      "keyword_match_results": 1,
      "first_category_via_llm": false,
      "descriptive_title_via_llm": true,
      "round_out_keywords_via_llm": true,
      "broad_keyword_matching": true,
      "input_data": {
        "product_number": 56115267,
        "product_name": "[G&G] Men'\''s Athletic Socks Thick Mid-Calf Ankle Socks Golf Socks Hiking Fishing Cushion Socks",
        "hashtags": [],
        "keywords": [
          "Running socks",
          "Men'\''s socks",
          "Male socks",
          "Men'\''s ankle socks",
          "Golf socks",
          "Hiking socks",
          "Cushion socks",
          "Embossing",
          "Sports equipment",
          "Sports socks"
        ],
        "main_image_link": "https://cdn1.domeggook.com/upload/item/2025/04/01/1743519014B995060574F0F14EA2F5EE/1743519014B995060574F0F14EA2F5EE_img_760?hash=65c2bc7883383f6fe522bea40f37eb6c",
        "sales_status": "On Sale"
      }
    },
    {
      "language": "en",
      "semantic_top_k": 15,
      "keyword_match_results": 1,
      "first_category_via_llm": false,
      "descriptive_title_via_llm": true,
      "round_out_keywords_via_llm": true,
      "broad_keyword_matching": true,
      "input_data": {
        "product_number": 56509695,
        "product_name": "[G&G] Vase flower arrangement pin holder stand, pretty flower arrangement fixture stand interior",
        "hashtags": [],
        "keywords": [
          "Vase accessories",
          "flower arrangement pin",
          "florist",
          "flower stand",
          "floral",
          "flower",
          "artificial flowers",
          "bouquet",
          "accessories",
          "holder"
        ],
        "main_image_link": "https://cdn1.domeggook.com/upload/item/2025/04/10/1744277711B7E75F0C1CC2BB8BC19023/1744277711B7E75F0C1CC2BB8BC19023_img_760?hash=40acda9bf9c28940153e52f698acdd70",
        "sales_status": "On Sale"
      }
    }
]'
```

## What

The server action will be called when the user presses the Process button which passes in the file content to the server action

### Success Criteria

- [ ] [Specific measurable outcomes]

## All Needed Context

### Documentation & References (list all context needed to implement the feature)

```yaml
# MUST READ - Include these in your context window
- url: [Official Next.js/React docs URL]
  why: [Specific sections/methods you'll need]

```

### Current Codebase tree (run `tree` in the root of the project) to get an overview of the codebase

```bash

```

### Desired Codebase tree with files to be added and responsibility of file

```bash

```

### Known Gotchas of our codebase & Library Quirks

```typescript

Next.js 15 App Router - Route handlers must export named functions
'use client' directive must be at top of file, affects entire component tree
Server Components can't use browser APIs or event handlers
We use TypeScript strict mode and require proper typing
```

## Implementation Blueprint

### Data models and structure

Create the core data models, we ensure type safety and consistency.

```typescript
Examples:
 - Zod schemas for validation
 - TypeScript interfaces/types
 - Database schema types
 - API response types
 - Component prop types

```



### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
npm run lint                    # ESLint checks
npx tsc --noEmit               # TypeScript type checking
npm run format                 # Prettier formatting

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Unit Tests each new feature/file/function use existing test patterns

```typescript
// CREATE __tests__/new-feature.test.tsx with these test cases:
import { render, screen } from '@testing-library/react'
import { NewFeature } from '@/components/new-feature'

describe('NewFeature', () => {
  test('renders without crashing', () => {
    render(<NewFeature />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  test('handles invalid input gracefully', () => {
    render(<NewFeature invalidProp="" />)
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })

  test('calls API with correct parameters', async () => {
    const mockFetch = jest.fn()
    global.fetch = mockFetch
    
    render(<NewFeature />)
    // ... test API interaction
  })
})
```

```bash
# Run and iterate until passing:
npm test new-feature.test.tsx
# If failing: Read error, understand root cause, fix code, re-run (never mock to pass)
```

### Level 3: Integration Test

```bash
# Start the dev server
npm run dev

# Test the page loads
curl http://localhost:3000/dashboard/users
# Expected: HTML response with user table

# Test the API endpoint
curl -X POST http://localhost:3000/api/feature \
  -H "Content-Type: application/json" \
  -d '{"param": "test_value"}'

# Expected: {"status": "success", "data": {...}}
# If error: Check browser console and Next.js terminal for error messages
```

### Level 4: Deployment & Creative Validation

```bash
# Production build check
npm run build

# Expected: Successful build with no errors
# Common issues:
# - "Module not found" → Check import paths
# - "Hydration mismatch" → Ensure server/client render same content
# - Type errors → Run tsc to identify

# Test production build
npm run start

# Creative validation methods:
# - E2E testing with Playwright/Cypress
# - Performance testing with Lighthouse
# - Accessibility testing with axe
# - Bundle size analysis
# - SEO validation

# Custom validation specific to the feature
# [Add creative validation methods here]
```

## Final validation Checklist

- [ ] All tests pass: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npx tsc --noEmit`
- [ ] Manual test successful: [specific curl/command]
- [ ] Error cases handled gracefully
- [ ] Logs are informative but not verbose
- [ ] Documentation updated if needed

---

## Anti-Patterns to Avoid

- ❌ Don't create new patterns when existing ones work
- ❌ Don't skip validation because "it should work"
- ❌ Don't ignore failing tests - fix them
- ❌ Don't use 'use client' unnecessarily - embrace Server Components
- ❌ Don't hardcode values that should be config
- ❌ Don't catch all exceptions - be specific
