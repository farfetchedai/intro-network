import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

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
    const recipient = settings.emailProvider === 'gmail'
      ? settings.gmailEmail
      : settings.resendFromEmail

    if (!recipient) {
      return NextResponse.json(
        { success: false, error: 'Email provider not configured' },
        { status: 400 }
      )
    }

    // Send test email using unified email utility
    await sendEmail({
      to: recipient,
      subject: 'Test Email from Admin Dashboard',
      html: `
        <h2>Test Email Successful!</h2>
        <p>This is a test email from your admin dashboard.</p>
        <p>Your ${settings.emailProvider === 'gmail' ? 'Gmail SMTP' : 'Resend'} integration is working correctly.</p>
      `,
    })

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
    })
  } catch (error) {
    console.error('Failed to send test email:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to send test email' },
      { status: 500 }
    )
  }
}
