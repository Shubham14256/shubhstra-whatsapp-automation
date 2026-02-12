# Phase 9 Testing Guide - Cron Jobs & Automation

## ✅ Current Status

**Backend Server:** Running on port 3000  
**Cron Jobs:** Initialized successfully  
- ✅ Appointment Reminder Job (every 30 minutes)
- ✅ Payment Recovery Job (daily at 8 PM)

**Dependencies:** All installed (node-cron v4.2.1)

---

## 🔧 Next Steps to Complete Phase 9

### Step 1: Update Database Schema ⚠️ REQUIRED

You need to run the SQL script in your Supabase SQL Editor:

1. Open Supabase Dashboard: https://vliswvuyapadipuxhfuf.supabase.co
2. Go to SQL Editor
3. Copy and paste the entire contents of `database/update_appointments_payment.sql`
4. Click "Run" to execute

**What this does:**
- Adds `payment_status` column (paid/pending/partial)
- Adds `balance_amount` column (numeric)
- Adds `reminder_sent` column (boolean)
- Creates indexes for performance
- Adds sample queries

### Step 2: Create WhatsApp Templates in Meta Business Manager ⚠️ REQUIRED

You need to create 2 templates for the cron jobs to work:

#### Template 1: `appointment_reminder`

**Go to:** Meta Business Manager → WhatsApp → Message Templates

**Template Name:** `appointment_reminder`  
**Category:** UTILITY  
**Language:** English

**Body Text:**
```
Hello {{1}}! 👋

This is a reminder for your appointment at {{3}} on {{2}}.

Please arrive 10 minutes early. If you need to reschedule, please let us know.

See you soon! 🏥
```

**Variables:**
- {{1}} = Patient name
- {{2}} = Appointment time (e.g., "9 Feb, 02:30 PM")
- {{3}} = Clinic name

**Buttons:** None

---

#### Template 2: `payment_reminder`

**Template Name:** `payment_reminder`  
**Category:** UTILITY  
**Language:** English

**Body Text:**
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

**Variables:**
- {{1}} = Patient name
- {{2}} = Amount (e.g., "₹500")
- {{3}} = Clinic name

**Buttons:** None

---

### Step 3: Wait for Template Approval

Meta typically approves templates within:
- **Fast:** 15-30 minutes
- **Normal:** 1-2 hours
- **Slow:** Up to 24 hours

Check status in Meta Business Manager → Message Templates

---

## 🧪 Testing the Cron Jobs

### Test 1: Appointment Reminder Job

**Option A: Create Test Appointment (Recommended)**

Run this SQL in Supabase:

```sql
-- Create a test appointment in 1 hour
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

**What happens:**
- Cron job runs every 30 minutes
- It will find this appointment (within next 2 hours)
- Send reminder to patient
- Mark `reminder_sent = true`

**Check server logs:**
```
⏰ Running Appointment Reminder Job...
📋 Found 1 appointment(s) needing reminders
📤 Sending reminder to [Patient Name]
✅ Reminder sent to [Patient Name]
```

---

**Option B: Manual Trigger (For Immediate Testing)**

Create a test file `test-reminder.js`:

```javascript
import { sendManualReminder } from './src/services/cronService.js';

// Replace with actual appointment ID from your database
const appointmentId = 'your-appointment-uuid-here';

const result = await sendManualReminder(appointmentId);
console.log('Result:', result);
```

Run:
```bash
C:\Users\Shree\AppData\Local\nvm\v20.11.0\node.exe test-reminder.js
```

---

### Test 2: Payment Recovery Job

**Create Test Pending Payment:**

Run this SQL in Supabase:

```sql
-- Create appointment from yesterday with pending payment
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

**What happens:**
- Cron job runs daily at 8 PM
- It will find this appointment (yesterday + pending payment)
- Send payment reminder to patient

**To test immediately (without waiting for 8 PM):**

Temporarily modify `src/services/cronService.js`:

```javascript
// Change this line (around line 145):
cron.schedule('0 20 * * *', async () => {

// To this (runs every minute):
cron.schedule('* * * * *', async () => {
```

Restart server and watch logs:
```
💰 Running Payment Recovery Job...
📋 Found 1 pending payment(s)
📤 Sending payment reminder to [Patient Name] (₹500)
✅ Payment reminder sent
```

**IMPORTANT:** Change it back to `'0 20 * * *'` after testing!

---

## 📊 Monitoring Cron Jobs

### Check Server Logs

Your server logs will show:

**On Startup:**
```
🤖 Initializing Cron Jobs...
✅ Appointment Reminder Job scheduled (every 30 minutes)
✅ Payment Recovery Job scheduled (daily at 8 PM)
✅ Cron Jobs initialized successfully
```

**Every 30 Minutes (Reminder Job):**
```
⏰ Running Appointment Reminder Job...
Time: 9 Feb 2026, 10:00 AM
📋 Found X appointment(s) needing reminders
```

