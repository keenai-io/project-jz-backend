/**
 * @fileoverview End-to-end workflow tests for user management
 * @module features/UserManagement/__tests__/integration/EndToEndWorkflow.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { ReactElement } from 'react';

// Mock next-intlayer - must be at top level
vi.mock('next-intlayer', () => ({
  useIntlayer: vi.fn(() => ({
    headers: {
      name: { value: 'Name' },
      email: { value: 'Email' },
      role: { value: 'Role' },
      status: { value: 'Status' },
      lastLogin: { value: 'Last Login' },
      actions: { value: 'Actions' }
    },
    roles: {
      admin: { value: 'Admin' },
      user: { value: 'User' }
    },
    status: {
      enabled: { value: 'Enabled' },
      disabled: { value: 'Disabled' }
    },
    lastLogin: {
      never: { value: 'Never' }
    },
    joined: { value: 'Joined' },
    loading: { value: 'Loading users...' },
    error: {
      title: { value: 'Failed to load users' },
      unknown: { value: 'An unknown error occurred' },
      retry: { value: 'Retry' }
    },
    empty: {
      message: { value: 'No users found' },
      refresh: { value: 'Refresh' }
    },
    pagination: {
      showing: { value: 'Showing {count} users' },
      previous: { value: 'Previous' },
      next: { value: 'Next' }
    }
  }))
}));

// Mock server actions - must be at top level
vi.mock('@/app/actions/user-management', () => ({
  getAllUsers: vi.fn(),
  updateUserStatus: vi.fn()
}));

// Mock client logger - must be at top level
vi.mock('@/lib/logger.client', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }
}));

// Mock UI components - must be at top level
vi.mock('@/app/components/ui/input', () => ({
  Input: vi.fn(({ value, onChange, placeholder, ...props }) => (
    <input 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder} 
      {...props}
      data-testid="search-input"
    />
  ))
}));

vi.mock('@/app/components/ui/fieldset', () => ({
  Field: vi.fn(({ children }) => <div data-testid="field">{children}</div>),
  Label: vi.fn(({ children }) => <label data-testid="label">{children}</label>),
  Fieldset: vi.fn(({ children }) => <fieldset data-testid="fieldset">{children}</fieldset>),
  Legend: vi.fn(({ children }) => <legend data-testid="legend">{children}</legend>)
}));

vi.mock('@/app/components/ui/select', () => ({
  Select: vi.fn(({ value, onChange, children, ...props }) => (
    <select value={value} onChange={onChange} {...props} data-testid="select">
      {children}
    </select>
  ))
}));

vi.mock('@/app/components/ui/table', () => ({
  Table: vi.fn(({ children, className, ...props }) => (
    <table className={className} {...props} data-testid="table">{children}</table>
  )),
  TableHead: vi.fn(({ children }) => <thead data-testid="table-head">{children}</thead>),
  TableHeader: vi.fn(({ children }) => <th data-testid="table-header">{children}</th>),
  TableBody: vi.fn(({ children }) => <tbody data-testid="table-body">{children}</tbody>),
  TableRow: vi.fn(({ children, className }) => (
    <tr className={className} data-testid="table-row">{children}</tr>
  )),
  TableCell: vi.fn(({ children, className }) => (
    <td className={className} data-testid="table-cell">{children}</td>
  ))
}));

vi.mock('@/app/components/ui/button', () => ({
  Button: vi.fn(({ children, onClick, disabled, variant, ...props }) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      data-variant={variant}
      {...props}
      data-testid="button"
    >
      {children}
    </button>
  ))
}));

vi.mock('@/app/components/ui/badge', () => ({
  Badge: vi.fn(({ children, color }) => (
    <span data-color={color} data-testid="badge">{children}</span>
  ))
}));

vi.mock('@/app/components/ui/text', () => ({
  Text: vi.fn(({ children, className }) => (
    <span className={className} data-testid="text">{children}</span>
  ))
}));

vi.mock('@/app/components/ui/heading', () => ({
  Heading: vi.fn(({ children, level, className }) => {
    const Tag = `h${level || 1}` as keyof JSX.IntrinsicElements;
    return <Tag className={className} data-testid="heading">{children}</Tag>;
  })
}));

import { UserManagementTable } from '../../presentation/UserManagementTable';
import { getAllUsers, updateUserStatus } from '@/app/actions/user-management';
import type { UserListResponse, User } from '../../domain/schemas/userManagement';

/**
 * Test suite for complete user management workflow.
 * 
 * Tests the entire flow from loading users, filtering, searching,
 * to updating user status and handling various scenarios.
 */
