import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, generateReferralRequestEmail } from '@/lib/services/email'
import { sendSMS, generateReferralRequestSMS } from '@/lib/services/sms'
import { generateMagicLink } from '@/lib/magicLink'
import { z } from 'zod'

const sendIntrosSchema = z.object({
  refereeId: z.string(),
  firstDegreeUserId: z.string(),
  referralIds: z.array(z.string()),
  sendViaEmail: z.boolean().default(true),
  sendViaSms: z.boolean().default(false),
  customEmailSubject: z.string().optional(),
  customEmailBody: z.string().optional(),
  customSmsBody: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = sendIntrosSchema.parse(body)

    // Get referee with all fields needed for the email
    const referee = await prisma.user.findUnique({
      where: { id: validatedData.refereeId },
    })

    if (!referee) {
      return NextResponse.json(
        { error: 'Referee not found' },
        { status: 404 }
      )
    }

    // Get first degree user
    const firstDegree = await prisma.user.findUnique({
      where: { id: validatedData.firstDegreeUserId },
    })

    if (!firstDegree) {
      return NextResponse.json(
        { error: 'First degree contact not found' },
        { status: 404 }
      )
    }

    // Get referral users
    const referrals = await prisma.user.findMany({
      where: {
        id: { in: validatedData.referralIds },
      },
    })

    if (referrals.length === 0) {
      return NextResponse.json({ error: 'No referrals found' }, { status: 404 })
    }

    // Send introductions and create referral records
    const results = await Promise.all(
      referrals.map(async (referral) => {
        // Generate magic link for authentication
        const redirectUrl = `/network/${firstDegree.id}?referralId=${referral.id}&refereeId=${referee.id}`
        const link = await generateMagicLink(referral.id, redirectUrl)

        let emailResult, smsResult

        // Send email if requested and email exists
        if (validatedData.sendViaEmail && referral.email) {
          // Helper to capitalize first letter
          const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

          // Use custom subject if provided, otherwise use default
          let emailSubject = validatedData.customEmailSubject ||
            `${firstDegree.firstName} wants to introduce you to ${referee.firstName}`

          // Apply variable substitution to subject line
          emailSubject = emailSubject
            .replace(/\{referralFirstName\}/g, capitalize(referral.firstName))
            .replace(/\{referralLastName\}/g, referral.lastName)
            .replace(/\{refereeFirstName\}/g, referee.firstName)
            .replace(/\{refereeLastName\}/g, referee.lastName)
            .replace(/\{firstDegreeFirstName\}/g, firstDegree.firstName)
            .replace(/\{firstDegreeLastName\}/g, firstDegree.lastName)

          // Use custom body if provided, otherwise use default template
          let emailHtml: string
          if (validatedData.customEmailBody) {
            // Apply variable substitution to custom body
            emailHtml = validatedData.customEmailBody
              .replace(/\{referralFirstName\}/g, capitalize(referral.firstName))
              .replace(/\{referralLastName\}/g, referral.lastName)
              .replace(/\{refereeFirstName\}/g, referee.firstName)
              .replace(/\{refereeLastName\}/g, referee.lastName)
              .replace(/\{firstDegreeFirstName\}/g, firstDegree.firstName)
              .replace(/\{firstDegreeLastName\}/g, firstDegree.lastName)
              .replace(/\{statementSummary\}/g, referee.statementSummary || '')
              .replace(/\{skills\}/g, referee.skills || '')
              .replace(/\{company\}/g, referee.companyName || '')
              .replace(/\{achievement\}/g, referee.achievement || '')
              .replace(/\{method\}/g, referee.achievementMethod || '')
              .replace(/\{introRequest\}/g, referee.introRequest || '')
              .replace(/\{link\}/g, link)
          } else {
            // Use default template with all referee fields
            emailHtml = generateReferralRequestEmail({
              refereeFirstName: referee.firstName,
              refereeLastName: referee.lastName,
              firstDegreeFirstName: firstDegree.firstName,
              firstDegreeLastName: firstDegree.lastName,
              referralFirstName: referral.firstName,
              statementSummary: referee.statementSummary || '',
              skills: referee.skills,
              company: referee.companyName,
              achievement: referee.achievement,
              method: referee.achievementMethod,
              introRequest: referee.introRequest,
              link,
            })
          }

          emailResult = await sendEmail({
            to: referral.email,
            subject: emailSubject,
            html: emailHtml,
          })
        }

        // Send SMS if requested and phone exists
        if (validatedData.sendViaSms && referral.phone) {
          // Helper to capitalize first letter
          const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

          // Use custom SMS body if provided, otherwise use default template
          let smsMessage: string
          if (validatedData.customSmsBody) {
            // Apply variable substitution to custom SMS body
            smsMessage = validatedData.customSmsBody
              .replace(/\{referralFirstName\}/g, capitalize(referral.firstName))
              .replace(/\{referralLastName\}/g, referral.lastName)
              .replace(/\{refereeFirstName\}/g, referee.firstName)
              .replace(/\{refereeLastName\}/g, referee.lastName)
              .replace(/\{firstDegreeFirstName\}/g, firstDegree.firstName)
              .replace(/\{firstDegreeLastName\}/g, firstDegree.lastName)
              .replace(/\{statementSummary\}/g, referee.statementSummary)
              .replace(/\{link\}/g, link)
          } else {
            // Use default template
            smsMessage = generateReferralRequestSMS({
              refereeFirstName: referee.firstName,
              firstDegreeFirstName: firstDegree.firstName,
              referralFirstName: referral.firstName,
              link,
            })
          }

          smsResult = await sendSMS({
            to: referral.phone,
            message: smsMessage,
          })
        }

        // Create referral record
        const referralRecord = await prisma.referral.create({
          data: {
            refereeId: referee.id,
            firstDegreeId: firstDegree.id,
            referralId: referral.id,
            status: 'PENDING',
          },
        })

        // Create message record
        await prisma.message.create({
          data: {
            senderId: firstDegree.id,
            receiverId: referral.id,
            messageType: 'REFERRAL_REQUEST',
            subject: `${firstDegree.firstName} wants to introduce you to ${referee.firstName}`,
            body: referee.statementSummary,
            sentViaEmail: validatedData.sendViaEmail && !!referral.email,
            sentViaSms: validatedData.sendViaSms && !!referral.phone,
            emailSentAt: emailResult?.success ? new Date() : null,
            smsSentAt: smsResult?.success ? new Date() : null,
          },
        })

        return {
          referralId: referral.id,
          referralRecordId: referralRecord.id,
          emailSent: emailResult?.success || false,
          smsSent: smsResult?.success || false,
        }
      })
    )

    return NextResponse.json({ success: true, results })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Send intros error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
