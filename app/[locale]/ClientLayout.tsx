'use client'

import { ReactElement, ReactNode, useState, useCallback, lazy, Suspense } from 'react';
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
import type { ConfigurationForm } from '@features/Configuration';

// Lazy load the ConfigurationModal to avoid SSG issues
const ConfigurationModal = lazy(() => import('@features/Configuration').then(module => ({
  default: module.ConfigurationModal
})));

interface ClientLayoutProps {
  children: ReactNode;
  content: {
    navigation: {
      configurations: string;
      dashboard: string;
    };
    userMenu: {
      support: string;
      myProfile: string;
      settings: string;
      privacyPolicy: string;
      shareFeedback: string;
      signOut: string;
    };
    teamDropdown: {
      settings: string;
      tailwindLabs: string;
      workcation: string;
      newTeam: string;
    };
  };
}

/**
 * Client-side layout component that manages the configuration modal state
 */
export function ClientLayout({ children, content }: ClientLayoutProps): ReactElement {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const handleConfigurationClick = useCallback((e: React.MouseEvent): void => {
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
    <>
      <StackedLayout
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
                  key={label} 
                  href={url}
                  onClick={onClick}
                >
                  {label}
                </NavbarItem>
              ))}
            </NavbarSection>
            <NavbarSpacer />
            <NavbarSection>
              <NavbarItem href="/support" aria-label={content.userMenu.support}>
                <Text>{content.userMenu.support}</Text>
              </NavbarItem>
              <Dropdown>
                <DropdownButton as={NavbarItem}>
                  <Avatar src="/profile-photo.jpg" square />
                </DropdownButton>
                <DropdownMenu className="min-w-64" anchor="bottom end">
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
                  <DropdownItem href="/logout">
                    <ArrowRightStartOnRectangleIcon />
                    <DropdownLabel>{content.userMenu.signOut}</DropdownLabel>
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
                  <Avatar src="/icon.png" />
                  <ChevronDownIcon />
                </DropdownButton>
                <TeamDropdownMenu />
              </Dropdown>
            </SidebarHeader>
            <SidebarBody>
              <SidebarSection>
                {getNavItems().map(({ label, url, onClick }) => (
                  <SidebarItem 
                    key={label} 
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
        <Suspense fallback={null}>
          <ConfigurationModal
            isOpen={isConfigModalOpen}
            onClose={() => setIsConfigModalOpen(false)}
            onSave={handleConfigSave}
          />
        </Suspense>
      )}
    </>
  );
}