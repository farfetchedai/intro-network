import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { exchangeCodeForToken, fetchLinkedInProfile } from '@/lib/linkedin'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
  // Use NEXT_PUBLIC_APP_URL for production, fallback to req.url origin for local dev
  const getBaseUrl = () => process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin

  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // Handle errors from LinkedIn
    if (error) {
      console.error('LinkedIn OAuth error:', error, errorDescription)
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, getBaseUrl())
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/login?error=No authorization code received', getBaseUrl())
      )
    }

    // Get and validate state cookie
    const cookieStore = await cookies()
    const stateCookie = cookieStore.get('linkedin_oauth_state')

    console.log('[LinkedIn Callback] State cookie present:', !!stateCookie)

    if (!stateCookie) {
      console.error('[LinkedIn Callback] State cookie missing - cookies available:', cookieStore.getAll().map(c => c.name))
      return NextResponse.redirect(
        new URL('/login?error=Invalid session state', getBaseUrl())
      )
    }

    let stateData: { state: string; returnTo: string }
    try {
      stateData = JSON.parse(stateCookie.value)
    } catch {
      return NextResponse.redirect(
        new URL('/login?error=Invalid session state', getBaseUrl())
      )
    }

    // Validate state (CSRF protection)
    // LinkedIn may return state with or without the JSON wrapper
    let receivedState = state
    try {
      const parsedState = JSON.parse(state || '{}')
      if (parsedState.state) {
        receivedState = parsedState.state
      }
    } catch {
      // State is plain string, use as-is
    }

    if (receivedState !== stateData.state) {
      return NextResponse.redirect(
        new URL('/login?error=Invalid state parameter', getBaseUrl())
      )
    }

    // Exchange code for access token
    const tokenResponse = await exchangeCodeForToken(code)

    // Fetch LinkedIn profile
    const profile = await fetchLinkedInProfile(tokenResponse.access_token)

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { linkedInAccount: { linkedinId: profile.sub } },
          { email: profile.email },
        ],
      },
      include: {
        linkedInAccount: true,
      },
    })

    const tokenExpiry = new Date(Date.now() + tokenResponse.expires_in * 1000)

    if (user) {
      // Update existing user with LinkedIn data
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: user.firstName || profile.given_name,
          lastName: user.lastName || profile.family_name,
          email: user.email || profile.email,
          profilePicture: user.profilePicture || profile.picture,
          linkedInAccount: user.linkedInAccount
            ? {
                update: {
                  accessToken: tokenResponse.access_token,
                  refreshToken: tokenResponse.refresh_token,
                  tokenExpiry,
                  scope: tokenResponse.scope,
                },
              }
            : {
                create: {
                  linkedinId: profile.sub,
                  accessToken: tokenResponse.access_token,
                  refreshToken: tokenResponse.refresh_token,
                  tokenExpiry,
                  scope: tokenResponse.scope,
                },
              },
        },
        include: {
          linkedInAccount: true,
        },
      })
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          firstName: profile.given_name,
          lastName: profile.family_name,
          email: profile.email,
          profilePicture: profile.picture,
          userType: 'REFEREE',
          linkedInAccount: {
            create: {
              linkedinId: profile.sub,
              accessToken: tokenResponse.access_token,
              refreshToken: tokenResponse.refresh_token,
              tokenExpiry,
              scope: tokenResponse.scope,
            },
          },
        },
        include: {
          linkedInAccount: true,
        },
      })
    }

    // Build redirect URL with linkedin flag
    const returnTo = stateData.returnTo || '/onboarding'
    const redirectUrl = new URL(returnTo, getBaseUrl())
    redirectUrl.searchParams.set('linkedin', 'connected')

    // Create response with redirect
    const response = NextResponse.redirect(redirectUrl)

    // Clear OAuth state cookie
    response.cookies.delete('linkedin_oauth_state')

    // Set session cookies (same pattern as magic link auth)
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
    console.error('LinkedIn OAuth callback failed:', error)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin
    return NextResponse.redirect(
      new URL('/login?error=LinkedIn authentication failed', baseUrl)
    )
  }
}
