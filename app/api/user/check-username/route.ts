import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Validate username format
    if (!/^[a-z0-9_-]+$/.test(username)) {
      return NextResponse.json({ available: false, error: 'Invalid username format' }, { status: 400 })
    }

    // Check if username exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    })

    return NextResponse.json({ available: !existingUser })
  } catch (error) {
    console.error('Check username error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
