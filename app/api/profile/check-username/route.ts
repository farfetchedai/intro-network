import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
        { status: 400 }
      )
    }

    // Check if username is already taken
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    return NextResponse.json({
      success: true,
      available: !existingUser,
    })
  } catch (error) {
    console.error('Failed to check username:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check username' },
      { status: 500 }
    )
  }
}
