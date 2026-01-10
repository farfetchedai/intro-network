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
        cardButtonABgColor: true,
        cardButtonATextColor: true,
        cardButtonBBgColor: true,
        cardButtonBTextColor: true,
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
      cardButtonABgColor,
      cardButtonATextColor,
      cardButtonBBgColor,
      cardButtonBTextColor,
    } = body

    // Build update data, only including fields that were explicitly provided
    const updateData: Record<string, any> = {}
    if (cardPageBgColor !== undefined) updateData.cardPageBgColor = cardPageBgColor || null
    if (cardBoxBgColor !== undefined) updateData.cardBoxBgColor = cardBoxBgColor || null
    if (cardTextColor !== undefined) updateData.cardTextColor = cardTextColor || null
    if (body.hasOwnProperty('cardBgImage')) updateData.cardBgImage = cardBgImage || null
    if (cardProfileBorderColor !== undefined) updateData.cardProfileBorderColor = cardProfileBorderColor || null
    if (cardFooterBgColor !== undefined) updateData.cardFooterBgColor = cardFooterBgColor || null
    if (cardFooterTextColor !== undefined) updateData.cardFooterTextColor = cardFooterTextColor || null
    if (cardButtonABgColor !== undefined) updateData.cardButtonABgColor = cardButtonABgColor || null
    if (cardButtonATextColor !== undefined) updateData.cardButtonATextColor = cardButtonATextColor || null
    if (cardButtonBBgColor !== undefined) updateData.cardButtonBBgColor = cardButtonBBgColor || null
    if (cardButtonBTextColor !== undefined) updateData.cardButtonBTextColor = cardButtonBTextColor || null

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        cardPageBgColor: true,
        cardBoxBgColor: true,
        cardTextColor: true,
        cardBgImage: true,
        cardProfileBorderColor: true,
        cardFooterBgColor: true,
        cardFooterTextColor: true,
        cardButtonABgColor: true,
        cardButtonATextColor: true,
        cardButtonBBgColor: true,
        cardButtonBTextColor: true,
      },
    })

    return NextResponse.json({ success: true, customization: user })
  } catch (error) {
    console.error('[card-customization] POST Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
