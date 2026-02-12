# Phase 5: Revenue Guard (Missed Call Integration) - Setup Guide

## Overview
Phase 5 implements the Revenue Guard system - a missed call recovery mechanism. When a patient calls the clinic and the call is missed, an Android app triggers this API, which automatically sends a WhatsApp recovery message to the patient.

## Business Logic: The Revenue Guard

### The Problem
- Patient calls clinic → Call is missed
- Patient thinks: "They're too busy" or "They don't care"
- Patient calls competitor instead
- **Lost revenue opportunity**

### The Solution
- Android app detects missed call
- Triggers API endpoint with doctor + patient phone numbers
- System sends instant WhatsApp recovery message
- Patient gets menu to book appointment or mark as urgent
- **Revenue recovered!**

## Changes Made

### 1. New Files Created
- `src/controllers/missedCallController.js` - Handles missed call API
- `PHASE5_SETUP.md` - This setup guide

### 2. Updated Files
- `src/routes/webhookRoutes.js` - Added `/api/missed-call` endpoint
- `src/services/whatsappService.js` - Added 24-hour window error handling

### 3. No New Dependencies
Uses existing dependencies.

## API Endpoint

### POST `/api/missed-call`

**Purpose:** Receive missed call notifications from Android App and send recovery messages.

**Request Body:**
```json
{
  "doctor_phone_number": "919876543210",
  "patient_phone_number": "919999999999"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Recovery message sent",
  "data": {
    "doctor_name": "Dr. Rajesh Kumar",
    "clinic_name": "Heart Care Clinic",
    "patient_phone_number": "919999999999",
    "timestamp": "2026-02-09T12:30:00.000Z"
  }
}
```

**Error Responses:**

**400 - Missing Fields:**
```json
{
  "status": "error",
  "message": "Both doctor_phone_number and patient_phone_number are required"
}
```

**404 - Doctor Not Found:**
```json
{
  "status": "error",
  "message": "Doctor not found in system",
  "doctor_phone_number": "919876543210"
}
```

**500 - Send Failed:**
```json
{
  "status": "error",
  "message": "Failed to send recovery message",
  "error": "Error details"
}
```

## How It Works

### Flow Diagram:

```
Patient Calls Clinic
    ↓
Call Missed
    ↓
Android App Detects
    ↓
POST /api/missed-call
    ↓
Server Looks Up Doctor
    ↓
Doctor Found?
    ↓
Send Recovery Message
    ↓
Patient Receives Menu:
├─ 📅 Book Now
└─ 🚑 Urgent
```

### Recovery Message Format:

```
[Clinic Name]

Hello! 👋

We noticed a missed call from you at *Heart Care Clinic*.

We are currently attending other patients. Would you like to book an appointment? 👇

[View Options]
├─ 📅 Book Now
└─ 🚑 Urgent
```

## Testing the API

### Using cURL:

```bash
curl -X POST http://localhost:3000/api/missed-call \
  -H "Content-Type: application/json" \
  -d '{
    "doctor_phone_number": "919876543210",
    "patient_phone_number": "919999999999"
  }'
```

### Using Postman:

1. **Method:** POST
2. **URL:** `http://localhost:3000/api/missed-call`
3. **Headers:**
   - `Content-Type: application/json`
4. **Body (raw JSON):**
```json
{
  "doctor_phone_number": "919876543210",
  "patient_phone_number": "919999999999"
}
```

### Using JavaScript (Android App):

```javascript
const sendMissedCallNotification = async (doctorPhone, patientPhone) => {
  try {
    const response = await fetch('https://your-domain.com/api/missed-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        doctor_phone_number: doctorPhone,
        patient_phone_number: patientPhone,
      }),
    });

    const data = await response.json();
    console.log('Recovery message sent:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Usage
sendMissedCallNotification('919876543210', '919999999999');
```

## The 24-Hour Window Rule

### WhatsApp's Policy:
- Businesses can send **free-form messages** only within 24 hours of the last customer message
- After 24 hours, only **Template Messages** (pre-approved) can be sent
- Template messages have a cost per message

