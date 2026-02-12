# Phase 11: Marketing Suite - Setup Guide

## Overview
Phase 11 adds powerful marketing features including social media integration, patient referral system, and automated patient recall for long-term engagement and growth.

## Business Value

### Social Media Integration:
- **Brand Building** - Connect patients with your social presence
- **Content Marketing** - Share health tips and updates
- **Trust Building** - Showcase expertise through content
- **Patient Engagement** - Keep patients connected between visits

### Referral System:
- **Organic Growth** - Patients bring new patients
- **Cost-Effective** - No advertising spend needed
- **Trust Factor** - Referred patients have higher trust
- **Gamification** - Track and reward top referrers
- **Viral Growth** - Each patient becomes a marketer

### Patient Recall:
- **Revenue Recovery** - Bring back inactive patients
- **Preventive Care** - Remind patients about checkups
- **Long-term Relationships** - Stay connected over time
- **Automated Outreach** - No manual follow-up needed
- **Increased Lifetime Value** - More visits per patient

## Changes Made

### 1. Database Updates
- `doctors` table - Added `social_links` (JSONB)
- `patients` table - Added `referral_code`, `referred_by`, `referral_count`, `last_recall_sent`

### 2. New Files Created
- `src/services/referralService.js` - Referral system logic
- `database/update_phase11_marketing.sql` - Database schema

### 3. Updated Files
- `src/controllers/messageHandler.js` - Added social media & referral handlers
- `src/services/doctorService.js` - Added social media management functions
- `src/services/cronService.js` - Added patient recall job

## Installation Steps

### Step 1: Update Database Schema

Run in Supabase SQL Editor:
```sql
-- Copy entire contents of database/update_phase11_marketing.sql
```

This will:
- Add `social_links` column to doctors table
- Add referral columns to patients table
- Create referral code generation function
- Create referral count trigger
- Create analytics views
- Add indexes for performance

---

### Step 2: Add Social Media Links (Optional)

Update your doctor's social media links in Supabase:

```sql
UPDATE doctors
SET social_links = jsonb_build_object(
  'instagram', 'https://instagram.com/yourclinic',
  'youtube', 'https://youtube.com/@yourclinic',
  'website', 'https://yourclinic.com',
  'facebook', 'https://facebook.com/yourclinic'
)
WHERE id = 'your-doctor-id';
```

Or use the dashboard (future feature).

---

### Step 3: Create WhatsApp Template for Recall

Create this template in Meta Business Manager:

#### Template: `checkup_recall`

**Category:** UTILITY  
**Language:** English

**Body:**
```
Hello {{1}}! 👋

It's been {{2}} since your last visit to {{3}}. We hope you're doing well!

Regular checkups are important for maintaining good health. Would you like to schedule a checkup?

We'd love to see you again! 🏥

Reply 'Hi' to book an appointment.
```

**Variables:**
- {{1}} = Patient name
- {{2}} = Time since last visit (e.g., "6 months")
- {{3}} = Clinic name

---

### Step 4: Restart Server

```bash
C:\Users\Shree\AppData\Local\nvm\v20.11.0\node.exe server.js
```

The new cron job will start automatically!

---

## Features Breakdown

### 1. Social Media Integration 📱

**Patient Trigger Words:**
- "social", "follow", "instagram", "youtube", "website", "facebook"

**Flow:**
```
Patient: "Follow"
    ↓
Bot fetches social links from database
    ↓
Bot sends message with all available links:
  📸 Instagram: [link]
  🎥 YouTube: [link]
  🌐 Website: [link]
  👍 Facebook: [link]
    ↓
Patient clicks and follows ✅
```

**Example Response:**
```
📱 Stay Connected with Us!

Follow us on:

📸 Instagram: https://instagram.com/yourclinic

🎥 YouTube: https://youtube.com/@yourclinic

🌐 Website: https://yourclinic.com

Follow us for health tips and updates! 💚
```

---

### 2. Referral System 🎁

**Patient Trigger Words:**
- "refer", "referral", "code", "share"

**Flow:**
```
Patient: "Refer"
    ↓
System checks if patient has referral code
    ↓
If NO: Generate code (e.g., RAH1234)
If YES: Fetch existing code
    ↓
Send code to patient with instructions
    ↓
Patient shares code with friends
    ↓
Friend registers with code
    ↓
Referral count increments automatically ✅
```

**Referral Code Format:**
- First 3 letters of name (uppercase)
- Last 4 digits of phone number
- Example: "Rahul" + "9999" = "RAH9999"

