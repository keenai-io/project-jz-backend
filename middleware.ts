import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { intlayerMiddleware } from "next-intlayer/middleware"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth
  
  // Allow access to authentication-related routes
  const isAuthRoute = pathname.includes('/signin') || pathname.includes('/api/auth')
  
  // Allow access to public assets and API routes that don't require auth
  const isPublicRoute = pathname.startsWith('/_next') ||
                       pathname.startsWith('/static') ||
                       pathname.startsWith('/api/auth') ||
                       pathname === '/favicon.ico' ||
                       pathname === '/robots.txt' ||
                       pathname === '/manifest.json'

  // If not authenticated and trying to access a protected route
  if (!isAuthenticated && !isAuthRoute && !isPublicRoute) {
    // Redirect to sign-in page
    const signInUrl = new URL('/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', req.url)
    return NextResponse.redirect(signInUrl)
  }

  // If authenticated and trying to access signin page, redirect to home
  if (isAuthenticated && pathname.includes('/signin')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Handle internationalization for all other requests
  return intlayerMiddleware(req)
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|static|assets|robots|sitemap|sw|service-worker|manifest|.*\\..*|_next).*)"
  ],
};
