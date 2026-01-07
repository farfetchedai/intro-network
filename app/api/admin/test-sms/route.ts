import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    // Get API settings
    const settings = await prisma.apiSettings.findFirst()

    if (!settings || !settings.twilioAccountSid || !settings.twilioAuthToken || !settings.twilioPhoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Twilio API credentials not configured' },
        { status: 400 }
      )
    }

    // Get optional "to" number from request body, default to Twilio phone number
    let toNumber = settings.twilioPhoneNumber
    try {
      const body = await request.json()
      if (body.to) {
        toNumber = body.to
      }
    } catch {
      // No body provided, use default
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
          To: toNumber,
          Body: 'Test SMS from Admin Dashboard - Your Twilio integration is working correctly!',
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      // Provide better error messages for common Twilio errors
      let errorMessage = data.message || 'Failed to send test SMS'

      if (data.code === 21608 || errorMessage.includes('unverified')) {
        errorMessage = 'Trial accounts can only send to verified numbers. Add your phone number in Twilio Console > Verified Caller IDs.'
      } else if (data.code === 21211) {
        errorMessage = 'Invalid phone number format. Use E.164 format (e.g., +14155551234).'
      } else if (data.code === 21606) {
        errorMessage = 'The "From" number is not a valid Twilio number. Check your Twilio phone number.'
      }

      return NextResponse.json(
        { success: false, error: errorMessage, code: data.code },
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
