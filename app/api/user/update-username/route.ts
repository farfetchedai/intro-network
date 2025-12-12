import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

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
    const { username } = body

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Validate username format
    if (!/^[a-z0-9_-]+$/.test(username)) {
      return NextResponse.json({ error: 'Invalid username format' }, { status: 400 })
    }

    // Check if username is already taken
    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    })

    if (existingUser && existingUser.id !== userId) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
    }

    // Update username
    await prisma.user.update({
      where: { id: userId },
      data: { username },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update username error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
