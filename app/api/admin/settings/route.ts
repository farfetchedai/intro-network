import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { clearLinkedInConfigCache } from '@/lib/linkedin'

export async function GET() {
  try {
    // Get the first (and should be only) API settings record
    let settings = await prisma.apiSettings.findFirst()

    // If no settings exist, create default empty ones
    if (!settings) {
      settings = await prisma.apiSettings.create({
        data: {},
      })
    }

    return NextResponse.json({
      success: true,
      settings: {
        appUrl: settings.appUrl || '',
        emailProvider: settings.emailProvider || 'resend',
        emailFromName: settings.emailFromName || '',
        resendApiKey: settings.resendApiKey || '',
        resendFromEmail: settings.resendFromEmail || '',
        gmailEmail: settings.gmailEmail || '',
        gmailAppPassword: settings.gmailAppPassword || '',
        sesAccessKeyId: settings.sesAccessKeyId || '',
        sesSecretAccessKey: settings.sesSecretAccessKey || '',
        sesRegion: settings.sesRegion || 'us-east-1',
        sesFromEmail: settings.sesFromEmail || '',
        smsEnabled: settings.smsEnabled || false,
        twilioAccountSid: settings.twilioAccountSid || '',
        twilioAuthToken: settings.twilioAuthToken || '',
        twilioPhoneNumber: settings.twilioPhoneNumber || '',
        anthropicApiKey: settings.anthropicApiKey || '',
        // S3 Storage
        s3Enabled: settings.s3Enabled || false,
        s3Bucket: settings.s3Bucket || '',
        s3Region: settings.s3Region || 'us-east-1',
        s3AccessKeyId: settings.s3AccessKeyId || '',
        s3SecretAccessKey: settings.s3SecretAccessKey || '',
        s3PublicUrlPrefix: settings.s3PublicUrlPrefix || '',
        // LinkedIn OAuth
        linkedinEnabled: settings.linkedinEnabled || false,
        linkedinClientId: settings.linkedinClientId || '',
        linkedinClientSecret: settings.linkedinClientSecret || '',
        linkedinRedirectUri: settings.linkedinRedirectUri || '',
        // Backup Configuration
        backupS3Bucket: settings.backupS3Bucket || '',
        backupS3Region: settings.backupS3Region || 'us-east-1',
        backupRetentionDays: settings.backupRetentionDays || 14,
      },
    })
  } catch (error) {
    console.error('Failed to fetch API settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch API settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Get existing settings or create new
    let apiSettings = await prisma.apiSettings.findFirst()

    if (apiSettings) {
      // Update existing
      apiSettings = await prisma.apiSettings.update({
        where: { id: apiSettings.id },
        data: {
          appUrl: body.appUrl || null,
          emailProvider: body.emailProvider || 'resend',
          emailFromName: body.emailFromName || null,
          resendApiKey: body.resendApiKey || null,
          resendFromEmail: body.resendFromEmail || null,
          gmailEmail: body.gmailEmail || null,
          gmailAppPassword: body.gmailAppPassword || null,
          sesAccessKeyId: body.sesAccessKeyId || null,
          sesSecretAccessKey: body.sesSecretAccessKey || null,
          sesRegion: body.sesRegion || 'us-east-1',
          sesFromEmail: body.sesFromEmail || null,
          smsEnabled: body.smsEnabled || false,
          twilioAccountSid: body.twilioAccountSid || null,
          twilioAuthToken: body.twilioAuthToken || null,
          twilioPhoneNumber: body.twilioPhoneNumber || null,
          anthropicApiKey: body.anthropicApiKey || null,
          // S3 Storage
          s3Enabled: body.s3Enabled || false,
          s3Bucket: body.s3Bucket || null,
          s3Region: body.s3Region || 'us-east-1',
          s3AccessKeyId: body.s3AccessKeyId || null,
          s3SecretAccessKey: body.s3SecretAccessKey || null,
          s3PublicUrlPrefix: body.s3PublicUrlPrefix || null,
          // LinkedIn OAuth
          linkedinEnabled: body.linkedinEnabled || false,
          linkedinClientId: body.linkedinClientId || null,
          linkedinClientSecret: body.linkedinClientSecret || null,
          linkedinRedirectUri: body.linkedinRedirectUri || null,
          // Backup Configuration
          backupS3Bucket: body.backupS3Bucket || null,
          backupS3Region: body.backupS3Region || 'us-east-1',
          backupRetentionDays: body.backupRetentionDays || 14,
        },
      })
    } else {
      // Create new
      apiSettings = await prisma.apiSettings.create({
        data: {
          appUrl: body.appUrl || null,
          emailProvider: body.emailProvider || 'resend',
          emailFromName: body.emailFromName || null,
          resendApiKey: body.resendApiKey || null,
          resendFromEmail: body.resendFromEmail || null,
          gmailEmail: body.gmailEmail || null,
          gmailAppPassword: body.gmailAppPassword || null,
          sesAccessKeyId: body.sesAccessKeyId || null,
          sesSecretAccessKey: body.sesSecretAccessKey || null,
          sesRegion: body.sesRegion || 'us-east-1',
          sesFromEmail: body.sesFromEmail || null,
          smsEnabled: body.smsEnabled || false,
          twilioAccountSid: body.twilioAccountSid || null,
          twilioAuthToken: body.twilioAuthToken || null,
          twilioPhoneNumber: body.twilioPhoneNumber || null,
          anthropicApiKey: body.anthropicApiKey || null,
          // S3 Storage
          s3Enabled: body.s3Enabled || false,
          s3Bucket: body.s3Bucket || null,
          s3Region: body.s3Region || 'us-east-1',
          s3AccessKeyId: body.s3AccessKeyId || null,
          s3SecretAccessKey: body.s3SecretAccessKey || null,
          s3PublicUrlPrefix: body.s3PublicUrlPrefix || null,
          // LinkedIn OAuth
          linkedinEnabled: body.linkedinEnabled || false,
          linkedinClientId: body.linkedinClientId || null,
          linkedinClientSecret: body.linkedinClientSecret || null,
          linkedinRedirectUri: body.linkedinRedirectUri || null,
          // Backup Configuration
          backupS3Bucket: body.backupS3Bucket || null,
          backupS3Region: body.backupS3Region || 'us-east-1',
          backupRetentionDays: body.backupRetentionDays || 14,
        },
      })
    }

    // Clear LinkedIn config cache so new settings take effect immediately
    clearLinkedInConfigCache()

    return NextResponse.json({
      success: true,
      message: 'API settings saved successfully',
    })
  } catch (error) {
    console.error('Failed to save API settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save API settings' },
      { status: 500 }
    )
  }
}
