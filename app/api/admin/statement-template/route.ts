import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULT_TEMPLATE = `{firstName} {lastName} is great at {skills}.{companySection}{introRequestSection}`

export async function GET() {
  try {
    let settings = await prisma.apiSettings.findFirst()

    if (!settings) {
      settings = await prisma.apiSettings.create({
        data: {
          statementSummaryTemplate: DEFAULT_TEMPLATE,
        },
      })
    }

    return NextResponse.json({
      success: true,
      template: settings.statementSummaryTemplate || DEFAULT_TEMPLATE,
    })
  } catch (error) {
    console.error('Get statement template error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { template } = await req.json()

    if (!template) {
      return NextResponse.json(
        { error: 'Template is required' },
        { status: 400 }
      )
    }

    let settings = await prisma.apiSettings.findFirst()

    if (!settings) {
      settings = await prisma.apiSettings.create({
        data: {
          statementSummaryTemplate: template,
        },
      })
    } else {
      settings = await prisma.apiSettings.update({
        where: { id: settings.id },
        data: {
          statementSummaryTemplate: template,
        },
      })
    }

    return NextResponse.json({
      success: true,
      template: settings.statementSummaryTemplate,
    })
  } catch (error) {
    console.error('Update statement template error:', error)
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    )
  }
}
