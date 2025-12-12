# Intro Network

A web application that allows users to ask their contacts for introductions to people in their own networks.

## Features

- **Three User Types with Distinct Flows:**
  - **Referee**: Request introductions from your network
  - **1st Degree Contact**: Help your contacts by introducing them to people you know
  - **Referral**: Approve or deny introduction requests

- **Multi-Channel Communication:**
  - Email notifications via Resend
  - SMS notifications via Twilio

- **Complete User Flows:**
  - Profile creation with statement summaries
  - Contact management
  - Customizable message templates
  - Status tracking for all introductions

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Email**: Resend
- **SMS**: Twilio
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Resend API key (sign up at https://resend.com)
- Twilio account (sign up at https://twilio.com)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**

   Update the `.env` file with your actual credentials:

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/intro_network"

   # NextAuth
   NEXTAUTH_SECRET="generate-a-random-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"

   # Email Service (Resend)
   RESEND_API_KEY="re_your_resend_api_key"

   # SMS Service (Twilio)
   TWILIO_ACCOUNT_SID="your_twilio_account_sid"
   TWILIO_AUTH_TOKEN="your_twilio_auth_token"
   TWILIO_PHONE_NUMBER="+1234567890"
   ```

   **To generate NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

3. **Set up the database:**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev --name init
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## User Flows

### User Flow A: The Referee

1. **Step 1**: Input name, contact details, and statement summary (top 2 skills, most recent company, most proud achievement)
2. **Step 2**: Add 1st degree contacts to "My Contacts"
3. **Step 3**: Edit the template message personalized with contact and user names
4. **Step 4**: Send requests via email/SMS to contacts individually or all at once

### User Flow B: The 1st Degree Contact

1. **Step 1**: Receive SMS/Email from Referee and click link to `/firstdegree/[username]`
2. **Step 2**: Add contact recommendations (first name, last name, phone, email, company)
3. **Step 3**: Review template message with Referee's statement summary and send introductions

### User Flow C: The Referral

1. **Step 1**: Receive SMS/Email with customized message and click link to `/network/[username]`
2. **Step 2**: View the introduction request and click "Approve" or "Deny"

## Database Schema

### User Model
- Stores all user types (Admin, Referee, 1st Degree, Referral)
- Includes contact information and statement summary

### Contact Model
- Tracks relationships between users
- Supports 1st and 2nd degree connections

### Message Model
- Records all sent communications
- Tracks delivery status for email and SMS

### Referral Model
- Manages introduction requests
- Tracks approval/denial status
- Links Referee → 1st Degree → Referral

## API Routes

### Referee Routes
- `POST /api/referee/register` - Create new referee account
- `POST /api/referee/send-requests` - Send introduction requests to contacts
- `GET /api/referee/[id]` - Get referee profile

### Contact Routes
- `POST /api/contacts` - Add multiple contacts
- `GET /api/contacts` - Get user's contacts

### First Degree Routes
- `POST /api/firstdegree/add-referrals` - Add referral recommendations
- `POST /api/firstdegree/send-intros` - Send introduction requests to referrals

### Referral Routes
- `GET /api/referral/respond` - Get referral details
- `POST /api/referral/respond` - Approve or deny introduction

## Email Configuration

The app uses Resend for email delivery. Update the sender email in `lib/services/email.ts`:

```typescript
from: 'Intro Network <your-verified-email@yourdomain.com>'
```

You'll need to verify your domain with Resend or use their development email for testing.

## SMS Configuration

Twilio is used for SMS delivery. Make sure to:
1. Verify your Twilio phone number
2. For production, verify recipient phone numbers or upgrade your Twilio account

## Development

### Database Management

View your database:
```bash
npx prisma studio
```

Reset the database:
```bash
npx prisma migrate reset
```

Create a new migration:
```bash
npx prisma migrate dev --name your_migration_name
```

### Type Generation

After schema changes, regenerate Prisma client:
```bash
npx prisma generate
```

## Production Deployment

### Environment Variables

Ensure all production environment variables are set:
- Use a production PostgreSQL database
- Generate a secure NEXTAUTH_SECRET
- Set NEXTAUTH_URL to your production domain
- Use production API keys for Resend and Twilio

### Build

```bash
npm run build
npm start
```

### Recommended Platforms

- **Vercel** (recommended for Next.js)
- **Railway** (for database)
- **Fly.io**
- **DigitalOcean App Platform**

## Project Structure

```
intro-network/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth configuration
│   │   ├── contacts/     # Contact management
│   │   ├── firstdegree/  # 1st degree flow APIs
│   │   ├── referee/      # Referee flow APIs
│   │   └── referral/     # Referral flow APIs
│   ├── firstdegree/      # 1st degree contact pages
│   ├── network/          # Referral pages
│   ├── referee/          # Referee pages
│   └── page.tsx          # Home page
├── lib/
│   ├── services/         # Email and SMS services
│   │   ├── email.ts
│   │   └── sms.ts
│   ├── auth.ts           # NextAuth configuration
│   └── prisma.ts         # Prisma client
├── prisma/
│   └── schema.prisma     # Database schema
└── .env                  # Environment variables
```

## Future Enhancements

- [ ] Dashboard for each user type showing status of introductions
- [ ] Admin panel for managing users
- [ ] Notification system for real-time updates
- [ ] In-app messaging between connected users
- [ ] Analytics and tracking
- [ ] Mobile app
- [ ] Export contacts to CRM
- [ ] Recommendation algorithm for suggested connections

## License

MIT
