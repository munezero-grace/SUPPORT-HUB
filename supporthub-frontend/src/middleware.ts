import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuthenticated = !!token && !!token.accessToken
    const isSuperAdmin = token?.role === 'super_admin'

    if (!isAuthenticated && (
      req.nextUrl.pathname.startsWith('/dashboard') ||
      req.nextUrl.pathname.startsWith('/products') ||
      req.nextUrl.pathname.startsWith('/clients')
    )) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    if (isAuthenticated && req.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (isAuthenticated && (
      req.nextUrl.pathname.startsWith('/dashboard/products') ||
      req.nextUrl.pathname.startsWith('/dashboard/clients') ||
      req.nextUrl.pathname.startsWith('/products')
    )) {
      if (!isSuperAdmin) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true
    },
  }
)

export const config = {
  matcher: ['/', '/dashboard/:path*', '/products/:path*']
}