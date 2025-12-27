import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await req.json()
    const {
      email,
      phone,
      linkedinUrl,
      twitterUrl,
      facebookUrl,
      instagramUrl,
      tiktokUrl,
      websiteUrl,
    } = body

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        email: email || undefined,
        phone: phone || null,
        linkedinUrl: linkedinUrl || null,
        twitterUrl: twitterUrl || null,
        facebookUrl: facebookUrl || null,
        instagramUrl: instagramUrl || null,
        tiktokUrl: tiktokUrl || null,
        websiteUrl: websiteUrl || null,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        linkedinUrl: true,
        twitterUrl: true,
        facebookUrl: true,
        instagramUrl: true,
        tiktokUrl: true,
        websiteUrl: true,
      },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('[update-profile] POST Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