### How We Handle It:

**Error Code 131047:** "Message failed to send because more than 24 hours have passed since the customer last replied."

**Our Response:**
```
⚠️  ═══════════════════════════════════════════════
⚠️  24-Hour Window Closed
⚠️  ═══════════════════════════════════════════════
⚠️  Recipient: 919999999999
⚠️  Message failed to send because more than 24 hours
⚠️  have passed since the customer last replied.
⚠️  
⚠️  SOLUTION: Use a Template Message instead.
⚠️  Template messages can be sent outside the 24-hour window.
⚠️  ═══════════════════════════════════════════════
```

**What Happens:**
- Error is logged clearly
- Server doesn't crash
- Android app receives error response
- You can implement template message fallback

### Other Error Codes Handled:

**131026:** Recipient may have blocked the number or is not on WhatsApp
**131021:** Recipient phone number not registered on WhatsApp

## Console Output Examples

### Successful Recovery Message:

```
📞 Missed Call Notification Received
═══════════════════════════════════════
Doctor Phone: 919876543210
Patient Phone: 919999999999
═══════════════════════════════════════

🔍 Looking up doctor: 919876543210
✅ Doctor found: Dr. Rajesh Kumar
   Clinic: Heart Care Clinic
📤 Sending recovery message to patient: 919999999999
📤 Sending message to WhatsApp API...
Recipient: 919999999999
✅ Message sent successfully
✅ Recovery message sent successfully
═══════════════════════════════════════
```

### Doctor Not Found:

```
📞 Missed Call Notification Received
═══════════════════════════════════════
Doctor Phone: 919999999999
Patient Phone: 918888888888
═══════════════════════════════════════

🔍 Looking up doctor: 919999999999
ℹ️  No doctor found with phone: 919999999999
❌ Doctor not found: 919999999999
```

### 24-Hour Window Error:

```
📤 Sending recovery message to patient: 919999999999
❌ Error sending message to WhatsApp API:
Status: 400
Error Data: {
  "error": {
    "code": 131047,
    "message": "Message failed to send..."
  }
}

⚠️  ═══════════════════════════════════════════════
⚠️  24-Hour Window Closed
⚠️  ═══════════════════════════════════════════════
⚠️  Recipient: 919999999999
⚠️  SOLUTION: Use a Template Message instead.
⚠️  ═══════════════════════════════════════════════
```

## Android App Integration

### Requirements for Android App:

1. **Detect Missed Calls**
   - Use `CallLog.Calls` API
   - Filter by `MISSED_TYPE`
   - Get caller phone number

2. **Get Doctor's Phone Number**
   - Store in app settings
   - Or detect from SIM card

3. **Send API Request**
   - POST to `/api/missed-call`
   - Include both phone numbers
   - Handle response

### Sample Android Code (Kotlin):

```kotlin
// Detect missed call
val cursor = contentResolver.query(
    CallLog.Calls.CONTENT_URI,
    null,
    "${CallLog.Calls.TYPE} = ?",
    arrayOf(CallLog.Calls.MISSED_TYPE.toString()),
    "${CallLog.Calls.DATE} DESC"
)

cursor?.use {
    if (it.moveToFirst()) {
        val patientNumber = it.getString(
            it.getColumnIndex(CallLog.Calls.NUMBER)
        )
        
        // Send to API
        sendMissedCallNotification(doctorNumber, patientNumber)
    }
}

// API call function
fun sendMissedCallNotification(doctorPhone: String, patientPhone: String) {
    val client = OkHttpClient()
    val json = JSONObject().apply {
        put("doctor_phone_number", doctorPhone)
        put("patient_phone_number", patientPhone)
    }
    
    val body = RequestBody.create(
        "application/json".toMediaType(),
        json.toString()
    )
    
    val request = Request.Builder()
        .url("https://your-domain.com/api/missed-call")
        .post(body)
        .build()
    
    client.newCall(request).enqueue(object : Callback {
        override fun onResponse(call: Call, response: Response) {
            Log.d("MissedCall", "Recovery message sent")
        }
        
        override fun onFailure(call: Call, e: IOException) {
            Log.e("MissedCall", "Failed to send", e)
        }
    })
}
```

