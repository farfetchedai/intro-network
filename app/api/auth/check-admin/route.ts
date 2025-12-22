import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ isAdmin: false })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { userType: true },
    })

    return NextResponse.json({ isAdmin: user?.userType === 'ADMIN' })
  } catch (error) {
    console.error('Check admin error:', error)
    return NextResponse.json({ isAdmin: false })
  }
}
