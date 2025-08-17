import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { intlayerMiddleware } from "next-intlayer/middleware"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth
  const user = req.auth?.user
  
  // Allow access to authentication-related routes and pending approval
  const isAuthRoute = pathname.includes('/signin') || 
                      pathname.includes('/api/auth') || 
                      pathname.includes('/pending-approval')
  
  // Allow access to public assets and API routes that don't require auth
  const isPublicRoute = pathname.startsWith('/_next') ||
                       pathname.startsWith('/static') ||
                       pathname.startsWith('/api/auth') ||
                       pathname === '/favicon.ico' ||
                       pathname === '/robots.txt' ||
                       pathname === '/manifest.json'

  // Check for admin routes (for future stories)
  const isAdminRoute = pathname.startsWith('/admin')
  
  // Check for protected routes that require enabled status
  // Home page can be / or /[locale] (like /en, /ko)
  const isHomePage = pathname === '/' || /^\/[a-z]{2}$/.test(pathname)
  const isProtectedRoute = isHomePage || 
                          pathname.includes('/categorization') || 
                          pathname.includes('/speedgo-optimizer')

  // If not authenticated and trying to access a protected route
  if (!isAuthenticated && !isAuthRoute && !isPublicRoute) {
    // Redirect to sign-in page
    const signInUrl = new URL('/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', req.url)
    return NextResponse.redirect(signInUrl)
  }

  // If authenticated and trying to access signin page, redirect appropriately
  if (isAuthenticated && pathname.includes('/signin')) {
    const userEnabled = (user as any)?.enabled
    
    if (!userEnabled) {
      // Disabled users go to pending approval instead of home
      return NextResponse.redirect(new URL('/pending-approval', req.url))
    } else {
      // Enabled users go to home
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Admin route protection (for future stories)
  if (isAuthenticated && isAdminRoute) {
    const userRole = (user as any)?.role
    const userEnabled = (user as any)?.enabled
    
    if (userRole !== 'admin' || !userEnabled) {
      // Redirect non-admin or disabled users away from admin routes
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Protected route access control for disabled users  
  if (isAuthenticated && isProtectedRoute) {
    const userEnabled = (user as any)?.enabled
    
    if (!userEnabled) {
      // Redirect disabled users to pending approval page
      const pendingUrl = new URL('/pending-approval', req.url)
      return NextResponse.redirect(pendingUrl)
    }
  }

  // Handle internationalization for all other requests
  return intlayerMiddleware(req)
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|static|assets|robots|sitemap|sw|service-worker|manifest|.*\\..*|_next).*)"
  ],
};