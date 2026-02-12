# Phase 9: Automation Engine (Cron Jobs & Reminders) - Setup Guide

## Overview
Phase 9 implements automated background jobs using node-cron for appointment reminders and payment follow-ups. This ensures patients never miss appointments and payments are collected efficiently.

## Business Value

### Appointment Reminders:
- **Reduce no-shows** - Automated reminders 2 hours before
- **Improve attendance** - Patients get timely notifications
- **Save time** - No manual reminder calls needed
- **Professional image** - Automated, consistent communication

### Payment Recovery:
- **Improve cash flow** - Automated payment reminders
- **Reduce bad debt** - Follow up on pending payments
- **Track balances** - Know exactly what's owed
- **Professional collection** - Polite, automated reminders

## Changes Made

### 1. Database Updates
- `appointments` table - Added payment and reminder columns

### 2. New Dependencies
- `node-cron` - Job scheduling library

### 3. New Files Created
- `src/services/cronService.js` - Cron job management
- `database/update_appointments_payment.sql` - Database schema

### 4. Updated Files
- `server.js` - Initialize cron jobs on startup
- `src/services/doctorService.js` - Added payment management functions

## Installation Steps

### Step 1: Install Dependencies

```bash
npm install node-cron
```

### Step 2: Update Database

Run in Supabase SQL Editor:
```sql
-- Copy entire contents of database/update_appointments_payment.sql
```

This will:
- Add `payment_status` column (paid, pending, partial)
- Add `balance_amount` column (numeric)
- Add `reminder_sent` column (boolean)
- Create indexes for performance
- Add constraints

### Step 3: Create WhatsApp Templates

Create these templates in Meta Business Manager:

#### Template 1: `appointment_reminder`
**Category:** UTILITY  
**Language:** English (US)

**Body:**
```
Hello {{1}}! 👋

This is a reminder for your appointment at {{3}} on {{2}}.

Please arrive 10 minutes early. If you need to reschedule, please let us know.

See you soon! 🏥
```

**Variables:**
- {{1}} = Patient name
- {{2}} = Appointment time
- {{3}} = Clinic name

#### Template 2: `payment_reminder`
**Category:** UTILITY  
**Language:** English (US)

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

**Variables:**
- {{1}} = Patient name
- {{2}} = Amount (₹500)
- {{3}} = Clinic name

### Step 4: Restart Server

```bash
npm start
```

The cron jobs will start automatically!

## Features Breakdown

### 1. Appointment Reminder Job ⏰

**Schedule:** Every 30 minutes

**Logic:**
```
Every 30 minutes:
  ↓
Query appointments where:
  - appointment_time is in next 2 hours
  - reminder_sent = false
  - status = 'confirmed'
  ↓
For each appointment:
  - Send template message to patient
  - Mark reminder_sent = true
  - Log success/failure
```

**Example Console Output:**
```
⏰ Running Appointment Reminder Job...
Time: 9 Feb 2026, 10:00 AM
📋 Found 3 appointment(s) needing reminders
📤 Sending reminder to Rahul Patil (989012...)
✅ Reminder sent to Rahul Patil
📤 Sending reminder to Priya Sharma (902134...)
✅ Reminder sent to Priya Sharma
📤 Sending reminder to Amit Kumar (987654...)
✅ Reminder sent to Amit Kumar

📊 Reminder Job Summary:
   ✅ Success: 3
   ❌ Failed: 0
   📋 Total: 3
```

### 2. Payment Recovery Job 💰

**Schedule:** Daily at 8 PM

**Logic:**
```
Every day at 8 PM:
  ↓
Query appointments where:
  - payment_status = 'pending'
  - appointment_time was yesterday
  - status = 'completed' or 'confirmed'
  ↓
For each appointment:
  - Send payment reminder template
  - Log success/failure
  - Track total amount
```

**Example Console Output:**
```
💰 Running Payment Recovery Job...
Time: 9 Feb 2026, 8:00 PM
📋 Found 2 pending payment(s)
📤 Sending payment reminder to Rahul Patil (₹500)
✅ Payment reminder sent to Rahul Patil
📤 Sending payment reminder to Priya Sharma (₹750)
✅ Payment reminder sent to Priya Sharma

📊 Payment Recovery Job Summary:
   ✅ Success: 2
   ❌ Failed: 0
   📋 Total: 2
   💰 Total Amount: ₹1250.00
```

