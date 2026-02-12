# 🚀 OPTION B IMPLEMENTATION - Individual Credentials Per Doctor

## ✅ COMPLETED CHANGES

### 1. Database Schema ✅
**File:** `database/add_individual_whatsapp_credentials.sql`

**Run this SQL in Supabase:**
```sql
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS whatsapp_business_account_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_token_expires_at TIMESTAMP WITH TIME ZONE;
```

### 2. WhatsApp Service Refactored ✅
**File:** `src/services/whatsappService.js`

**Changes:**
- ✅ Added `getCredentials(doctor)` function
- ✅ All functions now accept optional `doctor` parameter
- ✅ Automatic fallback to master credentials if doctor credentials missing
- ✅ Dynamic API URL based on doctor's `phone_number_id`

**Functions Updated:**
- `sendMessage(to, data, doctor)`
- `sendTextMessage(to, text, doctor)`
- `sendListMessage(to, headerText, bodyText, sections, doctor)`
- `sendButtonMessage(to, bodyText, buttons, doctor)`
- `sendLocationMessage(to, latitude, longitude, name, address, doctor)`
- `sendTemplateMessage(to, templateName, languageCode, components, doctor)`
- `sendDocument(to, filepath, filename, caption, doctor)`

---

## ⚠️ REMAINING WORK

### 3. Update messageHandler.js Calls

**Current Status:** Partially updated

**What Needs to be Done:**
All `sendTextMessage`, `sendListMessage`, `sendLocationMessage` calls in `messageHandler.js` need to pass the `doctor` object as the last parameter.

**Example:**
```javascript
// BEFORE
await sendTextMessage(from, message);

// AFTER
await sendTextMessage(from, message, doctor);
```

**Files to Update:**
- `src/controllers/messageHandler.js` - Add `, doctor` to all WhatsApp service calls

---

## 📋 HOW TO ADD DOCTOR CREDENTIALS

### Method 1: Via Supabase Dashboard (Manual)

1. **Get Credentials from Meta Dashboard:**
   - Go to: https://developers.facebook.com/apps
   - Select doctor's app
   - WhatsApp → API Setup
   - Copy:
     - Phone Number ID
     - Business Account ID
     - Access Token

2. **Update in Supabase:**
   ```sql
   UPDATE doctors 
   SET 
     whatsapp_phone_number_id = 'PHONE_NUMBER_ID_HERE',
     whatsapp_business_account_id = 'BUSINESS_ACCOUNT_ID_HERE',
     whatsapp_access_token = 'ACCESS_TOKEN_HERE',
     whatsapp_token_expires_at = NOW() + INTERVAL '60 days'
   WHERE phone_number = '919545816728';
   ```

3. **Verify:**
   ```sql
   SELECT 
     name,
     phone_number,
     whatsapp_phone_number_id,
     SUBSTRING(whatsapp_access_token, 1, 20) || '...' as token_preview
   FROM doctors
   WHERE phone_number = '919545816728';
   ```

### Method 2: Via Dashboard UI (Future Enhancement)

Create a settings page where doctors can add their own credentials.

---

## 🎯 HOW IT WORKS NOW

### Flow Diagram:

```
Patient sends message
    ↓
Webhook receives (display_phone_number)
    ↓
Find doctor in database
    ↓
Doctor object has credentials?
    ├─ YES → Use doctor's credentials (their free quota)
    └─ NO  → Use master credentials (fallback)
    ↓
Send response using selected credentials
```

### Code Logic:

```javascript
// In whatsappService.js
const getCredentials = (doctor) => {
  // Priority 1: Doctor-specific credentials
  if (doctor?.whatsapp_access_token && doctor?.whatsapp_phone_number_id) {
    return {
      token: doctor.whatsapp_access_token,
      phoneNumberId: doctor.whatsapp_phone_number_id,
    };
  }

  // Priority 2: Fallback to master account
  return {
    token: process.env.WHATSAPP_TOKEN,
    phoneNumberId: process.env.PHONE_NUMBER_ID,
  };
};
```

