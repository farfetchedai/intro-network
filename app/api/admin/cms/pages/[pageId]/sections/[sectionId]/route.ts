import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const sectionSchema = z.object({
  order: z.number().optional(),
  isFullWidth: z.boolean().optional(),
  columns: z.number().min(1).max(3).optional(),
  content: z.string().optional(),
})

// PUT update section
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ pageId: string; sectionId: string }> }
) {
  try {
    const { sectionId } = await params
    const body = await req.json()
    const validatedData = sectionSchema.parse(body)

    const section = await prisma.section.update({
      where: { id: sectionId },
      data: validatedData,
    })

    return NextResponse.json({ success: true, section })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update section error:', error)
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 })
  }
}

// DELETE section
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ pageId: string; sectionId: string }> }
) {
  try {
    const { sectionId } = await params
    await prisma.section.delete({
      where: { id: sectionId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete section error:', error)
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 })
  }
}
