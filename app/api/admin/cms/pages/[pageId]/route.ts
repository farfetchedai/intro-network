import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const pageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly'),
  isPublished: z.boolean().default(false),
  isHomepage: z.boolean().default(false),
})

// GET single page
export async function GET(req: Request, { params }: { params: Promise<{ pageId: string }> }) {
  try {
    const { pageId } = await params
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    return NextResponse.json({ page })
  } catch (error) {
    console.error('Get page error:', error)
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 })
  }
}

// PUT update page
export async function PUT(req: Request, { params }: { params: Promise<{ pageId: string }> }) {
  try {
    const { pageId } = await params
    const body = await req.json()
    const validatedData = pageSchema.parse(body)

    // If setting as homepage, unset other homepages
    if (validatedData.isHomepage) {
      await prisma.page.updateMany({
        where: {
          isHomepage: true,
          NOT: { id: pageId }
        },
        data: { isHomepage: false },
      })
    }

    const page = await prisma.page.update({
      where: { id: pageId },
      data: validatedData,
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
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

    console.error('Update page error:', error)
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 })
  }
}

// DELETE page
export async function DELETE(req: Request, { params }: { params: Promise<{ pageId: string }> }) {
  try {
    const { pageId } = await params
    await prisma.page.delete({
      where: { id: pageId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete page error:', error)
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 })
  }
}
