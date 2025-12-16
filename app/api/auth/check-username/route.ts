import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Validate username format
    const usernameRegex = /^[a-z0-9_]+$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { available: false, error: 'Username can only contain lowercase letters, numbers, and underscores' },
        { status: 200 }
      )
    }

    // Check minimum length
    if (username.length < 3) {
      return NextResponse.json(
        { available: false, error: 'Username must be at least 3 characters' },
        { status: 200 }
      )
    }

    // Get current user ID from cookies
    const cookieStore = await cookies()
    const currentUserId = cookieStore.get('userId')?.value

    // Check if username exists in database
    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    })

    // If username exists and belongs to current user, it's available
    if (existingUser && currentUserId && existingUser.id === currentUserId) {
      return NextResponse.json({
        available: true,
        username,
        isCurrentUser: true,
      })
    }

    return NextResponse.json({
      available: !existingUser,
      username,
      isCurrentUser: false,
    })
  } catch (error) {
    console.error('Check username error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