**Daily at 8 PM (Payment Job):**
```
💰 Running Payment Recovery Job...
Time: 9 Feb 2026, 8:00 PM
📋 Found X pending payment(s)
```

---

### Query Database Status

**Check reminders sent today:**
```sql
SELECT 
  p.name AS patient_name,
  p.phone_number,
  a.appointment_time,
  a.reminder_sent,
  a.status
FROM appointments a
JOIN patients p ON a.patient_id = p.id
WHERE a.reminder_sent = true
  AND a.appointment_time::date = CURRENT_DATE
ORDER BY a.appointment_time;
```

**Check pending payments:**
```sql
SELECT 
  p.name AS patient_name,
  p.phone_number,
  a.appointment_time,
  a.payment_status,
  a.balance_amount
FROM appointments a
JOIN patients p ON a.patient_id = p.id
WHERE a.payment_status = 'pending'
ORDER BY a.appointment_time DESC;
```

---

## 🎯 Payment Management Functions

You can manually manage payments using the doctor service:

### Mark Payment as Pending

```javascript
import { markPaymentPending } from './src/services/doctorService.js';

await markPaymentPending('appointment-uuid', 500.00);
// Sets payment_status = 'pending', balance_amount = 500
```

### Mark Payment as Paid

```javascript
import { markPaymentPaid } from './src/services/doctorService.js';

await markPaymentPaid('appointment-uuid');
// Sets payment_status = 'paid', balance_amount = 0
```

---

## ⚠️ Troubleshooting

### Issue: Reminders not sending

**Check:**
1. ✅ Cron jobs initialized? (see server logs)
2. ✅ Appointments exist in next 2 hours?
3. ✅ `reminder_sent = false`?
4. ✅ `status = 'confirmed'`?
5. ✅ WhatsApp template approved?
6. ✅ WHATSAPP_TOKEN valid in .env?

**Solution:**
- Check server logs for errors
- Verify template name matches exactly: `appointment_reminder`
- Test with manual trigger first

---

### Issue: Payment reminders not sending

**Check:**
1. ✅ Current time is 8 PM?
2. ✅ Appointments from yesterday exist?
3. ✅ `payment_status = 'pending'`?
4. ✅ `status = 'completed'`?
5. ✅ WhatsApp template approved?

**Solution:**
- Temporarily change cron schedule to `* * * * *` for testing
- Check server logs for errors
- Verify template name: `payment_reminder`

---

### Issue: Template errors (131047)

**Error:** "24-hour window closed"

**Cause:** Template not approved or wrong template name

**Solution:**
1. Check template status in Meta Business Manager
2. Verify template name matches exactly
3. Ensure template is approved (green checkmark)
4. Check template language matches (`en` or `en_US`)

---

### Issue: Database errors

**Error:** "Column does not exist"

**Cause:** SQL update script not run

**Solution:**
1. Run `database/update_appointments_payment.sql` in Supabase
2. Verify columns exist:
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'appointments';
   ```

---

## 📈 Expected Results

### After 1 Hour of Testing:

✅ Server running with cron jobs initialized  
✅ Database schema updated  
✅ WhatsApp templates created and approved  
✅ Test appointment created  
✅ Reminder sent successfully  
✅ `reminder_sent` marked as true  

### After Full Day:

✅ Appointment reminders sent every 30 minutes  
✅ Payment reminders sent at 8 PM  
✅ All messages logged in server  
✅ Database updated correctly  

---

## 🚀 Production Checklist

Before going live:

- [ ] Database schema updated in production Supabase
- [ ] WhatsApp templates approved in Meta
- [ ] WHATSAPP_TOKEN valid and not expired
- [ ] Server running continuously (not just during testing)
- [ ] Cron schedule appropriate (30 mins for reminders, 8 PM for payments)
- [ ] Error logging monitored
- [ ] Test with real patient data
- [ ] Backup database before going live

---

## 📞 Quick Commands

**Start Server:**
```bash
C:\Users\Shree\AppData\Local\nvm\v20.11.0\node.exe server.js
```

**Check Server Status:**
- Server logs show cron initialization
- Visit: http://localhost:3000/health

**Stop Server:**
- Press Ctrl+C in terminal

---

## 🎉 Success Indicators

You'll know Phase 9 is working when:

1. ✅ Server starts with "Cron Jobs initialized successfully"
2. ✅ Every 30 minutes you see "Running Appointment Reminder Job"
3. ✅ At 8 PM you see "Running Payment Recovery Job"
4. ✅ Patients receive WhatsApp messages
5. ✅ Database updates correctly (reminder_sent = true)
6. ✅ No errors in server logs

---

**Phase 9 Status:** ⚠️ Partially Complete  
**Next Action:** Run database SQL script + Create WhatsApp templates  
**Estimated Time:** 30 minutes (+ template approval wait time)

