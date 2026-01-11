import { NextResponse } from 'next/server'
import { getLinkedInAuthUrl } from '@/lib/linkedin'
import crypto from 'crypto'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const returnTo = searchParams.get('returnTo') || '/onboarding'

    // Generate a random state for CSRF protection
    const state = crypto.randomBytes(16).toString('hex')

    // Store state and returnTo in a cookie for validation
    const stateData = JSON.stringify({ state, returnTo })

    // Get the LinkedIn authorization URL
    const authUrl = getLinkedInAuthUrl(state, returnTo)

    // Create response that redirects to LinkedIn
    const response = NextResponse.redirect(authUrl)

    // Set state cookie for CSRF validation
    // Use sameSite: 'none' for cross-site OAuth flow (LinkedIn redirect)
    // This requires secure: true, which works in production (HTTPS)
    const isProduction = process.env.NODE_ENV === 'production'
    response.cookies.set('linkedin_oauth_state', stateData, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site in prod, 'lax' for local dev
      path: '/',
      maxAge: 60 * 10, // 10 minutes
    })

    return response
  } catch (error) {
    console.error('LinkedIn OAuth initiation failed:', error)
    return NextResponse.json(
      { error: 'Failed to initiate LinkedIn login' },
      { status: 500 }
    )
  }
}
