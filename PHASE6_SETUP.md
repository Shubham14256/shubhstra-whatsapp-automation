# Phase 6: Patient CRM & Template Messaging - Setup Guide

## Overview
Phase 6 implements a complete Patient CRM system and WhatsApp Template Messages to bypass the 24-hour messaging window. This allows you to send messages to patients anytime, even if they haven't messaged you in over 24 hours.

## Business Value

### Patient CRM Benefits:
- **Track all patient interactions** automatically
- **Build patient database** without manual data entry
- **Analyze patient behavior** and engagement
- **Personalize future communications**
- **Track appointment history**

### Template Messages Benefits:
- **Bypass 24-hour window** restriction
- **Send missed call recovery** messages anytime
- **Automated follow-ups** for appointments
- **Marketing campaigns** (with consent)
- **Appointment reminders**

## Changes Made

### 1. New Database Tables
- `patients` - Stores patient information and tracks interactions
- `appointments` - Manages appointment bookings and status

### 2. New Files Created
- `src/services/patientService.js` - Patient and appointment database operations
- `database/create_patients_appointments_tables.sql` - Database schema

### 3. Updated Files
- `src/controllers/webhookController.js` - Now stores patient data on every message
- `src/services/whatsappService.js` - Added `sendTemplateMessage()` function
- `src/controllers/missedCallController.js` - Smart fallback to template messages

## Installation Steps

### Step 1: Create Database Tables

1. Go to your Supabase SQL Editor
2. Open `database/create_patients_appointments_tables.sql`
3. Copy the entire SQL script
4. Paste and run in Supabase SQL Editor

This creates:
- `patients` table with indexes
- `appointments` table with indexes
- Triggers for auto-updating timestamps
- Foreign key relationships
- Sample queries for analytics

### Step 2: Restart Server

```bash
# Stop current server (Ctrl+C)
# Start again
npm start
```

No new dependencies needed!

## Database Schema

### Patients Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| phone_number | VARCHAR(20) | WhatsApp number (unique) |
| name | VARCHAR(255) | Patient name from WhatsApp profile |
| doctor_id | UUID | Foreign key to doctors table |
| created_at | TIMESTAMP | First contact timestamp |
| last_seen_at | TIMESTAMP | Last interaction timestamp |
| email | VARCHAR(255) | Email (optional, for future) |
| notes | TEXT | Additional notes |
| is_active | BOOLEAN | Account status |

**Indexes:**
- `idx_patients_phone_number` - Fast phone lookups
- `idx_patients_doctor_id` - Filter by doctor
- `idx_patients_last_seen` - Sort by activity

### Appointments Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| patient_id | UUID | Foreign key to patients |
| doctor_id | UUID | Foreign key to doctors |
| appointment_time | TIMESTAMP | Scheduled date/time |
| status | VARCHAR(50) | pending, confirmed, completed, cancelled, no_show |
| notes | TEXT | Appointment notes |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_appointments_patient_id` - Filter by patient
- `idx_appointments_doctor_id` - Filter by doctor
- `idx_appointments_time` - Sort by time
- `idx_appointments_status` - Filter by status

## How It Works

### Automatic Patient Tracking

**Flow:**
```
Patient sends message
    ↓
Webhook receives message
    ↓
Extract patient phone & name
    ↓
Check if patient exists
    ↓
┌─────────────┴─────────────┐
│                           │
EXISTS                  NEW PATIENT
│                           │
Update last_seen_at      Create new record
Update name if changed   Store all info
    ↓                       ↓
Continue processing message
```

**Code Location:** `src/controllers/webhookController.js`

```javascript
// Automatically called for every incoming message
const patient = await upsertPatient(message.from, doctor.id, patientName);
```

### Template Messages

**What are Template Messages?**
- Pre-approved message templates by Meta
- Can be sent outside 24-hour window
- Must be created in Meta Business Manager
- Have a small cost per message

**When to Use:**
- Missed call recovery (patient hasn't messaged in 24+ hours)
- Appointment reminders
- Follow-up messages
- Marketing campaigns (with consent)

**Code Location:** `src/services/whatsappService.js`

```javascript
await sendTemplateMessage(
  phoneNumber,
  'template_name',
  'en_US',
  components
);
```

## Template Message Setup

### Step 1: Create Template in Meta Business Manager

1. Go to [Meta Business Manager](https://business.facebook.com/)
2. Select your WhatsApp Business Account
3. Go to "Message Templates"
4. Click "Create Template"

### Step 2: Template Example - Missed Call Recovery

**Template Name:** `missed_call_recovery`

**Category:** UTILITY (for transactional messages)

**Language:** English (US)

**Header:** None (optional)

**Body:**
```
Hello! 👋