## Security Considerations

### 1. API Authentication (Recommended)
Add API key authentication:

```javascript
// In missedCallController.js
const API_KEY = process.env.ANDROID_APP_API_KEY;

export const handleMissedCall = async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  
  if (apiKey !== API_KEY) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized'
    });
  }
  
  // ... rest of the code
};
```

### 2. Rate Limiting
Prevent abuse by limiting requests:

```javascript
import rateLimit from 'express-rate-limit';

const missedCallLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

router.post('/api/missed-call', missedCallLimiter, handleMissedCall);
```

### 3. Phone Number Validation
Validate phone numbers before processing:

```javascript
const isValidPhone = (phone) => {
  return /^[0-9]{10,15}$/.test(phone);
};
```

## Business Metrics to Track

### Key Performance Indicators (KPIs):

1. **Recovery Rate**
   - Missed calls received
   - Recovery messages sent
   - Patients who responded

2. **Conversion Rate**
   - Recovery messages sent
   - Appointments booked
   - Revenue generated

3. **Response Time**
   - Time from missed call to message sent
   - Target: < 30 seconds

4. **Success Rate**
   - Messages sent successfully
   - Messages failed (24-hour window)
   - Messages failed (other errors)

## Project Structure (Updated)

```
shubhstra-tech/
├── src/
│   ├── config/
│   │   └── supabaseClient.js
│   ├── controllers/
│   │   ├── webhookController.js
│   │   ├── messageHandler.js
│   │   └── missedCallController.js    # ✨ NEW
│   ├── routes/
│   │   └── webhookRoutes.js           # ✨ UPDATED
│   ├── services/
│   │   ├── doctorService.js
│   │   └── whatsappService.js         # ✨ UPDATED
│   └── app.js
├── database/
│   └── create_doctors_table.sql
├── server.js
├── .env
├── package.json
├── README.md
├── PHASE2_SETUP.md
├── PHASE3_SETUP.md
├── PHASE4_SETUP.md
└── PHASE5_SETUP.md                    # This file
```

## Troubleshooting

### API Returns 404 "Doctor not found"
- Verify doctor's phone number is in database
- Check phone number format (no spaces, dashes)
- Ensure `is_active = true` in database

### Message Not Sending
- Check WhatsApp credentials in `.env`
- Verify patient's phone number is valid
- Check if patient has WhatsApp installed
- Review console logs for specific error codes

### 24-Hour Window Error
- This is expected for patients who haven't messaged in 24+ hours
- Solution: Implement Template Messages (Phase 6)
- Or: Only send to patients who messaged recently

### Android App Can't Connect
- Ensure server is accessible (not localhost)
- Use ngrok or deploy to cloud
- Check firewall settings
- Verify API endpoint URL

## Next Steps (Phase 6)

- [ ] Implement Template Messages for 24+ hour window
- [ ] Add patient database and conversation tracking
- [ ] Create analytics dashboard
- [ ] Add webhook for appointment confirmations
- [ ] Implement automated follow-ups
- [ ] Add emergency handling logic

## ROI Calculation

### Example Scenario:
- **Missed calls per day:** 10
- **Recovery rate:** 70% (7 patients respond)
- **Conversion rate:** 40% (3 book appointments)
- **Average appointment value:** ₹1,000
- **Daily recovered revenue:** ₹3,000
- **Monthly recovered revenue:** ₹90,000
- **Annual recovered revenue:** ₹10,80,000

**Investment:** Minimal (server costs + WhatsApp API costs)
**ROI:** Massive

## Support

For WhatsApp Business API documentation:
- Error Codes: https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes
- 24-Hour Window: https://developers.facebook.com/docs/whatsapp/pricing#conversations
- Template Messages: https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates
