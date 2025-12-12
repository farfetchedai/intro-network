# API Reference

Complete reference for all API endpoints in the Intro Network application.

## Authentication

All authenticated endpoints require a valid session token from NextAuth.js.

**Get session:**
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const session = await getServerSession(authOptions)
```

---

## Referee Endpoints

### Register New Referee

**Endpoint:** `POST /api/referee/register`

**Description:** Creates a new referee account with profile information.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "statementSummary": "Product Management & Growth Marketing at TechCo...",
  "password": "optional-password"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "clxxx...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

**Validation:**
- `firstName`: Required, min 1 character
- `lastName`: Required, min 1 character
- `email`: Optional, must be valid email
- `phone`: Optional, min 10 characters
- `statementSummary`: Required, min 10 characters
- `password`: Optional, min 6 characters if provided

---

### Get Referee Profile

**Endpoint:** `GET /api/referee/[id]`

**Description:** Retrieves referee profile information.

**Response:**
```json
{
  "referee": {
    "id": "clxxx...",
    "firstName": "John",
    "lastName": "Doe",
    "statementSummary": "Product Management & Growth Marketing...",
    "userType": "REFEREE"
  }
}
```

---

### Send Introduction Requests

**Endpoint:** `POST /api/referee/send-requests`

**Description:** Sends introduction requests to 1st degree contacts via email and/or SMS.

**Authentication:** Required

**Request Body:**
```json
{
  "contactIds": ["contact-id-1", "contact-id-2"],
  "customMessage": "Hi {contactName}, I'm reaching out...",
  "sendViaEmail": true,
  "sendViaSms": false
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "contactId": "contact-id-1",
      "emailSent": true,
      "smsSent": false
    }
  ]
}
```

---

## Contact Endpoints

### Add Contacts

**Endpoint:** `POST /api/contacts`

**Description:** Adds multiple contacts to the authenticated user's network.

**Authentication:** Required

**Request Body:**
```json
{
  "contacts": [
    {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "company": "Tech Corp"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "contacts": [
    {
      "id": "clxxx...",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "company": "Tech Corp",
      "degreeType": "FIRST_DEGREE"
    }
  ]
}
```

**Validation:**
- `firstName`: Required, min 1 character
- `lastName`: Required, min 1 character
- `email`: Optional, must be valid email
- `phone`: Optional, min 10 characters
- `company`: Optional

---

### Get Contacts

**Endpoint:** `GET /api/contacts`

**Description:** Retrieves all contacts for the authenticated user.

**Authentication:** Required

**Response:**
```json
{
  "contacts": [
    {
      "id": "clxxx...",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "company": "Tech Corp",
      "degreeType": "FIRST_DEGREE",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## First Degree Contact Endpoints

### Add Referrals

**Endpoint:** `POST /api/firstdegree/add-referrals`

**Description:** Adds referral recommendations from a 1st degree contact.

**Request Body:**
```json
{
  "refereeId": "referee-user-id",
  "firstDegreeEmail": "connector@example.com",
  "firstDegreePhone": "+1234567890",
  "referrals": [
    {
      "firstName": "Bob",
      "lastName": "Johnson",
      "email": "bob@example.com",
      "phone": "+1234567890",
      "company": "Startup Inc"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "firstDegreeUserId": "clxxx...",
  "referrals": [
    {
      "referralUser": {
        "id": "clxxx...",
        "firstName": "Bob",
        "lastName": "Johnson"
      },
      "contact": {
        "id": "clxxx...",
        "degreeType": "SECOND_DEGREE"
      }
    }
  ]
}
```

---

### Send Introductions

**Endpoint:** `POST /api/firstdegree/send-intros`

**Description:** Sends introduction requests to referrals.

**Request Body:**
```json
{
  "refereeId": "referee-user-id",
  "firstDegreeUserId": "first-degree-user-id",
  "referralIds": ["referral-id-1", "referral-id-2"],
  "sendViaEmail": true,
  "sendViaSms": false
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "referralId": "referral-id-1",
      "referralRecordId": "clxxx...",
      "emailSent": true,
      "smsSent": false
    }
  ]
}
```

---

## Referral Endpoints

### Get Referral Details

**Endpoint:** `GET /api/referral/respond`

**Description:** Retrieves details about a specific referral request.

**Query Parameters:**
- `referralId`: The ID of the referral user
- `refereeId`: The ID of the referee
- `firstDegreeId`: The ID of the 1st degree contact

**Example:**
```
GET /api/referral/respond?referralId=xxx&refereeId=yyy&firstDegreeId=zzz
```

**Response:**
```json
{
  "referral": {
    "id": "clxxx...",
    "status": "PENDING",
    "referee": {
      "id": "xxx",
      "firstName": "John",
      "lastName": "Doe",
      "statementSummary": "Product Management & Growth Marketing..."
    },
    "firstDegree": {
      "id": "zzz",
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "referral": {
      "id": "yyy",
      "firstName": "Bob",
      "lastName": "Johnson"
    }
  }
}
```

---

### Respond to Referral

**Endpoint:** `POST /api/referral/respond`

**Description:** Approve or deny an introduction request.

**Request Body:**
```json
{
  "referralId": "referral-record-id",
  "response": "APPROVED"
}
```

**Valid Responses:**
- `APPROVED`: Accept the introduction
- `DENIED`: Decline the introduction

**Response:**
```json
{
  "success": true,
  "referral": {
    "id": "clxxx...",
    "status": "APPROVED",
    "approvedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Introduction approved"
}
```

**Error Responses:**

*Referral not found:*
```json
{
  "error": "Referral not found"
}
```

*Already responded:*
```json
{
  "error": "Referral already responded to"
}
```

---

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "Error message",
  "details": [] // Optional, for validation errors
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad request (validation error)
- `401`: Unauthorized (authentication required)
- `404`: Resource not found
- `500`: Internal server error

**Validation Error Example:**
```json
{
  "error": "Invalid data",
  "details": [
    {
      "code": "too_small",
      "minimum": 1,
      "path": ["firstName"],
      "message": "String must contain at least 1 character(s)"
    }
  ]
}
```

---

## Data Types

### UserType Enum
```typescript
enum UserType {
  ADMIN
  REFEREE
  FIRST_DEGREE
  REFERRAL
}
```

### ReferralStatus Enum
```typescript
enum ReferralStatus {
  PENDING
  APPROVED
  DENIED
}
```

### MessageType Enum
```typescript
enum MessageType {
  FIRST_DEGREE_REQUEST
  REFERRAL_REQUEST
}
```

---

## Rate Limiting

Currently not implemented. For production, consider implementing:
- Rate limiting per IP address
- Rate limiting per user
- CAPTCHA for public endpoints

---

## Testing Examples

### Using cURL

**Register a referee:**
```bash
curl -X POST http://localhost:3000/api/referee/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "statementSummary": "Product Manager with 5 years experience..."
  }'
```

**Add contacts (requires authentication):**
```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "contacts": [{
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com"
    }]
  }'
```

### Using JavaScript/TypeScript

**Register a referee:**
```typescript
const response = await fetch('/api/referee/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    statementSummary: 'Product Manager...'
  })
})

const data = await response.json()
```

**Add contacts:**
```typescript
const response = await fetch('/api/contacts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contacts: [{
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com'
    }]
  })
})

const data = await response.json()
```

---

## Webhooks (Future Enhancement)

Consider adding webhooks for:
- Introduction approved/denied
- New referral received
- Message delivered/failed

Example webhook payload:
```json
{
  "event": "referral.approved",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "referralId": "clxxx...",
    "refereeId": "xxx",
    "status": "APPROVED"
  }
}
```
