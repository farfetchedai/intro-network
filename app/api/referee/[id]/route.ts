import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Try to find by username first, then by ID
    const referee = await prisma.user.findFirst({
      where: {
        OR: [
          { username: id },
          { id: id }
        ]
      },
      select: {
        id: true,
        username: true,
        profilePicture: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        skills: true,
        companyName: true,
        achievement: true,
        achievementMethod: true,
        statementSummary: true,
        statementSummary3rdPerson: true,
        introRequest: true,
        userType: true,
      },
    })

    if (!referee) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Parse skills JSON if it's stored as a string
    let parsedReferee = { ...referee }
    if (referee.skills) {
      try {
        parsedReferee.skills = JSON.parse(referee.skills)
      } catch {
        // If parsing fails, keep as is
      }
    }

    return NextResponse.json({ referee: parsedReferee })
  } catch (error) {
    console.error('Get referee error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
