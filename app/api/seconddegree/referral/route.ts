import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const refereeUsername = searchParams.get('refereeUsername')
    const referralId = searchParams.get('referralId')
    const userId = searchParams.get('userId')

    if (!refereeUsername) {
      return NextResponse.json(
        { success: false, error: 'Referee username is required' },
        { status: 400 }
      )
    }

    // Find the referee by username
    const referee = await prisma.user.findFirst({
      where: {
        OR: [
          { username: refereeUsername },
          { id: refereeUsername }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        phone: true,
        profilePicture: true,
        skills: true,
        companyName: true,
        achievement: true,
        achievementMethod: true,
        statementSummary: true,
        statementSummary3rdPerson: true,
        introRequest: true,
        linkedinUrl: true,
        twitterUrl: true,
        websiteUrl: true,
      }
    })

    if (!referee) {
      return NextResponse.json(
        { success: false, error: 'Referee not found' },
        { status: 404 }
      )
    }

    // Build query for finding the referral
    let referralQuery: any = {
      refereeId: referee.id,
      status: 'PENDING', // Default to pending referrals
    }

    // If specific referral ID provided, use it (can be any status)
    if (referralId) {
      referralQuery = {
        id: referralId,
        refereeId: referee.id, // Ensure it matches the referee
      }
    }
    // If user is authenticated, find their referral with this referee (any status)
    else if (userId) {
      referralQuery = {
        refereeId: referee.id,
        referralId: userId,
      }
    }

    // Find the referral
    const referral = await prisma.referral.findFirst({
      where: referralQuery,
      include: {
        firstDegree: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!referral) {
      return NextResponse.json(
        { success: false, error: 'No pending introduction found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      referral: {
        id: referral.id,
        status: referral.status,
        referee: referee,
        firstDegree: referral.firstDegree,
      }
    })
  } catch (error) {
    console.error('Get referral error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
