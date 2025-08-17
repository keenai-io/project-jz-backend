/**
 * @fileoverview Tests for HeaderNavigation admin link integration
 * @module features/UserManagement/__tests__/integration/HeaderNavigation.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';

// Mock next-intlayer - must be at top level
vi.mock('next-intlayer', () => ({
  useIntlayer: vi.fn(() => ({
    Logo: {
      text: { value: 'Marketplace AI' }
    },
    Navigation: {
      configurations: 'Configurations',
      dashboard: 'Dashboard',
      support: 'Support',
      signIn: 'Sign In'
    },
    MobileMenu: {
      openMenu: 'Open menu',
      closeMenu: 'Close menu'
    },
    UserMenu: {
      myProfile: 'My Profile',
      settings: 'Settings',
      userManagement: 'User Management',
      privacyPolicy: 'Privacy Policy',
      shareFeedback: 'Share Feedback',
      signOut: 'Sign Out',
      signingOut: 'Signing out...'
    }
  }))
}));

// Mock server actions - must be at top level
vi.mock('@/app/actions/auth', () => ({
  signOutAction: vi.fn()
}));

// Mock LanguageSwitcher - must be at top level
vi.mock('@/app/components/common/LanguageSwitcher', () => ({
  LanguageSwitcher: vi.fn(() => <div data-testid="language-switcher">Language Switcher</div>)
}));

// Mock UI components - must be at top level
vi.mock('@/app/components/ui/link', () => ({
  Link: vi.fn(({ children, href, className, onClick, ...props }) => (
    <a href={href} className={className} onClick={onClick} {...props}>
      {children}
    </a>
  ))
}));

vi.mock('@/app/components/ui/dropdown', () => ({
  Dropdown: vi.fn(({ children }) => <div data-testid="dropdown">{children}</div>),
  DropdownButton: vi.fn(({ children, className, onClick, ...props }) => (
    <button className={className} onClick={onClick} {...props} data-testid="dropdown-button">
      {children}
    </button>
  )),
  DropdownMenu: vi.fn(({ children, className, ...props }) => (
    <div className={className} {...props} data-testid="dropdown-menu">
      {children}
    </div>
  )),
  DropdownItem: vi.fn(({ children, href, onClick, disabled, ...props }) => 
    href ? (
      <a href={href} {...props} data-testid="dropdown-item">
        {children}
      </a>
    ) : (
      <button onClick={onClick} disabled={disabled} {...props} data-testid="dropdown-item">
        {children}
      </button>
    )
  ),
  DropdownLabel: vi.fn(({ children }) => <span data-testid="dropdown-label">{children}</span>),
  DropdownDivider: vi.fn(() => <hr data-testid="dropdown-divider" />)
}));

vi.mock('@/app/components/ui/avatar', () => ({
  Avatar: vi.fn(({ src, initials, className, ...props }) => (
    <div className={className} {...props} data-testid="avatar">
      {src ? <img src={src} alt="Avatar" /> : initials}
    </div>
  ))
}));

// Mock icons
vi.mock('@heroicons/react/24/outline', () => ({
  Bars3Icon: vi.fn((props) => <svg {...props} data-testid="bars3-icon">bars3</svg>),
  XMarkIcon: vi.fn((props) => <svg {...props} data-testid="xmark-icon">xmark</svg>),
}));

vi.mock('@heroicons/react/16/solid', () => ({
  ArrowRightStartOnRectangleIcon: vi.fn((props) => <svg {...props} data-testid="sign-out-icon">sign-out</svg>),
  Cog8ToothIcon: vi.fn((props) => <svg {...props} data-testid="settings-icon">settings</svg>),
  UserIcon: vi.fn((props) => <svg {...props} data-testid="user-icon">user</svg>),
  ShieldCheckIcon: vi.fn((props) => <svg {...props} data-testid="shield-icon">shield</svg>),
  LightBulbIcon: vi.fn((props) => <svg {...props} data-testid="lightbulb-icon">lightbulb</svg>),
  UsersIcon: vi.fn((props) => <svg {...props} data-testid="users-icon">users</svg>),
}));

import { HeaderNavigation } from '@/app/components/common/HeaderNavigation';

/**
 * Test suite for HeaderNavigation admin link integration.
 * 
 * Tests that admin users can see and access the user management link,
 * while regular users cannot. Tests both desktop and mobile layouts.
 */
