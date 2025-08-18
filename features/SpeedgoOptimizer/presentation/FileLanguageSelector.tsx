'use client';

import { Fragment, ReactElement } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { getLocaleName, getHTMLTextDir } from "intlayer";
import { useLocale, useIntlayer } from 'next-intlayer';
import { Locales } from 'intlayer';

interface FileLanguageSelectorProps {
  /** Currently selected language for file processing */
  selectedLanguage: Locales | null;
  /** Callback when language selection changes */
  onLanguageChange: (language: Locales) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
}

/**
 * File Language Selector Component
 * 
 * Allows users to select the language for file categorization processing.
 * Follows the same UI pattern as LanguageSwitcher but for per-upload session scope.
 * 
 * @component
 * @example
 * ```tsx
 * <FileLanguageSelector 
 *   selectedLanguage={selectedLang}
 *   onLanguageChange={setSelectedLang}
 * />
 * ```
 */
export function FileLanguageSelector({
  selectedLanguage,
  onLanguageChange,
  disabled = false
}: FileLanguageSelectorProps): ReactElement {
  const { locale, availableLocales } = useLocale();
  const content = useIntlayer<'file-language-selector'>('file-language-selector');

  // Language flags/icons - following LanguageSwitcher pattern
  const languageFlags: Record<string, string> = {
    en: '🇺🇸',
    ko: '🇰🇷',
  };

  // Use selected language or fallback to current locale
  const displayLanguage = selectedLanguage || (locale as Locales);

  const handleLanguageSelect = (newLanguage: string): void => {
    onLanguageChange(newLanguage as Locales);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {content.label.value}
      </label>
      
      <Menu as="div" className="relative inline-block text-left w-full" key={displayLanguage}>
        <MenuButton 
          disabled={disabled}
          className={clsx(
            "inline-flex w-full justify-between gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300",
            disabled 
              ? "opacity-50 cursor-not-allowed" 
              : "hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          )}
        >
          <div className="flex items-center gap-x-2">
            <GlobeAltIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
            <span className="flex items-center gap-2">
              <span className="text-base">
                {languageFlags[displayLanguage]}
              </span>
              <span dir={getHTMLTextDir(displayLanguage)} lang={displayLanguage}>
                {getLocaleName(displayLanguage, locale)}
              </span>
            </span>
          </div>
          <ChevronDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
        </MenuButton>

        <MenuItems 
          transition
          className="absolute left-0 z-10 mt-2 w-full origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
        >
          <div className="py-1">
            {availableLocales.map((availableLocale) => (
              <MenuItem key={availableLocale} as={Fragment}>
                <button
                  type="button"
                  onClick={() => handleLanguageSelect(availableLocale)}
                  className={clsx(
                    'block w-full px-4 py-2 text-left text-sm transition-colors',
                    displayLanguage === availableLocale
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">
                      {languageFlags[availableLocale]}
                    </span>
                    <span dir={getHTMLTextDir(availableLocale)} lang={availableLocale}>
                      {getLocaleName(availableLocale, locale)}
                    </span>
                    {displayLanguage === availableLocale && (
                      <span className="ml-auto text-xs text-gray-500">✓</span>
                    )}
                  </span>
                </button>
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Menu>
      
      <p className="mt-1 text-xs text-gray-500">
        {content.description.value}
      </p>
    </div>
  );
}