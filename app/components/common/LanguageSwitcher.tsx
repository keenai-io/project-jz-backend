'use client';

import { useLocale, useIntlayer } from 'next-intlayer';
import { Fragment, ReactElement } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

/**
 * Language switcher dropdown component.
 * 
 * Allows users to switch between available locales using a dropdown menu.
 * Integrates with next-intlayer's useLocale hook for seamless language switching.
 * 
 * @component
 * @example
 * ```tsx
 * <LanguageSwitcher />
 * ```
 */
export const LanguageSwitcher = (): ReactElement => {
  const { locale, availableLocales, setLocale } = useLocale();
  const content = useIntlayer<'language-switcher'>('language-switcher');

  // Language display names - these will automatically use the current locale context
  const getLanguageName = (localeCode: string): string => {
    switch(localeCode) {
      case 'en':
        return content.languages.english.toString();
      case 'ko':
        return content.languages.korean.toString();
      default:
        return localeCode;
    }
  };

  // Language flags/icons
  const languageFlags: Record<string, string> = {
    en: '🇺🇸',
    ko: '🇰🇷',
  };

  const handleLocaleChange = (newLocale: string): void => {
    // TypeScript doesn't recognize the locale string as a valid LocalesValues
    // but we know it's valid since it comes from availableLocales
    setLocale(newLocale as typeof locale);
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
        <GlobeAltIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
        <span className="sr-only">{content.switchLanguage.toString()}</span>
        <span className="hidden sm:inline">
          {languageFlags[locale]} {getLanguageName(locale)}
        </span>
        <span className="sm:hidden">
          {languageFlags[locale]}
        </span>
        <ChevronDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
      </MenuButton>

      <MenuItems 
        transition
        className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="py-1">
          {availableLocales.map((availableLocale) => (
            <MenuItem key={availableLocale} as={Fragment}>
              <button
                onClick={() => handleLocaleChange(availableLocale)}
                className={clsx(
                  'block w-full px-4 py-2 text-left text-sm transition-colors',
                  locale === availableLocale
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900'
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">
                    {languageFlags[availableLocale]}
                  </span>
                  <span>
                    {getLanguageName(availableLocale)}
                  </span>
                  {locale === availableLocale && (
                    <span className="ml-auto text-xs text-gray-500">✓</span>
                  )}
                </span>
              </button>
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  );
};