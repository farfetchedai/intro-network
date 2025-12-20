import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/services/email'
import { z } from 'zod'

const respondSchema = z.object({
  referralId: z.string(),
  response: z.enum(['APPROVED', 'DENIED']),
  contactInfo: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }).optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = respondSchema.parse(body)

    // Find the referral
    const referral = await prisma.referral.findUnique({
      where: { id: validatedData.referralId },
      include: {
        referee: true,
        firstDegree: true,
        referral: true, // The second degree contact
      }
    })

    if (!referral) {
      return NextResponse.json(
        { success: false, error: 'Referral not found' },
        { status: 404 }
      )
    }

    // Update the referral status
    const updatedReferral = await prisma.referral.update({
      where: { id: validatedData.referralId },
      data: {
        status: validatedData.response,
        approvedAt: validatedData.response === 'APPROVED' ? new Date() : null,
        deniedAt: validatedData.response === 'DENIED' ? new Date() : null,
      }
    })

    // If contact info provided and user not fully set up, update their info
    if (validatedData.contactInfo && referral.referral) {
      const updateData: any = {}
      if (validatedData.contactInfo.firstName) updateData.firstName = validatedData.contactInfo.firstName
      if (validatedData.contactInfo.lastName) updateData.lastName = validatedData.contactInfo.lastName
      if (validatedData.contactInfo.email) updateData.email = validatedData.contactInfo.email
      if (validatedData.contactInfo.phone) updateData.phone = validatedData.contactInfo.phone

      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
          where: { id: referral.referral.id },
          data: updateData,
        })
      }
    }

    // Send notification email to referee if approved
    if (validatedData.response === 'APPROVED' && referral.referee.email) {
      const secondDegree = referral.referral
      const firstDegree = referral.firstDegree

      try {
        await sendEmail({
          to: referral.referee.email,
          subject: `${secondDegree.firstName} ${secondDegree.lastName} wants to connect with you!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a1a1a;">Great news! 🎉</h2>
              <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                <strong>${secondDegree.firstName} ${secondDegree.lastName}</strong> has accepted the introduction
                from <strong>${firstDegree.firstName} ${firstDegree.lastName}</strong> and would like to connect with you.
              </p>
              ${secondDegree.email ? `
                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                  You can reach them at: <a href="mailto:${secondDegree.email}" style="color: #3b82f6;">${secondDegree.email}</a>
                </p>
              ` : ''}
              ${secondDegree.phone ? `
                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                  Phone: ${secondDegree.phone}
                </p>
              ` : ''}
              <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Good luck with your new connection!
              </p>
            </div>
          `,
        })
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError)
        // Don't fail the request if email fails
      }
    }

    // Also notify the first degree contact
    if (referral.firstDegree.email) {
      const secondDegree = referral.referral
      const statusText = validatedData.response === 'APPROVED' ? 'accepted' : 'declined'

      try {
        await sendEmail({
          to: referral.firstDegree.email,
          subject: `${secondDegree.firstName} has ${statusText} your introduction to ${referral.referee.firstName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a1a1a;">Introduction Update</h2>
              <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                <strong>${secondDegree.firstName} ${secondDegree.lastName}</strong> has <strong>${statusText}</strong>
                your introduction to <strong>${referral.referee.firstName} ${referral.referee.lastName}</strong>.
              </p>
              ${validatedData.response === 'APPROVED' ? `
                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                  They'll be connecting directly. Thanks for making the introduction!
                </p>
              ` : `
                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                  No worries - not every introduction works out. Thanks for trying!
                </p>
              `}
            </div>
          `,
        })
      } catch (emailError) {
        console.error('Failed to send first degree notification:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      status: updatedReferral.status,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Respond to referral error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
