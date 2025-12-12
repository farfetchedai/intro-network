import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const referee = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        skills: true,
        companyName: true,
        achievement: true,
        achievementMethod: true,
        statementSummary: true,
        introRequest: true,
        userType: true,
      },
    })

    if (!referee || referee.userType !== 'REFEREE') {
      return NextResponse.json(
        { error: 'Referee not found' },
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
