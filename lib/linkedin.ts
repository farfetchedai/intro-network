// LinkedIn OAuth utilities

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/auth/linkedin/callback'

export interface LinkedInTokenResponse {
  access_token: string
  expires_in: number
  refresh_token?: string
  refresh_token_expires_in?: number
  scope: string
}

export interface LinkedInProfile {
  sub: string // LinkedIn member ID
  name: string
  given_name: string
  family_name: string
  picture?: string
  email?: string
  email_verified?: boolean
}

export interface LinkedInPosition {
  id: string
  title: string
  companyName: string
  companyId?: string
  companyLogoUrl?: string
  location?: string
  description?: string
  startDate?: { year: number; month?: number }
  endDate?: { year: number; month?: number }
}

export interface LinkedInConnection {
  id: string
  firstName: string
  lastName: string
  headline?: string
  profilePicture?: string
  profileUrl?: string
}

/**
 * Generate LinkedIn OAuth authorization URL
 */
export function getLinkedInAuthUrl(state: string, returnTo?: string): string {
  if (!LINKEDIN_CLIENT_ID) {
    throw new Error('LINKEDIN_CLIENT_ID is not configured')
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: LINKEDIN_REDIRECT_URI,
    state: state,
    scope: 'openid profile email',
  })

  // Encode returnTo in state if provided
  if (returnTo) {
    params.set('state', JSON.stringify({ state, returnTo }))
  }

  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<LinkedInTokenResponse> {
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
    throw new Error('LinkedIn OAuth credentials not configured')
  }

  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET,
      redirect_uri: LINKEDIN_REDIRECT_URI,
    }).toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code for token: ${error}`)
  }

  return response.json()
}

/**
 * Fetch LinkedIn user profile using OpenID Connect userinfo endpoint
 */
export async function fetchLinkedInProfile(accessToken: string): Promise<LinkedInProfile> {
  const response = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to fetch LinkedIn profile: ${error}`)
  }

  return response.json()
}

/**
 * Refresh LinkedIn access token
 * Note: LinkedIn refresh tokens require OAuth 2.0 with refresh token scope
 */
export async function refreshLinkedInToken(refreshToken: string): Promise<LinkedInTokenResponse> {
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
    throw new Error('LinkedIn OAuth credentials not configured')
  }

  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET,
    }).toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh token: ${error}`)
  }

  return response.json()
}

/**
 * Fetch LinkedIn connections
 * Note: This requires r_network scope which needs LinkedIn Partner Program approval
 */
export async function fetchLinkedInConnections(accessToken: string): Promise<LinkedInConnection[]> {
  // This endpoint requires Partner Program approval
  // For now, return empty array with a note
  console.warn('LinkedIn connections API requires Partner Program approval')

  try {
    const response = await fetch(
      'https://api.linkedin.com/v2/connections?q=viewer&start=0&count=50',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      // Expected to fail without Partner Program approval
      console.warn('LinkedIn connections fetch failed - Partner Program may be required')
      return []
    }

    const data = await response.json()
    return data.elements || []
  } catch (error) {
    console.warn('Failed to fetch LinkedIn connections:', error)
    return []
  }
}

/**
 * Parse date from LinkedIn format to JavaScript Date
 */
export function parseLinkedInDate(dateObj?: { year: number; month?: number }): Date | null {
  if (!dateObj || !dateObj.year) return null
  return new Date(dateObj.year, (dateObj.month || 1) - 1, 1)
}
