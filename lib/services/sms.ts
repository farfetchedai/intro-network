import { prisma } from '../prisma'

export async function sendSMS({
  to,
  message,
}: {
  to: string
  message: string
}) {
  try {
    const settings = await prisma.apiSettings.findFirst()

    if (!settings) {
      console.warn('SMS provider not configured. SMS not sent.')
      return { success: false, error: 'SMS provider not configured' }
    }

    // Check if SMS is enabled
    if (!settings.smsEnabled) {
      console.warn('SMS is disabled. SMS not sent.')
      return { success: false, error: 'SMS is disabled' }
    }

    // Check if Twilio is configured
    if (!settings.twilioAccountSid || !settings.twilioAuthToken || !settings.twilioPhoneNumber) {
      console.warn('Twilio SMS credentials not configured. SMS not sent.')
      return { success: false, error: 'Twilio not configured' }
    }

    console.log('Sending SMS via Twilio:', {
      from: settings.twilioPhoneNumber,
      to,
      message: message.substring(0, 50) + '...',
    })

    // Send SMS using Twilio REST API
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
          To: to,
          Body: message,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Twilio SMS error:', data)
      return { success: false, error: data.message || 'Failed to send SMS' }
    }

    console.log('SMS sent successfully:', data.sid)
    return { success: true, provider: 'twilio', sid: data.sid }
  } catch (error) {
    console.error('Failed to send SMS:', error)
    return { success: false, error }
  }
}

export function generateFirstDegreeRequestSMS({
  refereeFirstName,
  refereeLastName,
  contactFirstName,
  customMessage,
  link,
}: {
  refereeFirstName: string
  refereeLastName: string
  contactFirstName: string
  customMessage: string
  link: string
}) {
  return `Hi ${contactFirstName},

${customMessage}

Help ${refereeFirstName} out: ${link}

- ${refereeFirstName} ${refereeLastName} via Intro Network`
}
