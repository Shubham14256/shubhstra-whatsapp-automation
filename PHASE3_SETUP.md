# Phase 3: Sending Messages - Setup Guide

## Overview
Phase 3 implements WhatsApp message sending functionality. When patients send messages, the bot responds with interactive menus and helpful text messages.

## Changes Made

### 1. New Dependencies
- `axios` - HTTP client for WhatsApp Cloud API requests

### 2. New Files Created
- `src/services/whatsappService.js` - WhatsApp Cloud API integration
- `src/controllers/messageHandler.js` - Message processing logic

### 3. Updated Files
- `src/controllers/webhookController.js` - Now processes messages and sends responses
- `.env` & `.env.example` - Added WhatsApp API credentials
- `package.json` - Added axios dependency

## Installation Steps

### Step 1: Install Dependencies
```bash
npm install
```
✅ Already done! Axios has been installed.

### Step 2: Get WhatsApp Cloud API Credentials

#### A. Go to Meta for Developers
1. Visit: https://developers.facebook.com/
2. Go to your app or create a new one
3. Add "WhatsApp" product if not already added

#### B. Get Your Credentials

**1. Get PHONE_NUMBER_ID:**
- In WhatsApp > API Setup
- Look for "Phone number ID" (not the actual phone number)
- Copy the numeric ID (e.g., `123456789012345`)

**2. Get WHATSAPP_TOKEN:**
- In WhatsApp > API Setup
- Look for "Temporary access token" (for testing)
- Copy the token (starts with `EAA...`)

**For Production:**
- Generate a permanent System User Token
- Go to Business Settings > System Users
- Create a system user and generate a token with `whatsapp_business_messaging` permission

### Step 3: Update Environment Variables

Update your `.env` file with the credentials:

```env
# WhatsApp Cloud API Configuration
WHATSAPP_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PHONE_NUMBER_ID=123456789012345
```

### Step 4: Restart the Server

Stop the current server (Ctrl+C) and restart:
```bash
npm start
```

## How It Works

### Message Flow:

1. **Patient sends "Hi"** → WhatsApp Cloud API → Your webhook
2. **Server receives message** → Identifies doctor → Processes message
3. **Bot checks message content:**
   - If "Hi", "Hello", "Menu" → Sends interactive list menu
   - Otherwise → Sends help text
4. **Patient receives response** instantly

### Example Interaction:

**Patient:** Hi
**Bot:** 
```
📋 [Clinic Name]

Welcome! 👋

How can we help you today?

[View Options]
├─ 📅 Book Appointment
└─ 📍 Clinic Address
```

**Patient:** Random text
**Bot:** 
```
Thank you for your message! 😊

Type *Hi* or *Menu* to see available options.
```

## Message Types Implemented

### 1. Text Messages
Simple text responses for general communication.

```javascript
await sendTextMessage(phoneNumber, 'Your message here');
```

### 2. Interactive List Messages
Menu-style messages with selectable options (up to 10 items per section).

```javascript
await sendListMessage(
  phoneNumber,
  'Header Text',
  'Body Text',
  [
    {
      title: 'Section Title',
      rows: [
        { id: 'option1', title: 'Option 1', description: 'Description' }
      ]
    }
  ]
);
```

### 3. Button Messages (Bonus)
Quick reply buttons (max 3 buttons).

```javascript
await sendButtonMessage(
  phoneNumber,
  'Choose an option:',
  [
    { id: 'yes', title: 'Yes' },
    { id: 'no', title: 'No' }
  ]
);
```

## Testing

### Test Locally (Before Webhook Setup):

You can test the WhatsApp service functions directly:

```javascript
// test-whatsapp.js
import { sendTextMessage } from './src/services/whatsappService.js';

const testPhone = '919876543210'; // Your test number
await sendTextMessage(testPhone, 'Test message from bot!');
```

Run: `node test-whatsapp.js`

### Test with Live Webhook:

1. Set up ngrok or deploy to a server
2. Configure webhook in Meta dashboard
3. Send "Hi" from your WhatsApp to the business number
4. Bot should respond with the menu

## Console Output Examples

