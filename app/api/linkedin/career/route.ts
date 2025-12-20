import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET /api/linkedin/career - Get LinkedIn account status for career import
export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user's LinkedIn account
    const linkedInAccount = await prisma.linkedInAccount.findUnique({
      where: { userId },
    })

    if (!linkedInAccount) {
      return NextResponse.json({
        success: true,
        connected: false,
        message: 'LinkedIn not connected',
      })
    }

    // Check if token is expired
    const tokenExpired = linkedInAccount.tokenExpiry && linkedInAccount.tokenExpiry < new Date()

    return NextResponse.json({
      success: true,
      connected: true,
      tokenExpired,
      linkedinId: linkedInAccount.linkedinId,
    })
  } catch (error) {
    console.error('Failed to get LinkedIn career status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get LinkedIn status' },
      { status: 500 }
    )
  }
}

// POST /api/linkedin/career - Import career history from LinkedIn
// Note: Full career history import requires LinkedIn Partner Program approval
// For standard OAuth, we can only import basic profile data
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user's LinkedIn account
    const linkedInAccount = await prisma.linkedInAccount.findUnique({
      where: { userId },
    })

    if (!linkedInAccount) {
      return NextResponse.json(
        { success: false, error: 'LinkedIn not connected' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (linkedInAccount.tokenExpiry && linkedInAccount.tokenExpiry < new Date()) {
      return NextResponse.json(
        { success: false, error: 'LinkedIn token expired. Please reconnect LinkedIn.' },
        { status: 401 }
      )
    }

    // Note: LinkedIn's standard OAuth scopes (openid, profile, email) do not include
    // access to positions/career history. Full profile data requires:
    // - r_fullprofile scope (LinkedIn Partner Program)
    // - or LinkedIn Talent Solutions API
    //
    // For now, we'll return a message explaining this limitation
    // In the future, with Partner Program approval, this endpoint would:
    // 1. Fetch positions from LinkedIn API
    // 2. Parse and transform the data
    // 3. Upsert career entries to the database

    return NextResponse.json({
      success: false,
      error: 'Career history import requires LinkedIn Partner Program approval. Please add your career history manually.',
      requiresPartnerProgram: true,
    })

  } catch (error) {
    console.error('Failed to import LinkedIn career:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to import career history' },
      { status: 500 }
    )
  }
}
