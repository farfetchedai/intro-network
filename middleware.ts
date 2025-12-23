import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only check if user is logged in for admin routes
  // Admin status is checked in individual pages/APIs using lib/adminAuth.ts
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const userId = request.cookies.get('userId')?.value

    // If no user is logged in, redirect to login (for pages) or return 401 (for API)
    if (!userId) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized - Please log in' },
          { status: 401 }
        )
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Note: Admin status check is now done in individual pages/APIs
    // using the requireAdmin() function from lib/adminAuth.ts
    // This avoids the middleware fetch-to-self issue in production
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
