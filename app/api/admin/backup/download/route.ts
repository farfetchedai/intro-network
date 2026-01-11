import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { prisma } from '@/lib/prisma'
import { getS3Config } from '@/lib/services/s3'

/**
 * GET /api/admin/backup/download?key=backups/backup-xxx.json.gz
 * Generate a presigned URL to download a backup file
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key) {
    return NextResponse.json(
      { success: false, error: 'Missing key parameter' },
      { status: 400 }
    )
  }

  // Validate the key is a backup file
  if (!key.startsWith('backups/') || !key.endsWith('.json.gz')) {
    return NextResponse.json(
      { success: false, error: 'Invalid backup key' },
      { status: 400 }
    )
  }

  try {
    const s3Config = await getS3Config()

    if (!s3Config) {
      return NextResponse.json(
        { success: false, error: 'S3 not configured' },
        { status: 500 }
      )
    }

    // Get backup-specific bucket if configured
    const settings = await prisma.apiSettings.findFirst()
    const bucket = settings?.backupS3Bucket || s3Config.bucket
    const region = settings?.backupS3Region || s3Config.region

    const client = new S3Client({
      region,
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      },
    })

    // Generate presigned URL (valid for 5 minutes)
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })

    const url = await getSignedUrl(client, command, { expiresIn: 300 })

    return NextResponse.json({ success: true, url })
  } catch (error) {
    console.error('[Backup Download] Failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate download URL' },
      { status: 500 }
    )
  }
}
