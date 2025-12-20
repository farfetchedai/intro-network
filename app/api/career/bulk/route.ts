import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

interface CareerEntryInput {
  title: string
  companyName: string
  location?: string | null
  description?: string | null
  startDate?: string | null
  endDate?: string | null
  isCurrent?: boolean
}

// POST /api/career/bulk - Create multiple career entries at once
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
    const { entries } = body as { entries: CareerEntryInput[] }

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No entries provided' },
        { status: 400 }
      )
    }

    // Validate all entries have required fields
    for (const entry of entries) {
      if (!entry.title || !entry.companyName) {
        return NextResponse.json(
          { success: false, error: 'All entries must have title and company name' },
          { status: 400 }
        )
      }
    }

    // Parse date string (YYYY-MM) to Date object
    const parseDate = (dateStr: string | null | undefined): Date | null => {
      if (!dateStr) return null
      // Handle YYYY-MM format
      if (/^\d{4}-\d{2}$/.test(dateStr)) {
        return new Date(`${dateStr}-01`)
      }
      // Try parsing as regular date
      const date = new Date(dateStr)
      return isNaN(date.getTime()) ? null : date
    }

    // Create all entries in a transaction
    const createdEntries = await prisma.$transaction(
      entries.map((entry) =>
        prisma.careerHistory.create({
          data: {
            userId,
            title: entry.title,
            companyName: entry.companyName,
            location: entry.location || null,
            description: entry.description || null,
            startDate: parseDate(entry.startDate),
            endDate: parseDate(entry.endDate),
            isCurrent: entry.isCurrent || false,
            importedFromLinkedIn: false,
          },
        })
      )
    )

    return NextResponse.json({
      success: true,
      count: createdEntries.length,
      careerEntries: createdEntries,
    })
  } catch (error) {
    console.error('Failed to bulk create career entries:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save career entries' },
      { status: 500 }
    )
  }
}
