import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET /api/career - List user's career history
export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const careerHistory = await prisma.careerHistory.findMany({
      where: { userId },
      orderBy: [
        { isCurrent: 'desc' },
        { startDate: 'desc' },
      ],
    })

    return NextResponse.json({
      success: true,
      careerHistory,
    })
  } catch (error) {
    console.error('Failed to fetch career history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch career history' },
      { status: 500 }
    )
  }
}

// POST /api/career - Create a new career entry
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      title,
      companyName,
      companyLogoUrl,
      location,
      description,
      startDate,
      endDate,
      isCurrent,
    } = body

    if (!title || !companyName) {
      return NextResponse.json(
        { success: false, error: 'Title and company name are required' },
        { status: 400 }
      )
    }

    const careerEntry = await prisma.careerHistory.create({
      data: {
        userId,
        title,
        companyName,
        companyLogoUrl,
        location,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isCurrent: isCurrent || false,
        importedFromLinkedIn: false,
      },
    })

    return NextResponse.json({
      success: true,
      careerEntry,
    })
  } catch (error) {
    console.error('Failed to create career entry:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create career entry' },
      { status: 500 }
    )
  }
}
