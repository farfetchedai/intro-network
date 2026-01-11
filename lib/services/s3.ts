import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { prisma } from '../prisma'
import crypto from 'crypto'

interface S3Config {
  bucket: string
  region: string
  accessKeyId: string
  secretAccessKey: string
  publicUrlPrefix?: string
}

interface UploadResult {
  success: boolean
  url?: string
  key?: string
  error?: string
}

// Get S3 configuration from database
export async function getS3Config(): Promise<S3Config | null> {
  const settings = await prisma.apiSettings.findFirst()

  if (!settings?.s3Enabled || !settings.s3Bucket || !settings.s3AccessKeyId || !settings.s3SecretAccessKey) {
    return null
  }

  return {
    bucket: settings.s3Bucket,
    region: settings.s3Region || 'us-east-1',
    accessKeyId: settings.s3AccessKeyId,
    secretAccessKey: settings.s3SecretAccessKey,
    publicUrlPrefix: settings.s3PublicUrlPrefix || undefined,
  }
}

// Check if S3 is configured and enabled
export async function isS3Configured(): Promise<boolean> {
  const config = await getS3Config()
  return config !== null
}

// Generate unique filename with original extension
function generateUniqueKey(originalFilename: string, folder: string = 'uploads'): string {
  const randomId = crypto.randomBytes(6).toString('hex') // 12 chars
  const extension = originalFilename.split('.').pop()?.toLowerCase() || 'bin'
  return `${folder}/${randomId}.${extension}`
}

// Upload file to S3
export async function uploadToS3(
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string,
  folder: string = 'uploads'
): Promise<UploadResult> {
  try {
    const config = await getS3Config()

    if (!config) {
      return { success: false, error: 'S3 not configured' }
    }

    const client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })

    const key = generateUniqueKey(originalFilename, folder)

    await client.send(new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
    }))

    // Generate public URL
    const url = config.publicUrlPrefix
      ? `${config.publicUrlPrefix.replace(/\/$/, '')}/${key}`
      : `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`

    return { success: true, url, key }
  } catch (error) {
    console.error('[S3] Upload failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload to S3'
    }
  }
}

// Delete file from S3
export async function deleteFromS3(key: string): Promise<{ success: boolean; error?: string }> {
  try {
    const config = await getS3Config()

    if (!config) {
      return { success: false, error: 'S3 not configured' }
    }

    const client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })

    await client.send(new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }))

    return { success: true }
  } catch (error) {
    console.error('[S3] Delete failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete from S3'
    }
  }
}

// Test S3 configuration by uploading and deleting a test file
export async function testS3Connection(): Promise<{ success: boolean; error?: string }> {
  try {
    const config = await getS3Config()

    if (!config) {
      return { success: false, error: 'S3 credentials not configured' }
    }

    const client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })

    const testKey = `test/connection-test-${Date.now()}.txt`

    // Upload test file
    await client.send(new PutObjectCommand({
      Bucket: config.bucket,
      Key: testKey,
      Body: 'S3 connection test',
      ContentType: 'text/plain',
    }))

    // Delete test file
    await client.send(new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: testKey,
    }))

    return { success: true }
  } catch (error) {
    console.error('[S3] Connection test failed:', error)

    // Provide more helpful error messages
    const errorMessage = error instanceof Error ? error.message : 'S3 connection test failed'

    if (errorMessage.includes('InvalidAccessKeyId')) {
      return { success: false, error: 'Invalid Access Key ID' }
    }
    if (errorMessage.includes('SignatureDoesNotMatch')) {
      return { success: false, error: 'Invalid Secret Access Key' }
    }
    if (errorMessage.includes('NoSuchBucket')) {
      return { success: false, error: 'Bucket does not exist' }
    }
    if (errorMessage.includes('AccessDenied')) {
      return { success: false, error: 'Access denied. Check IAM permissions.' }
    }

    return { success: false, error: errorMessage }
  }
}
