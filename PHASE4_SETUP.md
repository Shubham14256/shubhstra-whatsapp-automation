# Phase 4: Review Booster Logic - Setup Guide

## Overview
Phase 4 implements interactive response handling and the review booster system. The bot now handles menu selections, appointment bookings, location sharing, and smart review requests based on patient ratings.

## Changes Made

### 1. Updated Files
- `src/controllers/messageHandler.js` - Complete rewrite with advanced logic
- `src/services/whatsappService.js` - Added `sendLocationMessage()`
- `src/controllers/webhookController.js` - Added interactive response handling

### 2. No New Dependencies
All features use existing dependencies (axios, express, etc.)

## Features Implemented

### 1. Interactive Response Handling
The bot now handles both text messages AND interactive responses (list/button selections).

**Supported Interactive Types:**
- List replies (menu selections)
- Button replies (quick actions)

### 2. Menu Options

#### 📅 Book Appointment
When patient selects "Book Appointment":
- Sends booking link (placeholder for now)
- Message includes call-to-action
- Ready to integrate with Calendly, Google Calendar, etc.

#### 📍 Clinic Address
When patient selects "Clinic Address":
- Sends actual location pin (latitude/longitude)
- Includes clinic name and address
- Patient can tap to open in Google Maps
- Follows up with text message with details

### 3. Review Booster System

#### Rating Request Flow:
1. Bot asks patient to rate experience (1-5)
2. Patient replies with a number

#### Smart Response Logic:

**⭐⭐⭐⭐⭐ Rating 5 (Excellent):**
- Thanks the patient enthusiastically
- Requests Google Review with direct link
- Positive, encouraging tone

**⭐⭐⭐⭐ Rating 4 or below:**
- Apologizes for the experience
- Requests specific feedback
- Shows willingness to improve
- Prevents negative public reviews


## How It Works

### Message Flow Diagram:

```
Patient Message
    ↓
Is it TEXT or INTERACTIVE?
    ↓
┌─────────────┴─────────────┐
│                           │
TEXT                   INTERACTIVE
│                           │
├─ "Hi/Hello/Menu"         ├─ "book" → Booking Link
├─ "1-5" (Rating)          ├─ "address" → Location Pin
└─ Other → Help Text       └─ "review_request" → Rating Request
```

### Example Conversations:

#### Conversation 1: Booking Appointment
```
Patient: Hi
Bot: [Interactive Menu]
     📅 Book Appointment
     📍 Clinic Address

Patient: [Selects "Book Appointment"]
Bot: 📅 Book Your Appointment
     
     Please select your preferred date and time here:
     https://calendly.com/your-clinic/appointment
     
     We look forward to seeing you! 😊
```

#### Conversation 2: Getting Location
```
Patient: Menu
Bot: [Interactive Menu]

Patient: [Selects "Clinic Address"]
Bot: [Sends Location Pin]
     📍 Dr. Kumar's Clinic
     
     Pune, Maharashtra, India
     
     Tap on the location above to get directions via Google Maps! 🗺️
```

#### Conversation 3: Review Booster (5-Star)
```
Bot: ⭐ How was your experience?
     
     Please rate your visit on a scale of 1-5:
     5 - Excellent ⭐⭐⭐⭐⭐
     ...

Patient: 5
Bot: 🌟 Thank you so much!
     
     We're thrilled you had a great experience! 😊
     
     Would you mind sharing your experience on Google?
     Leave a review here:
     https://g.page/r/YOUR_PLACE_ID/review
```

#### Conversation 4: Review Booster (Low Rating)
```
Bot: ⭐ How was your experience?
     ...

Patient: 2
Bot: 😔 We're sorry to hear that
     
     We truly value your feedback and want to improve.
     
     Could you please tell us what went wrong?
```

## Configuration

### 1. Update Booking Link

In `src/controllers/messageHandler.js`, find `handleBookAppointment()`:

```javascript
const bookingLink = 'https://calendly.com/your-clinic/appointment'; // Replace this
```

**Options:**
- Calendly: `https://calendly.com/your-username/appointment`
- Google Calendar: Your appointment scheduling link
- Custom booking system: Your own URL

### 2. Update Clinic Coordinates

In `src/controllers/messageHandler.js`, find `handleClinicAddress()`:

```javascript
const latitude = 18.5204;  // Replace with your clinic latitude
const longitude = 73.8567; // Replace with your clinic longitude
```

**How to get coordinates:**
1. Open Google Maps
2. Right-click on your clinic location
3. Click on the coordinates to copy them
4. Update the values in the code

### 3. Update Google Review Link

In `src/controllers/messageHandler.js`, find `handleRatingResponse()`:

```javascript
const googleReviewLink = 'https://g.page/r/YOUR_GOOGLE_PLACE_ID/review';
```

