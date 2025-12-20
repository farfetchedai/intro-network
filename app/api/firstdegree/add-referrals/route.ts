import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const referralSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  company: z.string().optional().or(z.literal('')),
}).refine(
  (data) => data.email || data.phone,
  {
    message: 'Either email or phone is required',
    path: ['email'],
  }
)

const addReferralsSchema = z.object({
  refereeId: z.string(),
  firstDegreeEmail: z.string().email().optional(),
  firstDegreePhone: z.string().optional(),
  referrals: z.array(referralSchema),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = addReferralsSchema.parse(body)

    // Find or create first degree user
    let firstDegreeUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.firstDegreeEmail || undefined },
          { phone: validatedData.firstDegreePhone || undefined },
        ],
      },
    })

    if (!firstDegreeUser && validatedData.referrals.length > 0) {
      // Create a temporary user for the first degree contact
      firstDegreeUser = await prisma.user.create({
        data: {
          firstName: validatedData.referrals[0].firstName, // Temporary, should be collected
          lastName: validatedData.referrals[0].lastName,
          email: validatedData.firstDegreeEmail || undefined,
          phone: validatedData.firstDegreePhone || undefined,
          userType: 'FIRST_DEGREE',
        },
      })
    }

    if (!firstDegreeUser) {
      return NextResponse.json(
        { error: 'Could not create user' },
        { status: 400 }
      )
    }

    // Create or find referral users and add them as contacts
    const createdReferrals = await Promise.all(
      validatedData.referrals.map(async (referral) => {
        // Find or create referral user
        let referralUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email: referral.email || undefined },
              { phone: referral.phone || undefined },
            ],
          },
        })

        if (!referralUser) {
          referralUser = await prisma.user.create({
            data: {
              firstName: referral.firstName,
              lastName: referral.lastName,
              email: referral.email || undefined,
              phone: referral.phone || undefined,
              userType: 'REFERRAL',
            },
          })
        }

        // Add as contact to first degree user
        const contact = await prisma.contact.create({
          data: {
            userId: firstDegreeUser.id,
            contactId: referralUser.id,
            firstName: referral.firstName,
            lastName: referral.lastName,
            email: referral.email || undefined,
            phone: referral.phone || undefined,
            company: referral.company || undefined,
            degreeType: 'SECOND_DEGREE',
          },
        })

        return {
          referralUser,
          contact,
        }
      })
    )

    return NextResponse.json({
      success: true,
      firstDegreeUserId: firstDegreeUser.id,
      referrals: createdReferrals,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format validation errors into user-friendly messages
      const errorMessages = error.issues.map((err) => {
        const path = err.path
        const contactIndex = path[1] !== undefined ? Number(path[1]) + 1 : null
        const field = path[2] as string

        // Create user-friendly error messages
        if (field === 'email' && err.message === 'Either email or phone is required') {
          return contactIndex
            ? `Contact ${contactIndex}: Please enter their email or phone number`
            : 'Please enter an email or phone number'
        } else if (field === 'email') {
          return contactIndex
            ? `Contact ${contactIndex}: Please enter a valid email address`
            : 'Please enter a valid email address'
        } else if (field === 'firstName') {
          return contactIndex
            ? `Contact ${contactIndex}: Please enter their first name`
            : 'Please enter the first name'
        } else if (field === 'lastName') {
          return contactIndex
            ? `Contact ${contactIndex}: Please enter their last name`
            : 'Please enter the last name'
        } else {
          return err.message
        }
      })

      return NextResponse.json(
        {
          error: 'Please fix the following:',
          details: error.issues,
          messages: errorMessages
        },
        { status: 400 }
      )
    }

    console.error('Add referrals error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
