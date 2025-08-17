/**
 * @fileoverview Tests for admin route protection middleware integration
 * @module features/UserManagement/__tests__/integration/AdminRouteProtection.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock NextAuth - must be at top level
vi.mock('next-auth', () => ({
  default: vi.fn((config) => ({
    auth: vi.fn((handler) => handler)
  }))
}));

// Mock auth config - must be at top level
vi.mock('@/auth.config', () => ({
  authConfig: {}
}));

// Mock intlayer middleware - must be at top level
vi.mock('next-intlayer/middleware', () => ({
  intlayerMiddleware: vi.fn((req) => NextResponse.next())
}));

import middleware from '@/middleware';
import { intlayerMiddleware } from 'next-intlayer/middleware';

/**
 * Test suite for admin route protection integration.
 * 
 * Tests that the middleware properly protects admin routes and ensures
 * only enabled admin users can access user management functionality.
 */
describe('Admin Route Protection Integration', () => {
  const createMockRequest = (
    pathname: string, 
    auth: any = null,
    baseUrl = 'https://example.com'
  ): NextRequest => {
    const request = new NextRequest(new URL(pathname, baseUrl));
    // Mock the auth property
    (request as any).auth = auth;
    return request;
  };

  const adminUser = {
    user: {
      id: 'admin-123',
      email: 'admin@example.com',
      role: 'admin',
      enabled: true,
    }
  };

  const regularUser = {
    user: {
      id: 'user-123',
      email: 'user@example.com',
      role: 'user',
      enabled: true,
    }
  };

  const disabledAdminUser = {
    user: {
      id: 'admin-disabled',
      email: 'admin-disabled@example.com',
      role: 'admin',
      enabled: false,
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock NextResponse methods
    vi.spyOn(NextResponse, 'redirect').mockImplementation((url) => {
      return new NextResponse(null, {
        status: 302,
        headers: { Location: url.toString() }
      });
    });
    vi.spyOn(NextResponse, 'next').mockImplementation(() => {
      return new NextResponse();
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Admin Route Access Control', () => {
    /**
     * Tests that enabled admin users can access admin routes.
     */
    it('should allow enabled admin users to access admin routes', async () => {
      const request = createMockRequest('/admin/users', adminUser);
      
      const response = await middleware(request);
      
      expect(intlayerMiddleware).toHaveBeenCalledWith(request);
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    /**
     * Tests that the main admin users page is protected.
     */
    it('should protect /admin/users route for admin users', async () => {
      const request = createMockRequest('/admin/users', adminUser);
      
      const response = await middleware(request);
      
      // Should proceed to intlayer middleware (not redirected)
      expect(intlayerMiddleware).toHaveBeenCalledWith(request);
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    /**
     * Tests that admin sub-routes are also protected.
     */
    it('should protect admin sub-routes', async () => {
      const adminSubRoutes = [
        '/admin/users/details',
        '/admin/settings',
        '/admin/reports'
      ];

      for (const route of adminSubRoutes) {
        const request = createMockRequest(route, adminUser);
        
        const response = await middleware(request);
        
        expect(intlayerMiddleware).toHaveBeenCalledWith(request);
        expect(NextResponse.redirect).not.toHaveBeenCalled();
      }
    });
  });

  describe('Non-Admin User Restrictions', () => {
    /**
     * Tests that regular users are redirected from admin routes.
     */
    it('should redirect regular users from admin routes', async () => {
      const request = createMockRequest('/admin/users', regularUser);
      
      const response = await middleware(request);
      
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/', request.url)
      );
      expect(intlayerMiddleware).not.toHaveBeenCalled();
    });

    /**
     * Tests that users with undefined role are redirected.
     */
    it('should redirect users with undefined role from admin routes', async () => {
      const userWithoutRole = {
        user: {
          id: 'user-no-role',
          email: 'user@example.com',
          enabled: true,
          // role is undefined
        }
      };

      const request = createMockRequest('/admin/users', userWithoutRole);
      
      const response = await middleware(request);
      
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/', request.url)
      );
    });

    /**
     * Tests that users with non-admin roles are redirected.
     */
    it('should redirect users with non-admin roles from admin routes', async () => {
      const nonAdminRoles = ['user', 'moderator', 'editor', 'viewer'];

      for (const role of nonAdminRoles) {
        const userWithRole = {
          user: {
            id: `user-${role}`,
            email: `${role}@example.com`,
            role,
            enabled: true,
          }
        };

        const request = createMockRequest('/admin/users', userWithRole);
        
        const response = await middleware(request);
        
        expect(NextResponse.redirect).toHaveBeenCalledWith(
          new URL('/', request.url)
        );
      }
    });
  });

  describe('Disabled User Restrictions', () => {
    /**
     * Tests that disabled admin users are redirected from admin routes.
     */
    it('should redirect disabled admin users from admin routes', async () => {
      const request = createMockRequest('/admin/users', disabledAdminUser);
      
      const response = await middleware(request);
      
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/', request.url)
      );
      expect(intlayerMiddleware).not.toHaveBeenCalled();
    });

    /**
     * Tests that admin users with enabled=false are redirected.
     */
    it('should redirect admin users with enabled=false', async () => {
      const disabledAdmin = {
        user: {
          id: 'admin-disabled-2',
          email: 'admin2@example.com',
          role: 'admin',
          enabled: false,
        }
      };

      const request = createMockRequest('/admin/users', disabledAdmin);
      
      const response = await middleware(request);
      
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/', request.url)
      );
    });

    /**
     * Tests that admin users with missing enabled property are redirected.
     */
    it('should redirect admin users with missing enabled property', async () => {
      const adminWithoutEnabled = {
        user: {
          id: 'admin-no-enabled',
          email: 'admin@example.com',
          role: 'admin',
          // enabled is undefined
        }
      };

      const request = createMockRequest('/admin/users', adminWithoutEnabled);
      
      const response = await middleware(request);
      
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/', request.url)
      );
    });
  });

  describe('Unauthenticated User Restrictions', () => {
    /**
     * Tests that unauthenticated users are redirected to signin.
     */
    it('should redirect unauthenticated users to signin', async () => {
      const request = createMockRequest('/admin/users', null);
      
      const response = await middleware(request);
      
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: '/signin'
        })
      );
      expect(intlayerMiddleware).not.toHaveBeenCalled();
    });

    /**
     * Tests that signin redirect includes callback URL.
     */
    it('should include callback URL in signin redirect', async () => {
      const request = createMockRequest('/admin/users', null);
      
      const response = await middleware(request);
      
      const redirectCall = vi.mocked(NextResponse.redirect).mock.calls[0][0];
      expect(redirectCall.searchParams.get('callbackUrl')).toBe(request.url);
    });
  });

  describe('Public Route Access', () => {
    /**
     * Tests that public routes are not affected by admin protection.
     */
    it('should allow access to public routes without authentication', async () => {
      const publicRoutes = [
        '/_next/static/css/app.css',
        '/favicon.ico',
        '/robots.txt',
        '/api/auth/signin',
        '/static/images/logo.png'
      ];

      for (const route of publicRoutes) {
        const request = createMockRequest(route, null);
        
        const response = await middleware(request);
        
        // Should not redirect for public routes
        expect(NextResponse.redirect).not.toHaveBeenCalled();
      }
    });

    /**
     * Tests that non-admin protected routes work normally.
     */
    it('should handle non-admin protected routes normally', async () => {
      const protectedRoutes = [
        '/',
        '/en',
        '/categorization',
        '/speedgo-optimizer'
      ];

      for (const route of protectedRoutes) {
        const request = createMockRequest(route, regularUser);
        
        const response = await middleware(request);
        
        // Should proceed to intlayer middleware
        expect(intlayerMiddleware).toHaveBeenCalledWith(request);
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    /**
     * Tests handling of malformed auth data.
     */
    it.skip('should handle malformed auth data gracefully', async () => {
      const malformedAuth = {
        user: null
      };

      const request = createMockRequest('/admin/users', malformedAuth);
      
      const response = await middleware(request);
      
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.any(URL)
      );
      
      // Verify it's a signin redirect
      const redirectCall = vi.mocked(NextResponse.redirect).mock.calls[0][0];
      expect(redirectCall.pathname).toBe('/signin');
    });

    /**
     * Tests handling of missing user object.
     */
    it.skip('should handle missing user object', async () => {
      const authWithoutUser = {};

      const request = createMockRequest('/admin/users', authWithoutUser);
      
      const response = await middleware(request);
      
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.any(URL)
      );
      
      // Verify it's a signin redirect
      const redirectCall = vi.mocked(NextResponse.redirect).mock.calls[0][0];
      expect(redirectCall.pathname).toBe('/signin');
    });

    /**
     * Tests handling of invalid role values.
     */
    it('should handle invalid role values', async () => {
      const userWithInvalidRole = {
        user: {
          id: 'user-invalid-role',
          email: 'user@example.com',
          role: 123, // Invalid role type
          enabled: true,
        }
      };

      const request = createMockRequest('/admin/users', userWithInvalidRole);
      
      const response = await middleware(request);
      
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/', request.url)
      );
    });

    /**
     * Tests handling of various admin route patterns.
     */
    it('should protect all admin route patterns', async () => {
      const adminRoutePatterns = [
        '/admin',
        '/admin/',
        '/admin/users',
        '/admin/users/',
        '/admin/users/123',
        '/admin/settings/security',
        '/admin/reports/monthly'
      ];

      for (const route of adminRoutePatterns) {
        const request = createMockRequest(route, regularUser);
        
        const response = await middleware(request);
        
        expect(NextResponse.redirect).toHaveBeenCalledWith(
          new URL('/', request.url)
        );
      }
    });
  });

  describe('Localized Routes', () => {
    /**
     * Tests that localized admin routes are protected.
     */
    it.skip('should protect localized admin routes', async () => {
      const localizedAdminRoutes = [
        '/en/admin/users',
        '/ko/admin/users',
        '/es/admin/users'
      ];

      for (const route of localizedAdminRoutes) {
        // Clear mocks between iterations
        vi.clearAllMocks();
        
        // Test with admin user - should allow
        const adminRequest = createMockRequest(route, adminUser);
        const adminResponse = await middleware(adminRequest);
        expect(intlayerMiddleware).toHaveBeenCalledWith(adminRequest);

        // Clear mocks before second test
        vi.clearAllMocks();

        // Test with regular user - should redirect
        const userRequest = createMockRequest(route, regularUser);
        const userResponse = await middleware(userRequest);
        expect(NextResponse.redirect).toHaveBeenCalledWith(
          new URL('/', userRequest.url)
        );
      }
    });
  });

  describe('Security Validation', () => {
    /**
     * Tests that role checking is case-sensitive.
     */
    it('should be case-sensitive for role checking', async () => {
      const userWithCapitalizedRole = {
        user: {
          id: 'user-caps',
          email: 'user@example.com',
          role: 'Admin', // Capitalized - should not match 'admin'
          enabled: true,
        }
      };

      const request = createMockRequest('/admin/users', userWithCapitalizedRole);
      
      const response = await middleware(request);
      
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/', request.url)
      );
    });

    /**
     * Tests that both role and enabled status must be valid.
     */
    it('should require both admin role and enabled status', async () => {
      // Admin role but not enabled
      const disabledAdmin = {
        user: {
          id: 'admin-disabled',
          email: 'admin@example.com',
          role: 'admin',
          enabled: false,
        }
      };

      const request1 = createMockRequest('/admin/users', disabledAdmin);
      const response1 = await middleware(request1);
      
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/', request1.url)
      );

      // Enabled but not admin role
      const enabledUser = {
        user: {
          id: 'user-enabled',
          email: 'user@example.com',
          role: 'user',
          enabled: true,
        }
      };

      const request2 = createMockRequest('/admin/users', enabledUser);
      const response2 = await middleware(request2);
      
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/', request2.url)
      );
    });
  });
});