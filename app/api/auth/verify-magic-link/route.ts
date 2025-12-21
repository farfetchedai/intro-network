import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find user with this token
    const user = await prisma.user.findUnique({
      where: { magicLinkToken: token },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired magic link' },
        { status: 401 }
      )
    }

    // Check if token has expired
    if (!user.magicLinkExpiry || user.magicLinkExpiry < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Magic link has expired' },
        { status: 401 }
      )
    }

    // Save redirect URL before clearing
    const redirectUrl = user.magicLinkRedirect

    // Clear the token and redirect (single use)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        magicLinkToken: null,
        magicLinkExpiry: null,
        magicLinkRedirect: null,
      },
    })

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        magicLinkRedirect: redirectUrl,
      },
    })

    // Set session cookies
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
    console.error('Failed to verify magic link:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to verify magic link' },
      { status: 500 }
    )
  }
}
