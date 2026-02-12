# 🏗️ Technical Architecture Overview - Shubhstra WhatsApp Bot

## Executive Summary

**Current Architecture:** Single Master API Number (Centralized)  
**Multi-Tenancy:** Supported via `display_phone_number` matching  
**Deployment Model:** One webhook, multiple doctors identified by their WhatsApp Business phone numbers

---

## 1. Database Schema Analysis

### Current `doctors` Table Structure:

```sql
CREATE TABLE doctors (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL UNIQUE,  -- WhatsApp Business number
  email VARCHAR(255),
  specialization VARCHAR(255),
  clinic_name VARCHAR(255),
  clinic_address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### ❌ Missing Columns for Individual API Credentials:

The current schema **DOES NOT** have:
- ❌ `whatsapp_phone_number_id` (per doctor)
- ❌ `access_token` (per doctor)
- ❌ `business_account_id` (per doctor)

### ✅ What We Have:

- ✅ `phone_number` - The doctor's WhatsApp Business display number
- ✅ Multi-tenancy support via phone number matching
- ✅ Doctor identification and data isolation

---

## 2. Multi-Tenancy Logic

### How It Works (Current Implementation):

```javascript
// webhookController.js - Line 52-60
const displayPhoneNumber = metadata?.display_phone_number;
const doctor = await getDoctorByPhone(displayPhoneNumber);
```

### Flow Diagram:

```
Meta WhatsApp Webhook
    ↓
Extract metadata.display_phone_number
    ↓
Query: SELECT * FROM doctors WHERE phone_number = display_phone_number
    ↓
Doctor Found? → Process with doctor's context
Doctor Not Found? → Log "Unknown Doctor Number"
```

### Key Points:

1. **Single Webhook URL** for all doctors
2. **Doctor identification** via `display_phone_number` from Meta webhook
3. **Automatic routing** to correct doctor's logic
4. **Data isolation** enforced by `doctor_id` in all queries

---

## 3. Current Credential Structure

### Environment Variables (.env):

```env
# SINGLE SET OF CREDENTIALS (Master API)
WHATSAPP_TOKEN=EAATpl9Ci1zU...
PHONE_NUMBER_ID=984043858130065
WHATSAPP_BUSINESS_ACCOUNT_ID=1200553978900975
```

### ⚠️ Critical Finding:

**The system uses ONE set of WhatsApp API credentials for ALL doctors.**

This means:
- All doctors share the same `WHATSAPP_TOKEN`
- All doctors share the same `PHONE_NUMBER_ID`
- All doctors share the same `WHATSAPP_BUSINESS_ACCOUNT_ID`


---

## 4. Authentication Architecture

### Two Separate Authentication Systems:

#### A. Doctor Dashboard Login (Supabase Auth):
```javascript
// shubhstra-dashboard/middleware.ts
const { data: { user } } = await supabase.auth.getUser();
```

- **Purpose:** Access to dashboard
- **Method:** Supabase Authentication (email/password)
- **Scope:** Dashboard pages, settings, reports
- **Storage:** Supabase Auth tables

#### B. WhatsApp API Credentials (Environment Variables):
```javascript
// .env file
WHATSAPP_TOKEN=...
PHONE_NUMBER_ID=...
```

- **Purpose:** Send/receive WhatsApp messages
- **Method:** Meta Cloud API tokens
- **Scope:** WhatsApp messaging only
- **Storage:** Environment variables (NOT in database)

### ⚠️ Important Distinction:

**Doctor login credentials ≠ WhatsApp API credentials**

- Doctors log into dashboard with email/password
- WhatsApp API uses Meta tokens (shared across all doctors currently)

---

## 5. Current Message Flow

### When Patient Sends "Hi":

```
Step 1: Patient sends "Hi" to 9545816728
    ↓
Step 2: Meta WhatsApp receives message
    ↓
Step 3: Meta sends webhook POST to:
        https://your-ngrok-url/webhook
    ↓
Step 4: webhookController.js receives webhook
    ↓
Step 5: Extract metadata.display_phone_number = "919545816728"
    ↓
Step 6: Query database:
        SELECT * FROM doctors WHERE phone_number = '919545816728'
    ↓
Step 7: Doctor found? 
        YES → Continue with doctor's context
        NO  → Log "Unknown Doctor Number" and exit
    ↓
Step 8: Upsert patient in database (linked to doctor_id)
    ↓
Step 9: Check knowledge base for doctor_id
        Match found? → Send doctor's pre-defined advice
        No match?    → Call Gemini AI
    ↓
