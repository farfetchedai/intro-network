import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/services/email'
import { generateMagicLink } from '@/lib/magicLink'
import { z } from 'zod'

const createAccountSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  refereeUsername: z.string(), // The referee they're making intros for
})

function generateMagicLinkEmail({
  firstName,
  link,
}: {
  firstName: string
  link: string
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Complete Your Registration</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Hi ${firstName},</h2>
          <p>Thank you for registering! Click the button below to complete your registration and continue making introductions.</p>
          <p>
            <a href="${link}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Complete Registration
            </a>
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This link will expire in 72 hours. If you didn't request this, please ignore this email.
          </p>
        </div>
      </body>
    </html>
  `
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = createAccountSchema.parse(body)

    // Check if user already exists by email
    let user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    // If user exists, just generate and send magic link
    if (user) {
      const redirectUrl = `/firstdegree/${validatedData.refereeUsername}`
      const link = await generateMagicLink(user.id, redirectUrl)

      const emailResult = await sendEmail({
        to: validatedData.email,
        subject: 'Complete Your Registration',
        html: generateMagicLinkEmail({
          firstName: user.firstName,
          link,
        }),
      })

      return NextResponse.json({
        success: true,
        userId: user.id,
        emailSent: emailResult?.success || false,
        message: 'Magic link sent to existing user',
      })
    }

    // Create new user with userType FIRST_DEGREE
    user = await prisma.user.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone || null,
        userType: 'FIRST_DEGREE',
      },
    })

    // Generate magic link
    const redirectUrl = `/firstdegree/${validatedData.refereeUsername}`
    const link = await generateMagicLink(user.id, redirectUrl)

    // Send magic link email
    const emailResult = await sendEmail({
      to: validatedData.email,
      subject: 'Complete Your Registration',
      html: generateMagicLinkEmail({
        firstName: user.firstName,
        link,
      }),
    })

    return NextResponse.json({
      success: true,
      userId: user.id,
      emailSent: emailResult?.success || false,
      message: 'Account created and magic link sent',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Create account error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