**Example Response:**
```
🎁 Your Referral Code

Code: RAH9999

Share this code with your friends and family!

When they register using your code, both of you will get 
special benefits! 🎉

You've referred 3 friends so far. Thank you! 🙏
```

---

### 3. Patient Recall (Automated) 📢

**Schedule:** Daily at 11 AM

**Logic:**
```
Every day at 11 AM:
    ↓
Query patients where:
  - last_seen_at >= 6 months ago
  - last_recall_sent is NULL OR >= 6 months ago
  - No future appointments scheduled
    ↓
For each patient (max 50/day):
  - Send recall template message
  - Update last_recall_sent timestamp
  - Log success/failure
```

**Example Recall Message:**
```
Hello Rahul! 👋

It's been 6 months since your last visit to Dr. Sharma's Clinic. 
We hope you're doing well!

Regular checkups are important for maintaining good health. Would 
you like to schedule a checkup?

We'd love to see you again! 🏥

Reply 'Hi' to book an appointment.
```

---

## Database Schema

### doctors Table (Updated)

**New Column:**

| Column | Type | Description |
|--------|------|-------------|
| social_links | JSONB | Social media URLs {instagram, youtube, website, facebook, twitter} |

**Example Data:**
```json
{
  "instagram": "https://instagram.com/yourclinic",
  "youtube": "https://youtube.com/@yourclinic",
  "website": "https://yourclinic.com",
  "facebook": "https://facebook.com/yourclinic"
}
```

---

### patients Table (Updated)

**New Columns:**

| Column | Type | Description |
|--------|------|-------------|
| referral_code | VARCHAR(20) | Unique referral code (e.g., RAH1234) |
| referred_by | UUID | Patient ID who referred them |
| referral_count | INTEGER | Number of patients they referred |
| last_recall_sent | TIMESTAMP | When last recall message was sent |

**Indexes:**
- `idx_patients_referral_code` - Fast referral code lookups
- `idx_patients_referred_by` - Fast referral queries
- `idx_patients_last_recall` - Fast recall candidate queries

---

## API Functions

### doctorService.js

#### `updateSocialLinks(doctorId, links)`
```javascript
await updateSocialLinks('doctor-uuid', {
  instagram: 'https://instagram.com/clinic',
  youtube: 'https://youtube.com/@clinic',
  website: 'https://clinic.com'
});
```

#### `getSocialLinks(doctorId)`
```javascript
const links = await getSocialLinks('doctor-uuid');
// Returns: { instagram: '...', youtube: '...', ... }
```

---

### referralService.js

#### `generateReferralCode(patientId, name, phoneNumber)`
```javascript
const code = await generateReferralCode(
  'patient-uuid',
  'Rahul Patil',
  '919999999999'
);
// Returns: 'RAH9999'
```

#### `getOrCreateReferralCode(patientId)`
```javascript
const code = await getOrCreateReferralCode('patient-uuid');
// Returns existing code or generates new one
```

#### `applyReferralCode(newPatientId, referralCode)`
```javascript
const success = await applyReferralCode(
  'new-patient-uuid',
  'RAH9999'
);
// Returns: true/false
```

#### `getReferralStats(patientId)`
```javascript
const stats = await getReferralStats('patient-uuid');
// Returns: {
//   referralCode: 'RAH9999',
//   totalReferrals: 5,
//   referredPatients: [...]
// }
```

#### `getTopReferrers(doctorId, limit)`
```javascript
const topReferrers = await getTopReferrers('doctor-uuid', 10);
// Returns: Array of top 10 referrers
```

---

### cronService.js

#### `sendManualRecall(patientId)`
```javascript
import { sendManualRecall } from './src/services/cronService.js';

const result = await sendManualRecall('patient-uuid');
// Returns: { success: true/false }
```

---

## Testing

### Test 1: Social Media Links

**Send via WhatsApp:**
```
Follow
```

**Expected Response:**
```
📱 Stay Connected with Us!

Follow us on:

📸 Instagram: https://instagram.com/yourclinic
🎥 YouTube: https://youtube.com/@yourclinic
🌐 Website: https://yourclinic.com

Follow us for health tips and updates! 💚
```

---

### Test 2: Referral Code

**Send via WhatsApp:**
```
Refer
```

**Expected Response:**
```
🎁 Your Referral Code

Code: RAH9999

Share this code with your friends and family!

When they register using your code, both of you will get 
special benefits! 🎉

You've referred 0 friends so far. Thank you! 🙏
```

