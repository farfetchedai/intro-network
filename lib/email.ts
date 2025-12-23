import { prisma } from './prisma'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const settings = await prisma.apiSettings.findFirst()

    if (!settings) {
      throw new Error('API settings not configured')
    }

    const provider = settings.emailProvider || 'resend'

    console.log(`Sending email via ${provider} to: ${to}, subject: ${subject}`)

    if (provider === 'ses') {
      // AWS SES
      if (!settings.sesAccessKeyId || !settings.sesSecretAccessKey || !settings.sesFromEmail) {
        throw new Error('AWS SES not configured - missing access key, secret key, or from email')
      }

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

      const response = await sesClient.send(command)
      console.log('SES email sent successfully:', response.MessageId)
      return { success: true, messageId: response.MessageId }

    } else if (provider === 'resend') {
      // Resend
      if (!settings.resendApiKey || !settings.resendFromEmail) {
        throw new Error('Resend not configured - missing API key or from email')
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: settings.resendFromEmail,
          to: [to],
          subject,
          html,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Resend API error: ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()
      console.log('Resend email sent successfully:', data.id)
      return { success: true, messageId: data.id }

    } else if (provider === 'gmail') {
      // Gmail via nodemailer would go here
      throw new Error('Gmail provider not yet implemented')
    } else {
      throw new Error(`Unknown email provider: ${provider}`)
    }
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

export function generateWelcomeEmail({
  firstName,
  lastName,
}: {
  firstName: string
  lastName: string
}) {
  return {
    subject: `Welcome to IntroNetwork, ${firstName}!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px;
              text-align: center;
            }
            .content {
              padding: 30px 0;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 8px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome to IntroNetwork!</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName},</p>
            <p>Thank you for joining IntroNetwork! We're excited to help you expand your professional network.</p>
            <p>Your profile has been created successfully. You can now:</p>
            <ul>
              <li>Connect with professionals in your industry</li>
              <li>Request introductions to people you'd like to meet</li>
              <li>Help others by making introductions</li>
            </ul>
            <p>Best regards,<br>The IntroNetwork Team</p>
          </div>
        </body>
      </html>
    `,
  }
}
