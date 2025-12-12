import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        phone: true,
        bio: true,
        profilePicture: true,
        backgroundImage: true,
        linkedinUrl: true,
        twitterUrl: true,
        facebookUrl: true,
        instagramUrl: true,
        websiteUrl: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: user,
    })
  } catch (error) {
    console.error('Failed to fetch profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if username is being changed and if it's available
    if (body.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: body.username },
      })

      if (existingUser && existingUser.id !== id) {
        return NextResponse.json(
          { success: false, error: 'Username is already taken' },
          { status: 400 }
        )
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        username: body.username || null,
        email: body.email || null,
        phone: body.phone || null,
        bio: body.bio || null,
        profilePicture: body.profilePicture || null,
        backgroundImage: body.backgroundImage || null,
        linkedinUrl: body.linkedinUrl || null,
        twitterUrl: body.twitterUrl || null,
        facebookUrl: body.facebookUrl || null,
        instagramUrl: body.instagramUrl || null,
        websiteUrl: body.websiteUrl || null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedUser,
    })
  } catch (error) {
    console.error('Failed to update profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
