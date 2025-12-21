import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'
import { sendEmail } from '@/lib/email'

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores').optional(),
  profilePicture: z.string().optional(),
  statementSummary: z.string().optional(),
  skills: z.array(z.string()).optional(),
  companyName: z.string().optional(),
  achievement: z.string().optional(),
  achievementMethod: z.string().optional(),
  introRequest: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  userId: z.string().optional(), // userId if user is already logged in
})

async function sendMagicLink(userId: string, email: string, firstName: string) {
  try {
    // Generate magic link token
    const token = crypto.randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Save token to database
    await prisma.user.update({
      where: { id: userId },
      data: {
        magicLinkToken: token,
        magicLinkExpiry: expiry,
      },
    })

    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify?token=${token}`

    // Send email using unified email utility
    try {
      await sendEmail({
        to: email,
        subject: 'Welcome! Here\'s your login link',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome ${firstName}!</h2>
            <p>Thank you for completing Step 1. Click the button below to access your account anytime.</p>
            <a href="${magicLink}" style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Access My Account
            </a>
            <p style="color: #666; font-size: 14px;">This link will expire in 15 minutes.</p>
            <p style="color: #666; font-size: 14px;">Save this email to easily log back in later, or request a new link at any time from the login page.</p>
          </div>
        `,
      })
      // For development: always log and return the magic link
      console.log(`✨ Magic link for ${email}:`, magicLink)
      return { success: true, devLink: magicLink }
    } catch (emailError) {
      // For development: log the magic link if email fails
      console.log(`✨ Magic link for ${email}:`, magicLink)
      return { success: true, devLink: magicLink }
    }
  } catch (error) {
    console.error('Failed to send magic link:', error)
    return { success: false, error }
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = registerSchema.parse(body)

    // Convert empty strings to null for unique fields
    const email = validatedData.email?.trim() || null
    const phone = validatedData.phone?.trim() || null
    const username = validatedData.username?.trim() || null
    const profilePicture = validatedData.profilePicture?.trim() || null
    const statementSummary = validatedData.statementSummary?.trim() || null

    // Check if user already exists - prefer userId if provided (user is logged in)
    let existingUser = null
    if (validatedData.userId) {
      existingUser = await prisma.user.findUnique({
        where: { id: validatedData.userId },
      })
    }

    // If no userId or user not found, try email/phone lookup
    if (!existingUser) {
      existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            email ? { email } : { id: 'never-match' },
            phone ? { phone } : { id: 'never-match' },
          ],
        },
      })
    }

    if (existingUser) {
      // User exists - update their information
      // Only update fields that are explicitly provided (not undefined)
      const updateData: any = {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
      }

      // Only update optional fields if they are explicitly provided
      if (profilePicture !== null) {
        updateData.profilePicture = profilePicture
      }
      if (statementSummary !== undefined) {
        updateData.statementSummary = statementSummary
      }
      if (validatedData.skills !== undefined) {
        updateData.skills = validatedData.skills ? JSON.stringify(validatedData.skills) : null
      }
      if (validatedData.companyName !== undefined) {
        updateData.companyName = validatedData.companyName
      }
      if (validatedData.achievement !== undefined) {
        updateData.achievement = validatedData.achievement
      }
      if (validatedData.achievementMethod !== undefined) {
        updateData.achievementMethod = validatedData.achievementMethod
      }
      if (validatedData.introRequest !== undefined) {
        updateData.introRequest = validatedData.introRequest
      }

      // Only update email if it's different from current and not null
      if (email !== null && email !== existingUser.email) {
        updateData.email = email
      }

      // Only update phone if it's different from current and not null
      if (phone !== null && phone !== existingUser.phone) {
        updateData.phone = phone
      }

      // Only update username if it's different from current and not null
      if (username !== null && username !== existingUser.username) {
        updateData.username = username
      }

      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: updateData,
      })

      // Send magic link if user has email and is not already logged in
      let magicLinkResult
      if (existingUser.email && !validatedData.userId) {
        magicLinkResult = await sendMagicLink(existingUser.id, existingUser.email, existingUser.firstName)
      }

      return NextResponse.json({
        success: true,
        user: {
          id: existingUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: existingUser.email,
          phone: existingUser.phone,
        },
        magicLinkSent: !!magicLinkResult?.success,
        devLink: magicLinkResult?.devLink,
      })
    }

    // Hash password if provided
    let hashedPassword
    if (validatedData.password) {
      hashedPassword = await hash(validatedData.password, 12)
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email,
        phone,
        username,
        profilePicture,
        statementSummary,
        skills: validatedData.skills ? JSON.stringify(validatedData.skills) : null,
        companyName: validatedData.companyName,
        achievement: validatedData.achievement,
        achievementMethod: validatedData.achievementMethod,
        introRequest: validatedData.introRequest,
        password: hashedPassword,
        userType: 'REFEREE',
      },
    })

    // Send magic link if email is provided
    let magicLinkResult
    if (user.email) {
      magicLinkResult = await sendMagicLink(user.id, user.email, user.firstName)
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },
      magicLinkSent: !!magicLinkResult?.success,
      devLink: magicLinkResult?.devLink,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('Zod validation error:', error)
      console.log('error.issues:', error.issues)
      console.log('error.issues:', error.issues)
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    // Handle Prisma unique constraint errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      const meta = ('meta' in error ? error.meta : null) as { target?: string[] } | null
      const field = meta?.target?.[0] || 'field'
      return NextResponse.json(
        { error: `A user with this ${field} already exists. Please use a different ${field} or log in.` },
        { status: 409 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
