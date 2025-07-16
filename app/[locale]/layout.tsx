export {generateStaticParams} from "next-intlayer"; // Line to insert
import type {NextLayoutIntlayer} from "next-intlayer";
import {Inter} from "next/font/google";
import {getHTMLTextDir} from "intlayer";
import {StackedLayout} from "@components/stacked-layout";
import {Navbar, NavbarDivider, NavbarItem, NavbarSection, NavbarSpacer} from "@components/navbar";
import {Avatar} from '@components/avatar'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@components/dropdown'
import {Sidebar, SidebarBody, SidebarHeader, SidebarItem, SidebarSection} from '@components/sidebar'
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
import {Text} from "@components/text";

const inter = Inter({subsets: ["latin"]});

const navItems = [
  {label: 'Configurations', url: '/'},
  {label: 'Dashboard', url: '/events'}
]

function TeamDropdownMenu() {
  return (
    <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
      <DropdownItem href="/teams/1/settings">
        <Cog8ToothIcon/>
        <DropdownLabel>Settings</DropdownLabel>
      </DropdownItem>
      <DropdownDivider/>
      <DropdownItem href="/teams/1">
        <Avatar slot="icon" src="/tailwind-logo.svg"/>
        <DropdownLabel>Tailwind Labs</DropdownLabel>
      </DropdownItem>
      <DropdownItem href="/teams/2">
        <Avatar slot="icon" initials="WC" className="bg-purple-500 text-white"/>
        <DropdownLabel>Workcation</DropdownLabel>
      </DropdownItem>
      <DropdownDivider/>
      <DropdownItem href="/teams/create">
        <PlusIcon/>
        <DropdownLabel>New team&hellip;</DropdownLabel>
      </DropdownItem>
    </DropdownMenu>
  )
}

const LocaleLayout: NextLayoutIntlayer = async ({children, params}) => {
  const {locale} = await params;
  return (
    <html lang={locale} dir={getHTMLTextDir(locale)}>
    <body className={inter.className}>
    <StackedLayout
      navbar={
        <Navbar>
          <Dropdown>
            <DropdownButton as={NavbarItem} className="max-lg:hidden">
              <Image priority={true} width={200} height={200} src="/logo.png" alt={""}/>
              <ChevronDownIcon/>
            </DropdownButton>
            <TeamDropdownMenu/>
          </Dropdown>
          <NavbarDivider className="max-lg:hidden"/>
          <NavbarSection className="max-lg:hidden">
            {navItems.map(({label, url}) => (
              <NavbarItem key={label} href={url}>
                {label}
              </NavbarItem>
            ))}
          </NavbarSection>
          <NavbarSpacer/>
          <NavbarSection>
            <NavbarItem href="/support" aria-label="Support">
              <Text>Support</Text>
            </NavbarItem>
            <Dropdown>
              <DropdownButton as={NavbarItem}>
                <Avatar src="/profile-photo.jpg" square/>
              </DropdownButton>
              <DropdownMenu className="min-w-64" anchor="bottom end">
                <DropdownItem href="/my-profile">
                  <UserIcon/>
                  <DropdownLabel>My profile</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="/settings">
                  <Cog8ToothIcon/>
                  <DropdownLabel>Settings</DropdownLabel>
                </DropdownItem>
                <DropdownDivider/>
                <DropdownItem href="/privacy-policy">
                  <ShieldCheckIcon/>
                  <DropdownLabel>Privacy policy</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="/share-feedback">
                  <LightBulbIcon/>
                  <DropdownLabel>Share feedback</DropdownLabel>
                </DropdownItem>
                <DropdownDivider/>
                <DropdownItem href="/logout">
                  <ArrowRightStartOnRectangleIcon/>
                  <DropdownLabel>Sign out</DropdownLabel>
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
                <Avatar src="/icon.png"/>
                <ChevronDownIcon/>
              </DropdownButton>
              <TeamDropdownMenu/>
            </Dropdown>
          </SidebarHeader>
          <SidebarBody>
            <SidebarSection>
              {navItems.map(({label, url}) => (
                <SidebarItem key={label} href={url}>
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
    </body>
    </html>
  );
};

export default LocaleLayout;
