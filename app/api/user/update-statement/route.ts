import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { statementSummary, statementSummary3rdPerson, userId: bodyUserId } = body

    console.log('[update-statement] Received request:', {
      hasStatementSummary: !!statementSummary,
      hasStatementSummary3rdPerson: !!statementSummary3rdPerson,
      bodyUserId,
    })

    // Get userId from cookie or from request body (for unauthenticated flows like onboarding)
    const cookieStore = await cookies()
    const cookieUserId = cookieStore.get('userId')?.value
    const userId = cookieUserId || bodyUserId

    console.log('[update-statement] userId resolution:', { cookieUserId, bodyUserId, finalUserId: userId })

    if (!userId) {
      console.log('[update-statement] No userId found, returning 401')
      return NextResponse.json(
        { error: 'Not authenticated', success: false },
        { status: 401 }
      )
    }

    if (typeof statementSummary !== 'string') {
      console.log('[update-statement] Invalid statementSummary type:', typeof statementSummary)
      return NextResponse.json({ error: 'Statement summary is required', success: false }, { status: 400 })
    }

    // Update statement summaries (both 1st and 3rd person if provided)
    const updateData: { statementSummary: string; statementSummary3rdPerson?: string } = {
      statementSummary,
    }

    if (statementSummary3rdPerson && typeof statementSummary3rdPerson === 'string') {
      updateData.statementSummary3rdPerson = statementSummary3rdPerson
    }

    console.log('[update-statement] Updating user:', userId)

    // First check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })

    if (!existingUser) {
      console.log('[update-statement] User not found:', userId)
      return NextResponse.json(
        { error: `User not found: ${userId}`, success: false },
        { status: 404 }
      )
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    console.log('[update-statement] Update successful')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[update-statement] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}`, success: false },
      { status: 500 }
    )
  }
}
