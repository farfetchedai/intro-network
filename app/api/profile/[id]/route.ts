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

    // Build update data, only including fields that were explicitly provided
    const updateData: Record<string, any> = {}

    // Always update these text fields
    if (body.firstName !== undefined) updateData.firstName = body.firstName
    if (body.lastName !== undefined) updateData.lastName = body.lastName
    if (body.username !== undefined) updateData.username = body.username || null
    if (body.email !== undefined) updateData.email = body.email || null
    if (body.phone !== undefined) updateData.phone = body.phone || null
    if (body.bio !== undefined) updateData.bio = body.bio || null
    if (body.linkedinUrl !== undefined) updateData.linkedinUrl = body.linkedinUrl || null
    if (body.twitterUrl !== undefined) updateData.twitterUrl = body.twitterUrl || null
    if (body.facebookUrl !== undefined) updateData.facebookUrl = body.facebookUrl || null
    if (body.instagramUrl !== undefined) updateData.instagramUrl = body.instagramUrl || null
    if (body.websiteUrl !== undefined) updateData.websiteUrl = body.websiteUrl || null

    // Only update image fields if explicitly provided (preserves existing images)
    if (body.hasOwnProperty('profilePicture')) updateData.profilePicture = body.profilePicture || null
    if (body.hasOwnProperty('backgroundImage')) updateData.backgroundImage = body.backgroundImage || null

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
