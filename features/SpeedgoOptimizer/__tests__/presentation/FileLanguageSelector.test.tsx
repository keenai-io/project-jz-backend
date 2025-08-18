/**
 * @fileoverview Tests for FileLanguageSelector component
 * @module features/SpeedgoOptimizer/__tests__/presentation/FileLanguageSelector.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileLanguageSelector } from '../../presentation/FileLanguageSelector';

// Mock next-intlayer
vi.mock('next-intlayer', () => ({
  useLocale: vi.fn(() => ({
    locale: 'en',
    availableLocales: ['en', 'ko']
  })),
  useIntlayer: vi.fn(() => ({
    label: { value: 'File Language' },
    description: { value: 'Select the language of your files' }
  }))
}));

// Mock intlayer functions  
vi.mock('intlayer', () => ({
  getLocaleName: vi.fn((locale, displayLocale) => {
    const names: Record<string, Record<string, string>> = {
      en: { en: 'English', ko: 'English' },
      ko: { en: '한국어', ko: '한국어' }
    };
    return names[locale]?.[displayLocale] || locale;
  }),
  getHTMLTextDir: vi.fn(() => 'ltr'),
  Locales: {
    ENGLISH: 'en',
    KOREAN: 'ko'
  }
}));

/**
 * Test suite for FileLanguageSelector component.
 * 
 * Tests language selection UI, state management, and user interactions.
 */
describe('FileLanguageSelector', () => {
  const mockOnLanguageChange = vi.fn();

  const defaultProps = {
    selectedLanguage: null,
    onLanguageChange: mockOnLanguageChange,
    disabled: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Tests that component renders with default props.
   */
  it('should render file language selector', () => {
    render(<FileLanguageSelector {...defaultProps} />);
    
    expect(screen.getByText('File Language')).toBeInTheDocument();
    expect(screen.getByText('Select the language of your files')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  /**
   * Tests that component shows current locale when no language is selected.
   */
  it('should show current locale when no language selected', () => {
    render(<FileLanguageSelector {...defaultProps} />);
    
    // Should show English (current locale) by default
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('🇺🇸')).toBeInTheDocument();
  });

  /**
   * Tests that component shows selected language when one is chosen.
   */
  it('should show selected language when provided', () => {
    render(
      <FileLanguageSelector 
        {...defaultProps} 
        selectedLanguage={'ko' as any}
      />
    );
    
    // Should show Korean when selected
    expect(screen.getByText('한국어')).toBeInTheDocument();
    expect(screen.getByText('🇰🇷')).toBeInTheDocument();
  });

  /**
   * Tests that clicking opens the language dropdown.
   */
  it('should open dropdown when clicked', async () => {
    const user = userEvent.setup();
    render(<FileLanguageSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    // Should show available language options
    const englishOption = screen.getAllByText('English');
    const koreanOption = screen.getAllByText('한국어');
    
    expect(englishOption.length).toBeGreaterThan(1); // Button + dropdown option
    expect(koreanOption.length).toBeGreaterThan(0); // Dropdown option
  });

  /**
   * Tests that selecting a language calls the onChange handler.
   */
  it('should call onLanguageChange when language is selected', async () => {
    const user = userEvent.setup();
    render(<FileLanguageSelector {...defaultProps} />);
    
    // Open dropdown
    const button = screen.getByRole('button');
    await user.click(button);
    
    // Click on Korean option (the second 한국어 text in the DOM)
    const koreanOptions = screen.getAllByText('한국어');
    await user.click(koreanOptions[0]); // Click the dropdown option
    
    expect(mockOnLanguageChange).toHaveBeenCalledWith('ko');
  });

  /**
   * Tests that component is disabled when disabled prop is true.
   */
  it('should be disabled when disabled prop is true', () => {
    render(
      <FileLanguageSelector 
        {...defaultProps} 
        disabled={true}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  /**
   * Tests that component shows checkmark for selected language.
   */
  it('should show checkmark for selected language', async () => {
    const user = userEvent.setup();
    render(
      <FileLanguageSelector 
        {...defaultProps} 
        selectedLanguage={'ko' as any}
      />
    );
    
    // Open dropdown
    const button = screen.getByRole('button');
    await user.click(button);
    
    // Should show checkmark for Korean (selected language)
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  /**
   * Tests accessibility features.
   */
  it('should have proper accessibility attributes', () => {
    render(<FileLanguageSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    
    // Should have label text
    expect(screen.getByText('File Language')).toBeInTheDocument();
    
    // Should have description text
    expect(screen.getByText('Select the language of your files')).toBeInTheDocument();
  });
});