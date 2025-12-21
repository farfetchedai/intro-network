import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

// GET /api/connections/status?userId=xxx - Check connection status with another user
export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    const currentUserId = cookieStore.get('userId')?.value

    if (!currentUserId) {
      return NextResponse.json({
        success: true,
        status: 'not_authenticated',
      })
    }

    const { searchParams } = new URL(req.url)
    const targetUserId = searchParams.get('userId')

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      )
    }

    // Same user
    if (targetUserId === currentUserId) {
      return NextResponse.json({
        success: true,
        status: 'self',
      })
    }

    // Check if already connected
    const connection = await prisma.connection.findFirst({
      where: {
        userId: currentUserId,
        connectedUserId: targetUserId,
      },
    })

    if (connection) {
      return NextResponse.json({
        success: true,
        status: 'connected',
        connectionId: connection.id,
      })
    }

    // Check for pending requests
    const pendingRequest = await prisma.connectionRequest.findFirst({
      where: {
        OR: [
          { fromUserId: currentUserId, toUserId: targetUserId, status: 'PENDING' },
          { fromUserId: targetUserId, toUserId: currentUserId, status: 'PENDING' },
        ],
      },
    })

    if (pendingRequest) {
      if (pendingRequest.fromUserId === currentUserId) {
        return NextResponse.json({
          success: true,
          status: 'pending_sent',
          requestId: pendingRequest.id,
        })
      } else {
        return NextResponse.json({
          success: true,
          status: 'pending_received',
          requestId: pendingRequest.id,
          note: pendingRequest.note,
        })
      }
    }

    // No connection or pending request
    return NextResponse.json({
      success: true,
      status: 'not_connected',
    })
  } catch (error) {
    console.error('Check connection status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
