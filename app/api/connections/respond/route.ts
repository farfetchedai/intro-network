import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendEmail } from '@/lib/email'
import { notifyConnectionAccepted, notifyConnectionDeclined } from '@/lib/notifications'

const respondSchema = z.object({
  requestId: z.string().optional(),
  token: z.string().optional(),
  action: z.enum(['accept', 'decline']),
}).refine((data) => data.requestId || data.token, {
  message: 'Either requestId or token is required',
})

// POST /api/connections/respond - Accept or decline a connection request
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = respondSchema.parse(body)

    // Find the connection request
    let connectionRequest
    if (validatedData.token) {
      // Token-based access (from email link)
      connectionRequest = await prisma.connectionRequest.findUnique({
        where: { token: validatedData.token },
        include: {
          fromUser: true,
          toUser: true,
        },
      })
    } else if (validatedData.requestId) {
      // ID-based access (from logged-in user)
      const cookieStore = await cookies()
      const userId = cookieStore.get('userId')?.value

      if (!userId) {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        )
      }

      connectionRequest = await prisma.connectionRequest.findUnique({
        where: { id: validatedData.requestId },
        include: {
          fromUser: true,
          toUser: true,
        },
      })

      // Verify the logged-in user is the recipient
      if (connectionRequest && connectionRequest.toUserId !== userId) {
        return NextResponse.json(
          { error: 'You are not authorized to respond to this request' },
          { status: 403 }
        )
      }
    }

    if (!connectionRequest) {
      return NextResponse.json(
        { error: 'Connection request not found' },
        { status: 404 }
      )
    }

    if (connectionRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: `This request has already been ${connectionRequest.status.toLowerCase()}` },
        { status: 400 }
      )
    }

    if (validatedData.action === 'accept') {
      // Accept the request and create bidirectional connections
      await prisma.$transaction([
        prisma.connectionRequest.update({
          where: { id: connectionRequest.id },
          data: { status: 'ACCEPTED', respondedAt: new Date() },
        }),
        prisma.connection.create({
          data: {
            userId: connectionRequest.fromUserId,
            connectedUserId: connectionRequest.toUserId,
          },
        }),
        prisma.connection.create({
          data: {
            userId: connectionRequest.toUserId,
            connectedUserId: connectionRequest.fromUserId,
          },
        }),
      ])

      // Create in-app notification for the requester
      await notifyConnectionAccepted(connectionRequest.fromUserId, {
        id: connectionRequest.toUserId,
        firstName: connectionRequest.toUser.firstName,
        lastName: connectionRequest.toUser.lastName,
        username: connectionRequest.toUser.username,
      })

      // Send acceptance notification email
      if (connectionRequest.fromUser.email) {
        try {
          const profileUrl = connectionRequest.toUser.username
            ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${connectionRequest.toUser.username}`
            : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`

          await sendEmail({
            to: connectionRequest.fromUser.email,
            subject: `${connectionRequest.toUser.firstName} ${connectionRequest.toUser.lastName} accepted your connection request`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Connection Accepted!</h2>
                <p><strong>${connectionRequest.toUser.firstName} ${connectionRequest.toUser.lastName}</strong> has accepted your connection request.</p>
                <p>You are now connected and can collaborate together.</p>
                <div style="margin: 24px 0;">
                  <a href="${profileUrl}" style="display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                    View Their Profile
                  </a>
                </div>
              </div>
            `,
          })
        } catch (emailError) {
          console.log('Email sending failed (dev mode):', emailError)
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Connection request accepted',
        connection: {
          user: {
            id: connectionRequest.fromUser.id,
            firstName: connectionRequest.fromUser.firstName,
            lastName: connectionRequest.fromUser.lastName,
            username: connectionRequest.fromUser.username,
          },
        },
      })
    } else {
      // Decline the request
      await prisma.connectionRequest.update({
        where: { id: connectionRequest.id },
        data: { status: 'DECLINED', respondedAt: new Date() },
      })

      // Create in-app notification for the requester
      await notifyConnectionDeclined(connectionRequest.fromUserId, {
        id: connectionRequest.toUserId,
        firstName: connectionRequest.toUser.firstName,
        lastName: connectionRequest.toUser.lastName,
      })

      return NextResponse.json({
        success: true,
        message: 'Connection request declined',
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Respond to connection request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
