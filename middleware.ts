import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if this is an admin route (page or API)
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

    // Check if user is admin by calling an internal API
    // We need to check the database, but middleware runs on the edge
    // So we'll make a request to verify admin status
    try {
      const baseUrl = request.nextUrl.origin
      const response = await fetch(`${baseUrl}/api/auth/check-admin`, {
        headers: {
          Cookie: `userId=${userId}`,
        },
      })

      const data = await response.json()

      if (!data.isAdmin) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Unauthorized - Admin access required' },
            { status: 403 }
          )
        }
        // Redirect non-admins to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      console.error('Admin check failed:', error)
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Authorization check failed' },
          { status: 500 }
        )
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
