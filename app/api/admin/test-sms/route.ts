import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Get API settings
    const settings = await prisma.apiSettings.findFirst()

    if (!settings || !settings.twilioAccountSid || !settings.twilioAuthToken || !settings.twilioPhoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Twilio API credentials not configured' },
        { status: 400 }
      )
    }

    // Send test SMS using Twilio API
    const auth = Buffer.from(`${settings.twilioAccountSid}:${settings.twilioAuthToken}`).toString('base64')

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${settings.twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`,
        },
        body: new URLSearchParams({
          From: settings.twilioPhoneNumber,
          To: settings.twilioPhoneNumber,
          Body: 'Test SMS from Admin Dashboard - Your Twilio integration is working correctly!',
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.message || 'Failed to send test SMS' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Test SMS sent successfully',
      sid: data.sid,
    })
  } catch (error) {
    console.error('Failed to send test SMS:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send test SMS' },
      { status: 500 }
    )
  }
}
