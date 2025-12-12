import twilio from 'twilio'
import { prisma } from './prisma'

interface SMSOptions {
  to: string
  message: string
}

export async function sendSMS({ to, message }: SMSOptions) {
  try {
    const settings = await prisma.apiSettings.findFirst()

    if (!settings) {
      throw new Error('API settings not configured')
    }

    if (!settings.twilioAccountSid || !settings.twilioAuthToken || !settings.twilioPhoneNumber) {
      throw new Error('Twilio not configured')
    }

    console.log('Sending SMS via Twilio:', {
      from: settings.twilioPhoneNumber,
      to,
    })

    const client = twilio(settings.twilioAccountSid, settings.twilioAuthToken)

    const result = await client.messages.create({
      body: message,
      from: settings.twilioPhoneNumber,
      to,
    })

    console.log('Twilio SMS send successful:', result.sid)

    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to send SMS:', error)
    throw error
  }
}

export function generateFirstDegreeRequestSMS({
  refereeFirstName,
  refereeLastName,
  contactFirstName,
  link,
}: {
  refereeFirstName: string
  refereeLastName: string
  contactFirstName: string
  link: string
}) {
  return `Hi ${contactFirstName}, ${refereeFirstName} ${refereeLastName} is asking for your help with introductions. Click here to respond: ${link}`
}

export function generateReferralRequestSMS({
  refereeFirstName,
  firstDegreeFirstName,
  referralFirstName,
  link,
}: {
  refereeFirstName: string
  firstDegreeFirstName: string
  referralFirstName: string
  link: string
}) {
  return `Hi ${referralFirstName}, ${firstDegreeFirstName} thought you should meet ${refereeFirstName}. Click here to view: ${link}`
}
