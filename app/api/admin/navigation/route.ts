import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const navigation = await prisma.navigationSettings.findFirst()

    if (!navigation) {
      return NextResponse.json({ navigation: null })
    }

    // Parse JSON fields
    const parsed = {
      ...navigation,
      headerLinks: JSON.parse(navigation.headerLinks),
      footerLinks: JSON.parse(navigation.footerLinks),
    }

    return NextResponse.json({ navigation: parsed })
  } catch (error) {
    console.error('Failed to fetch navigation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch navigation' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { headerLinks, footerLinks, tagline, companyName } = body

    // Check if navigation settings already exist
    const existing = await prisma.navigationSettings.findFirst()

    const data = {
      headerLinks: JSON.stringify(headerLinks || []),
      footerLinks: JSON.stringify(footerLinks || []),
      tagline,
      companyName,
    }

    let navigation
    if (existing) {
      navigation = await prisma.navigationSettings.update({
        where: { id: existing.id },
        data,
      })
    } else {
      navigation = await prisma.navigationSettings.create({
        data,
      })
    }

    // Parse JSON fields for response
    const parsed = {
      ...navigation,
      headerLinks: JSON.parse(navigation.headerLinks),
      footerLinks: JSON.parse(navigation.footerLinks),
    }

    return NextResponse.json({ navigation: parsed })
  } catch (error) {
    console.error('Failed to update navigation:', error)
    return NextResponse.json(
      { error: 'Failed to update navigation' },
      { status: 500 }
    )
  }
}
