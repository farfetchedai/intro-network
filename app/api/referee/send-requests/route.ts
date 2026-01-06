import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, generateFirstDegreeRequestEmail } from '@/lib/services/email'
import { sendSMS, generateFirstDegreeRequestSMS } from '@/lib/services/sms'
import { generateMagicLink } from '@/lib/magicLink'
import { z } from 'zod'
import { notifyIntroHelpRequest } from '@/lib/notifications'

const sendRequestSchema = z.object({
  userId: z.string(),
  contactIds: z.array(z.string()),
  customMessage: z.string(),
  customSmsMessage: z.string().optional(),
  emailSubject: z.string().optional(),
  sendViaEmail: z.boolean().default(true),
  sendViaSms: z.boolean().default(false),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = sendRequestSchema.parse(body)

    // Get referee user
    const referee = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    })

    if (!referee) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get contacts
    const contacts = await prisma.contact.findMany({
      where: {
        id: { in: validatedData.contactIds },
        userId: validatedData.userId,
      },
    })

    if (contacts.length === 0) {
      return NextResponse.json({ error: 'No contacts found' }, { status: 404 })
    }

    // Ensure all contacts have user accounts
    for (const contact of contacts) {
      if (!contact.contactId) {
        // First check if a user with this email already exists
        let contactUser = await prisma.user.findFirst({
          where: { email: contact.email },
        })

        if (!contactUser) {
          // Create user account for contact only if no user exists with this email
          contactUser = await prisma.user.create({
            data: {
              firstName: contact.firstName,
              lastName: contact.lastName,
              email: contact.email,
              phone: contact.phone,
              userType: 'FIRST_DEGREE',
            },
          })
        }

        // Update contact with the user id
        await prisma.contact.update({
          where: { id: contact.id },
          data: { contactId: contactUser.id },
        })

        // Update the contact object in memory so it has the contactId
        contact.contactId = contactUser.id
      }
    }

    // Send messages to each contact
    const results = await Promise.all(
      contacts.map(async (contact) => {
        // Generate magic link for authentication
        const redirectUrl = `/firstdegree/${referee.id}?c=${contact.id}`
        const link = await generateMagicLink(contact.contactId!, redirectUrl)

        let emailResult, smsResult

        // Send email if requested and email exists
        console.log(`[SendRequests] Processing contact ${contact.id}: sendViaEmail=${validatedData.sendViaEmail}, email=${contact.email}`)
        if (validatedData.sendViaEmail && contact.email) {
          // Helper to capitalize first letter
          const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

          // Use custom message directly as HTML, with variable substitution
          let emailHtml = validatedData.customMessage

          // If user has no statement summary, remove the statement summary div
          if (!referee.statementSummary) {
            // Remove div with class containing "statement-summary-email" (handles class before or after style)
            emailHtml = emailHtml.replace(/<div[^>]*class\s*=\s*["'][^"']*statement-summary-email[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '')
            // Remove div with the blue border styling that typically wraps statement summary
            emailHtml = emailHtml.replace(/<div[^>]*style\s*=\s*["'][^"']*border-left:\s*4px[^"']*#3B82F6[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '')
            // Clean up any remaining "{statementSummary}" or just {statementSummary}
            emailHtml = emailHtml.replace(/["']\{statementSummary\}["']/g, '')
            emailHtml = emailHtml.replace(/\{statementSummary\}/g, '')
          }

          emailHtml = emailHtml
            .replace(/\{contactName\}/g, `${capitalize(contact.firstName)} ${contact.lastName}`)
            .replace(/\{contactFirstName\}/g, capitalize(contact.firstName))
            .replace(/\{contactLastName\}/g, contact.lastName)
            .replace(/\{firstName\}/g, referee.firstName)
            .replace(/\{refereeFirstName\}/g, referee.firstName)
            .replace(/\{refereeLastName\}/g, referee.lastName)
            .replace(/\{link\}/g, link)
            .replace(/\{statementSummary\}/g, referee.statementSummary || '')
            .replace(/\{skills\}/g, referee.skills || '')
            .replace(/\{achievement\}/g, referee.achievement || '')
            .replace(/\{achievementMethod\}/g, referee.achievementMethod || '')
            .replace(/\{introRequest\}/g, referee.introRequest || '')
            .replace(/\{companyName\}/g, referee.companyName || '')

          // Use custom subject if provided, otherwise use default
          let emailSubject = validatedData.emailSubject || `${referee.firstName} needs your help with introductions`

          // Apply variable substitution to subject line
          emailSubject = emailSubject
            .replace(/\{contactName\}/g, `${capitalize(contact.firstName)} ${contact.lastName}`)
            .replace(/\{contactFirstName\}/g, capitalize(contact.firstName))
            .replace(/\{contactLastName\}/g, contact.lastName)
            .replace(/\{firstName\}/g, referee.firstName)
            .replace(/\{refereeFirstName\}/g, referee.firstName)
            .replace(/\{refereeLastName\}/g, referee.lastName)
            .replace(/\{statementSummary\}/g, referee.statementSummary || '')
            .replace(/\{skills\}/g, referee.skills || '')
            .replace(/\{achievement\}/g, referee.achievement || '')
            .replace(/\{achievementMethod\}/g, referee.achievementMethod || '')
            .replace(/\{introRequest\}/g, referee.introRequest || '')
            .replace(/\{companyName\}/g, referee.companyName || '')

          emailResult = await sendEmail({
            to: contact.email,
            subject: emailSubject,
            html: emailHtml,
          })
          console.log(`[SendRequests] Email result for ${contact.email}:`, emailResult)
        }

        // Send SMS if requested and phone exists
        if (validatedData.sendViaSms && contact.phone) {
          // Helper to capitalize first letter
          const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

          // Use custom SMS message if provided, otherwise use default generator
          let smsMessage: string
          if (validatedData.customSmsMessage) {
            smsMessage = validatedData.customSmsMessage
              .replace(/\{contactName\}/g, `${capitalize(contact.firstName)} ${contact.lastName}`)
              .replace(/\{contactFirstName\}/g, capitalize(contact.firstName))
              .replace(/\{contactLastName\}/g, contact.lastName)
              .replace(/\{firstName\}/g, referee.firstName)
              .replace(/\{refereeFirstName\}/g, referee.firstName)
              .replace(/\{refereeLastName\}/g, referee.lastName)
              .replace(/\{link\}/g, link)
              .replace(/\{statementSummary\}/g, referee.statementSummary || '')
              .replace(/\{skills\}/g, referee.skills || '')
              .replace(/\{achievement\}/g, referee.achievement || '')
              .replace(/\{achievementMethod\}/g, referee.achievementMethod || '')
              .replace(/\{introRequest\}/g, referee.introRequest || '')
              .replace(/\{companyName\}/g, referee.companyName || '')
          } else {
            smsMessage = generateFirstDegreeRequestSMS({
              refereeFirstName: referee.firstName,
              refereeLastName: referee.lastName,
              contactFirstName: capitalize(contact.firstName),
              customMessage: referee.introRequest || referee.statementSummary || `I'd like to introduce you to ${referee.firstName} ${referee.lastName}.`,
              link,
            })
          }

          smsResult = await sendSMS({
            to: contact.phone,
            message: smsMessage,
          })
        }

        // Update contact with requestSentAt timestamp
        try {
          await prisma.contact.update({
            where: { id: contact.id },
            data: { requestSentAt: new Date() },
          })
        } catch (updateError) {
          console.error('Error updating contact requestSentAt:', updateError)
          throw updateError
        }

        // Create message record and notification
        if (contact.contactId) {
          await prisma.message.create({
            data: {
              senderId: validatedData.userId,
              receiverId: contact.contactId,
              messageType: 'FIRST_DEGREE_REQUEST',
              subject: validatedData.emailSubject || `${referee.firstName} needs your help with introductions`,
              body: validatedData.customMessage,
              sentViaEmail: validatedData.sendViaEmail && !!contact.email,
              sentViaSms: validatedData.sendViaSms && !!contact.phone,
              emailSentAt: emailResult?.success ? new Date() : null,
              smsSentAt: smsResult?.success ? new Date() : null,
            },
          })

          // Create in-app notification
          await notifyIntroHelpRequest(contact.contactId, {
            id: referee.id,
            firstName: referee.firstName,
            lastName: referee.lastName,
          })
        }

        return {
          contactId: contact.id,
          emailSent: emailResult?.success || false,
          smsSent: smsResult?.success || false,
        }
      })
    )

    console.log('[SendRequests] Final results:', JSON.stringify(results))
    return NextResponse.json({ success: true, results })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Send requests error:', errorMessage)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: errorMessage || 'Internal server error' },
      { status: 500 }
    )
  }
}
