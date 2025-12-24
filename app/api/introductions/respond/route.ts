import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await req.json()
    const { introductionId, action } = body

    if (!introductionId || !['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    // Get the introduction
    const introduction = await prisma.pendingIntroduction.findUnique({
      where: { id: introductionId },
      include: {
        introducer: {
          select: { id: true, firstName: true, lastName: true }
        },
        personAUser: {
          select: { id: true, firstName: true, lastName: true, email: true, username: true }
        },
        personBUser: {
          select: { id: true, firstName: true, lastName: true, email: true, username: true }
        },
      }
    })

    if (!introduction) {
      return NextResponse.json({ error: 'Introduction not found' }, { status: 404 })
    }

    // Check if this user is part of the introduction
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isPersonA = introduction.personAUserId === userId || introduction.personAEmail === user.email
    const isPersonB = introduction.personBUserId === userId || introduction.personBEmail === user.email

    if (!isPersonA && !isPersonB) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    if (action === 'decline') {
      // Update status to declined
      await prisma.pendingIntroduction.update({
        where: { id: introductionId },
        data: { status: 'declined' }
      })

      // Notify the introducer
      await prisma.notification.create({
        data: {
          userId: introduction.introducerId,
          type: 'INTRODUCTION_DECLINED',
          title: 'Introduction Declined',
          message: `${user.firstName} ${user.lastName} declined your introduction`,
          fromUserId: userId,
        }
      })

      return NextResponse.json({ success: true, status: 'declined' })
    }

    // Handle accept
    const updateData: Record<string, boolean | string | Date> = {}

    if (isPersonA) {
      updateData.personAAccepted = true
      if (!introduction.personAUserId) {
        updateData.personAUserId = userId
      }
    }
    if (isPersonB) {
      updateData.personBAccepted = true
      if (!introduction.personBUserId) {
        updateData.personBUserId = userId
      }
    }

    // Check if both have now accepted
    const personAAccepted = isPersonA ? true : introduction.personAAccepted
    const personBAccepted = isPersonB ? true : introduction.personBAccepted

    if (personAAccepted && personBAccepted) {
      updateData.status = 'both_accepted'
      updateData.acceptedAt = new Date()
    } else if (isPersonA) {
      updateData.status = 'personA_accepted'
    } else {
      updateData.status = 'personB_accepted'
    }

    await prisma.pendingIntroduction.update({
      where: { id: introductionId },
      data: updateData
    })

    // If both accepted, create a connection between them
    if (personAAccepted && personBAccepted) {
      const personAId = introduction.personAUserId || userId
      const personBId = introduction.personBUserId || (isPersonB ? userId : null)

      if (personAId && personBId && personAId !== personBId) {
        // Check if connection already exists
        const existingConnection = await prisma.connection.findFirst({
          where: {
            OR: [
              { userId: personAId, connectedUserId: personBId },
              { userId: personBId, connectedUserId: personAId }
            ]
          }
        })

        if (!existingConnection) {
          // Create mutual connections
          await prisma.connection.createMany({
            data: [
              { userId: personAId, connectedUserId: personBId },
              { userId: personBId, connectedUserId: personAId }
            ]
          })

          // Notify both parties
          await prisma.notification.create({
            data: {
              userId: personAId,
              type: 'INTRODUCTION_CONNECTED',
              title: 'Introduction Complete!',
              message: `You are now connected with ${introduction.personBName}`,
              link: personBId ? `/${introduction.personBUser?.username || personBId}` : undefined,
              fromUserId: introduction.introducerId,
            }
          })

          await prisma.notification.create({
            data: {
              userId: personBId,
              type: 'INTRODUCTION_CONNECTED',
              title: 'Introduction Complete!',
              message: `You are now connected with ${introduction.personAName}`,
              link: personAId ? `/${introduction.personAUser?.username || personAId}` : undefined,
              fromUserId: introduction.introducerId,
            }
          })
        }
      }

      // Notify the introducer
      await prisma.notification.create({
        data: {
          userId: introduction.introducerId,
          type: 'INTRODUCTION_COMPLETE',
          title: 'Introduction Successful!',
          message: `${introduction.personAName} and ${introduction.personBName} are now connected`,
          fromUserId: userId,
        }
      })
    } else {
      // Notify the introducer of partial acceptance
      await prisma.notification.create({
        data: {
          userId: introduction.introducerId,
          type: 'INTRODUCTION_ACCEPTED',
          title: 'Introduction Accepted',
          message: `${user.firstName} ${user.lastName} accepted your introduction`,
          fromUserId: userId,
        }
      })
    }

    return NextResponse.json({
      success: true,
      status: updateData.status,
      bothAccepted: personAAccepted && personBAccepted
    })
  } catch (error) {
    console.error('[introductions/respond] POST Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
