import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { testS3Connection } from '@/lib/services/s3'

export async function POST() {
  try {
    const settings = await prisma.apiSettings.findFirst()

    if (!settings?.s3Enabled) {
      return NextResponse.json(
        { success: false, error: 'S3 storage is not enabled' },
        { status: 400 }
      )
    }

    if (!settings.s3Bucket || !settings.s3AccessKeyId || !settings.s3SecretAccessKey) {
      return NextResponse.json(
        { success: false, error: 'S3 credentials not fully configured' },
        { status: 400 }
      )
    }

    const result = await testS3Connection()

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'S3 connection test failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully connected to S3 bucket: ${settings.s3Bucket}`,
    })
  } catch (error) {
    console.error('Failed to test S3 connection:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to test S3' },
      { status: 500 }
    )
  }
}
