import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function to link pending introductions to a user
async function linkPendingIntroductions(userId: string, email: string) {
  try {
    // Find introductions where this user's email matches but userId not yet set
    const asPersonA = await prisma.pendingIntroduction.findMany({
      where: {
        personAEmail: email,
        personAUserId: null,
      },
    })

    const asPersonB = await prisma.pendingIntroduction.findMany({
      where: {
        personBEmail: email,
        personBUserId: null,
      },
    })

    // Update introductions to link the user
    for (const intro of asPersonA) {
      await prisma.pendingIntroduction.update({
        where: { id: intro.id },
        data: { personAUserId: userId },
      })
    }

    for (const intro of asPersonB) {
      await prisma.pendingIntroduction.update({
        where: { id: intro.id },
        data: { personBUserId: userId },
      })
    }

    const linkedCount = asPersonA.length + asPersonB.length
    if (linkedCount > 0) {
      console.log(`[verify-magic-link] Linked ${linkedCount} pending introduction(s) to user ${userId}`)
    }

    return linkedCount
  } catch (error) {
    console.error('[verify-magic-link] Error linking pending introductions:', error)
    return 0
  }
}

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

    // Link any pending introductions to this user
    const linkedIntros = user.email ? await linkPendingIntroductions(user.id, user.email) : 0

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
      pendingIntroductions: linkedIntros,
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
