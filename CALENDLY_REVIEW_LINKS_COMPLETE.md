# ✅ Calendly & Review Links Feature - Complete

## Overview
Added Calendly appointment booking and Google Review link features to the dashboard and bot.

## Changes Made

### 1. Database Migration
**File:** `database/add_calendly_review_links.sql`

Added two new columns to `clinic_config` table:
- `calendly_link` (TEXT) - Calendly appointment booking URL
- `review_link` (TEXT) - Google Review or feedback URL

**Run this SQL in Supabase:**
```sql
ALTER TABLE clinic_config 
ADD COLUMN IF NOT EXISTS calendly_link TEXT,
ADD COLUMN IF NOT EXISTS review_link TEXT;
```

### 2. Dashboard Settings Page
**File:** `shubhstra-dashboard/app/settings/page.tsx`

Added new section: "Appointment & Review Links" with:
- Calendly Appointment Link input field
- Google Review / Feedback Link input field
- Helpful instructions for getting these links
- Auto-save to database with other settings

**Features:**
- URL validation (type="url")
- Placeholder examples
- Info box with setup instructions
- Saves to `clinic_config` table

### 3. Bot Logic Updates
**File:** `src/controllers/messageHandler.js`

#### A. Book Appointment Handler (`handleBookAppointment`)
**Before:**
- Sent hardcoded placeholder link

**After:**
- Fetches `calendly_link` from database
- If link exists → Sends Calendly link
- If link empty → Fallback message with clinic phone number

**Example Messages:**

With Calendly Link:
```
📅 Book Your Appointment

Please select your preferred date and time here:

https://calendly.com/your-clinic/appointment

We look forward to seeing you! 😊
```

Without Link (Fallback):
```
📅 Book Your Appointment

Please contact us directly to book your appointment:

📞 Phone: 919545816728

Our team will help you schedule a convenient time. 😊
```

#### B. Rating Response Handler (`handleRatingResponse`)
**Before:**
- Sent hardcoded placeholder Google Review link

**After:**
- Fetches `review_link` from database
- If 5-star rating + link exists → Sends review link
- If 5-star rating + no link → Sends thank you message
- If 1-4 stars → Requests feedback (unchanged)

**Example Messages:**

5-Star with Review Link:
```
🌟 Thank you so much!

We're thrilled you had a great experience! 😊

Would you mind sharing your experience on Google? It helps us serve more patients like you.

Leave a review here:
https://g.page/r/YOUR_PLACE_ID/review

Thank you for your support! 🙏
```

5-Star without Link (Fallback):
```
🌟 Thank you so much!

We're thrilled you had a great experience! 😊

Thank you for your wonderful feedback! 🙏
```

## How to Use

### Step 1: Run Database Migration
```sql
-- In Supabase SQL Editor
ALTER TABLE clinic_config 
ADD COLUMN IF NOT EXISTS calendly_link TEXT,
ADD COLUMN IF NOT EXISTS review_link TEXT;
```

### Step 2: Configure Links in Dashboard
1. Login to dashboard
2. Go to Settings page
3. Scroll to "Appointment & Review Links" section
4. Enter your Calendly link (optional)
5. Enter your Google Review link (optional)
6. Click "Save All Settings"

### Step 3: Get Your Links

#### Calendly Link:
1. Sign up at https://calendly.com
2. Create an event type (e.g., "Consultation")
3. Copy your booking page URL
4. Example: `https://calendly.com/dr-shubham/consultation`

#### Google Review Link:
1. Search your business on Google Maps
2. Click "Share" button
3. Click "Copy link"
4. Or use format: `https://g.page/r/YOUR_GOOGLE_PLACE_ID/review`

### Step 4: Test the Bot
1. Send "Hi" to WhatsApp bot
2. Select "📅 Book Appointment" → Should receive Calendly link
3. Send rating "5" → Should receive Review link

## Fallback Behavior

### No Calendly Link
Bot sends: "Please contact us directly at [phone number]"

### No Review Link
Bot sends: "Thank you for your wonderful feedback!"

## Multi-Language Support

Both features support English and Marathi:
- English: Default
- Marathi: If patient's `preferred_language = 'mr'`

## Database Schema

```sql
-- clinic_config table structure
CREATE TABLE clinic_config (
  id UUID PRIMARY KEY,
  doctor_id UUID REFERENCES doctors(id),
  opening_time TIME,
  closing_time TIME,
  welcome_message TEXT,
  holidays TEXT[],
  calendly_link TEXT,      -- NEW
  review_link TEXT,        -- NEW
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

## Testing Checklist

- [ ] Run database migration
- [ ] Restart backend server
- [ ] Login to dashboard
- [ ] Add Calendly link in Settings
- [ ] Add Review link in Settings
- [ ] Save settings successfully
- [ ] Send "Hi" to bot
- [ ] Click "Book Appointment" → Verify Calendly link received
- [ ] Send "5" rating → Verify Review link received
- [ ] Test fallback: Remove links from settings
- [ ] Send "Hi" → Click "Book Appointment" → Verify fallback message
- [ ] Send "5" rating → Verify thank you message (no link)

## Files Modified

1. `database/add_calendly_review_links.sql` - NEW
2. `shubhstra-dashboard/app/settings/page.tsx` - UPDATED
3. `src/controllers/messageHandler.js` - UPDATED
4. `CALENDLY_REVIEW_LINKS_COMPLETE.md` - NEW (this file)

## Next Steps

1. Run the SQL migration
2. Restart servers
3. Configure your links in dashboard
4. Test with real patients

## Notes

- Links are optional - bot works with or without them
- Each doctor can have their own links (multi-tenancy supported)
- Links are fetched dynamically from database per doctor
- No hardcoded URLs in code anymore
- Graceful fallback if links not configured

---

**Status:** ✅ Complete and Ready for Testing
**Date:** February 12, 2026
