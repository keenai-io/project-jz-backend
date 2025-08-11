import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { intlayerMiddleware } from "next-intlayer/middleware"
import { NextRequest } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req: NextRequest) => {
  // Handle internationalization after authentication
  return intlayerMiddleware(req)
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|static|assets|robots|sitemap|sw|service-worker|manifest|.*\\..*|_next).*)"
  ],
};
