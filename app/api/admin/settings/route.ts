import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get the first (and should be only) API settings record
    let settings = await prisma.apiSettings.findFirst()

    // If no settings exist, create default empty ones
    if (!settings) {
      settings = await prisma.apiSettings.create({
        data: {},
      })
    }

    return NextResponse.json({
      success: true,
      settings: {
        emailProvider: settings.emailProvider || 'resend',
        resendApiKey: settings.resendApiKey || '',
        resendFromEmail: settings.resendFromEmail || '',
        gmailEmail: settings.gmailEmail || '',
        gmailAppPassword: settings.gmailAppPassword || '',
        twilioAccountSid: settings.twilioAccountSid || '',
        twilioAuthToken: settings.twilioAuthToken || '',
        twilioPhoneNumber: settings.twilioPhoneNumber || '',
      },
    })
  } catch (error) {
    console.error('Failed to fetch API settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch API settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Get existing settings or create new
    let apiSettings = await prisma.apiSettings.findFirst()

    if (apiSettings) {
      // Update existing
      apiSettings = await prisma.apiSettings.update({
        where: { id: apiSettings.id },
        data: {
          emailProvider: body.emailProvider || 'resend',
          resendApiKey: body.resendApiKey || null,
          resendFromEmail: body.resendFromEmail || null,
          gmailEmail: body.gmailEmail || null,
          gmailAppPassword: body.gmailAppPassword || null,
          twilioAccountSid: body.twilioAccountSid || null,
          twilioAuthToken: body.twilioAuthToken || null,
          twilioPhoneNumber: body.twilioPhoneNumber || null,
        },
      })
    } else {
      // Create new
      apiSettings = await prisma.apiSettings.create({
        data: {
          emailProvider: body.emailProvider || 'resend',
          resendApiKey: body.resendApiKey || null,
          resendFromEmail: body.resendFromEmail || null,
          gmailEmail: body.gmailEmail || null,
          gmailAppPassword: body.gmailAppPassword || null,
          twilioAccountSid: body.twilioAccountSid || null,
          twilioAuthToken: body.twilioAuthToken || null,
          twilioPhoneNumber: body.twilioPhoneNumber || null,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'API settings saved successfully',
    })
  } catch (error) {
    console.error('Failed to save API settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save API settings' },
      { status: 500 }
    )
  }
}
