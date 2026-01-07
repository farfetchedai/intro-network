import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Public endpoint to check if SMS is enabled
export async function GET() {
  try {
    const settings = await prisma.apiSettings.findFirst()

    return NextResponse.json({
      success: true,
      smsEnabled: settings?.smsEnabled || false,
    })
  } catch (error) {
    console.error('Failed to fetch SMS status:', error)
    return NextResponse.json({
      success: true,
      smsEnabled: false,
    })
  }
}
