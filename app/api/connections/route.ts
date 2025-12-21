import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

// GET /api/connections - Get user's connections and pending requests
export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get all accepted connections
    const connections = await prisma.connection.findMany({
      where: { userId },
      include: {
        connectedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profilePicture: true,
            companyName: true,
            statementSummary: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get pending connection requests received
    const pendingReceived = await prisma.connectionRequest.findMany({
      where: {
        toUserId: userId,
        status: 'PENDING',
      },
      include: {
        fromUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profilePicture: true,
            companyName: true,
            statementSummary: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get pending connection requests sent
    const pendingSent = await prisma.connectionRequest.findMany({
      where: {
        fromUserId: userId,
        status: 'PENDING',
      },
      include: {
        toUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profilePicture: true,
            companyName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      connections: connections.map((c) => c.connectedUser),
      pendingReceived: pendingReceived.map((r) => ({
        id: r.id,
        note: r.note,
        createdAt: r.createdAt,
        fromUser: r.fromUser,
      })),
      pendingSent: pendingSent.map((r) => ({
        id: r.id,
        note: r.note,
        createdAt: r.createdAt,
        toUser: r.toUser,
      })),
    })
  } catch (error) {
    console.error('Get connections error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