Step 10: Send response using SHARED WhatsApp credentials
```

### Key Decision Points:

1. **Doctor Identification:** `display_phone_number` from webhook
2. **Knowledge Base:** Filtered by `doctor_id`
3. **AI Context:** Uses doctor's `clinic_name` for personalization
4. **Response Sending:** Uses SHARED `WHATSAPP_TOKEN` and `PHONE_NUMBER_ID`

---

## 6. Deployment Architecture Options

### Option A: Single Master API Number (CURRENT)

**How it works:**
- One WhatsApp Business number (e.g., Shubham's 9545816728)
- All doctors' patients message this ONE number
- System identifies doctor via `display_phone_number`
- Responses sent from the SAME number

**Pros:**
- ✅ Simple setup (one Meta app)
- ✅ Lower cost (one WhatsApp Business account)
- ✅ Centralized management
- ✅ Already implemented and working

**Cons:**
- ❌ All patients see same sender number
- ❌ No doctor-specific branding on WhatsApp
- ❌ Single point of failure
- ❌ Shared rate limits

**Current Support:** ✅ FULLY SUPPORTED


### Option B: Individual API Numbers Per Doctor (REQUIRES CHANGES)

**How it would work:**
- Each doctor has their own WhatsApp Business number
- Each doctor has their own Meta app credentials
- Credentials stored in database per doctor
- System uses doctor-specific credentials for responses

**Pros:**
- ✅ Doctor-specific branding
- ✅ Independent rate limits
- ✅ Isolated failure domains
- ✅ Professional appearance

**Cons:**
- ❌ Complex setup (multiple Meta apps)
- ❌ Higher cost (multiple Business accounts)
- ❌ More maintenance overhead
- ❌ Requires code changes

**Current Support:** ❌ NOT SUPPORTED (requires implementation)

---

## 7. Required Changes for Individual API Numbers

### Database Schema Changes:

```sql
ALTER TABLE doctors ADD COLUMN whatsapp_phone_number_id VARCHAR(50);
ALTER TABLE doctors ADD COLUMN whatsapp_access_token TEXT;
ALTER TABLE doctors ADD COLUMN whatsapp_business_account_id VARCHAR(50);
ALTER TABLE doctors ADD COLUMN whatsapp_token_expires_at TIMESTAMP;

-- Indexes
CREATE INDEX idx_doctors_phone_number_id ON doctors(whatsapp_phone_number_id);
```

### Code Changes Required:

#### 1. Update `whatsappService.js`:

```javascript
// CURRENT (uses global credentials)
const token = process.env.WHATSAPP_TOKEN;
const phoneNumberId = process.env.PHONE_NUMBER_ID;

// NEEDED (uses doctor-specific credentials)
const token = doctor.whatsapp_access_token;
const phoneNumberId = doctor.whatsapp_phone_number_id;
```

#### 2. Update `messageHandler.js`:

```javascript
// Pass doctor object to all WhatsApp service calls
await sendTextMessage(from, message, doctor);
```

#### 3. Create Credential Management:

- Dashboard page for doctors to add their Meta credentials
- Token refresh mechanism
- Credential validation
- Fallback to master credentials if doctor's credentials fail

### Estimated Implementation Time:

- Database changes: 1 hour
- Code refactoring: 4-6 hours
- Testing: 2-3 hours
- **Total: 1-2 days**

---

## 8. Recommendation

### For Current Stage (Testing/MVP):

**Use Option A: Single Master API Number**

**Reasons:**
1. ✅ Already implemented and working
2. ✅ Faster to deploy and test
3. ✅ Lower cost for initial rollout
4. ✅ Easier to manage and debug
5. ✅ Sufficient for proof of concept

### For Production/Scale:

**Migrate to Option B: Individual API Numbers**

**Reasons:**
1. Better doctor branding
2. Independent scaling
3. Professional appearance
4. Isolated failures
5. Compliance with WhatsApp Business policies

### Migration Path:

```
Phase 1 (Now): Single Master API
    ↓
Phase 2 (After 10-20 doctors): Add individual API support
    ↓
Phase 3 (Production): Migrate all doctors to individual APIs
```

---

## 9. Current System Capabilities

### ✅ What Works Now:

1. **Multi-Tenancy:** Multiple doctors, single webhook
2. **Doctor Identification:** Via `display_phone_number`
3. **Data Isolation:** All queries filtered by `doctor_id`
4. **Knowledge Base:** Per-doctor medical advice
5. **AI Integration:** Personalized by doctor's clinic name
6. **Dashboard:** Separate login for each doctor
7. **Patient Management:** Linked to correct doctor
8. **Appointment System:** Doctor-specific
9. **Queue Management:** Doctor-specific
10. **Referral System:** Doctor-specific

### ❌ What Doesn't Work:

1. **Individual WhatsApp Numbers:** All use same sender number
2. **Per-Doctor API Credentials:** Not stored in database
3. **Independent Rate Limits:** Shared across all doctors
4. **Doctor-Specific Branding:** All messages from same number

---

## 10. Technical Debt & Future Considerations

### Current Technical Debt:

1. **Hardcoded Credentials:** In `.env` file, not database
2. **No Token Refresh:** Manual token regeneration needed
3. **No Credential Validation:** No check if token is valid
4. **No Fallback Mechanism:** If token expires, system fails

### Future Enhancements:

1. **Credential Management Dashboard**
2. **Automatic Token Refresh**
3. **Multi-Region Support**
4. **Load Balancing**
5. **Webhook Retry Logic**
6. **Message Queue System**
7. **Analytics Dashboard**
8. **A/B Testing Framework**

---

## 11. Conclusion

### Current Architecture Summary:

**Model:** Single Master API Number (Centralized)  
**Multi-Tenancy:** ✅ Supported via phone number matching  
**Individual Credentials:** ❌ Not supported (requires implementation)  
**Production Ready:** ✅ Yes, for single API model  
**Scalable:** ⚠️ Limited (shared rate limits)

### Answer to Your Questions:

1. **Database Schema:** ❌ No columns for individual API credentials
2. **Multi-Tenancy:** ✅ One webhook, doctor identified by `display_phone_number`
3. **Authentication:** Two separate systems (dashboard login vs API credentials)
4. **Message Flow:** Doctor identified → Knowledge base → AI → Response

### Recommendation:

**Start with current architecture (Single Master API), plan migration to individual APIs after validation.**

---

**Document Version:** 1.0  
**Last Updated:** February 11, 2026  
**Status:** Current Implementation Analysis
