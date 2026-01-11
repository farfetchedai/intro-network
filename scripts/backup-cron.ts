/**
 * Backup Cron Script
 *
 * This script is designed to be run by Railway's cron service.
 * It executes the database backup and then exits.
 *
 * Usage: npx tsx scripts/backup-cron.ts
 */

import { createDatabaseBackup } from '../lib/services/backup'

async function run() {
  console.log('[Cron] Starting scheduled backup...')
  console.log('[Cron] Time:', new Date().toISOString())

  try {
    const result = await createDatabaseBackup()

    if (result.success) {
      console.log('[Cron] Backup completed successfully')
      console.log('[Cron] File:', result.backupKey)
      console.log('[Cron] Size:', result.size, 'bytes')
      if (result.cleanedUp && result.cleanedUp > 0) {
        console.log('[Cron] Cleaned up', result.cleanedUp, 'old backup(s)')
      }
      process.exit(0)
    } else {
      console.error('[Cron] Backup failed:', result.error)
      process.exit(1)
    }
  } catch (error) {
    console.error('[Cron] Unexpected error:', error)
    process.exit(1)
  }
}

run()
