import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    // Try to find user by username first, then by ID
    let user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        profilePicture: true,
        username: true,
        linkedinUrl: true,
        twitterUrl: true,
        facebookUrl: true,
        instagramUrl: true,
        websiteUrl: true,
        companyName: true,
        statementSummary: true,
      },
    })

    // If not found by username, try by ID
    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: username },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          profilePicture: true,
          username: true,
          linkedinUrl: true,
          twitterUrl: true,
          facebookUrl: true,
          instagramUrl: true,
          websiteUrl: true,
          companyName: true,
          statementSummary: true,
        },
      })
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate vCard content
    const vcard = generateVCard(user, req.url)

    // Return as downloadable VCF file
    return new NextResponse(vcard, {
      status: 200,
      headers: {
        'Content-Type': 'text/vcard; charset=utf-8',
        'Content-Disposition': `attachment; filename="${user.firstName}_${user.lastName}.vcf"`,
      },
    })
  } catch (error) {
    console.error('[vcard] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateVCard(user: {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  profilePicture: string | null
  username: string | null
  linkedinUrl: string | null
  twitterUrl: string | null
  facebookUrl: string | null
  instagramUrl: string | null
  websiteUrl: string | null
  companyName: string | null
  statementSummary: string | null
}, requestUrl: string): string {
  // Get base URL from env var for production, fallback to request URL for local dev
  const url = new URL(requestUrl)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`
  const profileUrl = `${baseUrl}/${user.username || user.id}`

  // Start building vCard
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escapeVCardValue(user.lastName)};${escapeVCardValue(user.firstName)};;;`,
    `FN:${escapeVCardValue(user.firstName)} ${escapeVCardValue(user.lastName)}`,
  ]

  // Add organization if available
  if (user.companyName) {
    lines.push(`ORG:${escapeVCardValue(user.companyName)}`)
  }

  // Add email
  if (user.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${user.email}`)
  }

  // Add phone
  if (user.phone) {
    lines.push(`TEL;TYPE=CELL:${user.phone}`)
  }

  // Add profile URL
  lines.push(`URL:${profileUrl}`)

  // Add website if different from profile
  if (user.websiteUrl) {
    lines.push(`URL;TYPE=WORK:${user.websiteUrl}`)
  }

  // Add social media URLs as X-SOCIALPROFILE (supported by many contact apps)
  if (user.linkedinUrl) {
    lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${user.linkedinUrl}`)
  }
  if (user.twitterUrl) {
    lines.push(`X-SOCIALPROFILE;TYPE=twitter:${user.twitterUrl}`)
  }
  if (user.facebookUrl) {
    lines.push(`X-SOCIALPROFILE;TYPE=facebook:${user.facebookUrl}`)
  }
  if (user.instagramUrl) {
    lines.push(`X-SOCIALPROFILE;TYPE=instagram:${user.instagramUrl}`)
  }

  // Add note with statement summary
  if (user.statementSummary) {
    lines.push(`NOTE:${escapeVCardValue(user.statementSummary)}`)
  }

  // Add profile picture if it's a URL (not base64)
  if (user.profilePicture && user.profilePicture.startsWith('http')) {
    lines.push(`PHOTO;VALUE=URI:${user.profilePicture}`)
  }

  // Add unique identifier
  lines.push(`UID:${user.id}@intronetwork`)

  // End vCard
  lines.push('END:VCARD')

  return lines.join('\r\n')
}

// Escape special characters in vCard values
function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}
