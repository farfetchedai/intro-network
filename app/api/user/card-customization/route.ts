import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        cardPageBgColor: true,
        cardBoxBgColor: true,
        cardTextColor: true,
        cardBgImage: true,
        cardProfileBorderColor: true,
        cardFooterBgColor: true,
        cardFooterTextColor: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, customization: user })
  } catch (error) {
    console.error('[card-customization] GET Error:', error)
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
      cardPageBgColor,
      cardBoxBgColor,
      cardTextColor,
      cardBgImage,
      cardProfileBorderColor,
      cardFooterBgColor,
      cardFooterTextColor,
    } = body

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        cardPageBgColor: cardPageBgColor || null,
        cardBoxBgColor: cardBoxBgColor || null,
        cardTextColor: cardTextColor || null,
        cardBgImage: cardBgImage || null,
        cardProfileBorderColor: cardProfileBorderColor || null,
        cardFooterBgColor: cardFooterBgColor || null,
        cardFooterTextColor: cardFooterTextColor || null,
      },
      select: {
        cardPageBgColor: true,
        cardBoxBgColor: true,
        cardTextColor: true,
        cardBgImage: true,
        cardProfileBorderColor: true,
        cardFooterBgColor: true,
        cardFooterTextColor: true,
      },
    })

    return NextResponse.json({ success: true, customization: user })
  } catch (error) {
    console.error('[card-customization] POST Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
