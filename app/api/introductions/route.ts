import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { sendIntroductionEmail } from '@/lib/services/email'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get introductions made by this user
    const introductionsMade = await prisma.pendingIntroduction.findMany({
      where: { introducerId: userId },
      include: {
        personAUser: {
          select: { id: true, firstName: true, lastName: true, username: true, profilePicture: true, companyName: true }
        },
        personBUser: {
          select: { id: true, firstName: true, lastName: true, username: true, profilePicture: true, companyName: true }
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get introductions where this user is Person A
    const introductionsAsA = await prisma.pendingIntroduction.findMany({
      where: { personAUserId: userId },
      include: {
        introducer: {
          select: { id: true, firstName: true, lastName: true, username: true, profilePicture: true }
        },
        personBUser: {
          select: { id: true, firstName: true, lastName: true, username: true, profilePicture: true, companyName: true }
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get introductions where this user is Person B
    const introductionsAsB = await prisma.pendingIntroduction.findMany({
      where: { personBUserId: userId },
      include: {
        introducer: {
          select: { id: true, firstName: true, lastName: true, username: true, profilePicture: true }
        },
        personAUser: {
          select: { id: true, firstName: true, lastName: true, username: true, profilePicture: true, companyName: true }
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Also check for introductions by email (for when user just signed up)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pendingByEmail: any[] = []
    if (user?.email) {
      // Find introductions where this user's email matches but userId not yet set
      const asAByEmail = await prisma.pendingIntroduction.findMany({
        where: {
          personAEmail: user.email,
          personAUserId: null,
        },
        include: {
          introducer: {
            select: { id: true, firstName: true, lastName: true, username: true, profilePicture: true }
          },
          personBUser: {
            select: { id: true, firstName: true, lastName: true, username: true, profilePicture: true, companyName: true }
          },
        },
      })

      const asBByEmail = await prisma.pendingIntroduction.findMany({
        where: {
          personBEmail: user.email,
          personBUserId: null,
        },
        include: {
          introducer: {
            select: { id: true, firstName: true, lastName: true, username: true, profilePicture: true }
          },
          personAUser: {
            select: { id: true, firstName: true, lastName: true, username: true, profilePicture: true, companyName: true }
          },
        },
      })

      // Update these introductions to link the user
      for (const intro of asAByEmail) {
        await prisma.pendingIntroduction.update({
          where: { id: intro.id },
          data: { personAUserId: userId }
        })
      }
      for (const intro of asBByEmail) {
        await prisma.pendingIntroduction.update({
          where: { id: intro.id },
          data: { personBUserId: userId }
        })
      }

      pendingByEmail = [...asAByEmail, ...asBByEmail]
    }

    return NextResponse.json({
      success: true,
      introductionsMade,
      introductionsReceived: [...introductionsAsA, ...introductionsAsB, ...pendingByEmail],
    })
  } catch (error) {
    console.error('[introductions] GET Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await req.json()
    const {
      personAEmail,
      personAName,
      personACompany,
      personAContext,
      personBEmail,
      personBName,
      personBCompany,
      personBContext,
      message,
    } = body

    // Validate required fields
    if (!personAEmail || !personAName || !personBEmail || !personBName || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get introducer info
    const introducer = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true, email: true, username: true }
    })

    if (!introducer) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if Person A has an account
    const personAUser = await prisma.user.findFirst({
      where: { email: personAEmail },
      select: { id: true, firstName: true, lastName: true, username: true }
    })

    // Check if Person B has an account
    const personBUser = await prisma.user.findFirst({
      where: { email: personBEmail },
      select: { id: true, firstName: true, lastName: true, username: true }
    })

    // Create the introduction
    const introduction = await prisma.pendingIntroduction.create({
      data: {
        introducerId: userId,
        personAEmail,
        personAName,
        personACompany,
        personAContext,
        personAUserId: personAUser?.id || null,
        personBEmail,
        personBName,
        personBCompany,
        personBContext,
        personBUserId: personBUser?.id || null,
        message,
      },
    })

    // Send emails to both parties
    const introducerName = `${introducer.firstName} ${introducer.lastName}`

    try {
      // Email to Person A
      await sendIntroductionEmail({
        to: personAEmail,
        recipientName: personAName,
        introducerName,
        otherPersonName: personBName,
        otherPersonCompany: personBCompany,
        otherPersonContext: personBContext,
        message,
        introductionId: introduction.id,
        isExistingUser: !!personAUser,
      })

      await prisma.pendingIntroduction.update({
        where: { id: introduction.id },
        data: { personAEmailSent: true }
      })
    } catch (emailError) {
      console.error('Failed to send email to Person A:', emailError)
    }

    try {
      // Email to Person B
      await sendIntroductionEmail({
        to: personBEmail,
        recipientName: personBName,
        introducerName,
        otherPersonName: personAName,
        otherPersonCompany: personACompany,
        otherPersonContext: personAContext,
        message,
        introductionId: introduction.id,
        isExistingUser: !!personBUser,
      })

      await prisma.pendingIntroduction.update({
        where: { id: introduction.id },
        data: { personBEmailSent: true }
      })
    } catch (emailError) {
      console.error('Failed to send email to Person B:', emailError)
    }

    // Re-fetch user IDs since sendIntroductionEmail may have created new accounts
    const personAUserAfter = await prisma.user.findFirst({
      where: { email: personAEmail },
      select: { id: true }
    })
    const personBUserAfter = await prisma.user.findFirst({
      where: { email: personBEmail },
      select: { id: true }
    })

    // Update introduction with user IDs if they were just created
    if (personAUserAfter?.id || personBUserAfter?.id) {
      await prisma.pendingIntroduction.update({
        where: { id: introduction.id },
        data: {
          personAUserId: personAUserAfter?.id || introduction.personAUserId,
          personBUserId: personBUserAfter?.id || introduction.personBUserId,
        }
      })
    }

    // Add introduced people to introducer's contacts (if not already contacts)
    const personANameParts = personAName.split(' ')
    const personAFirstName = personANameParts[0] || ''
    const personALastName = personANameParts.slice(1).join(' ') || ''

    const personBNameParts = personBName.split(' ')
    const personBFirstName = personBNameParts[0] || ''
    const personBLastName = personBNameParts.slice(1).join(' ') || ''

    // Check and create contact for Person A
    const existingContactA = await prisma.contact.findFirst({
      where: {
        userId: userId,
        email: personAEmail,
      }
    })

    if (!existingContactA) {
      await prisma.contact.create({
        data: {
          userId: userId,
          contactId: personAUserAfter?.id || null,
          firstName: personAFirstName,
          lastName: personALastName,
          email: personAEmail,
          company: personACompany || null,
          degreeType: 'FIRST_DEGREE',
        }
      })
    } else if (!existingContactA.contactId && personAUserAfter?.id) {
      // Update existing contact with the user ID if it was just created
      await prisma.contact.update({
        where: { id: existingContactA.id },
        data: { contactId: personAUserAfter.id }
      })
    }

    // Check and create contact for Person B
    const existingContactB = await prisma.contact.findFirst({
      where: {
        userId: userId,
        email: personBEmail,
      }
    })

    if (!existingContactB) {
      await prisma.contact.create({
        data: {
          userId: userId,
          contactId: personBUserAfter?.id || null,
          firstName: personBFirstName,
          lastName: personBLastName,
          email: personBEmail,
          company: personBCompany || null,
          degreeType: 'FIRST_DEGREE',
        }
      })
    } else if (!existingContactB.contactId && personBUserAfter?.id) {
      // Update existing contact with the user ID if it was just created
      await prisma.contact.update({
        where: { id: existingContactB.id },
        data: { contactId: personBUserAfter.id }
      })
    }

    // Add introducer as a contact for Person A (if they have an account)
    if (personAUserAfter?.id) {
      const existingIntroducerContactForA = await prisma.contact.findFirst({
        where: {
          userId: personAUserAfter.id,
          email: introducer.email,
        }
      })

      if (!existingIntroducerContactForA) {
        await prisma.contact.create({
          data: {
            userId: personAUserAfter.id,
            contactId: userId,
            firstName: introducer.firstName || '',
            lastName: introducer.lastName || '',
            email: introducer.email,
            degreeType: 'FIRST_DEGREE',
          }
        })
      } else if (!existingIntroducerContactForA.contactId) {
        await prisma.contact.update({
          where: { id: existingIntroducerContactForA.id },
          data: { contactId: userId }
        })
      }
    }

    // Add introducer as a contact for Person B (if they have an account)
    if (personBUserAfter?.id) {
      const existingIntroducerContactForB = await prisma.contact.findFirst({
        where: {
          userId: personBUserAfter.id,
          email: introducer.email,
        }
      })

      if (!existingIntroducerContactForB) {
        await prisma.contact.create({
          data: {
            userId: personBUserAfter.id,
            contactId: userId,
            firstName: introducer.firstName || '',
            lastName: introducer.lastName || '',
            email: introducer.email,
            degreeType: 'FIRST_DEGREE',
          }
        })
      } else if (!existingIntroducerContactForB.contactId) {
        await prisma.contact.update({
          where: { id: existingIntroducerContactForB.id },
          data: { contactId: userId }
        })
      }
    }

    // Create notifications for users (including newly created ones)
    if (personAUserAfter) {
      await prisma.notification.create({
        data: {
          userId: personAUserAfter.id,
          type: 'INTRODUCTION',
          title: 'New Introduction',
          message: `${introducerName} wants to introduce you to ${personBName}`,
          link: '/introductions',
          fromUserId: userId,
        }
      })
    }

    if (personBUserAfter) {
      await prisma.notification.create({
        data: {
          userId: personBUserAfter.id,
          type: 'INTRODUCTION',
          title: 'New Introduction',
          message: `${introducerName} wants to introduce you to ${personAName}`,
          link: '/introductions',
          fromUserId: userId,
        }
      })
    }

    return NextResponse.json({
      success: true,
      introduction,
      personAHasAccount: !!personAUser,
      personBHasAccount: !!personBUser,
    })
  } catch (error) {
    console.error('[introductions] POST Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
