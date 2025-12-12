import { NextResponse } from 'next/server'
import { validateMagicLink } from '@/lib/magicLink'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/error?message=Invalid magic link', req.url))
    }

    // Validate the magic link
    const magicLinkData = await validateMagicLink(token)

    if (!magicLinkData) {
      return NextResponse.redirect(
        new URL('/error?message=Magic link is invalid or has expired', req.url)
      )
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: magicLinkData.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
      },
    })

    if (!user) {
      return NextResponse.redirect(new URL('/error?message=User not found', req.url))
    }

    // Create the response with redirect
    const redirectUrl = new URL(magicLinkData.redirectUrl, req.url)
    const response = NextResponse.redirect(redirectUrl)

    // Set a session cookie (simplified - in production, use a proper session management library)
    response.cookies.set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    response.cookies.set('userType', user.userType, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Magic link authentication error:', error)
    return NextResponse.redirect(
      new URL('/error?message=An error occurred during authentication', req.url)
    )
  }
}
