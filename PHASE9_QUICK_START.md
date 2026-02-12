# Phase 9 - Quick Start Guide

## ✅ What's Done

- ✅ node-cron installed
- ✅ Cron service created
- ✅ Server running with cron jobs active
- ✅ Code fully implemented

---

## ⚠️ What You Need to Do (3 Steps)

### Step 1: Update Database (2 minutes)

1. Open Supabase: https://vliswvuyapadipuxhfuf.supabase.co
2. Click "SQL Editor"
3. Copy ALL text from `database/update_appointments_payment.sql`
4. Paste and click "Run"

**Done when:** You see "Success. No rows returned"

---

### Step 2: Create WhatsApp Templates (10 minutes)

Go to Meta Business Manager → WhatsApp → Message Templates

#### Template 1: `appointment_reminder`

**Name:** `appointment_reminder`  
**Category:** UTILITY  
**Language:** English

**Body:**
```
Hello {{1}}! 👋

This is a reminder for your appointment at {{3}} on {{2}}.

Please arrive 10 minutes early. If you need to reschedule, please let us know.

See you soon! 🏥
```

Click "Submit"

---

#### Template 2: `payment_reminder`

**Name:** `payment_reminder`  
**Category:** UTILITY  
**Language:** English

**Body:**
```
Hello {{1}}! 👋

Thank you for visiting {{3}}. We hope you're feeling better!

We have a pending payment of {{2}} for your recent visit. Please complete the payment at your earliest convenience.

You can pay via:
• Cash at clinic
• UPI/PhonePe
• Bank transfer

Thank you! 🙏
```

Click "Submit"

---

### Step 3: Wait for Approval (15 mins - 24 hours)

Check template status in Meta Business Manager.

**When approved:** Green checkmark appears

---

## 🧪 Test It (After Templates Approved)

### Quick Test - Appointment Reminder

Run in Supabase SQL Editor:

```sql
INSERT INTO appointments (
  patient_id,
  doctor_id,
  appointment_time,
  status,
  reminder_sent
)
VALUES (
  (SELECT id FROM patients LIMIT 1),
  (SELECT id FROM doctors LIMIT 1),
  NOW() + INTERVAL '1 hour',
  'confirmed',
  false
);
```

**Wait:** Up to 30 minutes (cron runs every 30 mins)

**Check:** Server logs for "Reminder sent"

---

### Quick Test - Payment Reminder

Run in Supabase SQL Editor:

```sql
INSERT INTO appointments (
  patient_id,
  doctor_id,
  appointment_time,
  status,
  payment_status,
  balance_amount
)
VALUES (
  (SELECT id FROM patients LIMIT 1),
  (SELECT id FROM doctors LIMIT 1),
  NOW() - INTERVAL '1 day',
  'completed',
  'pending',
  500.00
);
```

**Wait:** Until 8 PM (or modify cron schedule for immediate test)

**Check:** Server logs for "Payment reminder sent"

---

## 📊 How to Know It's Working

**Server logs will show:**

```
⏰ Running Appointment Reminder Job...
📋 Found 1 appointment(s) needing reminders
📤 Sending reminder to [Patient Name]
✅ Reminder sent to [Patient Name]
```

**Patient receives WhatsApp message**

**Database updates:** `reminder_sent = true`

---

## 🆘 Troubleshooting

**No reminders sending?**
- Check templates are approved (green checkmark)
- Verify template names match exactly
- Check WHATSAPP_TOKEN in .env
- Look for errors in server logs

**Database errors?**
- Run the SQL update script
- Check columns exist: `payment_status`, `balance_amount`, `reminder_sent`

**Template errors (131047)?**
- Template not approved yet
- Template name doesn't match
- Wrong language code

---

## 📚 Full Documentation

- **Testing Guide:** `PHASE9_TESTING_GUIDE.md`
- **Setup Guide:** `PHASE9_SETUP.md`
- **Current Status:** `CURRENT_STATUS.md`

---

## 🎯 Success Checklist

- [ ] Database SQL script run
- [ ] Both templates created
- [ ] Templates approved (green checkmark)
- [ ] Test appointment created
- [ ] Reminder received on WhatsApp
- [ ] Database updated (reminder_sent = true)

**When all checked:** Phase 9 is COMPLETE! 🎉

---

**Estimated Total Time:** 30 minutes + template approval wait

