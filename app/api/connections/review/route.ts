import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/connections/review?token=xxx - Get connection request by token
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    const connectionRequest = await prisma.connectionRequest.findUnique({
      where: { token },
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
        toUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!connectionRequest) {
      return NextResponse.json(
        { error: 'Connection request not found or has expired' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      request: connectionRequest,
    })
  } catch (error) {
    console.error('Get connection request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
