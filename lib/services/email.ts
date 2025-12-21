import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
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
  try {
    const settings = await prisma.apiSettings.findFirst()

    if (!settings) {
      console.warn('Email provider not configured. Email not sent.')
      return { success: false, error: 'Email provider not configured' }
    }

    // Use Gmail SMTP if selected
    if (settings.emailProvider === 'gmail') {
      if (!settings.gmailEmail || !settings.gmailAppPassword) {
        console.warn('Gmail SMTP credentials not configured. Email not sent.')
        return { success: false, error: 'Gmail SMTP not configured' }
      }

      console.log('Sending email via Gmail SMTP:', {
        from: settings.gmailEmail,
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
        from: settings.gmailEmail,
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
        console.warn('Amazon SES credentials not configured. Email not sent.')
        return { success: false, error: 'Amazon SES not configured' }
      }

      console.log('Sending email via Amazon SES:', {
        from: settings.sesFromEmail,
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
        Source: settings.sesFromEmail,
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
        console.warn('Resend credentials not configured. Email not sent.')
        return { success: false, error: 'Resend not configured' }
      }

      const resend = new Resend(settings.resendApiKey)

      await resend.emails.send({
        from: settings.resendFromEmail,
        to,
        subject,
        html,
      })

      return { success: true, provider: 'resend' }
    }

    console.warn('No email provider configured. Email not sent.')
    return { success: false, error: 'No email provider configured' }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
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