---

### Test 3: Patient Recall (Manual)

**Run in Node.js:**
```javascript
import { sendManualRecall } from './src/services/cronService.js';

// Replace with actual patient ID
await sendManualRecall('patient-uuid-here');
```

**Expected:**
- Recall message sent to patient
- `last_recall_sent` updated in database
- Server logs show success

---

### Test 4: Referral Application

**SQL Query:**
```sql
-- Create test patient with referral code
INSERT INTO patients (name, phone_number, doctor_id, referral_code)
VALUES ('Test Patient', '919999999999', 'doctor-uuid', 'TEST1234');

-- Apply referral code to new patient
UPDATE patients
SET referred_by = (SELECT id FROM patients WHERE referral_code = 'TEST1234')
WHERE id = 'new-patient-uuid';

-- Check referral count (should auto-increment via trigger)
SELECT referral_count FROM patients WHERE referral_code = 'TEST1234';
```

---

## Analytics Queries

### Top Referrers
```sql
SELECT 
  p.name,
  p.referral_code,
  p.referral_count,
  COUNT(r.id) as actual_referrals
FROM patients p
LEFT JOIN patients r ON r.referred_by = p.id
WHERE p.referral_count > 0
GROUP BY p.id, p.name, p.referral_code, p.referral_count
ORDER BY p.referral_count DESC
LIMIT 10;
```

### Referral Conversion Rate
```sql
SELECT 
  COUNT(*) FILTER (WHERE referred_by IS NOT NULL) as referred_patients,
  COUNT(*) FILTER (WHERE referred_by IS NULL) as direct_patients,
  COUNT(*) as total_patients,
  ROUND(100.0 * COUNT(*) FILTER (WHERE referred_by IS NOT NULL) / COUNT(*), 2) as referral_percentage
FROM patients;
```

### Recall Candidates
```sql
SELECT 
  p.name,
  p.phone_number,
  p.last_seen_at,
  p.last_recall_sent,
  EXTRACT(MONTH FROM AGE(NOW(), p.last_seen_at)) as months_since_visit
FROM patients p
WHERE p.last_seen_at <= NOW() - INTERVAL '6 months'
  AND (p.last_recall_sent IS NULL OR p.last_recall_sent <= NOW() - INTERVAL '6 months')
  AND NOT EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.patient_id = p.id 
      AND a.appointment_time > NOW()
      AND a.status IN ('pending', 'confirmed')
  )
ORDER BY p.last_seen_at ASC
LIMIT 50;
```

### Social Media Engagement
```sql
-- Count doctors with social links
SELECT 
  COUNT(*) FILTER (WHERE social_links->>'instagram' IS NOT NULL) as has_instagram,
  COUNT(*) FILTER (WHERE social_links->>'youtube' IS NOT NULL) as has_youtube,
  COUNT(*) FILTER (WHERE social_links->>'website' IS NOT NULL) as has_website,
  COUNT(*) as total_doctors
FROM doctors;
```

---

## Configuration

### Change Recall Timing

In `cronService.js`:

```javascript
// Current: Daily at 11 AM
cron.schedule('0 11 * * *', async () => {

// Change to 9 AM:
cron.schedule('0 9 * * *', async () => {

// Change to 2 PM:
cron.schedule('0 14 * * *', async () => {
```

### Change Recall Period

```javascript
// Current: 6 months
const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

// Change to 3 months:
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 3);

// Change to 1 year:
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 12);
```

### Change Recall Batch Size

```javascript
// Current: 50 patients per day
.limit(50);

// Change to 100:
.limit(100);

// Change to 20:
.limit(20);
```

---

## Best Practices

### Social Media:
- ✅ Keep links updated
- ✅ Post regularly on social platforms
- ✅ Share health tips and clinic updates
- ✅ Respond to comments and messages
- ✅ Use consistent branding

### Referrals:
- ✅ Offer incentives for referrals
- ✅ Track and reward top referrers
- ✅ Make referral codes easy to share
- ✅ Thank patients for referrals
- ✅ Follow up with referred patients

### Patient Recall:
- ✅ Send recalls during business hours
- ✅ Personalize messages
- ✅ Don't spam (6 month interval)
- ✅ Track recall conversion rate
- ✅ A/B test message content

---

## ROI Analysis

### Referral System:

**Scenario:** 100 active patients

- 20% parti