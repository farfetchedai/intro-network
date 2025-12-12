import crypto from 'crypto'
import { prisma } from './prisma'

export interface MagicLinkData {
  userId: string
  redirectUrl: string
  expiresAt: Date
}

/**
 * Generate a secure magic link token and store it in the database
 */
export async function generateMagicLink(
  userId: string,
  redirectUrl: string,
  expiresInHours: number = 72
): Promise<string> {
  // Generate a secure random token
  const token = crypto.randomBytes(32).toString('hex')

  // Calculate expiration time
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + expiresInHours)

  // Store the token in the database
  await prisma.magicLink.create({
    data: {
      token,
      userId,
      redirectUrl,
      expiresAt,
      used: false,
    },
  })

  // Return the full magic link URL
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  return `${baseUrl}/api/auth/magic?token=${token}`
}

/**
 * Validate and consume a magic link token
 */
export async function validateMagicLink(token: string): Promise<MagicLinkData | null> {
  try {
    // Find the magic link
    const magicLink = await prisma.magicLink.findUnique({
      where: { token },
    })

    if (!magicLink) {
      return null
    }

    // Check if already used
    if (magicLink.used) {
      return null
    }

    // Check if expired
    if (new Date() > magicLink.expiresAt) {
      return null
    }

    // Mark as used
    await prisma.magicLink.update({
      where: { token },
      data: { used: true, usedAt: new Date() },
    })

    return {
      userId: magicLink.userId,
      redirectUrl: magicLink.redirectUrl,
      expiresAt: magicLink.expiresAt,
    }
  } catch (error) {
    console.error('Error validating magic link:', error)
    return null
  }
}
