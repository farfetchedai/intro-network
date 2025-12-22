import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function isAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return false
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { userType: true },
    })

    return user?.userType === 'ADMIN'
  } catch (error) {
    console.error('Admin auth check failed:', error)
    return false
  }
}

export async function requireAdmin() {
  const admin = await isAdmin()
  if (!admin) {
    return { authorized: false, error: 'Unauthorized - Admin access required' }
  }
  return { authorized: true, error: null }
}
