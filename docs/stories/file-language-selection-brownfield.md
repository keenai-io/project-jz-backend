# File Language Selection - Brownfield Addition

**Story ID:** FILE-LANG-001  
**Type:** Brownfield Enhancement  
**Effort:** Small (Single Session)  
**Created:** 2025-01-18  

## User Story

As a **user uploading files for categorization**,  
I want **to select the language of my uploaded files**,  
So that **the categorization AI can process products in the correct language context and provide more accurate results**.

## Story Context

**Existing System Integration:**
- Integrates with: SpeedgoOptimizer file upload flow in `app/[locale]/home/index.tsx`
- Technology: React with next-intlayer, Headless UI components, TypeScript
- Follows pattern: LanguageSwitcher component pattern in `app/components/common/LanguageSwitcher.tsx`
- Touch points: 
  - FileProcessingSection component UI
  - submitProductCategorization server action API call
  - useFileProcessing hook state management

## Acceptance Criteria

**Functional Requirements:**
1. Language selector dropdown appears in the FileProcessingSection component above the "Process" button
2. Dropdown defaults to current locale from `useLocale()` hook
3. All available locales are displayed using `getLocaleName()` with language flags
4. Selected language is passed to `submitProductCategorization()` as new parameter

**Integration Requirements:**
5. Existing file upload and processing workflow continues to work unchanged
6. New language selection follows existing LanguageSwitcher UI pattern (Menu/MenuButton from Headless UI)
7. Integration with submitProductCategorization maintains current API call structure

**Quality Requirements:**
8. Language selection is covered by appropriate tests in FileProcessingSection component
9. TypeScript types are updated for CategoryRequest schema if needed
10. No regression in existing file processing functionality verified

## Technical Implementation

### Files to Modify

1. **`features/SpeedgoOptimizer/presentation/FileProcessingSection.tsx`**
   - Add language dropdown above Process button
   - Follow LanguageSwitcher UI pattern
   - Pass selected language to processing function

2. **`features/SpeedgoOptimizer/hooks/useFileProcessing.ts`**
   - Add language state management
   - Pass language parameter to submitProductCategorization

3. **`features/SpeedgoOptimizer/application/submitProductCategorization.ts`**
   - Add optional language parameter
   - Include language in API request body

4. **`features/SpeedgoOptimizer/domain/schemas/CategoryRequest.ts`** (if exists)
   - Update schema to include language field

### Technical Notes

- **Integration Approach:** Add language selection state to useFileProcessing hook, pass through to submitProductCategorization
- **Existing Pattern Reference:** Follow `LanguageSwitcher.tsx` component for dropdown UI and locale handling
- **Key Constraints:** 
  - Per-upload session scope (not persisted)
  - Must use existing intlayer locale system
  - Should not affect existing API structure beyond adding language parameter

### UI Components Needed

```tsx
// Language selector following LanguageSwitcher pattern
const LanguageSelector = ({ selectedLanguage, onLanguageChange, availableLocales }) => {
  // Menu/MenuButton pattern with language flags and names
  // Default to current locale
  // Display all locales in current locale context
}
```

## Definition of Done

- [ ] Language dropdown added to FileProcessingSection with locale options
- [ ] Selected language passed to categorization API call
- [ ] Existing file processing workflow regression tested
- [ ] Code follows existing LanguageSwitcher and FileProcessingSection patterns
- [ ] Tests pass (existing and new component tests)
- [ ] TypeScript compilation successful with proper types

## Risk Assessment

**Minimal Risk Assessment:**
- **Primary Risk:** Breaking existing file processing flow if language parameter handling fails
- **Mitigation:** Add language parameter as optional with current locale fallback
- **Rollback:** Remove language dropdown UI and parameter passing

**Compatibility Verification:**
- [ ] No breaking changes to existing submitProductCategorization API
- [ ] Language parameter addition is backwards compatible
- [ ] UI changes follow existing FileProcessingSection design patterns
- [ ] Performance impact is negligible (simple dropdown state)

## Testing Strategy

### Unit Tests
- FileProcessingSection component with language dropdown
- useFileProcessing hook with language state
- submitProductCategorization with language parameter

### Integration Tests
- End-to-end file processing with language selection
- Verify existing workflow still works without language selection

### Regression Tests
- Existing file upload and processing functionality
- Language switching in other parts of the application

## Dependencies

**Existing Components:**
- `app/components/common/LanguageSwitcher.tsx` - UI pattern reference
- `features/SpeedgoOptimizer/presentation/FileProcessingSection.tsx` - Integration point
- `features/SpeedgoOptimizer/hooks/useFileProcessing.ts` - State management
- `features/SpeedgoOptimizer/application/submitProductCategorization.ts` - API integration

**External Dependencies:**
- next-intlayer (already integrated)
- @headlessui/react (already integrated)
- intlayer locale utilities (already integrated)

## Success Metrics

- Language selection dropdown appears and functions correctly
- Selected language is properly passed to categorization API
- No regression in existing file processing workflow
- All tests pass including new language selection tests
- TypeScript compilation successful

## Notes

- This is a small brownfield enhancement focused on a single feature addition
- Follows existing architectural patterns and UI components
- Minimal risk due to additive nature of changes
- Can be completed in a single focused development session
- Should take no more than 4 hours of development work

---

**Status:** Ready for Development  
**Assigned:** TBD  
**Sprint:** TBD