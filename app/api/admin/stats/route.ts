import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get counts for different user types
    const totalUsers = await prisma.user.count()
    const referees = await prisma.user.count({ where: { userType: 'REFEREE' } })
    const firstDegree = await prisma.user.count({ where: { userType: 'FIRST_DEGREE' } })
    const referrals = await prisma.user.count({ where: { userType: 'REFERRAL' } })

    // Get total contacts count
    const totalContacts = await prisma.contact.count()

    // Get total referrals count
    const totalReferrals = await prisma.referral.count()

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        referees,
        firstDegree,
        referrals,
        totalContacts,
        totalReferrals,
      },
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