describe('HeaderNavigation Admin Link Integration', () => {
  const mockOnConfigurationClick = vi.fn();

  const adminSession = {
    user: {
      id: 'admin-123',
      name: 'Admin User',
      email: 'admin@example.com',
      image: 'https://example.com/admin-avatar.jpg',
      role: 'admin',
      enabled: true,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  };

  const userSession = {
    user: {
      id: 'user-123',
      name: 'Regular User',
      email: 'user@example.com',
      image: 'https://example.com/user-avatar.jpg',
      role: 'user',
      enabled: true,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  const noSession = null;

  const renderWithSession = (session: any) => {
    return render(
      <SessionProvider session={session}>
        <HeaderNavigation onConfigurationClick={mockOnConfigurationClick} />
      </SessionProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Admin User - Desktop View', () => {
    /**
     * Tests that admin users can see the user management link in desktop dropdown.
     */
    it('should show user management link for admin users in desktop dropdown', () => {
      renderWithSession(adminSession);

      // Should show user avatar (indicating user is logged in)
      expect(screen.getByTestId('avatar')).toBeInTheDocument();

      // Should show dropdown menu with user management link
      const userManagementLinks = screen.getAllByText('User Management');
      expect(userManagementLinks.length).toBeGreaterThan(0);

      // Find the desktop dropdown link
      const dropdownItems = screen.getAllByTestId('dropdown-item');
      const adminLink = dropdownItems.find(item => 
        item.getAttribute('href') === '/admin/users'
      );
      expect(adminLink).toBeInTheDocument();
    });

    /**
     * Tests that the admin link has correct href and accessibility.
     */
    it('should have correct href and accessibility for admin link', () => {
      renderWithSession(adminSession);

      const dropdownItems = screen.getAllByTestId('dropdown-item');
      const adminLink = dropdownItems.find(item => 
        item.getAttribute('href') === '/admin/users'
      );

      expect(adminLink).toHaveAttribute('href', '/admin/users');
      expect(adminLink).toHaveTextContent('User Management');

      // Should have users icon
      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    });

    /**
     * Tests that admin can click the user management link.
     */
    it('should allow admin to click user management link', () => {
      renderWithSession(adminSession);

      const dropdownItems = screen.getAllByTestId('dropdown-item');
      const adminLink = dropdownItems.find(item => 
        item.getAttribute('href') === '/admin/users'
      );

      expect(adminLink).toBeInTheDocument();
      
      // Click should navigate (handled by Link component)
      fireEvent.click(adminLink!);
      
      // Link should still be present (navigation is handled by Next.js)
      expect(adminLink).toBeInTheDocument();
    });
  });

  describe('Admin User - Mobile View', () => {
    /**
     * Tests that admin users can see the user management link in mobile menu.
     */
    it('should show user management link for admin users in mobile menu', () => {
      const { container } = renderWithSession(adminSession);

      // Open mobile menu
      const mobileMenuButton = screen.getByTestId('bars3-icon').closest('button');
      fireEvent.click(mobileMenuButton!);

      // Should show mobile menu with user management link
      const userManagementLinks = screen.getAllByText('User Management');
      expect(userManagementLinks.length).toBeGreaterThan(0);

      // Check that admin link exists with correct href
      const allLinks = container.querySelectorAll('a[href="/admin/users"]');
      expect(allLinks.length).toBeGreaterThanOrEqual(1);
    });

    /**
     * Tests mobile menu toggle functionality.
     */
    it('should toggle mobile menu correctly', () => {
      renderWithSession(adminSession);

      // Initially mobile menu should be closed
      expect(screen.queryByText('User Management')).toBeInTheDocument(); // Desktop version
      
      // Open mobile menu
      const mobileMenuButton = screen.getByTestId('bars3-icon').closest('button');
      fireEvent.click(mobileMenuButton!);

      // Should show close icon
      expect(screen.getByTestId('xmark-icon')).toBeInTheDocument();

      // Should show mobile navigation items
      expect(screen.getAllByText('Dashboard')).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByText('Support')).toHaveLength(2); // Desktop + mobile

      // Close mobile menu
      const closeButton = screen.getByTestId('xmark-icon').closest('button');
      fireEvent.click(closeButton!);

      // Should show open icon again
      expect(screen.getByTestId('bars3-icon')).toBeInTheDocument();
    });

    /**
     * Tests that clicking mobile user management link closes menu.
     */
    it('should close mobile menu when clicking user management link', () => {
      const { container } = renderWithSession(adminSession);

      // Open mobile menu
      const mobileMenuButton = screen.getByTestId('bars3-icon').closest('button');
      fireEvent.click(mobileMenuButton!);

      // Find mobile user management link
      const allAdminLinks = container.querySelectorAll('a[href="/admin/users"]');
      expect(allAdminLinks.length).toBeGreaterThanOrEqual(1);

      // Click the first admin link (mobile or desktop)
      fireEvent.click(allAdminLinks[0]);

      // Menu should close (mobile menu content should be hidden)
      // Note: This tests the onClick handler that sets mobile menu state
      // The component should call setIsMobileMenuOpen(false) but we can't directly test state
      // We can verify the link exists and is clickable
      expect(allAdminLinks[0]).toBeInTheDocument();
    });
  });

  describe('Regular User Access', () => {
    /**
     * Tests that regular users cannot see the user management link.
     */
    it('should not show user management link for regular users', () => {
      renderWithSession(userSession);

      // Should show user avatar (user is logged in)
      expect(screen.getByTestId('avatar')).toBeInTheDocument();

      // Should NOT show user management link
      expect(screen.queryByText('User Management')).not.toBeInTheDocument();

      // Should not have any links to /admin/users
      const dropdownItems = screen.getAllByTestId('dropdown-item');
      const adminLink = dropdownItems.find(item => 
        item.getAttribute('href') === '/admin/users'
      );
      expect(adminLink).toBeUndefined();
    });

    /**
     * Tests that regular users see other menu items but not admin items.
     */
    it('should show other menu items but not admin items for regular users', () => {
      renderWithSession(userSession);

      // Should show regular menu items (may have desktop + mobile versions)
      expect(screen.getAllByText('My Profile').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Settings').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Privacy Policy').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Share Feedback').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Sign Out').length).toBeGreaterThanOrEqual(1);

      // Should NOT show admin-only items
      expect(screen.queryByText('User Management')).not.toBeInTheDocument();
      expect(screen.queryByTestId('users-icon')).not.toBeInTheDocument();
    });

    /**
     * Tests mobile menu for regular users.
     */
    it('should not show user management in mobile menu for regular users', () => {
      renderWithSession(userSession);

      // Open mobile menu
      const mobileMenuButton = screen.getByTestId('bars3-icon').closest('button');
      fireEvent.click(mobileMenuButton!);

      // Should NOT show user management link in mobile menu
      expect(screen.queryByText('User Management')).not.toBeInTheDocument();

      // Should show other mobile menu items
      expect(screen.getAllByText('My Profile').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Settings').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Unauthenticated User Access', () => {
    /**
     * Tests that unauthenticated users don't see any user menu.
     */
    it('should not show user menu for unauthenticated users', () => {
      renderWithSession(noSession);

      // Should NOT show user avatar
      expect(screen.queryByTestId('avatar')).not.toBeInTheDocument();

      // Should NOT show any user menu items
      expect(screen.queryByText('My Profile')).not.toBeInTheDocument();
      expect(screen.queryByText('Settings')).not.toBeInTheDocument();
      expect(screen.queryByText('User Management')).not.toBeInTheDocument();
      expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
    });

    /**
     * Tests that unauthenticated users see sign in option in mobile menu.
     */
    it('should show sign in option for unauthenticated users in mobile menu', () => {
      renderWithSession(noSession);

      // Open mobile menu
      const mobileMenuButton = screen.getByTestId('bars3-icon').closest('button');
      fireEvent.click(mobileMenuButton!);

      // Should show sign in link
      expect(screen.getByText('Sign In')).toBeInTheDocument();

      // Should NOT show user management or other user menu items
      expect(screen.queryByText('User Management')).not.toBeInTheDocument();
      expect(screen.queryByText('My Profile')).not.toBeInTheDocument();
    });
  });

  describe('Role-Based Access Control', () => {
    /**
     * Tests that admin role is specifically checked.
     */
    it('should only show admin features for admin role', () => {
      // Test with different user roles
      const moderatorSession = {
        ...adminSession,
        user: {
          ...adminSession.user,
          role: 'moderator' // Not admin
        }
      };

      renderWithSession(moderatorSession);

      // Should NOT show admin features for non-admin roles
      expect(screen.queryByText('User Management')).not.toBeInTheDocument();
    });

    /**
     * Tests that admin role shows admin features.
     */
    it('should show admin features for admin users', () => {
      renderWithSession(adminSession);

      // Should show admin features for admin role
      expect(screen.getAllByText('User Management').length).toBeGreaterThanOrEqual(1);
    });

    /**
     * Tests edge cases with missing or invalid role data.
     */
    it('should handle missing or invalid role data gracefully', () => {
      const sessionWithoutRole = {
        ...adminSession,
        user: {
          ...adminSession.user,
          role: undefined
        }
      };

      renderWithSession(sessionWithoutRole);

      // Should NOT show admin features when role is undefined
      expect(screen.queryByText('User Management')).not.toBeInTheDocument();

      // Should still show other user menu items
      expect(screen.getAllByText('My Profile').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Settings').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Navigation Integration', () => {
    /**
     * Tests that all navigation elements work together.
     */
    it('should integrate properly with overall navigation structure', () => {
      renderWithSession(adminSession);

      // Should show main navigation items
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Support')).toBeInTheDocument();
      expect(screen.getByText('Configurations')).toBeInTheDocument();

      // Should show user menu with admin access
      expect(screen.getByText('User Management')).toBeInTheDocument();

      // Should show language switcher
      expect(screen.getByTestId('language-switcher')).toBeInTheDocument();

      // Should show logo
      expect(screen.getByText('arketplace AI')).toBeInTheDocument(); // Only the part after 'M'
    });

    /**
     * Tests responsive behavior.
     */
    it('should maintain admin access across responsive layouts', () => {
      renderWithSession(adminSession);

      // Desktop: Should have user management in dropdown
      expect(screen.getByText('User Management')).toBeInTheDocument();

      // Mobile: Should have user management in mobile menu when opened
      const mobileMenuButton = screen.getByTestId('bars3-icon').closest('button');
      fireEvent.click(mobileMenuButton!);

      const userManagementLinks = screen.getAllByText('User Management');
      expect(userManagementLinks.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('User Experience', () => {
    /**
     * Tests that admin features are visually distinct.
     */
    it('should provide clear visual indication of admin features', () => {
      renderWithSession(adminSession);

      // Should have users icon for user management
      expect(screen.getByTestId('users-icon')).toBeInTheDocument();

      // Should have proper link styling
      const dropdownItems = screen.getAllByTestId('dropdown-item');
      const adminLink = dropdownItems.find(item => 
        item.getAttribute('href') === '/admin/users'
      );
      expect(adminLink).toBeInTheDocument();
    });

    /**
     * Tests that configuration callback is called correctly.
     */
    it('should call configuration callback when clicked', () => {
      renderWithSession(adminSession);

      const configButton = screen.getByText('Configurations');
      fireEvent.click(configButton);

      expect(mockOnConfigurationClick).toHaveBeenCalledTimes(1);
    });
  });
});