### When Patient Sends "Hi":
```
📨 Incoming webhook data:
═══════════════════════════════════════
{ ... webhook payload ... }
═══════════════════════════════════════

📞 Display Phone Number (Doctor's Number): 919876543210
🔍 Searching for doctor with phone: 919876543210
✅ Doctor found: Dr. Rajesh Kumar (ID: abc-123)
✅ Doctor Identified: Dr. Rajesh Kumar
   Specialization: Cardiologist
   Email: rajesh.kumar@example.com

📱 Message Details:
  From (Patient): 919999999999
  Type: text
  Timestamp: 1234567890
  Message ID: wamid.xxx
  Text: Hi

🤖 Processing message logic...
Patient: 919999999999
Message: Hi
Doctor: Dr. Rajesh Kumar
✅ Greeting detected - Sending menu...
📤 Sending message to WhatsApp API...
Recipient: 919999999999
✅ Message sent successfully
✅ Menu sent successfully
```

### When Patient Sends Other Text:
```
🤖 Processing message logic...
ℹ️  Unknown message - Sending help text...
📤 Sending message to WhatsApp API...
✅ Help message sent successfully
```

## Error Handling

The system includes comprehensive error handling:

1. **Missing Credentials:** Server won't start if WHATSAPP_TOKEN or PHONE_NUMBER_ID is missing
2. **API Errors:** Detailed error logging with status codes and error messages
3. **Patient Notification:** If an error occurs, patient receives a friendly error message
4. **Graceful Degradation:** Errors don't crash the server

## WhatsApp Cloud API Limits

### Free Tier (Test Numbers):
- 1,000 conversations per month
- Limited to 5 test phone numbers
- Temporary access tokens (24 hours)

### Production:
- Pay-per-conversation pricing
- Unlimited phone numbers
- Permanent access tokens
- Business verification required

## Project Structure (Updated)

```
shubhstra-tech/
├── src/
│   ├── config/
│   │   └── supabaseClient.js       # Supabase client
│   ├── controllers/
│   │   ├── webhookController.js    # Webhook handling
│   │   └── messageHandler.js       # Message logic ✨ NEW
│   ├── routes/
│   │   └── webhookRoutes.js        # Route definitions
│   ├── services/
│   │   ├── doctorService.js        # Doctor DB operations
│   │   └── whatsappService.js      # WhatsApp API ✨ NEW
│   └── app.js                      # Express app setup
├── database/
│   └── create_doctors_table.sql    # Database schema
├── server.js                       # Server entry point
├── .env                           # Environment variables
├── package.json
├── README.md
├── PHASE2_SETUP.md
└── PHASE3_SETUP.md                # This file
```

## Troubleshooting

### Error: "WHATSAPP_TOKEN is not defined"
- Check `.env` file has WHATSAPP_TOKEN set
- Restart the server after updating `.env`

### Error: "Invalid access token"
- Token may have expired (temporary tokens last 24 hours)
- Generate a new token from Meta dashboard
- For production, use permanent System User tokens

### Error: "Phone number not registered"
- Make sure you're sending from a test number registered in Meta dashboard
- Go to WhatsApp > API Setup > "To" field to add test numbers

### Message Not Sending
- Check console logs for detailed error messages
- Verify PHONE_NUMBER_ID is correct (numeric ID, not phone number)
- Ensure WhatsApp Business Account is active
- Check Meta dashboard for API status

### Bot Not Responding
- Verify webhook is properly configured in Meta dashboard
- Check server logs for incoming webhook data
- Ensure doctor's phone number is in database
- Test with "Hi" (case-insensitive)

## Next Steps (Phase 4)

- [ ] Handle interactive responses (button/list clicks)
- [ ] Implement appointment booking flow
- [ ] Store patient information in database
- [ ] Add conversation history tracking
- [ ] Implement clinic address sharing
- [ ] Add appointment confirmation messages

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to git
- Use permanent tokens for production
- Rotate tokens regularly
- Implement rate limiting for production
- Validate all incoming webhook data
- Use HTTPS for webhook URLs

## Support

For WhatsApp Cloud API documentation:
- Official Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
- API Reference: https://developers.facebook.com/docs/whatsapp/cloud-api/reference
- Webhooks: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks
