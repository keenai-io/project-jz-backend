'use client'

import { ReactElement, ReactNode, useState, useCallback, MouseEvent, useTransition } from 'react';
import { QueryErrorBoundary } from '@/app/components/error-boundaries/QueryErrorBoundary';
import { StackedLayout } from "@components/ui/stacked-layout";
import { Navbar, NavbarDivider, NavbarItem, NavbarSection, NavbarSpacer } from "@components/ui/navbar";
import { Avatar } from '@components/ui/avatar'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@components/ui/dropdown'
import { Sidebar, SidebarBody, SidebarHeader, SidebarItem, SidebarSection } from '@components/ui/sidebar'
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/16/solid'
import Image from 'next/image'
import { Text } from "@components/ui/text";
import { LanguageSwitcher } from '@components/common/LanguageSwitcher';
import { ConfigurationModal } from '@features/Configuration';
import type { ConfigurationForm } from '@features/Configuration';
import {useIntlayer, useLocale} from "next-intlayer";
import { signOutAction } from '@/app/actions/auth';
import { useSession } from 'next-auth/react';

interface ClientLayoutProps {
  children: ReactNode;
}

/**
 * Client-side layout component that manages the configuration modal state
 */
export function ClientLayout({ children }: ClientLayoutProps): ReactElement {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isSigningOut, startSignOutTransition] = useTransition();
  const { data: session } = useSession();
  const { locale } = useLocale();
  const content = useIntlayer<'layout'>("layout", locale);
  const handleConfigurationClick = useCallback((e: MouseEvent): void => {
    e.preventDefault();
    setIsConfigModalOpen(true);
  }, []);

  const handleConfigSave = useCallback(async (data: ConfigurationForm): Promise<void> => {
    try {
      // TODO: In a real app, you would save this to your backend
      console.log('Saving configuration:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just log the data and close the modal
      setIsConfigModalOpen(false);
    } catch (error) {
      console.error('Failed to save configuration:', error);
      throw error; // Re-throw so the modal can handle the error
    }
  }, []);

  const handleSignOut = useCallback((e: MouseEvent): void => {
    e.preventDefault();
    startSignOutTransition(async () => {
      try {
        await signOutAction();
      } catch (error) {
        console.error('Sign out failed:', error);
        // You could show a toast notification here
      }
    });
  }, []);

  const getNavItems = () => [
    {
      label: content.navigation.configurations,
      url: '#',
      onClick: handleConfigurationClick,
      isConfigModal: true
    },
    {
      label: content.navigation.dashboard,
      url: '/events',
      onClick: undefined,
      isConfigModal: false
    }
  ];

  function TeamDropdownMenu(): ReactElement {
    return (
      <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
        <DropdownItem href="/teams/1/settings">
          <Cog8ToothIcon />
          <DropdownLabel>{content.teamDropdown.settings}</DropdownLabel>
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem href="/teams/1">
          <Avatar slot="icon" src="/tailwind-logo.svg" />
          <DropdownLabel>{content.teamDropdown.tailwindLabs}</DropdownLabel>
        </DropdownItem>
        <DropdownItem href="/teams/2">
          <Avatar slot="icon" initials="WC" className="bg-purple-500 text-white" />
          <DropdownLabel>{content.teamDropdown.workcation}</DropdownLabel>
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem href="/teams/create">
          <PlusIcon />
          <DropdownLabel>{content.teamDropdown.newTeam}</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
    )
  }

  return (
        <QueryErrorBoundary>
        <StackedLayout
        key={locale}
        navbar={
          <Navbar>
            <Dropdown>
              <DropdownButton as={NavbarItem} className="max-lg:hidden">
                <Image priority={true} width={200} height={200} src="/logo.png" alt="" />
                <ChevronDownIcon />
              </DropdownButton>
              <TeamDropdownMenu />
            </Dropdown>
            <NavbarDivider className="max-lg:hidden" />
            <NavbarSection className="max-lg:hidden">
              {getNavItems().map(({ label, url, onClick }) => (
                <NavbarItem 
                  key={label.value}
                  href={url}
                  onClick={onClick}
                >
                  {label}
                </NavbarItem>
              ))}
            </NavbarSection>
            <NavbarSpacer />
            <NavbarSection>
              <NavbarItem href="/support" aria-label={content.userMenu.support.value}>
                <Text>{content.userMenu.support}</Text>
              </NavbarItem>
              <LanguageSwitcher />
              <Dropdown>
                <DropdownButton as={NavbarItem}>
                  <Avatar 
                    src={session?.user?.image || undefined} 
                    initials={session?.user?.name?.charAt(0) || 'U'}
                    square 
                  />
                </DropdownButton>
                <DropdownMenu className="w-72" anchor="bottom end">
                  <DropdownItem href="/my-profile">
                    <UserIcon />
                    <DropdownLabel>{content.userMenu.myProfile}</DropdownLabel>
                  </DropdownItem>
                  <DropdownItem href="/settings">
                    <Cog8ToothIcon />
                    <DropdownLabel>{content.userMenu.settings}</DropdownLabel>
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem href="/privacy-policy">
                    <ShieldCheckIcon />
                    <DropdownLabel>{content.userMenu.privacyPolicy}</DropdownLabel>
                  </DropdownItem>
                  <DropdownItem href="/share-feedback">
                    <LightBulbIcon />
                    <DropdownLabel>{content.userMenu.shareFeedback}</DropdownLabel>
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem onClick={handleSignOut} disabled={isSigningOut}>
                    <ArrowRightStartOnRectangleIcon />
                    <DropdownLabel>
                      {isSigningOut ? content.userMenu.signingOut : content.userMenu.signOut}
                    </DropdownLabel>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarSection>
          </Navbar>
        }
        sidebar={
          <Sidebar>
            <SidebarHeader>
              <Dropdown>
                <DropdownButton as={SidebarItem} className="lg:mb-2.5">
                  <Avatar 
                    src={session?.user?.image || "/icon.png"}
                    initials={session?.user?.name?.charAt(0) || 'U'}
                  />
                  <Text className="truncate">{session?.user?.name || 'User'}</Text>
                  <ChevronDownIcon />
                </DropdownButton>
                <TeamDropdownMenu />
              </Dropdown>
            </SidebarHeader>
            <SidebarBody>
              <SidebarSection>
                {getNavItems().map(({ label, url, onClick }) => (
                  <SidebarItem 
                    key={label.value}
                    href={url}
                    onClick={onClick}
                  >
                    {label}
                  </SidebarItem>
                ))}
              </SidebarSection>
            </SidebarBody>
          </Sidebar>
        }
      >
        {children}
      </StackedLayout>

      {/* Configuration Modal */}
      {isConfigModalOpen && (
        <ConfigurationModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          onSave={handleConfigSave}
        />
      )}
        </QueryErrorBoundary>
  );
}