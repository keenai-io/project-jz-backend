'use client'

import { ReactElement, useState, useCallback, useTransition } from 'react';
import { Link } from '@/app/components/ui/link';
import { useSession } from 'next-auth/react';
import { LanguageSwitcher } from '@/app/components/common/LanguageSwitcher';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useIntlayer } from 'next-intlayer';
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@components/ui/dropdown';
import { Avatar } from '@components/ui/avatar';
import {
  ArrowRightStartOnRectangleIcon,
  Cog8ToothIcon,
  UserIcon,
  ShieldCheckIcon,
  LightBulbIcon,
} from '@heroicons/react/16/solid';
import { signOutAction } from '@/app/actions/auth';

interface HeaderNavigationProps {
  onConfigurationClick: () => void;
}

/**
 * Header Navigation Component
 * 
 * Provides the main navigation header with logo, navigation links, and user avatar.
 * Matches the design shown in the reference home screen.
 */
export function HeaderNavigation({ onConfigurationClick }: HeaderNavigationProps): ReactElement {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigningOut, startSignOutTransition] = useTransition();
  const content = useIntlayer<'header-navigation'>('header-navigation');

  const handleSignOut = useCallback((e: React.MouseEvent): void => {
    e.preventDefault();
    startSignOutTransition(async () => {
      try {
        await signOutAction();
      } catch (error) {
        console.error('Sign out failed:', error);
      }
    });
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-500">
              <span className="text-blue-500">M</span>{content.Logo.text.value.substring(1)}
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={onConfigurationClick}
              className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
            >
              {content.Navigation.configurations}
            </button>
            <Link 
              href="/dashboard" 
              className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {content.Navigation.dashboard}
            </Link>
            <Link 
              href="/support" 
              className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {content.Navigation.support}
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 p-2 rounded-md"
            >
              <span className="sr-only">{isMobileMenuOpen ? content.MobileMenu.closeMenu : content.MobileMenu.openMenu}</span>
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Desktop - Language Switcher and User Avatar */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            {session?.user ? (
              <Dropdown>
                <DropdownButton className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Avatar 
                    src={session.user.image || undefined} 
                    initials={session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                    className="w-8 h-8 bg-orange-400 text-white"
                  />
                </DropdownButton>
                <DropdownMenu className="w-72" anchor="bottom end">
                  <DropdownItem href="/my-profile">
                    <UserIcon />
                    <DropdownLabel>{content.UserMenu.myProfile}</DropdownLabel>
                  </DropdownItem>
                  <DropdownItem href="/settings">
                    <Cog8ToothIcon />
                    <DropdownLabel>{content.UserMenu.settings}</DropdownLabel>
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem href="/privacy-policy">
                    <ShieldCheckIcon />
                    <DropdownLabel>{content.UserMenu.privacyPolicy}</DropdownLabel>
                  </DropdownItem>
                  <DropdownItem href="/share-feedback">
                    <LightBulbIcon />
                    <DropdownLabel>{content.UserMenu.shareFeedback}</DropdownLabel>
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem onClick={handleSignOut} disabled={isSigningOut}>
                    <ArrowRightStartOnRectangleIcon />
                    <DropdownLabel>
                      {isSigningOut ? content.UserMenu.signingOut : content.UserMenu.signOut}
                    </DropdownLabel>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <Link 
                href="/signin" 
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {content.Navigation.signIn}
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {onConfigurationClick ? (
                <button 
                  onClick={() => {
                    onConfigurationClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                >
                  {content.Navigation.configurations}
                </button>
              ) : (
                <Link 
                  href="/configurations" 
                  className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {content.Navigation.configurations}
                </Link>
              )}
              <Link 
                href="/dashboard" 
                className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {content.Navigation.dashboard}
              </Link>
              <Link 
                href="/support" 
                className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {content.Navigation.support}
              </Link>
              
              {/* Mobile Language Switcher and Auth */}
              <div className="pt-4 border-t border-gray-200 mt-4">
                <div className="px-3 py-2">
                  <LanguageSwitcher />
                </div>
                {!session?.user && (
                  <Link 
                    href="/signin" 
                    className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {content.Navigation.signIn}
                  </Link>
                )}
                {session?.user && (
                  <div className="border-t border-gray-200 mt-4 pt-4">
                    <div className="flex items-center px-3 py-2 mb-3">
                      <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-medium text-sm mr-3">
                        {session.user.name?.charAt(0)?.toUpperCase() || 
                         session.user.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="text-gray-900 text-sm font-medium">
                        {session.user.name || session.user.email}
                      </div>
                    </div>
                    
                    {/* Mobile User Menu Items */}
                    <div className="space-y-1">
                      <Link 
                        href="/my-profile" 
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <UserIcon className="w-5 h-5 mr-3 text-gray-400" />
                        {content.UserMenu.myProfile}
                      </Link>
                      <Link 
                        href="/settings" 
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Cog8ToothIcon className="w-5 h-5 mr-3 text-gray-400" />
                        {content.UserMenu.settings}
                      </Link>
                      <Link 
                        href="/privacy-policy" 
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <ShieldCheckIcon className="w-5 h-5 mr-3 text-gray-400" />
                        {content.UserMenu.privacyPolicy}
                      </Link>
                      <Link 
                        href="/share-feedback" 
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <LightBulbIcon className="w-5 h-5 mr-3 text-gray-400" />
                        {content.UserMenu.shareFeedback}
                      </Link>
                      <button 
                        onClick={(e) => {
                          handleSignOut(e);
                          setIsMobileMenuOpen(false);
                        }}
                        disabled={isSigningOut}
                        className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-3 text-gray-400" />
                        {isSigningOut ? content.UserMenu.signingOut : content.UserMenu.signOut}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}