import { NextRequest, NextResponse } from 'next/server'
import { createDatabaseBackup, listBackups } from '@/lib/services/backup'

// Secret key for cron job authentication
const CRON_SECRET = process.env.CRON_SECRET

/**
 * POST /api/cron/backup
 * Trigger a database backup
 *
 * Requires Authorization header with Bearer token matching CRON_SECRET
 * Or x-cron-secret header for simpler cron services
 */
export async function POST(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get('authorization')
  const cronSecret = request.headers.get('x-cron-secret')

  const providedSecret = authHeader?.replace('Bearer ', '') || cronSecret

  if (!CRON_SECRET) {
    console.error('[Backup API] CRON_SECRET environment variable not set')
    return NextResponse.json(
      { success: false, error: 'Backup not configured' },
      { status: 500 }
    )
  }

  if (providedSecret !== CRON_SECRET) {
    console.warn('[Backup API] Unauthorized backup attempt')
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  console.log('[Backup API] Starting scheduled backup...')

  const result = await createDatabaseBackup()

  if (result.success) {
    console.log(`[Backup API] Backup completed: ${result.backupKey}`)
    return NextResponse.json({
      success: true,
      message: result.message,
      backupKey: result.backupKey,
      size: result.size,
      cleanedUp: result.cleanedUp,
    })
  } else {
    console.error(`[Backup API] Backup failed: ${result.error}`)
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cron/backup
 * List all backups
 */
export async function GET(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get('authorization')
  const cronSecret = request.headers.get('x-cron-secret')

  const providedSecret = authHeader?.replace('Bearer ', '') || cronSecret

  if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const result = await listBackups()

  if (result.success) {
    return NextResponse.json({
      success: true,
      backups: result.backups,
    })
  } else {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 }
    )
  }
}
