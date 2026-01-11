import { NextResponse } from 'next/server'
import { createDatabaseBackup, listBackups } from '@/lib/services/backup'

/**
 * POST /api/admin/backup
 * Trigger a manual database backup (admin only)
 */
export async function POST() {
  // Note: Admin authentication should be handled by middleware
  // This endpoint assumes the request has already passed admin auth

  console.log('[Admin Backup] Starting manual backup...')

  const result = await createDatabaseBackup()

  if (result.success) {
    console.log(`[Admin Backup] Backup completed: ${result.backupKey}`)
    return NextResponse.json({
      success: true,
      message: result.message,
      backupKey: result.backupKey,
      size: result.size,
      cleanedUp: result.cleanedUp,
    })
  } else {
    console.error(`[Admin Backup] Backup failed: ${result.error}`)
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/backup
 * List all available backups
 */
export async function GET() {
  const result = await listBackups()

  if (result.success) {
    return NextResponse.json({
      success: true,
      backups: result.backups?.map(b => ({
        ...b,
        sizeFormatted: formatBytes(b.size),
        dateFormatted: b.date.toISOString(),
      })),
    })
  } else {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 }
    )
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