---

## 💰 COST SAVINGS EXAMPLE

### Scenario: 10 Doctors, 100 Conversations Each

**Option A (Single Master):**
- Total conversations: 1000
- Free tier: 1000
- Cost: $0 (but limit exhausted in 1 day)
- Next 1000: ~$50/month

**Option B (Individual Credentials):**
- Doctor 1: 100 conversations (free)
- Doctor 2: 100 conversations (free)
- ...
- Doctor 10: 100 conversations (free)
- Total cost: $0
- Each doctor uses their own 1000 free quota

**Savings: 100% of API costs!**

---

## 🧪 TESTING STEPS

### 1. Run Database Migration
```sql
-- In Supabase SQL Editor
\i database/add_individual_whatsapp_credentials.sql
```

### 2. Add Test Doctor Credentials
```sql
UPDATE doctors 
SET 
  whatsapp_phone_number_id = '984043858130065',
  whatsapp_business_account_id = '1200553978900975',
  whatsapp_access_token = 'YOUR_TOKEN_HERE',
  whatsapp_token_expires_at = NOW() + INTERVAL '60 days'
WHERE phone_number = '919545816728';
```

### 3. Restart Server
```bash
# Stop
Stop-Process -Name node -Force

# Start
C:\Users\Shree\AppData\Local\nvm\v20.11.0\node.exe server.js
```

### 4. Test Message
- Send "Hi" to 9545816728
- Check logs for: "🔑 Using doctor-specific credentials for: Dr. [Name]"
- Verify response comes from doctor's account

### 5. Verify in Meta Dashboard
- Go to doctor's Meta Dashboard
- Check conversation count increased
- Verify it's using their free quota

---

## 📊 MONITORING

### Check Which Doctors Have Credentials:

```sql
SELECT 
  name,
  phone_number,
  CASE 
    WHEN whatsapp_access_token IS NOT NULL THEN '✅ Configured'
    ELSE '❌ Missing'
  END as status,
  whatsapp_token_expires_at
FROM doctors
ORDER BY name;
```

### Check Token Expiry:

```sql
SELECT 
  name,
  phone_number,
  whatsapp_token_expires_at,
  CASE 
    WHEN whatsapp_token_expires_at < NOW() THEN '⚠️ EXPIRED'
    WHEN whatsapp_token_expires_at < NOW() + INTERVAL '7 days' THEN '⚠️ Expiring Soon'
    ELSE '✅ Valid'
  END as token_status
FROM doctors
WHERE whatsapp_access_token IS NOT NULL
ORDER BY whatsapp_token_expires_at;
```

---

## 🚨 IMPORTANT NOTES

1. **Fallback Mechanism:** If doctor credentials are missing, system automatically uses master credentials
2. **No Breaking Changes:** Existing setup continues to work
3. **Gradual Migration:** Add doctor credentials one by one
4. **Token Expiry:** Temporary tokens expire in 60 days, need refresh
5. **Each Doctor = Separate Meta App:** Each doctor needs their own Meta Developer account

---

## ✅ NEXT STEPS

1. **Run database migration** (5 minutes)
2. **Update messageHandler.js** to pass doctor object (10 minutes)
3. **Add first doctor's credentials** (5 minutes)
4. **Test with real message** (2 minutes)
5. **Monitor logs** to verify correct credentials used

**Total Time: ~30 minutes**

---

## 🎯 SUCCESS CRITERIA

- ✅ Database has new columns
- ✅ Doctor credentials stored in database
- ✅ Logs show "Using doctor-specific credentials"
- ✅ Messages sent from doctor's account
- ✅ Doctor's free quota being used
- ✅ Fallback works if credentials missing

---

**Status:** 90% Complete  
**Remaining:** Update messageHandler.js calls (10 minutes work)  
**Ready for Testing:** After messageHandler update