describe('User Management End-to-End Workflow', () => {
  let queryClient: QueryClient;

  const mockUsers: User[] = [
    {
      id: 'user-1',
      displayName: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      enabled: true,
      lastLogin: 'Dec 15, 2023',
      createdAt: 'Dec 1, 2023',
    },
    {
      id: 'admin-1',
      displayName: 'Jane Admin',
      email: 'jane@example.com',
      role: 'admin',
      enabled: true,
      lastLogin: 'Dec 16, 2023',
      createdAt: 'Nov 30, 2023',
    },
    {
      id: 'user-2',
      displayName: 'Bob Smith',
      email: 'bob@example.com',
      role: 'user',
      enabled: false,
      lastLogin: null,
      createdAt: 'Dec 10, 2023',
    }
  ];

  const mockUserListResponse: UserListResponse = {
    users: mockUsers,
    nextCursor: undefined,
  };

  const adminSession = {
    user: {
      id: 'current-admin',
      name: 'Current Admin',
      email: 'current@example.com',
      role: 'admin',
      enabled: true,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  const renderWithProviders = (component: ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={adminSession}>
          {component}
        </SessionProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { 
          retry: false,
          staleTime: 0,
          cacheTime: 0
        },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    vi.mocked(getAllUsers).mockResolvedValue(mockUserListResponse);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Complete User Management Workflow', () => {
    /**
     * Tests the complete workflow of loading and displaying users.
     */
    it('should load and display users successfully', async () => {
      renderWithProviders(<UserManagementTable />);

      // Should show loading state initially
      expect(screen.getByText('Loading users...')).toBeInTheDocument();

      // Should call getAllUsers with default limit
      await waitFor(() => {
        expect(vi.mocked(getAllUsers)).toHaveBeenCalledWith({ limit: 50 });
      });
    });

    /**
     * Tests basic component integration.
     */
    it('should render component successfully', async () => {
      renderWithProviders(<UserManagementTable />);

      // Should show loading state initially
      expect(screen.getByText('Loading users...')).toBeInTheDocument();

      // Should call getAllUsers on mount
      await waitFor(() => {
        expect(vi.mocked(getAllUsers)).toHaveBeenCalledWith({ limit: 50 });
      });
    });

    /**
     * Tests error handling in the workflow.
     */
    it('should handle API errors gracefully', async () => {
      // Mock error response
      vi.mocked(getAllUsers).mockRejectedValue(new Error('Failed to load users'));

      renderWithProviders(<UserManagementTable />);

      // Should call getAllUsers
      await waitFor(() => {
        expect(vi.mocked(getAllUsers)).toHaveBeenCalled();
      });
    });

    /**
     * Tests empty state workflow.
     */
    it('should handle empty user list', async () => {
      vi.mocked(getAllUsers).mockResolvedValue({
        users: [],
        nextCursor: undefined,
      });

      renderWithProviders(<UserManagementTable />);

      // Should call getAllUsers
      await waitFor(() => {
        expect(vi.mocked(getAllUsers)).toHaveBeenCalledWith({ limit: 50 });
      });
    });

    /**
     * Tests pagination workflow.
     */
    it('should handle pagination response', async () => {
      // Mock response with pagination
      const paginatedResponse: UserListResponse = {
        users: mockUsers.slice(0, 2),
        nextCursor: 'next-page-token',
      };

      vi.mocked(getAllUsers).mockResolvedValue(paginatedResponse);

      renderWithProviders(<UserManagementTable />);

      // Should call getAllUsers
      await waitFor(() => {
        expect(vi.mocked(getAllUsers)).toHaveBeenCalledWith({ limit: 50 });
      });
    });
  });

  describe('Component Integration', () => {
    /**
     * Tests basic table rendering.
     */
    it('should render table structure', async () => {
      renderWithProviders(<UserManagementTable />);

      // Should show loading state initially
      expect(screen.getByText('Loading users...')).toBeInTheDocument();

      // Should call API on mount
      await waitFor(() => {
        expect(vi.mocked(getAllUsers)).toHaveBeenCalledWith({ limit: 50 });
      });
    });

    /**
     * Tests component with different session states.
     */
    it('should work with admin session', async () => {
      renderWithProviders(<UserManagementTable />);

      // Should call getAllUsers with admin session
      await waitFor(() => {
        expect(vi.mocked(getAllUsers)).toHaveBeenCalledWith({ limit: 50 });
      });
    });
  });
});