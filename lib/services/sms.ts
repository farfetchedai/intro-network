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

    // For now, just log the SMS since we don't have the Twilio package installed
    // In production, you would import and use the Twilio SDK here
    // const twilio = require('twilio')
    // const client = twilio(settings.twilioAccountSid, settings.twilioAuthToken)
    // await client.messages.create({
    //   body: message,
    //   from: settings.twilioPhoneNumber,
    //   to: to,
    // })

    console.log('SMS would be sent (Twilio not integrated yet)')

    return { success: true, provider: 'twilio' }
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