## Database Schema

### appointments Table (Updated)

**New Columns:**

| Column | Type | Description |
|--------|------|-------------|
| payment_status | VARCHAR(20) | 'paid', 'pending', 'partial' |
| balance_amount | NUMERIC(10,2) | Outstanding balance |
| reminder_sent | BOOLEAN | Whether reminder was sent |

**Indexes:**
- `idx_appointments_payment_status` - Fast payment queries
- `idx_appointments_reminder_sent` - Fast reminder queries
- `idx_appointments_time_reminder` - Combined index for reminder job

## API Functions

### cronService.js

#### `initializeCronJobs()`
```javascript
// Called automatically on server start
initializeCronJobs();

// Starts both cron jobs:
// - Appointment reminders (every 30 mins)
// - Payment recovery (daily at 8 PM)
```

#### `sendManualReminder(appointmentId)`
```javascript
// Manually trigger reminder for testing
const result = await sendManualReminder('appointment-uuid');

// Returns:
{
  success: true/false,
  error: 'error message' // if failed
}
```

### doctorService.js

#### `markPaymentPending(appointmentId, amount)`
```javascript
const appointment = await markPaymentPending(
  'appointment-uuid',
  500.00
);

// Sets payment_status = 'pending'
// Sets balance_amount = 500.00
```

#### `markPaymentPaid(appointmentId)`
```javascript
const appointment = await markPaymentPaid('appointment-uuid');

// Sets payment_status = 'paid'
// Sets balance_amount = 0
```

## Cron Schedule Syntax

### Understanding Cron Patterns:

```
 ┌────────────── minute (0 - 59)
 │ ┌──────────── hour (0 - 23)
 │ │ ┌────────── day of month (1 - 31)
 │ │ │ ┌──────── month (1 - 12)
 │ │ │ │ ┌────── day of week (0 - 7) (0 or 7 is Sunday)
 │ │ │ │ │
 * * * * *
```

### Examples:

```javascript
// Every 30 minutes
'*/30 * * * *'

// Every hour
'0 * * * *'

// Daily at 8 PM
'0 20 * * *'

// Every day at 9 AM
'0 9 * * *'

// Every Monday at 10 AM
'0 10 * * 1'

// Every 15 minutes
'*/15 * * * *'
```

## Testing

### Test Appointment Reminder:

**Method 1: Create test appointment**
```sql
-- Create appointment in next 2 hours
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

Wait for next cron run (max 30 minutes) or manually trigger.

**Method 2: Manual trigger**
```javascript
import { sendManualReminder } from './src/services/cronService.js';

await sendManualReminder('appointment-uuid');
```

### Test Payment Recovery:

**Create test pending payment:**
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

Wait until 8 PM or change cron schedule for testing:
```javascript
// In cronService.js, temporarily change to run every minute
cron.schedule('* * * * *', async () => {
  // ... payment recovery logic
});
```

### Test Payment Functions:

```javascript
import { markPaymentPending, markPaymentPaid } from './src/services/doctorService.js';

// Mark as pending
await markPaymentPending('appointment-uuid', 500.00);

