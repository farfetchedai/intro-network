import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/services/email'

export async function POST() {
  try {
    // Get API settings
    const settings = await prisma.apiSettings.findFirst()

    if (!settings) {
      return NextResponse.json(
        { success: false, error: 'API settings not configured' },
        { status: 400 }
      )
    }

    // Determine recipient based on email provider
    let recipient: string | null = null
    let providerName = ''

    if (settings.emailProvider === 'gmail') {
      recipient = settings.gmailEmail
      providerName = 'Gmail SMTP'
    } else if (settings.emailProvider === 'ses') {
      recipient = settings.sesFromEmail
      providerName = 'Amazon SES'
    } else if (settings.emailProvider === 'resend' || !settings.emailProvider) {
      recipient = settings.resendFromEmail
      providerName = 'Resend'
    }

    if (!recipient) {
      return NextResponse.json(
        { success: false, error: `Email provider (${settings.emailProvider || 'none'}) not configured - missing from/recipient email` },
        { status: 400 }
      )
    }

    // Send test email using unified email utility
    const result = await sendEmail({
      to: recipient,
      subject: 'Test Email from Admin Dashboard',
      html: `
        <h2>Test Email Successful!</h2>
        <p>This is a test email from your admin dashboard.</p>
        <p>Your <strong>${providerName}</strong> integration is working correctly.</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to send test email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully via ${providerName}`,
    })
  } catch (error) {
    console.error('Failed to send test email:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to send test email' },
      { status: 500 }
    )
  }
}
