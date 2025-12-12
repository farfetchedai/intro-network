import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Fetch referrals where the user is involved in any role
    const [
      initiatedReferrals,
      receivedReferrals,
      firstDegreeReferrals,
    ] = await Promise.all([
      // Referrals initiated by the user (as referee)
      prisma.referral.findMany({
        where: { refereeId: userId },
        include: {
          referee: true,
          firstDegree: true,
          referral: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      // Referrals received by the user (as the second degree target)
      prisma.referral.findMany({
        where: { referralId: userId },
        include: {
          referee: true,
          firstDegree: true,
          referral: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      // Referrals where user was the first degree contact
      prisma.referral.findMany({
        where: { firstDegreeId: userId },
        include: {
          referee: true,
          firstDegree: true,
          referral: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return NextResponse.json({
      success: true,
      referrals: {
        initiated: initiatedReferrals,
        received: receivedReferrals,
        facilitated: firstDegreeReferrals,
      },
    })
  } catch (error) {
    console.error('Get referrals error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