// Mark as paid
await markPaymentPaid('appointment-uuid');
```

## Configuration

### Change Reminder Timing:

In `cronService.js`, modify the schedule:

```javascript
// Current: Every 30 minutes
cron.schedule('*/30 * * * *', async () => {

// Change to every 15 minutes:
cron.schedule('*/15 * * * *', async () => {

// Change to every hour:
cron.schedule('0 * * * *', async () => {
```

### Change Reminder Window:

```javascript
// Current: Next 2 hours
const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

// Change to 1 hour:
const oneHourLater = new Date(now.getTime() + 1 * 60 * 60 * 1000);

// Change to 4 hours:
const fourHoursLater = new Date(now.getTime() + 4 * 60 * 60 * 1000);
```

### Change Payment Recovery Time:

```javascript
// Current: Daily at 8 PM
cron.schedule('0 20 * * *', async () => {

// Change to 9 AM:
cron.schedule('0 9 * * *', async () => {

// Change to 6 PM:
cron.schedule('0 18 * * *', async () => {
```

## Monitoring

### Check Cron Job Status:

Server logs will show:
```
🤖 Initializing Cron Jobs...
✅ Appointment Reminder Job scheduled (every 30 minutes)
✅ Payment Recovery Job scheduled (daily at 8 PM)
✅ Cron Jobs initialized successfully
```

### Monitor Job Execution:

Watch server logs for:
- ⏰ Appointment reminder runs
- 💰 Payment recovery runs
- ✅ Success messages
- ❌ Error messages

### Query Reminder Status:

```sql
-- Check reminders sent today
SELECT 
  p.name,
  a.appointment_time,
  a.reminder_sent,
  a.status
FROM appointments a
JOIN patients p ON a.patient_id = p.id
WHERE a.reminder_sent = true
  AND a.appointment_time::date = CURRENT_DATE
ORDER BY a.appointment_time;
```

### Query Pending Payments:

```sql
-- Check all pending payments
SELECT 
  p.name,
  a.appointment_time,
  a.payment_status,
  a.balance_amount
FROM appointments a
JOIN patients p ON a.patient_id = p.id
WHERE a.payment_status = 'pending'
ORDER BY a.appointment_time DESC;
```

## Troubleshooting

### Reminders not sending:
- Check cron job is initialized (see server logs)
- Verify appointments exist in next 2 hours
- Check `reminder_sent = false`
- Verify WhatsApp templates are approved
- Check WHATSAPP_TOKEN is valid

### Payment reminders not sending:
- Check cron schedule (8 PM)
- Verify appointments from yesterday exist
- Check `payment_status = 'pending'`
- Verify template is approved
- Check server is running at 8 PM

### Template errors:
- Ensure templates are created in Meta
- Verify template names match exactly
- Check template is approved (not pending)
- Verify parameter count matches

### Database errors:
- Check columns exist (run SQL update script)
- Verify foreign keys are valid
- Check data types match

## Best Practices

### Appointment Reminders:
- ✅ Send 1-2 hours before appointment
- ✅ Include clinic name and time
- ✅ Keep message professional
- ✅ Don't send too early (patient forgets)
- ❌ Don't spam multiple reminders

### Payment Recovery:
- ✅ Wait 24 hours after appointment
- ✅ Be polite and professional
- ✅ Provide multiple payment options
- ✅ Track payment status
- ❌ Don't be aggressive or rude

### Cron Jobs:
- ✅ Log all executions
- ✅ Handle errors gracefully
- ✅ Monitor job performance
- ✅ Test before production
- ❌ Don't run too frequently (API limits)

## Cost Considerations

### WhatsApp Template Messages:
- **Utility Templates:** ₹0.25 - ₹0.50 per message
- **Marketing Templates:** ₹0.50 - ₹1.00 per message

### Example Monthly Cost:
- 100 appointments/month
- 100 reminders × ₹0.30 = ₹30
- 20 payment reminders × ₹0.30 = ₹6
- **Total:** ₹36/month

### ROI:
- Reduced no-shows: 20% → 5% = 15% improvement
- 15 more patients seen/month
- Average revenue: ₹500/patient
- **Additional revenue:** ₹7,500/month
- **ROI:** 20,733% 🚀

## Next Steps (Phase 10)

- [ ] Birthday wishes automation
- [ ] Follow-up appointment reminders
- [ ] Health tips broadcasts
- [ ] Prescription reminders
- [ ] Lab report notifications
- [ ] Feedback collection automation

## Support

For issues:
1. Check server logs for cron execution
2. Verify database columns exist
3. Test templates in Meta dashboard
4. Check WhatsApp API limits
5. Monitor error messages

---

**Phase 9 Status:** ✅ Complete  
**Last Updated:** February 9, 2026  
**Features:** Automated Reminders & Payment Recovery  
**Dependencies:** node-cron  
