import { NextResponse } from 'next/server'
import { getLinkedInAuthUrl } from '@/lib/linkedin'
import crypto from 'crypto'

// Simple encoding to pass state data through OAuth flow without cookies
function encodeState(data: { nonce: string; returnTo: string }): string {
  return Buffer.from(JSON.stringify(data)).toString('base64url')
}

export function decodeState(state: string): { nonce: string; returnTo: string } | null {
  try {
    return JSON.parse(Buffer.from(state, 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const returnTo = searchParams.get('returnTo') || '/onboarding'

    // Generate a random nonce for basic request validation
    const nonce = crypto.randomBytes(16).toString('hex')

    // Encode state data directly in the OAuth state parameter
    // This avoids cookie issues with cross-site redirects
    const stateData = encodeState({ nonce, returnTo })

    // Get the LinkedIn authorization URL with encoded state
    const authUrl = await getLinkedInAuthUrl(stateData)

    // Redirect to LinkedIn - no cookies needed
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('LinkedIn OAuth initiation failed:', error)
    return NextResponse.json(
      { error: 'Failed to initiate LinkedIn login' },
      { status: 500 }
    )
  }
}