We noticed a missed call from you at {{1}}.

We are currently attending other patients. Would you like to book an appointment?

Reply with:
• "Book" to schedule
• "Urgent" for immediate assistance
```

**Footer:** None (optional)

**Buttons:** None (or add quick reply buttons)

**Variables:**
- `{{1}}` = Clinic Name (passed dynamically)

### Step 3: Submit for Approval

- Meta reviews templates (usually 24-48 hours)
- Once approved, you can use it in code

### Step 4: Use in Code

```javascript
const components = [
  {
    type: 'body',
    parameters: [
      {
        type: 'text',
        text: 'Heart Care Clinic', // Replaces {{1}}
      },
    ],
  },
];

await sendTemplateMessage(
  '919999999999',
  'missed_call_recovery',
  'en_US',
  components
);
```

## Smart Fallback Logic

The missed call controller now has intelligent fallback:

```
Missed Call Received
    ↓
Try Interactive List Message
    ↓
Success? ────────────> ✅ Done
    │
    No (24-hour window error)
    ↓
Try Template Message
    ↓
Success? ────────────> ✅ Done
    │
    No
    ↓
❌ Return Error
```

**Code Location:** `src/controllers/missedCallController.js`

The system automatically:
1. Tries interactive message first (free, better UX)
2. If 24-hour window error, falls back to template
3. Logs which method was used
4. Returns appropriate response to Android app

## Patient Service Functions

### upsertPatient()
```javascript
const patient = await upsertPatient(phoneNumber, doctorId, name);
```
- Creates new patient or updates existing
- Updates `last_seen_at` on every call
- Updates name if changed
- Returns patient object

### getPatientByPhone()
```javascript
const patient = await getPatientByPhone('919999999999');
```
- Finds patient by phone number
- Returns patient object or null

### createAppointment()
```javascript
const appointment = await createAppointment(
  patientId,
  doctorId,
  '2026-02-15T10:00:00Z',
  'First consultation'
);
```
- Creates new appointment
- Status defaults to 'pending'
- Returns appointment object

### updateAppointmentStatus()
```javascript
const updated = await updateAppointmentStatus(appointmentId, 'confirmed');
```
- Updates appointment status
- Valid statuses: pending, confirmed, completed, cancelled, no_show

### getPatientAppointments()
```javascript
const appointments = await getPatientAppointments(patientId);
```
- Gets all appointments for a patient
- Sorted by appointment time (newest first)

## Console Output Examples

### Patient Auto-Tracking:

```
📱 Message Details:
  From (Patient): 919999999999
  Type: text
  Message ID: wamid.xxx

👤 Patient Name from WhatsApp: John Doe

💾 Upserting patient: 919999999999
✅ Patient exists (ID: abc-123) - Updating last_seen_at
   Updating name: John Doe
✅ Patient updated successfully
💾 Patient record updated (ID: abc-123)
```

### Template Message Fallback:

```
📤 Sending recovery message to patient: 919999999999
❌ Failed to send interactive message: Request failed with status code 400

⚠️  ═══════════════════════════════════════════════
⚠️  24-Hour Window Closed
⚠️  ═══════════════════════════════════════════════

⚠️  24-Hour Window Closed. Attempting Template Message...
📋 Sending template message to 919999999999
Template: missed_call_recovery (en_US)
✅ Message sent successfully
✅ Recovery message sent successfully (Template Message)
```

## Analytics Queries

The SQL file includes useful analytics queries:

### Count Patients Per Doctor
```sql
SELECT 
  d.name AS doctor_name,
  COUNT(p.id) AS patient_count
