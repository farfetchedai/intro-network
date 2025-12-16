import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')
    const username = searchParams.get('username')

    if (!userId && !email && !username) {
      return NextResponse.json({ error: 'Missing userId, email, or username' }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: userId
        ? { id: userId }
        : username
        ? { username: username }
        : { email: email! },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        userType: true,
        username: true,
        profilePicture: true,
        skills: true,
        companyName: true,
        achievement: true,
        achievementMethod: true,
        statementSummary: true,
        introRequest: true,
        linkedinUrl: true,
        twitterUrl: true,
        facebookUrl: true,
        instagramUrl: true,
        websiteUrl: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
