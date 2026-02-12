# ✅ TASK 14 COMPLETE - Individual WhatsApp Credentials Per Doctor

## 🎯 OBJECTIVE
Implement individual WhatsApp credentials per doctor to avoid shared 1000 free conversation limit.

---

## ✅ COMPLETED WORK

### 1. Database Schema ✅
**File:** `database/add_individual_whatsapp_credentials.sql`

**Columns Added:**
- `whatsapp_phone_number_id` VARCHAR(50)
- `whatsapp_business_account_id` VARCHAR(50)
- `whatsapp_access_token` TEXT
- `whatsapp_token_expires_at` TIMESTAMP WITH TIME ZONE

**Status:** Migration file ready to run in Supabase

---

### 2. WhatsApp Service Refactored ✅
**File:** `src/services/whatsappService.js`

**Changes:**
- ✅ Added `getCredentials(doctor)` function
- ✅ All 7 functions now accept optional `doctor` parameter
- ✅ Automatic fallback to master credentials if doctor credentials missing
- ✅ Dynamic API URL based on doctor's `phone_number_id`

**Functions Updated:**
1. `sendMessage(to, data, doctor)`
2. `sendTextMessage(to, text, doctor)`
3. `sendListMessage(to, headerText, bodyText, sections, doctor)`
4. `sendButtonMessage(to, bodyText, buttons, doctor)`
5. `sendLocationMessage(to, latitude, longitude, name, address, doctor)`
6. `sendTemplateMessage(to, templateName, languageCode, components, doctor)`
7. `sendDocument(to, filepath, filename, caption, doctor)`

---

### 3. Message Handler Updated ✅
**File:** `src/controllers/messageHandler.js`

**ALL WhatsApp service calls updated to pass doctor parameter:**

#### Main Message Handlers:
- ✅ `handleIncomingMessage()` - All sendTextMessage calls updated
- ✅ `handleInteractiveResponse()` - All sendTextMessage calls updated
- ✅ `handleImageMessage()` - All sendTextMessage calls updated

#### Menu Functions:
- ✅ `sendMainMenu()` - sendListMessage + sendTextMessage updated
- ✅ `handleBookAppointment()` - sendTextMessage updated
- ✅ `handleClinicAddress()` - sendLocationMessage + sendTextMessage updated
- ✅ `handleReviewRequest()` - sendTextMessage updated
- ✅ `handleRatingResponse()` - sendTextMessage updated (both branches)

#### Social & Referral:
- ✅ `handleSocialMediaRequest()` - All sendTextMessage calls updated
- ✅ `handleReferralRequest()` - All sendTextMessage calls updated

#### Doctor Commands:
- ✅ `handleDoctorSearch()` - All sendTextMessage calls updated
- ✅ `handleDoctorQueue()` - All sendTextMessage calls updated
- ✅ `handleDoctorReport()` - All sendTextMessage + sendDocument calls updated
- ✅ `handleDoctorNetwork()` - All sendTextMessage calls updated

#### Utility Functions:
- ✅ `sendErrorMessage()` - Updated to accept doctor parameter

**Total Function Calls Updated:** 50+ calls across entire file

---

## 🔧 HOW IT WORKS

### Credential Priority System:

```javascript
// In whatsappService.js
const getCredentials = (doctor) => {
  // Priority 1: Doctor-specific credentials
  if (doctor?.whatsapp_access_token && doctor?.whatsapp_phone_number_id) {
    console.log(`🔑 Using doctor-specific credentials for: ${doctor.name}`);
    return {
      token: doctor.whatsapp_access_token,
      phoneNumberId: doctor.whatsapp_phone_number_id,
    };
  }

  // Priority 2: Fallback to master account
  console.log('🔑 Using master account credentials from .env');
  return {
    token: process.env.WHATSAPP_TOKEN,
    phoneNumberId: process.env.PHONE_NUMBER_ID,
  };
};
```

### Message Flow:

```
Patient sends message
    ↓
Webhook receives (display_phone_number)
    ↓
Find doctor in database
    ↓
Doctor object passed to messageHandler
    ↓
messageHandler calls whatsappService with doctor
    ↓
whatsappService checks doctor credentials
    ├─ YES → Use doctor's credentials (their free quota)
    └─ NO  → Use master credentials (fallback)
    ↓
Send response using selected credentials
```