**How to get your Google Review link:**
1. Go to Google Business Profile
2. Click "Get more reviews"
3. Copy the short URL (format: `https://g.page/r/XXXXX/review`)
4. Replace in the code

## Testing

### Test Interactive Responses:

1. Send "Hi" to get the menu
2. Select "📅 Book Appointment"
3. Should receive booking link

4. Send "Menu" again
5. Select "📍 Clinic Address"
6. Should receive location pin + text

### Test Review Booster:

**Method 1: Trigger manually**
Add a menu option for testing:
```javascript
{
  id: 'review_request',
  title: '⭐ Leave Review',
  description: 'Share your experience'
}
```

**Method 2: Send rating directly**
Just send a number (1-5) as a text message:
- Send "5" → Should get Google Review request
- Send "2" → Should get feedback request

## Console Output Examples

### When Patient Selects Menu Option:
```
📱 Message Details:
  From (Patient): 919999999999
  Type: interactive
  Interactive Response: {
    "list_reply": {
      "id": "book",
      "title": "📅 Book Appointment"
    }
  }
  User selected: book - 📅 Book Appointment

🎯 Processing interactive response...
Patient: 919999999999
Selected ID: book
Selected Title: 📅 Book Appointment
Doctor: Dr. Rajesh Kumar
📅 Book Appointment selected
📤 Sending message to WhatsApp API...
✅ Booking link sent successfully
```

### When Patient Sends Rating:
```
📱 Message Details:
  From (Patient): 919999999999
  Type: text
  Text: 5

🤖 Processing text message logic...
Patient: 919999999999
Message: 5
Doctor: Dr. Rajesh Kumar
⭐ Rating detected: 5/5
🌟 Excellent rating (5/5) - Requesting Google Review
📤 Sending message to WhatsApp API...
✅ Google Review request sent
```

## Advanced Features

### Location Message Format

WhatsApp location messages include:
- **Latitude/Longitude**: Exact coordinates
- **Name**: Business/location name
- **Address**: Full address text

Patients can:
- Tap to open in Google Maps
- Get turn-by-turn directions
- Save location for later

### Rating Detection

The system automatically detects numeric ratings:
- Accepts: "5", " 5 ", "5 stars" (extracts number)
- Validates: Must be 1-5
- Responds: Based on rating value

## Project Structure (Updated)

```
shubhstra-tech/
├── src/
│   ├── config/
│   │   └── supabaseClient.js
│   ├── controllers/
│   │   ├── webhookController.js    # Handles both text & interactive
│   │   └── messageHandler.js       # ✨ UPDATED - Advanced logic
│   ├── routes/
│   │   └── webhookRoutes.js
│   ├── services/
│   │   ├── doctorService.js
│   │   └── whatsappService.js      # ✨ UPDATED - Added location
│   └── app.js
├── database/
│   └── create_doctors_table.sql
├── server.js
├── .env
├── package.json
├── README.md
├── PHASE2_SETUP.md
├── PHASE3_SETUP.md
└── PHASE4_SETUP.md                 # This file
```

## Troubleshooting

### Interactive Responses Not Working
- Check webhook is receiving `type: 'interactive'` messages
- Verify `interactive.list_reply.id` or `interactive.button_reply.id` exists
- Check console logs for the interactive object structure

### Location Not Showing
- Ensure latitude/longitude are valid numbers
- WhatsApp requires both name and address fields
- Test with known coordinates first (e.g., famous landmark)

### Rating Not Detected
- Patient must send ONLY the number (1-5)
- Extra text will not be recognized as rating
- Check console logs to see what was received

### Google Review Link Not Working
- Verify the link format: `https://g.page/r/XXXXX/review`
- Test the link in a browser first
- Make sure your Google Business Profile is active

## Next Steps (Phase 5)

- [ ] Store patient information in database
- [ ] Track conversation history
- [ ] Implement appointment confirmation
- [ ] Add automated follow-up messages
- [ ] Create admin dashboard for reviews
- [ ] Add analytics and reporting

## Review Booster Best Practices

### Timing
- Send review request 24-48 hours after appointment
- Don't ask immediately after visit
- Consider patient's experience timeline

### Messaging
- Keep it friendly and appreciative
- Make it easy (direct link)
- Don't be pushy
- Thank them regardless of rating

### Handling Negative Feedback
- Respond quickly to low ratings
- Show genuine concern
- Offer to resolve issues
- Follow up personally if needed

## Security & Privacy

⚠️ **Important:**
- Don't store ratings without consent
- Respect patient privacy
- Follow HIPAA guidelines if applicable
- Secure all patient data
- Use HTTPS for all links

## Support

For WhatsApp Interactive Messages documentation:
- Interactive Messages: https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages#interactive-messages
- Location Messages: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#location-object
