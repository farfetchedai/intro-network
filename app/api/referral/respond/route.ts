import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import {
  sendEmail,
  generateApprovalNotificationToReferee,
  generateApprovalNotificationToFirstDegree,
  generateApprovalNotificationToReferral,
} from '@/lib/services/email'

const respondSchema = z.object({
  referralId: z.string(),
  response: z.enum(['APPROVED', 'DENIED']),
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
        referral: true,
      },
    })

    if (!referral) {
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      )
    }

    if (referral.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Referral already responded to' },
        { status: 400 }
      )
    }

    // Update referral status
    const updatedReferral = await prisma.referral.update({
      where: { id: validatedData.referralId },
      data: {
        status: validatedData.response,
        approvedAt:
          validatedData.response === 'APPROVED' ? new Date() : null,
        deniedAt: validatedData.response === 'DENIED' ? new Date() : null,
      },
    })

    // Send notification emails if approved
    if (validatedData.response === 'APPROVED') {
      try {
        // Send email to Referee (the person who initiated the intro request)
        if (referral.referee.email) {
          const refereeEmailHtml = generateApprovalNotificationToReferee({
            refereeFirstName: referral.referee.firstName,
            referralFirstName: referral.referral.firstName,
            referralLastName: referral.referral.lastName,
            referralEmail: referral.referral.email,
            referralPhone: referral.referral.phone,
          })

          await sendEmail({
            to: referral.referee.email,
            subject: 'Successful Intro! 🎉',
            html: refereeEmailHtml,
          })
        }

        // Send email to First Degree contact (the intermediary)
        if (referral.firstDegree.email) {
          const firstDegreeEmailHtml = generateApprovalNotificationToFirstDegree({
            firstDegreeFirstName: referral.firstDegree.firstName,
            refereeFirstName: referral.referee.firstName,
            refereeLastName: referral.referee.lastName,
            referralFirstName: referral.referral.firstName,
            referralLastName: referral.referral.lastName,
          })

          await sendEmail({
            to: referral.firstDegree.email,
            subject: 'Successful Intro! 🎉',
            html: firstDegreeEmailHtml,
          })
        }

        // Send email to Referral (the person who approved the intro)
        if (referral.referral.email) {
          const referralEmailHtml = generateApprovalNotificationToReferral({
            referralFirstName: referral.referral.firstName,
            refereeFirstName: referral.referee.firstName,
            refereeLastName: referral.referee.lastName,
            refereeEmail: referral.referee.email,
            refereePhone: referral.referee.phone,
          })

          await sendEmail({
            to: referral.referral.email,
            subject: 'Introduction Accepted! 🎉',
            html: referralEmailHtml,
          })
        }
      } catch (emailError) {
        console.error('Error sending approval notification emails:', emailError)
        // Don't fail the request if email sending fails
      }
    }

    return NextResponse.json({
      success: true,
      referral: updatedReferral,
      message: `Introduction ${validatedData.response.toLowerCase()}`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Respond to referral error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const referralId = searchParams.get('referralId')
    const refereeId = searchParams.get('refereeId')
    const firstDegreeId = searchParams.get('firstDegreeId')

    if (!referralId || !refereeId || !firstDegreeId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Find the referral record
    const referral = await prisma.referral.findFirst({
      where: {
        refereeId,
        firstDegreeId,
        referralId,
      },
      include: {
        referee: true,
        firstDegree: true,
        referral: true,
      },
    })

    if (!referral) {
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ referral })
  } catch (error) {
    console.error('Get referral error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
