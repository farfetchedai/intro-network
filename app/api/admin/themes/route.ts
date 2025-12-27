import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const themes = await prisma.cardTheme.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ success: true, themes })
  } catch (error) {
    console.error('Failed to fetch themes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch themes' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { themes } = await request.json()

    if (!Array.isArray(themes)) {
      return NextResponse.json(
        { success: false, error: 'Invalid themes data' },
        { status: 400 }
      )
    }

    // Delete all existing themes and recreate with the new set
    await prisma.cardTheme.deleteMany()

    // Create new themes with order
    const createdThemes = await Promise.all(
      themes.map((theme, index) =>
        prisma.cardTheme.create({
          data: {
            name: theme.name,
            order: index,
            pageBackground: theme.pageBackground,
            cardBackground: theme.cardBackground,
            textColor: theme.textColor,
            profilePictureBorder: theme.profilePictureBorder,
            footerBackground: theme.footerBackground,
            footerTextColor: theme.footerTextColor,
            buttonABackground: theme.buttonABackground || '#3b82f6',
            buttonATextColor: theme.buttonATextColor || '#ffffff',
            buttonBBackground: theme.buttonBBackground || '#10b981',
            buttonBTextColor: theme.buttonBTextColor || '#ffffff',
          },
        })
      )
    )

    return NextResponse.json({ success: true, themes: createdThemes })
  } catch (error) {
    console.error('Failed to save themes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save themes' },
      { status: 500 }
    )
  }
}
