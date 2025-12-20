import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { targetUserId } = body

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Target user ID is required', success: false },
        { status: 400 }
      )
    }

    // Get current user from cookie
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated', success: false },
        { status: 401 }
      )
    }

    // Can't connect with yourself
    if (userId === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot connect with yourself', success: false },
        { status: 400 }
      )
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, firstName: true, lastName: true, email: true, phone: true }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found', success: false },
        { status: 404 }
      )
    }

    // Check if connection already exists
    const existingConnection = await prisma.contact.findFirst({
      where: {
        userId: userId,
        contactId: targetUserId,
      }
    })

    if (existingConnection) {
      return NextResponse.json(
        { error: 'Already connected', success: false, alreadyConnected: true },
        { status: 400 }
      )
    }

    // Create the connection
    await prisma.contact.create({
      data: {
        userId: userId,
        contactId: targetUserId,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        email: targetUser.email,
        phone: targetUser.phone,
        degreeType: 'FIRST_DEGREE',
      }
    })

    return NextResponse.json({
      success: true,
      message: `Connected with ${targetUser.firstName} ${targetUser.lastName}`,
    })
  } catch (error) {
    console.error('[add-connection] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}`, success: false },
      { status: 500 }
    )
  }
}

// GET endpoint to check if already connected
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const targetUserId = searchParams.get('targetUserId')

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Target user ID is required', success: false },
        { status: 400 }
      )
    }

    // Get current user from cookie
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({
        success: true,
        isConnected: false,
        isLoggedIn: false,
      })
    }

    // Check if connection exists
    const existingConnection = await prisma.contact.findFirst({
      where: {
        userId: userId,
        contactId: targetUserId,
      }
    })

    return NextResponse.json({
      success: true,
      isConnected: !!existingConnection,
      isLoggedIn: true,
      isSelf: userId === targetUserId,
    })
  } catch (error) {
    console.error('[add-connection] GET Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    )
  }
}
