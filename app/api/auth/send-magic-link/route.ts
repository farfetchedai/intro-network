import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { email, redirectUrl, createIfNotExists } = await req.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    let user = await prisma.user.findUnique({
      where: { email },
    })

    // If user doesn't exist and createIfNotExists is true, create a new account
    if (!user && createIfNotExists) {
      user = await prisma.user.create({
        data: {
          email,
          firstName: '',
          lastName: '',
          userType: 'REFEREE',
        },
      })
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email' },
        { status: 404 }
      )
    }

    // Generate magic link token (secure random string)
    const token = crypto.randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Save token and optional redirect URL to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        magicLinkToken: token,
        magicLinkExpiry: expiry,
        magicLinkRedirect: redirectUrl || null,
      },
    })

    // Include redirect URL in magic link if provided
    let magicLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify?token=${token}`
    if (redirectUrl) {
      magicLink += `&redirect=${encodeURIComponent(redirectUrl)}`
    }

    // Send email using unified email utility
    try {
      await sendEmail({
        to: email,
        subject: 'Your login link',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Sign in to your account</h2>
            <p>Click the button below to sign in to your account. This link will expire in 15 minutes.</p>
            <a href="${magicLink}" style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Sign In
            </a>
            <p style="color: #666; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
            <p style="color: #666; font-size: 12px;">This link will expire at ${expiry.toLocaleString()}</p>
          </div>
        `,
      })

      return NextResponse.json({
        success: true,
        message: 'Magic link sent to your email',
      })
    } catch (emailError) {
      // For development: log the magic link if email fails
      console.log('Magic link (email failed):', magicLink)

      return NextResponse.json({
        success: true,
        message: 'Magic link generated (email not configured)',
        devLink: magicLink,
      })
    }
  } catch (error) {
    console.error('Failed to send magic link:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send magic link' },
      { status: 500 }
    )
  }
}
