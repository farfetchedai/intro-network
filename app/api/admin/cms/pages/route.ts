import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const pageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly (lowercase, hyphens only)'),
  isPublished: z.boolean().default(false),
  isHomepage: z.boolean().default(false),
})

// GET all pages
export async function GET(req: Request) {
  try {
    const pages = await prisma.page.findMany({
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ pages })
  } catch (error) {
    console.error('Get pages error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    )
  }
}

// POST create new page
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = pageSchema.parse(body)

    // If setting as homepage, unset other homepages
    if (validatedData.isHomepage) {
      await prisma.page.updateMany({
        where: { isHomepage: true },
        data: { isHomepage: false },
      })
    }

    const page = await prisma.page.create({
      data: validatedData,
      include: {
        sections: true,
      },
    })

    return NextResponse.json({ success: true, page })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Create page error:', error)
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    )
  }
}
