import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const contactSchema = z.object({
  id: z.string().optional(), // Allow id field from fetched contacts
  userId: z.string().optional(), // Allow userId from fetched contacts
  contactId: z.string().nullable().optional(), // Allow contactId from fetched contacts
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  phone: z.string().min(10).optional().or(z.literal('')).nullable(),
  company: z.string().optional().or(z.literal('')).nullable(),
  degreeType: z.string().optional(), // Allow degreeType from fetched contacts
  createdAt: z.date().or(z.string()).optional(), // Allow timestamp from fetched contacts
  updatedAt: z.date().or(z.string()).optional(), // Allow timestamp from fetched contacts
}).passthrough() // Allow additional fields without validation

const addContactsSchema = z.object({
  userId: z.string(),
  contacts: z.array(contactSchema),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = addContactsSchema.parse(body)

    // Filter out contacts that already have IDs (already in database)
    const newContacts = validatedData.contacts.filter(contact => !contact.id)

    // Only create new contacts if there are any
    if (newContacts.length > 0) {
      // Get existing contacts for this user to check for duplicates
      const existingContacts = await prisma.contact.findMany({
        where: { userId: validatedData.userId },
        select: { email: true },
      })
      const existingEmails = new Set(
        existingContacts
          .filter(c => c.email)
          .map(c => c.email!.toLowerCase())
      )

      // Filter out contacts that already exist by email
      const uniqueNewContacts = newContacts.filter(contact => {
        if (!contact.email) return true // Allow contacts without email
        return !existingEmails.has(contact.email.toLowerCase())
      })

      // Create only unique new contacts
      if (uniqueNewContacts.length > 0) {
        await prisma.$transaction(
          uniqueNewContacts.map((contact) =>
            prisma.contact.create({
              data: {
                userId: validatedData.userId,
                firstName: contact.firstName,
                lastName: contact.lastName,
                email: contact.email || undefined,
                phone: contact.phone || undefined,
                company: contact.company || undefined,
                degreeType: 'FIRST_DEGREE',
              },
            })
          )
        )
      }
    }

    // Fetch all contacts for this user to return (with linkedUser data)
    const allContacts = await prisma.contact.findMany({
      where: { userId: validatedData.userId },
      include: {
        contact: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            skills: true,
            companyName: true,
            achievement: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get all unique emails to check for matching users
    const contactEmails = allContacts
      .filter(c => c.email && !c.contactId)
      .map(c => c.email!.toLowerCase())

    // Find users that match contact emails
    const matchingUsers = contactEmails.length > 0 ? await prisma.user.findMany({
      where: { email: { in: contactEmails, mode: 'insensitive' } },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        skills: true,
        companyName: true,
        achievement: true,
      },
    }) : []

    // Create a map of email to user for quick lookup
    const usersByEmail: Record<string, typeof matchingUsers[0]> = {}
    for (const user of matchingUsers) {
      if (user.email) {
        usersByEmail[user.email.toLowerCase()] = user
      }
    }

    // Transform contacts to include linked user info
    const transformedContacts = allContacts.map((c) => {
      // First check if there's a direct contactId link
      let linkedUser = c.contact ? {
        id: c.contact.id,
        username: c.contact.username,
        firstName: c.contact.firstName,
        lastName: c.contact.lastName,
        profilePicture: c.contact.profilePicture,
        hasCompletedOnboarding: !!(c.contact.skills || c.contact.companyName || c.contact.achievement),
      } : null

      // If no direct link, try to match by email
      if (!linkedUser && c.email) {
        const matchedUser = usersByEmail[c.email.toLowerCase()]
        if (matchedUser) {
          linkedUser = {
            id: matchedUser.id,
            username: matchedUser.username,
            firstName: matchedUser.firstName,
            lastName: matchedUser.lastName,
            profilePicture: matchedUser.profilePicture,
            hasCompletedOnboarding: !!(matchedUser.skills || matchedUser.companyName || matchedUser.achievement),
          }
        }
      }

      return {
        ...c,
        linkedUser,
        contact: undefined,
      }
    })

    return NextResponse.json({ success: true, contacts: transformedContacts })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Add contacts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const contacts = await prisma.contact.findMany({
      where: {
        userId,
      },
      include: {
        contact: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            skills: true,
            companyName: true,
            achievement: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get all contact emails to find matching users
    const contactEmails = contacts
      .filter(c => c.email && !c.contactId)
      .map(c => c.email!.toLowerCase())

    // Find users by email for contacts that don't have a contactId linked
    const usersByEmail: Record<string, any> = {}
    if (contactEmails.length > 0) {
      const matchingUsers = await prisma.user.findMany({
        where: {
          email: {
            in: contactEmails,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          skills: true,
          companyName: true,
          achievement: true,
        },
      })

      // Index by lowercase email
      matchingUsers.forEach(user => {
        if (user.email) {
          usersByEmail[user.email.toLowerCase()] = user
        }
      })
    }

    // Transform contacts to include linked user info
    const transformedContacts = contacts.map((c) => {
      // First check if there's a direct contactId link
      let linkedUser = c.contact ? {
        id: c.contact.id,
        username: c.contact.username,
        firstName: c.contact.firstName,
        lastName: c.contact.lastName,
        profilePicture: c.contact.profilePicture,
        hasCompletedOnboarding: !!(c.contact.skills || c.contact.companyName || c.contact.achievement),
      } : null

      // If no direct link, try to match by email
      if (!linkedUser && c.email) {
        const matchedUser = usersByEmail[c.email.toLowerCase()]
        if (matchedUser) {
          linkedUser = {
            id: matchedUser.id,
            username: matchedUser.username,
            firstName: matchedUser.firstName,
            lastName: matchedUser.lastName,
            profilePicture: matchedUser.profilePicture,
            hasCompletedOnboarding: !!(matchedUser.skills || matchedUser.companyName || matchedUser.achievement),
          }
        }
      }

      return {
        ...c,
        linkedUser,
        contact: undefined, // Remove the raw contact relation from response
      }
    })

    return NextResponse.json({ contacts: transformedContacts })
  } catch (error) {
    console.error('Get contacts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
