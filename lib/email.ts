import { prisma } from './prisma'

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

    // For now, just log the email (you can integrate with SendGrid, AWS SES, etc. later)
    console.log('Sending email:', {
      to,
      subject,
      html: html.substring(0, 100) + '...',
    })

    // TODO: Implement actual email sending with your preferred service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail')
    // sgMail.setApiKey(settings.sendgridApiKey)
    // await sgMail.send({ to, subject, html, from: settings.fromEmail })

    // Throw error in development so the dev link shows in the UI
    throw new Error('Email sending not configured - using development mode')
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
