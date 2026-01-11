import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3'
import { prisma } from '../prisma'
import { getS3Config } from './s3'
import { gzipSync } from 'zlib'

const BACKUP_RETENTION_DAYS = 14
const BACKUP_FOLDER = 'backups'

interface BackupResult {
  success: boolean
  message?: string
  backupKey?: string
  size?: number
  cleanedUp?: number
  error?: string
}

/**
 * Create a full database backup and upload to S3
 */
export async function createDatabaseBackup(): Promise<BackupResult> {
  try {
    const config = await getS3Config()

    if (!config) {
      return { success: false, error: 'S3 not configured. Enable S3 in API Settings first.' }
    }

    console.log('[Backup] Starting database backup...')

    // Export all tables
    const backupData = await exportAllTables()

    // Convert to JSON and compress
    const jsonData = JSON.stringify(backupData, null, 2)
    const compressedData = gzipSync(Buffer.from(jsonData, 'utf-8'))

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupKey = `${BACKUP_FOLDER}/backup-${timestamp}.json.gz`

    // Upload to S3
    const client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })

    await client.send(new PutObjectCommand({
      Bucket: config.bucket,
      Key: backupKey,
      Body: compressedData,
      ContentType: 'application/gzip',
      ContentEncoding: 'gzip',
      Metadata: {
        'backup-date': new Date().toISOString(),
        'original-size': jsonData.length.toString(),
        'compressed-size': compressedData.length.toString(),
      },
    }))

    console.log(`[Backup] Uploaded backup: ${backupKey} (${formatBytes(compressedData.length)})`)

    // Clean up old backups
    const cleanedUp = await cleanupOldBackups(client, config.bucket)

    return {
      success: true,
      message: `Backup created successfully`,
      backupKey,
      size: compressedData.length,
      cleanedUp,
    }
  } catch (error) {
    console.error('[Backup] Failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Backup failed',
    }
  }
}

/**
 * Export all database tables
 */
async function exportAllTables(): Promise<Record<string, unknown[]>> {
  const backup: Record<string, unknown[]> = {}

  // Export each table
  backup.users = await prisma.user.findMany()
  backup.contacts = await prisma.contact.findMany()
  backup.messages = await prisma.message.findMany()
  backup.referrals = await prisma.referral.findMany()
  backup.connections = await prisma.connection.findMany()
  backup.connectionRequests = await prisma.connectionRequest.findMany()
  backup.pendingIntroductions = await prisma.pendingIntroduction.findMany()
  backup.notifications = await prisma.notification.findMany()
  backup.linkedInAccounts = await prisma.linkedInAccount.findMany()
  backup.linkedInConnections = await prisma.linkedInConnection.findMany()
  backup.careerHistory = await prisma.careerHistory.findMany()
  backup.cardThemes = await prisma.cardTheme.findMany()
  backup.messageTemplates = await prisma.messageTemplate.findMany()
  backup.pages = await prisma.page.findMany()
  backup.sections = await prisma.section.findMany()
  backup.navigationSettings = await prisma.navigationSettings.findMany()
  backup.magicLinks = await prisma.magicLink.findMany()
  backup.apiSettings = await prisma.apiSettings.findMany()
  backup.brandingSettings = await prisma.brandingSettings.findMany()

  // Add metadata
  backup._metadata = [{
    exportedAt: new Date().toISOString(),
    version: '1.0',
    tables: Object.keys(backup).filter(k => k !== '_metadata'),
    counts: Object.fromEntries(
      Object.entries(backup)
        .filter(([k]) => k !== '_metadata')
        .map(([k, v]) => [k, (v as unknown[]).length])
    ),
  }]

  return backup
}

/**
 * Delete backups older than retention period
 */
async function cleanupOldBackups(client: S3Client, bucket: string): Promise<number> {
  try {
    // List all backups
    const listResponse = await client.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: `${BACKUP_FOLDER}/`,
    }))

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      return 0
    }

    // Find backups older than retention period
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - BACKUP_RETENTION_DAYS)

    const oldBackups = listResponse.Contents.filter(obj => {
      if (!obj.LastModified || !obj.Key) return false
      return obj.LastModified < cutoffDate
    })

    if (oldBackups.length === 0) {
      console.log('[Backup] No old backups to clean up')
      return 0
    }

    // Delete old backups
    await client.send(new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: {
        Objects: oldBackups.map(obj => ({ Key: obj.Key! })),
      },
    }))

    console.log(`[Backup] Cleaned up ${oldBackups.length} old backup(s)`)
    return oldBackups.length
  } catch (error) {
    console.error('[Backup] Cleanup failed:', error)
    return 0
  }
}

/**
 * List all available backups
 */
export async function listBackups(): Promise<{ success: boolean; backups?: Array<{ key: string; size: number; date: Date }>; error?: string }> {
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

    const response = await client.send(new ListObjectsV2Command({
      Bucket: config.bucket,
      Prefix: `${BACKUP_FOLDER}/`,
    }))

    const backups = (response.Contents || [])
      .filter(obj => obj.Key && obj.Size && obj.LastModified)
      .map(obj => ({
        key: obj.Key!,
        size: obj.Size!,
        date: obj.LastModified!,
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())

    return { success: true, backups }
  } catch (error) {
    console.error('[Backup] List failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list backups',
    }
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
