import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const templateSchema = z.object({
  templateType: z.enum(['FIRST_DEGREE_REQUEST', 'REFERRAL_REQUEST', 'APPROVAL_NOTIFICATION_TO_REFEREE', 'APPROVAL_NOTIFICATION_TO_FIRST_DEGREE', 'APPROVAL_NOTIFICATION_TO_REFERRAL']),
  messageChannel: z.enum(['EMAIL', 'SMS']),
  subject: z.string().optional(),
  bodyHtml: z.string().optional(),
  bodySms: z.string().optional(),
  isActive: z.boolean().default(true),
})

// GET all templates or filter by templateType
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const templateType = searchParams.get('templateType')
    const messageChannel = searchParams.get('messageChannel')

    const where: any = {}
    if (templateType) where.templateType = templateType
    if (messageChannel) where.messageChannel = messageChannel

    const templates = await prisma.messageTemplate.findMany({
      where,
      orderBy: [
        { templateType: 'asc' },
        { messageChannel: 'asc' },
      ],
    })

    return NextResponse.json({ success: true, templates })
  } catch (error) {
    console.error('Get templates error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// POST create or update template
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = templateSchema.parse(body)

    // Use upsert to create or update based on templateType + messageChannel unique constraint
    const template = await prisma.messageTemplate.upsert({
      where: {
        templateType_messageChannel: {
          templateType: validatedData.templateType,
          messageChannel: validatedData.messageChannel,
        },
      },
      update: {
        subject: validatedData.subject,
        bodyHtml: validatedData.bodyHtml,
        bodySms: validatedData.bodySms,
        isActive: validatedData.isActive,
      },
      create: {
        templateType: validatedData.templateType,
        messageChannel: validatedData.messageChannel,
        subject: validatedData.subject,
        bodyHtml: validatedData.bodyHtml,
        bodySms: validatedData.bodySms,
        isActive: validatedData.isActive,
      },
    })

    return NextResponse.json({ success: true, template })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Save template error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save template' },
      { status: 500 }
    )
  }
}
