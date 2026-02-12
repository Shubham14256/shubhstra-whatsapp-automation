# ✅ Welcome Message Moved to Doctors Table

## Overview
Moved `welcome_message` from `clinic_config` table to `doctors` table so each doctor has their own personalized welcome message.

## Why This Change?
- Welcome message is doctor-specific, not clinic configuration
- Simplifies data structure (doctor identity in one place)
- Better multi-tenancy support (each doctor has unique message)
- Reduces database joins when fetching doctor info

## Changes Made

### 1. Database Migration
**File:** `database/move_welcome_message_to_doctors.sql`

**Actions:**
1. Add `welcome_message` column to `doctors` table
2. Migrate existing messages from `clinic_config` to `doctors`
3. Set default message for doctors without one

**Run this SQL in Supabase:**
```sql
-- Add column
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS welcome_message TEXT;

-- Migrate existing data
UPDATE doctors d
SET welcome_message = cc.welcome_message
FROM clinic_config cc
WHERE d.id = cc.doctor_id
AND cc.welcome_message IS NOT NULL;

-- Set default for empty ones
UPDATE doctors 
SET welcome_message = 'Welcome to our clinic! 👋 How can we help you today?'
WHERE welcome_message IS NULL OR welcome_message = '';
```

### 2. Settings Page Updated
**File:** `shubhstra-dashboard/app/settings/page.tsx`

**Changes:**
- Moved Welcome Message field from "Configuration" section to "Clinic Identity" section
- Now fetches from `doctors.welcome_message` instead of `clinic_config.welcome_message`
- Saves to `doctors` table instead of `clinic_config` table
- Field appears right after Consultation Fee

**UI Layout:**
```
Clinic Identity Section:
├── Clinic Name
├── Clinic Address
├── Consultation Fee
└── Welcome Message ← MOVED HERE

Clinic Configuration Section:
├── Opening Time
├── Closing Time
└── Holidays
```

### 3. Bot Logic Updated
**File:** `src/controllers/messageHandler.js`

**Function:** `sendMainMenu()`

**Before:**
```javascript
const bodyText = language === 'mr'
  ? `नमस्कार! 👋\n\nआम्ही आपली कशी मदत करू शकतो?`
  : `Welcome! 👋\n\nHow can we help you today?`;
```

**After:**
```javascript
const welcomeMessage = doctor.welcome_message || 
  (language === 'mr' ? 'नमस्कार! 👋\n\nआम्ही आपली कशी मदत करू शकतो?' : 'Welcome! 👋\n\nHow can we help you today?');

const bodyText = welcomeMessage;
```

**Benefits:**
- Uses doctor's custom welcome message from database
- Falls back to default if not set
- Supports multi-language fallback

## Database Schema Changes

### Before:
```sql
-- doctors table
CREATE TABLE doctors (
  id UUID,
  name VARCHAR(255),
  clinic_name VARCHAR(255),
  clinic_address TEXT,
  consultation_fee NUMERIC,
  -- No welcome_message
);

-- clinic_config table
CREATE TABLE clinic_config (
  id UUID,
  doctor_id UUID,
  opening_time TIME,
  closing_time TIME,
  welcome_message TEXT,  -- Was here
  holidays TEXT[]
);
```

### After:
```sql
-- doctors table
CREATE TABLE doctors (
  id UUID,
  name VARCHAR(255),
  clinic_name VARCHAR(255),
  clinic_address TEXT,
  consultation_fee NUMERIC,
  welcome_message TEXT  -- NOW HERE ✅
);

-- clinic_config table
CREATE TABLE clinic_config (
  id UUID,
  doctor_id UUID,
  opening_time TIME,
  closing_time TIME,
  -- welcome_message removed
  holidays TEXT[],
  calendly_link TEXT,
  review_link TEXT
);
```

## Data Flow

### Settings Page Save:
1. User edits welcome message in Settings
2. Frontend saves to `doctors.welcome_message`
3. Database updated via Supabase client

### Bot Greeting:
1. Patient sends "Hi" to WhatsApp
2. Webhook identifies doctor
3. Doctor object includes `welcome_message`
4. Bot sends custom welcome message
5. If empty, uses default fallback

## Testing Checklist

- [ ] Run database migration SQL
- [ ] Verify `welcome_message` column exists in `doctors` table
- [ ] Restart backend server
- [ ] Restart frontend server
- [ ] Login to dashboard
- [ ] Go to Settings page
- [ ] Verify Welcome Message field is in "Clinic Identity" section
- [ ] Update welcome message
- [ ] Save settings successfully
- [ ] Send "Hi" to bot
- [ ] Verify custom welcome message is received
- [ ] Test with empty welcome message (should use fallback)

## Migration Steps

### Step 1: Backup (Optional but Recommended)
```sql
-- Backup existing welcome messages
CREATE TABLE welcome_message_backup AS
SELECT doctor_id, welcome_message 
FROM clinic_config 
WHERE welcome_message IS NOT NULL;
```

### Step 2: Run Migration
```sql
-- Add column and migrate data
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS welcome_message TEXT;

UPDATE doctors d
SET welcome_message = cc.welcome_message
FROM clinic_config cc
WHERE d.id = cc.doctor_id;
```

### Step 3: Verify
```sql
-- Check all doctors have welcome messages
SELECT name, 
       CASE WHEN welcome_message IS NOT NULL 
            THEN '✅ Has message' 
            ELSE '❌ Missing' 
       END as status
FROM doctors 
WHERE is_active = true;
```

### Step 4: Restart Servers
```bash
# Backend
Ctrl+C (stop current server)
node server.js

# Frontend
Ctrl+C (stop current server)
npm run dev
```

## Files Modified

1. `database/move_welcome_message_to_doctors.sql` - NEW
2. `shubhstra-dashboard/app/settings/page.tsx` - UPDATED
3. `src/controllers/messageHandler.js` - UPDATED
4. `WELCOME_MESSAGE_MOVED_TO_DOCTORS.md` - NEW (this file)

## Benefits

✅ **Better Organization:** Doctor identity data in one table
✅ **Simpler Queries:** No join needed to get doctor + welcome message
✅ **Multi-Tenancy:** Each doctor has unique welcome message
✅ **Easier Maintenance:** One place to manage doctor info
✅ **Performance:** Fewer database queries

## Rollback (If Needed)

If you need to revert:
```sql
-- Move back to clinic_config
UPDATE clinic_config cc
SET welcome_message = d.welcome_message
FROM doctors d
WHERE cc.doctor_id = d.id;

-- Remove from doctors
ALTER TABLE doctors DROP COLUMN welcome_message;
```

---

**Status:** ✅ Complete and Ready for Testing
**Date:** February 12, 2026
