import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { fetchLinkedInConnections } from '@/lib/linkedin'

// GET /api/linkedin/connections - Fetch and sync LinkedIn connections
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
      return NextResponse.json(
        { success: false, error: 'LinkedIn not connected', notConnected: true },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (linkedInAccount.tokenExpiry && linkedInAccount.tokenExpiry < new Date()) {
      return NextResponse.json(
        { success: false, error: 'LinkedIn token expired', tokenExpired: true },
        { status: 401 }
      )
    }

    // Fetch connections from LinkedIn API
    // Note: This requires LinkedIn Partner Program approval for r_network scope
    const linkedInConnections = await fetchLinkedInConnections(linkedInAccount.accessToken)

    // If we got connections, sync them to the database
    if (linkedInConnections.length > 0) {
      // Upsert each connection
      for (const connection of linkedInConnections) {
        await prisma.linkedInConnection.upsert({
          where: {
            userId_linkedinId: {
              userId,
              linkedinId: connection.id,
            },
          },
          create: {
            userId,
            linkedinId: connection.id,
            firstName: connection.firstName,
            lastName: connection.lastName,
            headline: connection.headline,
            profilePictureUrl: connection.profilePicture,
            profileUrl: connection.profileUrl,
          },
          update: {
            firstName: connection.firstName,
            lastName: connection.lastName,
            headline: connection.headline,
            profilePictureUrl: connection.profilePicture,
            profileUrl: connection.profileUrl,
            lastSyncedAt: new Date(),
          },
        })
      }
    }

    // Fetch all stored connections for this user
    const storedConnections = await prisma.linkedInConnection.findMany({
      where: { userId },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' },
      ],
    })

    return NextResponse.json({
      success: true,
      connections: storedConnections,
      syncedAt: new Date().toISOString(),
      note: linkedInConnections.length === 0
        ? 'LinkedIn connections API requires Partner Program approval. Your existing connections are displayed.'
        : undefined,
    })
  } catch (error) {
    console.error('Failed to fetch LinkedIn connections:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch connections' },
      { status: 500 }
    )
  }
}

// POST /api/linkedin/connections/sync - Force sync connections
export async function POST() {
  // Same as GET but forces a fresh fetch
  return GET()
}