---

## 📋 NEXT STEPS FOR USER

### Step 1: Run Database Migration (5 minutes)
```sql
-- In Supabase SQL Editor
-- Copy and paste from: database/add_individual_whatsapp_credentials.sql

ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS whatsapp_business_account_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_token_expires_at TIMESTAMP WITH TIME ZONE;
```

### Step 2: Add Doctor Credentials (5 minutes)

**Get credentials from Meta Dashboard:**
1. Go to: https://developers.facebook.com/apps
2. Select doctor's app
3. WhatsApp → API Setup
4. Copy: Phone Number ID, Business Account ID, Access Token

**Update in Supabase:**
```sql
UPDATE doctors 
SET 
  whatsapp_phone_number_id = '984043858130065',
  whatsapp_business_account_id = '1200553978900975',
  whatsapp_access_token = 'YOUR_TOKEN_HERE',
  whatsapp_token_expires_at = NOW() + INTERVAL '60 days'
WHERE phone_number = '919545816728';
```

### Step 3: Restart Server (1 minute)
```powershell
# Stop server
Stop-Process -Name node -Force

# Start server
C:\Users\Shree\AppData\Local\nvm\v20.11.0\node.exe server.js
```

### Step 4: Test (2 minutes)
1. Send "Hi" to 9545816728
2. Check logs for: `🔑 Using doctor-specific credentials for: Dr. [Name]`
3. Verify response comes from doctor's account
4. Check Meta Dashboard - conversation count should increase

### Step 5: Verify in Database
```sql
-- Check which doctors have credentials
SELECT 
  name,
  phone_number,
  CASE 
    WHEN whatsapp_access_token IS NOT NULL THEN '✅ Configured'
    ELSE '❌ Missing'
  END as status
FROM doctors
ORDER BY name;
```

---

## 💰 COST SAVINGS

### Before (Single Master API):
- 10 doctors × 100 conversations each = 1000 total
- Free tier: 1000 conversations
- Cost: $0 (but limit exhausted in 1 day)
- Next 1000: ~$50/month

### After (Individual Credentials):
- Doctor 1: 100 conversations (uses their 1000 free quota)
- Doctor 2: 100 conversations (uses their 1000 free quota)
- ...
- Doctor 10: 100 conversations (uses their 1000 free quota)
- Total cost: $0
- Each doctor has 900 conversations remaining

**Savings: 100% of API costs!**

---

## 🎯 SUCCESS CRITERIA

- ✅ Database migration file created
- ✅ whatsappService.js refactored with getCredentials()
- ✅ All 50+ WhatsApp service calls in messageHandler.js updated
- ✅ Automatic fallback to master credentials
- ✅ No syntax errors (verified with getDiagnostics)
- ⏳ Database migration needs to be run
- ⏳ Doctor credentials need to be added
- ⏳ Server needs to be restarted
- ⏳ Testing needs to be performed

---

## 📊 IMPLEMENTATION STATUS

**Code Changes:** 100% Complete ✅
**Database Setup:** Ready to run ⏳
**Testing:** Pending user action ⏳

**Total Time to Complete:** ~15 minutes of user work remaining

---

## 🔍 VERIFICATION CHECKLIST

After completing the steps above, verify:

- [ ] Database has new columns
- [ ] Doctor credentials stored in database
- [ ] Server logs show "Using doctor-specific credentials"
- [ ] Messages sent from doctor's account
- [ ] Doctor's free quota being used
- [ ] Fallback works if credentials missing
- [ ] No errors in console

---

## 📝 NOTES

1. **Gradual Migration:** Add doctor credentials one by one
2. **No Breaking Changes:** Existing setup continues to work with fallback
3. **Token Expiry:** Temporary tokens expire in 60 days, need refresh
4. **Each Doctor = Separate Meta App:** Each doctor needs their own Meta Developer account
5. **Monitoring:** Check token expiry dates regularly

---

**Implementation Date:** February 12, 2026
**Status:** Code Complete - Ready for Deployment
**Next Action:** User to run database migration and add credentials
