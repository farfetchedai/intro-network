import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        skills: true,
        companyName: true,
        achievement: true,
        achievementMethod: true,
        introRequest: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Regenerate statementSummary with new format
    // Handle skills - it might be stored as JSON string or array
    let skills: string[] = []
    if (Array.isArray(user.skills)) {
      skills = user.skills
    } else if (typeof user.skills === 'string') {
      try {
        const parsed = JSON.parse(user.skills)
        skills = Array.isArray(parsed) ? parsed : []
      } catch {
        skills = []
      }
    }

    const skillsList = skills.filter(s => s?.trim()).join(' and ')
    const statementSummary = `I'm really good at ${skillsList}. I've worked at ${user.companyName} where I ${user.achievement} by ${user.achievementMethod}\n\nI'd love to meet ${user.introRequest}.`

    // Update user with new statementSummary
    await prisma.user.update({
      where: { id: userId },
      data: { statementSummary },
    })

    return NextResponse.json({
      success: true,
      statementSummary,
    })
  } catch (error) {
    console.error('Regenerate statement error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
