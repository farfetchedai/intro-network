import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import crypto from 'crypto'
import { prisma } from '../prisma'

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  console.log('[Email] Attempting to send email:', { to, subject: subject.substring(0, 50) })

  try {
    const settings = await prisma.apiSettings.findFirst()

    if (!settings) {
      console.error('[Email] No API settings found in database')
      return { success: false, error: 'Email provider not configured' }
    }

    console.log('[Email] Provider configured:', settings.emailProvider || 'none')

    // Helper to format from address with optional name
    const formatFrom = (email: string) => {
      if (settings.emailFromName) {
        return `${settings.emailFromName} <${email}>`
      }
      return email
    }

    // Use Gmail SMTP if selected
    if (settings.emailProvider === 'gmail') {
      if (!settings.gmailEmail || !settings.gmailAppPassword) {
        console.error('[Email] Gmail SMTP credentials not configured')
        return { success: false, error: 'Gmail SMTP not configured' }
      }

      const fromAddress = formatFrom(settings.gmailEmail)
      console.log('Sending email via Gmail SMTP:', {
        from: fromAddress,
        to,
        subject,
      })

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: settings.gmailEmail,
          pass: settings.gmailAppPassword,
        },
      })

      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
      })

      console.log('Gmail SMTP send successful:', info.messageId)

      return { success: true, provider: 'gmail' }
    }

    // Use Amazon SES if selected
    if (settings.emailProvider === 'ses') {
      if (!settings.sesAccessKeyId || !settings.sesSecretAccessKey || !settings.sesFromEmail) {
        console.error('[Email] Amazon SES credentials not configured')
        return { success: false, error: 'Amazon SES not configured' }
      }

      const fromAddress = formatFrom(settings.sesFromEmail)
      console.log('Sending email via Amazon SES:', {
        from: fromAddress,
        to,
        subject,
        region: settings.sesRegion,
      })

      const sesClient = new SESClient({
        region: settings.sesRegion || 'us-east-1',
        credentials: {
          accessKeyId: settings.sesAccessKeyId,
          secretAccessKey: settings.sesSecretAccessKey,
        },
      })

      const command = new SendEmailCommand({
        Source: fromAddress,
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: html,
              Charset: 'UTF-8',
            },
          },
        },
      })

      const result = await sesClient.send(command)
      console.log('Amazon SES send successful:', result.MessageId)

      return { success: true, provider: 'ses', messageId: result.MessageId }
    }

    // Use Resend if selected or default
    if (settings.emailProvider === 'resend' || !settings.emailProvider) {
      if (!settings.resendApiKey || !settings.resendFromEmail) {
        console.error('[Email] Resend credentials not configured')
        return { success: false, error: 'Resend not configured' }
      }

      const fromAddress = formatFrom(settings.resendFromEmail)
      console.log('[Email] Sending via Resend:', {
        from: fromAddress,
        to,
        subject,
      })

      const resend = new Resend(settings.resendApiKey)

      const result = await resend.emails.send({
        from: fromAddress,
        to,
        subject,
        html,
      })

      console.log('[Email] Resend send successful:', result)
      return { success: true, provider: 'resend' }
    }

    console.error('[Email] No email provider configured')
    return { success: false, error: 'No email provider configured' }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[Email] Failed to send email:', errorMessage)
    console.error('[Email] Full error:', error)
    return { success: false, error: errorMessage }
  }
}

