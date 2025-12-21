import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendEmail } from '@/lib/email'
import { notifyConnectionRequest, notifyConnectionAccepted } from '@/lib/notifications'

const requestSchema = z.object({
  toUserId: z.string().min(1, 'User ID is required'),
  note: z.string().optional(),
})

// POST /api/connections/request - Send a connection request
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedData = requestSchema.parse(body)

    // Can't connect to yourself
    if (validatedData.toUserId === userId) {
      return NextResponse.json(
        { error: 'You cannot connect with yourself' },
        { status: 400 }
      )
    }

    // Check if target user exists
    const toUser = await prisma.user.findUnique({
      where: { id: validatedData.toUserId },
    })

    if (!toUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get current user for notifications and email
    const fromUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!fromUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already connected
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { userId, connectedUserId: validatedData.toUserId },
          { userId: validatedData.toUserId, connectedUserId: userId },
        ],
      },
    })

    if (existingConnection) {
      return NextResponse.json(
        { error: 'You are already connected with this user' },
        { status: 400 }
      )
    }

    // Check if there's already a pending request (either direction)
    const existingRequest = await prisma.connectionRequest.findFirst({
      where: {
        OR: [
          { fromUserId: userId, toUserId: validatedData.toUserId, status: 'PENDING' },
          { fromUserId: validatedData.toUserId, toUserId: userId, status: 'PENDING' },
        ],
      },
    })

    if (existingRequest) {
      // If they already sent us a request, auto-accept it
      if (existingRequest.fromUserId === validatedData.toUserId) {
        // Accept their request and create connection
        await prisma.$transaction([
          prisma.connectionRequest.update({
            where: { id: existingRequest.id },
            data: { status: 'ACCEPTED', respondedAt: new Date() },
          }),
          prisma.connection.create({
            data: { userId, connectedUserId: validatedData.toUserId },
          }),
          prisma.connection.create({
            data: { userId: validatedData.toUserId, connectedUserId: userId },
          }),
        ])

        // Notify both users about the accepted connection
        await Promise.all([
          notifyConnectionAccepted(validatedData.toUserId, {
            id: userId,
            firstName: fromUser.firstName,
            lastName: fromUser.lastName,
            username: fromUser.username,
          }),
          notifyConnectionAccepted(userId, {
            id: validatedData.toUserId,
            firstName: toUser.firstName,
            lastName: toUser.lastName,
            username: toUser.username,
          }),
        ])

        return NextResponse.json({
          success: true,
          message: 'Connection established! They had already requested to connect with you.',
          autoAccepted: true,
        })
      }

      return NextResponse.json(
        { error: 'You already have a pending connection request with this user' },
        { status: 400 }
      )
    }

    // Create connection request
    const connectionRequest = await prisma.connectionRequest.create({
      data: {
        fromUserId: userId,
        toUserId: validatedData.toUserId,
        note: validatedData.note || null,
      },
    })

    // Create in-app notification
    await notifyConnectionRequest(validatedData.toUserId, {
      id: fromUser.id,
      firstName: fromUser.firstName,
      lastName: fromUser.lastName,
    })

    // Send email notification to recipient
    if (toUser.email) {
      const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/connections/review/${connectionRequest.token}`

      try {
        await sendEmail({
          to: toUser.email,
          subject: `${fromUser.firstName} ${fromUser.lastName} wants to connect with you`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>New Connection Request</h2>
              <p><strong>${fromUser.firstName} ${fromUser.lastName}</strong>${fromUser.companyName ? ` from ${fromUser.companyName}` : ''} would like to connect with you.</p>
              ${validatedData.note ? `
                <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-style: italic;">"${validatedData.note}"</p>
                </div>
              ` : ''}
              <div style="margin: 24px 0;">
                <a href="${reviewUrl}" style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-right: 12px;">
                  Review Request
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">Click the button above to accept or decline this connection request.</p>
            </div>
          `,
        })
      } catch (emailError) {
        console.log('Email sending failed (dev mode):', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Connection request sent successfully',
      request: {
        id: connectionRequest.id,
        toUser: {
          id: toUser.id,
          firstName: toUser.firstName,
          lastName: toUser.lastName,
        },
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    // Handle unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A connection request already exists between you and this user' },
        { status: 400 }
      )
    }

    console.error('Send connection request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
