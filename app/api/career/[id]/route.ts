import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// PUT /api/career/[id] - Update a career entry
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    const { id } = await params

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify ownership
    const existingEntry = await prisma.careerHistory.findFirst({
      where: { id, userId },
    })

    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: 'Career entry not found' },
        { status: 404 }
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

    const careerEntry = await prisma.careerHistory.update({
      where: { id },
      data: {
        title,
        companyName,
        companyLogoUrl,
        location,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isCurrent: isCurrent || false,
      },
    })

    return NextResponse.json({
      success: true,
      careerEntry,
    })
  } catch (error) {
    console.error('Failed to update career entry:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update career entry' },
      { status: 500 }
    )
  }
}

// DELETE /api/career/[id] - Delete a career entry
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    const { id } = await params

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify ownership
    const existingEntry = await prisma.careerHistory.findFirst({
      where: { id, userId },
    })

    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: 'Career entry not found' },
        { status: 404 }
      )
    }

    await prisma.careerHistory.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Failed to delete career entry:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete career entry' },
      { status: 500 }
    )
  }
}
