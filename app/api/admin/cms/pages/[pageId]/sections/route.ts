import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const sectionSchema = z.object({
  order: z.number(),
  isFullWidth: z.boolean().default(false),
  columns: z.number().min(1).max(3),
  content: z.string(), // JSON string
})

// POST create section
export async function POST(req: Request, { params }: { params: Promise<{ pageId: string }> }) {
  try {
    const { pageId } = await params
    const body = await req.json()
    const validatedData = sectionSchema.parse(body)

    const section = await prisma.section.create({
      data: {
        pageId,
        ...validatedData,
      },
    })

    return NextResponse.json({ success: true, section })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create section error:', error)
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 })
  }
}

// PUT update section (batch reorder)
export async function PUT(req: Request, { params }: { params: { pageId: string } }) {
  try {
    const { sections } = await req.json()

    // Update all sections' order
    await Promise.all(
      sections.map((section: { id: string; order: number }) =>
        prisma.section.update({
          where: { id: section.id },
          data: { order: section.order },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reorder sections error:', error)
    return NextResponse.json({ error: 'Failed to reorder sections' }, { status: 500 })
  }
}