FROM doctors d
LEFT JOIN patients p ON d.id = p.doctor_id
GROUP BY d.id, d.name;
```

### Recent Patients (Last 7 Days)
```sql
SELECT name, phone_number, last_seen_at
FROM patients
WHERE last_seen_at >= NOW() - INTERVAL '7 days'
ORDER BY last_seen_at DESC;
```

### Upcoming Appointments
```sql
SELECT 
  p.name AS patient_name,
  d.name AS doctor_name,
  a.appointment_time,
  a.status
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN doctors d ON a.doctor_id = d.id
WHERE a.appointment_time > NOW()
  AND a.status IN ('pending', 'confirmed')
ORDER BY a.appointment_time ASC;
```

### Appointment Status Summary
```sql
SELECT status, COUNT(*) AS count
FROM appointments
GROUP BY status;
```

## Testing

### Test Patient Auto-Tracking:

1. Send a message from WhatsApp to your business number
2. Check server logs - should see patient upsert
3. Query Supabase:
```sql
SELECT * FROM patients ORDER BY created_at DESC LIMIT 5;
```

### Test Template Message:

```javascript
// test-template.js
import { sendTemplateMessage } from './src/services/whatsappService.js';

await sendTemplateMessage(
  '919999999999',
  'hello_world', // Use Meta's sample template
  'en_US',
  []
);
```

Run: `node test-template.js`

## Template Message Costs

### Pricing (approximate, varies by region):
- **Utility Templates:** ₹0.25 - ₹0.50 per message
- **Marketing Templates:** ₹0.50 - ₹1.00 per message
- **Authentication Templates:** ₹0.10 - ₹0.25 per message

### Cost Optimization:
- Use interactive messages within 24-hour window (free)
- Only use templates when necessary
- Batch template messages
- Track ROI per template

## Project Structure (Updated)

```
shubhstra-tech/
├── src/
│   ├── config/
│   │   └── supabaseClient.js
│   ├── controllers/
│   │   ├── webhookController.js       # ✨ UPDATED
│   │   ├── messageHandler.js
│   │   └── missedCallController.js    # ✨ UPDATED
│   ├── routes/
│   │   └── webhookRoutes.js
│   ├── services/
│   │   ├── doctorService.js
│   │   ├── patientService.js          # ✨ NEW
│   │   └── whatsappService.js         # ✨ UPDATED
│   └── app.js
├── database/
│   ├── create_doctors_table.sql
│   └── create_patients_appointments_tables.sql  # ✨ NEW
├── server.js
├── .env
├── package.json
├── README.md
├── PHASE2_SETUP.md
├── PHASE3_SETUP.md
├── PHASE4_SETUP.md
├── PHASE5_SETUP.md
└── PHASE6_SETUP.md                    # This file
```

## Troubleshooting

### Patient Not Being Saved
- Check Supabase connection
- Verify `patients` table exists
- Check foreign key constraint (doctor_id must exist)
- Review server logs for errors

### Template Message Not Sending
- Verify template is approved in Meta Business Manager
- Check template name matches exactly (case-sensitive)
- Verify language code is correct
- Check component parameters match template variables

### Template Not Found Error
- Template must be created and approved in Meta first
- Wait 24-48 hours for approval
- Use exact template name from Meta dashboard

### 24-Hour Window Still Failing
- Ensure template message code is implemented
- Check error logs for specific error codes
- Verify WHATSAPP_TOKEN has template permissions

## Best Practices

### Patient Data:
- ✅ Auto-track all interactions
- ✅ Update last_seen_at regularly
- ✅ Store patient name from WhatsApp
- ✅ Respect privacy and data protection laws
- ❌ Don't store sensitive medical data without encryption

### Template Messages:
- ✅ Create templates for common scenarios
- ✅ Use utility category for transactional messages
- ✅ Keep templates simple and clear
- ✅ Test templates before production use
- ❌ Don't spam patients with marketing templates

### Appointments:
- ✅ Track all appointment statuses
- ✅ Send reminders before appointments
- ✅ Update status after completion
- ✅ Handle no-shows appropriately
- ❌ Don't double-book time slots

## Next Steps (Phase 7)

- [ ] Automated appointment reminders
- [ ] Patient conversation history
- [ ] Analytics dashboard API
- [ ] Bulk template messaging
- [ ] Patient segmentation
- [ ] Automated follow-ups
- [ ] Integration with calendar systems
- [ ] Payment tracking

## Support

For WhatsApp Template Messages:
- Template Guidelines: https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates
- Template Components: https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates/components
- Pricing: https://developers.facebook.com/docs/whatsapp/pricing