export function generateFirstDegreeRequestEmail({
  refereeFirstName,
  refereeLastName,
  contactFirstName,
  customMessage,
  link,
}: {
  refereeFirstName: string
  refereeLastName: string
  contactFirstName: string
  customMessage: string
  link: string
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Introduction Request</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Hi ${contactFirstName},</h2>
          <p>${customMessage}</p>
          <p>
            <a href="${link}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Help ${refereeFirstName} Out
            </a>
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This request was sent by ${refereeFirstName} ${refereeLastName} through the Intro Network platform.
          </p>
        </div>
      </body>
    </html>
  `
}

export function generateReferralRequestEmail({
  refereeFirstName,
  refereeLastName,
  firstDegreeFirstName,
  firstDegreeLastName,
  referralFirstName,
  statementSummary,
  skills,
  company,
  achievement,
  method,
  introRequest,
  link,
}: {
  refereeFirstName: string
  refereeLastName: string
  firstDegreeFirstName: string
  firstDegreeLastName: string
  referralFirstName: string
  statementSummary: string
  skills?: string | null
  company?: string | null
  achievement?: string | null
  method?: string | null
  introRequest?: string | null
  link: string
}) {
  // Build the full statement from individual components
  let fullStatement = ''

  // Parse skills if it's a JSON array
  let skillsList: string[] = []
  if (skills) {
    try {
      skillsList = JSON.parse(skills)
    } catch (e) {
      // If not JSON, treat as a single skill
      skillsList = [skills]
    }
  }

  // Start with skills
  if (skillsList.length > 0) {
    fullStatement = `${refereeFirstName} ${refereeLastName} is great at ${skillsList.join(' and ')}.`
  }

  // Add company and achievement
  if (company || achievement || method) {
    if (fullStatement) fullStatement += ' '

    if (company && achievement && method) {
      fullStatement += `${refereeFirstName} has worked at ${company} where they ${achievement} by ${method}.`
    } else if (company && achievement) {
      fullStatement += `${refereeFirstName} has worked at ${company} where they ${achievement}.`
    } else if (company) {
      fullStatement += `${refereeFirstName} has worked at ${company}.`
    }
  }

  // Add intro request
  if (introRequest) {
    if (fullStatement) fullStatement += ' '
    fullStatement += `They would really appreciate ${introRequest}.`
  }

  // Fallback to statementSummary if no components are available
  if (!fullStatement && statementSummary) {
    fullStatement = statementSummary
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Introduction From ${firstDegreeFirstName}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Hi ${referralFirstName},</h2>
          <p>${firstDegreeFirstName} ${firstDegreeLastName} thought you should meet ${refereeFirstName} ${refereeLastName}.</p>

          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">About ${refereeFirstName}:</h3>
            <p>${fullStatement}</p>
          </div>

          <p>
            <a href="${link}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">
              Approve Introduction
            </a>
          </p>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This introduction was facilitated through the Intro Network platform.
          </p>
        </div>
      </body>
    </html>
  `
}

export function generateApprovalNotificationToReferee({
  refereeFirstName,
  referralFirstName,
  referralLastName,
  referralEmail,
  referralPhone,
}: {
  refereeFirstName: string
  referralFirstName: string
  referralLastName: string
  referralEmail: string | null
  referralPhone: string | null
}) {
  const contactDetails = []
  if (referralEmail) contactDetails.push(`Email: ${referralEmail}`)
  if (referralPhone) contactDetails.push(`Phone: ${referralPhone}`)
  const contactInfo = contactDetails.length > 0
    ? contactDetails.join('<br>')
    : 'No contact information available'

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Successful Intro!</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 5px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0;">🎉 Successful Intro!</h2>
          </div>

          <h2>Great news, ${refereeFirstName}!</h2>
          <p>${referralFirstName} ${referralLastName} has approved the introduction request.</p>

          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="margin-top: 0; color: #065f46;">Contact Information:</h3>
            <p style="margin: 0; font-size: 16px;">${contactInfo}</p>
          </div>

          <p>Feel free to reach out to ${referralFirstName} directly to continue the conversation!</p>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This notification was sent through the Intro Network platform.
          </p>
        </div>
      </body>
    </html>
  `
}

export function generateApprovalNotificationToFirstDegree({
  firstDegreeFirstName,
  refereeFirstName,
  refereeLastName,
  referralFirstName,
  referralLastName,
}: {
  firstDegreeFirstName: string
  refereeFirstName: string
  refereeLastName: string
  referralFirstName: string
  referralLastName: string
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Successful Intro!</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 5px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0;">🎉 Successful Intro!</h2>
          </div>

          <h2>Great news, ${firstDegreeFirstName}!</h2>
          <p>${referralFirstName} ${referralLastName} has approved the introduction to ${refereeFirstName} ${refereeLastName}.</p>

          <p>Thank you for facilitating this connection! The introduction has been successfully completed.</p>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This notification was sent through the Intro Network platform.
          </p>
        </div>
      </body>
    </html>
  `
}

export async function sendIntroductionEmail({
  to,
  recipientName,
  introducerName,
  otherPersonName,
  otherPersonCompany,
  otherPersonContext,
  otherPersonStatementSummary,
  message,
  introductionId,
  isExistingUser,
}: {
  to: string
  recipientName: string
  introducerName: string
  otherPersonName: string
  otherPersonCompany?: string | null
  otherPersonContext?: string | null
  otherPersonStatementSummary?: string | null
  message: string
  introductionId: string
  isExistingUser: boolean
}) {
  // Get the app URL for links
  const settings = await prisma.apiSettings.findFirst()
  const appUrl = settings?.appUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Get or create user account
  let user = await prisma.user.findUnique({ where: { email: to } })

  if (!user) {
    // Create account for new users
    const nameParts = recipientName.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    user = await prisma.user.create({
      data: {
        email: to,
        firstName,
        lastName,
        userType: 'REFEREE',
      },
    })
  }

  // Generate magic link token for ALL users (new and existing)
  const token = crypto.randomBytes(32).toString('hex')
  const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days for intro emails

  // Save token with redirect to introductions page
  await prisma.user.update({
    where: { id: user.id },
    data: {
      magicLinkToken: token,
      magicLinkExpiry: expiry,
      magicLinkRedirect: '/introductions',
    },
  })

  const actionLink = `${appUrl}/auth/verify?token=${token}`
  const actionText = isExistingUser ? 'View Introduction' : 'View Introduction & Get Started'

  const html = generateIntroductionEmail({
    recipientName,
    introducerName,
    otherPersonName,
    otherPersonCompany,
    otherPersonContext,
    otherPersonStatementSummary,
    message,
    actionLink,
    actionText,
    isExistingUser,
  })

  return sendEmail({
    to,
    subject: `${introducerName} wants to introduce you to ${otherPersonName}`,
    html,
  })
}

function generateIntroductionEmail({
  recipientName,
  introducerName,
  otherPersonName,
  otherPersonCompany,
  otherPersonContext,
  otherPersonStatementSummary,
  message,
  actionLink,
  actionText,
  isExistingUser,
}: {
  recipientName: string
  introducerName: string
  otherPersonName: string
  otherPersonCompany?: string | null
  otherPersonContext?: string | null
  otherPersonStatementSummary?: string | null
  message: string
  actionLink: string
  actionText: string
  isExistingUser: boolean
}) {
  const otherPersonInfo = [
    otherPersonStatementSummary ? `${otherPersonStatementSummary}` : '',
    otherPersonCompany ? `<strong>Company:</strong> ${otherPersonCompany}` : '',
    otherPersonContext ? `<strong>Context:</strong> ${otherPersonContext}` : '',
  ].filter(Boolean).join('<br><br>')

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Introduction from ${introducerName}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🤝 New Introduction</h1>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <h2 style="margin-top: 0;">Hi ${recipientName},</h2>

            <p><strong>${introducerName}</strong> thinks you should meet <strong>${otherPersonName}</strong>!</p>

            <!-- Introduction Message -->
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; font-style: italic;">"${message}"</p>
              <p style="margin: 10px 0 0 0; text-align: right; color: #666;">— ${introducerName}</p>
            </div>

            ${otherPersonInfo ? `
            <!-- About the other person -->
            <div style="background-color: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #7c3aed;">About ${otherPersonName}:</h3>
              <p style="margin: 0;">${otherPersonInfo}</p>
            </div>
            ` : ''}

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${actionLink}" style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                ${actionText}
              </a>
            </div>

            ${!isExistingUser ? `
            <p style="text-align: center; color: #666; font-size: 14px;">
              Create your free Business Card to connect with ${otherPersonName} and grow your network.
            </p>
            ` : ''}
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #666; font-size: 12px;">
              This introduction was sent through Intro Network.
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}

export function generateApprovalNotificationToReferral({
  referralFirstName,
  refereeFirstName,
  refereeLastName,
  refereeEmail,
  refereePhone,
}: {
  referralFirstName: string
  refereeFirstName: string
  refereeLastName: string
  refereeEmail: string | null
  refereePhone: string | null
}) {
  const contactDetails = []
  if (refereeEmail) contactDetails.push(`Email: ${refereeEmail}`)
  if (refereePhone) contactDetails.push(`Phone: ${refereePhone}`)
  const contactInfo = contactDetails.length > 0
    ? contactDetails.join('<br>')
    : 'No contact information available'

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Thank you for accepting the introduction!</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 5px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0;">🎉 Introduction Accepted!</h2>
          </div>

          <h2>Thank you, ${referralFirstName}!</h2>
          <p>You have accepted the introduction to ${refereeFirstName} ${refereeLastName}.</p>

          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="margin-top: 0; color: #065f46;">Contact Information for ${refereeFirstName} ${refereeLastName}:</h3>
            <p style="margin: 0; font-size: 16px;">${contactInfo}</p>
          </div>

          <p>Feel free to reach out to ${refereeFirstName} directly to continue the conversation!</p>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This notification was sent through the Intro Network platform.
          </p>
        </div>
      </body>
    </html>
  `
}
