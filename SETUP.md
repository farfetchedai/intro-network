# Quick Setup Guide

## Step-by-Step Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy and update the `.env` file with your credentials:

#### Database Setup

**Option A: Use Prisma's Local Database (Easiest for Development)**
```bash
npx prisma dev
```
This will start a local PostgreSQL database. The DATABASE_URL is already configured in `.env`.

**Option B: Use Your Own PostgreSQL Database**
Update DATABASE_URL in `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/intro_network"
```

#### NextAuth Secret

Generate a secret key:
```bash
openssl rand -base64 32
```

Update in `.env`:
```env
NEXTAUTH_SECRET="paste-generated-secret-here"
```

#### Resend API Key (Email Service)

1. Sign up at https://resend.com
2. Get your API key from the dashboard
3. Update in `.env`:
```env
RESEND_API_KEY="re_your_api_key_here"
```

For testing, you can use Resend's test mode which sends to onboarding@resend.dev

#### Twilio Setup (SMS Service)

1. Sign up at https://twilio.com/try-twilio
2. Get your Account SID, Auth Token, and phone number
3. Update in `.env`:
```env
TWILIO_ACCOUNT_SID="your_account_sid"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"
```

For testing, Twilio trial accounts can send to verified numbers only.

### 3. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init
```

### 4. Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Testing the Application

### Test Flow 1: Referee Creates Request

1. Go to http://localhost:3000
2. Click "Get Started"
3. Fill out the Referee form:
   - Add your name and contact details
   - Write a statement summary
4. Add contacts (use your own email/phone for testing)
5. Customize the message
6. Click "Ask Everyone"

### Test Flow 2: 1st Degree Contact Responds

1. Check your email/SMS for the invitation
2. Click the link (e.g., `/firstdegree/[user-id]`)
3. Add your information
4. Add people to introduce (use your own contact info for testing)
5. Send introductions

### Test Flow 3: Referral Approves/Denies

1. Check your email/SMS for the introduction request
2. Click the link (e.g., `/network/[user-id]`)
3. Review the introduction
4. Click "Approve" or "Decline"

## Troubleshooting

### Database Issues

**Error: Can't reach database server**
- Make sure PostgreSQL is running
- Check DATABASE_URL in .env
- Try: `npx prisma db push` to sync schema

**Reset database:**
```bash
npx prisma migrate reset
```

### Email Not Sending

**Resend Issues:**
- Verify your API key is correct
- Check Resend dashboard for logs
- For production, verify your domain
- For testing, check spam folder

**Update sender email:**
Edit `lib/services/email.ts` line 11:
```typescript
from: 'Your Name <your-email@yourdomain.com>'
```

### SMS Not Sending

**Twilio Issues:**
- Verify Account SID and Auth Token
- Check Twilio phone number is correct (include +1)
- For trial accounts, verify recipient numbers in Twilio console
- Check Twilio dashboard for error logs

**Disable SMS for testing:**
In the API routes, set `sendViaSms: false`

### NextAuth Errors

**Error: NEXTAUTH_SECRET missing**
- Generate a secret: `openssl rand -base64 32`
- Add to .env file

**Error: NEXTAUTH_URL not set**
- Add to .env: `NEXTAUTH_URL="http://localhost:3000"`

## Optional: View Database

Open Prisma Studio to view/edit database:
```bash
npx prisma studio
```

This opens a UI at http://localhost:5555

## Production Checklist

Before deploying to production:

- [ ] Set up production PostgreSQL database
- [ ] Generate new NEXTAUTH_SECRET (don't reuse development one)
- [ ] Update NEXTAUTH_URL to production domain
- [ ] Verify domain with Resend for email
- [ ] Upgrade Twilio account (remove trial limitations)
- [ ] Update sender email in `lib/services/email.ts`
- [ ] Run `npm run build` to test production build
- [ ] Set up monitoring/error tracking (Sentry, etc.)
- [ ] Configure CORS if needed
- [ ] Set up rate limiting for API routes

## Need Help?

Check the main README.md for more detailed information about:
- Project structure
- API routes
- Database schema
- User flows
