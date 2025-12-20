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
    let contacts = []
    if (newContacts.length > 0) {
      contacts = await prisma.$transaction(
        newContacts.map((contact) =>
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

    // Fetch all contacts for this user to return
    const allContacts = await prisma.contact.findMany({
      where: { userId: validatedData.userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, contacts: allContacts })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
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

    // Transform contacts to include linked user info
    const transformedContacts = contacts.map((c) => ({
      ...c,
      linkedUser: c.contact ? {
        id: c.contact.id,
        username: c.contact.username,
        firstName: c.contact.firstName,
        lastName: c.contact.lastName,
        profilePicture: c.contact.profilePicture,
        hasCompletedOnboarding: !!(c.contact.skills || c.contact.companyName || c.contact.achievement),
      } : null,
      contact: undefined, // Remove the raw contact relation from response
    }))

    return NextResponse.json({ contacts: transformedContacts })
  } catch (error) {
    console.error('Get contacts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
