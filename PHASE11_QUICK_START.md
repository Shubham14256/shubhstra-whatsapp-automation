# Phase 11 - Marketing Suite Quick Start

## ✅ What's Done

- ✅ Social media integration code
- ✅ Referral system implemented
- ✅ Patient recall cron job added
- ✅ Database schema created
- ✅ All services implemented

---

## ⚠️ What You Need to Do (3 Steps)

### Step 1: Update Database (2 minutes)

Run in Supabase SQL Editor:
```sql
-- Copy entire contents of database/update_phase11_marketing.sql
```

**What it adds:**
- `social_links` to doctors table
- `referral_code`, `referred_by`, `referral_count` to patients table
- `last_recall_sent` to patients table
- Referral code generation function
- Analytics views

---

### Step 2: Add Social Media Links (Optional - 1 minute)

Update your doctor's social links in Supabase:

```sql
UPDATE doctors
SET social_links = jsonb_build_object(
  'instagram', 'https://instagram.com/yourclinic',
  'youtube', 'https://youtube.com/@yourclinic',
  'website', 'https://yourclinic.com'
)
WHERE phone_number = 'your-doctor-phone';
```

---

### Step 3: Create WhatsApp Template (10 minutes)

Create `checkup_recall` template in Meta Business Manager:

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
- {{2}} = Time (e.g., "6 months")
- {{3}} = Clinic name

---

## 🧪 Test It

### Test 1: Social Media

Send via WhatsApp:
```
Follow
```

**Expected:** Bot sends all social media links

---

### Test 2: Referral Code

Send via WhatsApp:
```
Refer
```

**Expected:** Bot sends unique referral code (e.g., RAH9999)

---

### Test 3: Patient Recall (Cron)

**Runs:** Daily at 11 AM automatically

**What it does:**
- Finds patients who visited 6+ months ago
- No future appointments
- Sends recall template message
- Max 50 patients/day

---

## 📊 Features

### 1. Social Media Integration 📱

**Trigger Words:** social, follow, instagram, youtube, website

**Response:**
```
📱 Stay Connected with Us!

Follow us on:
📸 Instagram: [link]
🎥 YouTube: [link]
🌐 Website: [link]

Follow us for health tips! 💚
```

---

### 2. Referral System 🎁

**Trigger Words:** refer, referral, code, share

**Response:**
```
🎁 Your Referral Code

Code: RAH9999

Share this code with your friends!

When they register using your code, both get special benefits! 🎉

You've referred 0 friends so far. Thank you! 🙏
```

**How It Works:**
- Patient requests code
- System generates unique code (Name + Phone)
- Patient shares with friends
- Friend registers with code
- Referral count auto-increments

---

### 3. Patient Recall 📢

**Schedule:** Daily at 11 AM

**Logic:**
- Find patients: last visit 6+ months ago
- No future appointments
- Send recall message
- Update timestamp

**Example Message:**
```
Hello Rahul! 👋

It's been 6 months since your last visit to Dr. Sharma's Clinic.

Regular checkups are important. Would you like to schedule one?

Reply 'Hi' to book! 🏥
```

---

## 🎯 Success Checklist

- [ ] Database SQL script run
- [ ] Social links added (optional)
- [ ] Recall template created
- [ ] Server restarted
- [ ] Test social media request
- [ ] Test referral code request
- [ ] Verify cron job scheduled

**When all checked:** Phase 11 is LIVE! 🎉

---

## 📈 Expected Results

### Social Media:
- Patients follow your social accounts
- Increased brand awareness
- More engagement

### Referrals:
- Organic patient growth
- Lower acquisition cost
- Higher trust factor

### Recall:
- Bring back inactive patients
- Increase revenue
- Better patient care

---

**Estimated Time:** 15 minutes  
**ROI:** High (organic growth + revenue recovery)

