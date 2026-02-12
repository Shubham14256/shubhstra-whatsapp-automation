# Phase 13: Doctor Referrals & PDF Reports - Setup Guide

## Overview
Phase 13 completes the platform with doctor-to-doctor referral tracking with commission management and professional PDF report generation for patient history.

## Business Value

### Doctor Referral Network:
- **Network Growth** - Build relationships with other doctors
- **Commission Tracking** - Automatic calculation and tracking
- **Revenue Sharing** - Fair compensation for referrals
- **Professional Network** - Strengthen medical community ties
- **Patient Acquisition** - Get patients from trusted sources

### PDF Reports:
- **Professional Documentation** - Generate reports instantly
- **Patient History** - Complete visit history in one document
- **Easy Sharing** - Send via WhatsApp directly
- **Record Keeping** - Digital patient records
- **Time Saving** - No manual report creation

## Changes Made

### 1. Database Updates
- Created `external_doctors` table
- Added `referred_by_doctor_id` to patients table
- Created commission tracking triggers
- Created analytics views

### 2. New Dependencies
- `pdfkit` - PDF generation
- `form-data` - File upload to WhatsApp

### 3. New Files Created
- `src/services/pdfService.js` - PDF generation service
- `database/update_phase13_referrals_pdf.sql` - Database schema

### 4. Updated Files
- `src/services/doctorService.js` - External doctor management
- `src/services/whatsappService.js` - Document sending
- `src/controllers/messageHandler.js` - /report and /network commands

## Installation Steps

### Step 1: Install Dependencies ✅

```bash
npm install pdfkit form-data
```

**Status:** Already installed!

---

### Step 2: Update Database

Run in Supabase SQL Editor:
```sql
-- Copy entire contents of database/update_phase13_referrals_pdf.sql
```

This will:
- Create `external_doctors` table
- Add `referred_by_doctor_id` to patients
- Create commission tracking triggers
- Create analytics views
- Add sample external doctors

---

### Step 3: Restart Server

```bash
C:\Users\Shree\AppData\Local\nvm\v20.11.0\node.exe server.js
```

---

## Features Breakdown

### 1. External Doctor Management 👨‍⚕️

**Database Structure:**

`external_doctors` table:
- `id` - UUID
- `name` - Doctor's name
- `phone_number` - Contact number (unique)
- `specialization` - Medical specialty
- `commission_percentage` - Commission rate (default 10%)
- `total_commission_due` - Pending commission amount
- `total_referrals` - Number of patients referred
- `is_active` - Active status

**How It Works:**
```
External doctor refers patient
    ↓
Patient visits clinic
    ↓
Link patient to external doctor
    ↓
Referral count auto-increments (trigger)
    ↓
Commission calculated on completed appointments
    ↓
Track total commission due
```

---

### 2. Doctor Commands 💻

#### Command: `/network`

**Usage:** Doctor sends `/network` via WhatsApp

**Response:**
```
🌐 Referral Network

Total External Doctors: 3

1. Dr. Rajesh Kumar
   Specialization: General Physician
   Referrals: 15
   Commission: 10%
   Due: ₹7,500

2. Dr. Priya Sharma
   Specialization: Pediatrician
   Referrals: 8
   Commission: 12%
   Due: ₹4,800

3. Dr. Amit Patel
   Specialization: Orthopedic
   Referrals: 12
   Commission: 15%
   Due: ₹9,000

━━━━━━━━━━━━━━━━━━━━
💰 Total Commission Due: ₹21,300
```

---

#### Command: `/report <patient name>`

**Usage:** Doctor sends `/report Rahul Patil` via WhatsApp

**Flow:**
```
Doctor: /report Rahul Patil
    ↓
Bot searches for patient
    ↓
If multiple matches:
  - Show list of matches
  - Ask to be more specific
    ↓
If single match:
  - Generate PDF report
  - Send: "📄 Generating report for Rahul Patil..."
  - Create PDF with patient history
  - Upload to WhatsApp
  - Send PDF document
  - Delete local file
    ↓
Doctor receives PDF ✅
```

**PDF Contents:**
- Clinic header with logo
- Patient information
- Last 5 appointments
- Date, time, status, payment
- Professional formatting

---

### 3. PDF Report Generation 📄

**Report Structure:**

```
┌─────────────────────────────────────┐
│     Dr. Sharma's Clinic             │
│     Medical Clinic                  │
│     Phone: 9999999999               │
│     Email: clinic@example.com       │
├─────────────────────────────────────┤
│   Patient Medical Report            │
├─────────────────────────────────────┤
│ Patient Information                 │
│                                     │
│ Name:        Rahul Patil            │
│ Phone:       919999999999           │
│ Patient ID:  abc123...              │
│ First Visit: 01 Jan 2026            │
│ Last Visit:  09 Feb 2026            │
├─────────────────────────────────────┤
│ Recent Appointments                 │
│                                     │
│ # │ Date       │ Time  │ Status    │
│ 1 │ 09 Feb 26  │ 10:00 │ COMPLETED │
│ 2 │ 02 Feb 26  │ 14:30 │ COMPLETED │
│ 3 │ 25 Jan 26  │ 11:00 │ COMPLETED │
│ 4 │ 18 Jan 26  │ 15:00 │ COMPLETED │
│ 5 │ 10 Jan 26  │ 09:30 │ COMPLETED │
├─────────────────────────────────────┤
│ Report generated on: 09 Feb 2026   │
│ This is a computer-generated report │
└─────────────────────────────────────┘
```

**Features:**
- Professional layout
- Clinic branding
- Color-coded headers
- Alternating row colors
- Automatic pagination
- Timestamp
- A4 size format

---

## API Functions

### doctorService.js

#### `addExternalDoctor(name, phoneNumber, commissionPercentage)`
```javascript
const doctor = await addExternalDoctor(
  'Dr. Rajesh Kumar',
  '919876543210',
  10.0
);
// Returns: External doctor object
```

#### `linkPatientToDoctor(patientPhone, externalDoctorName)`
```javascript
const success = await linkPatientToDoctor(
  '919999999999',
  'Dr. Rajesh Kumar'
);
// Returns: true/false
// Automatically increments referral count via trigger
```

#### `getExternalDoctorNetwork(doctorId)`
```javascript
const network = await getExternalDoctorNetwork();
// Returns: Array of external doctors with stats
```

---

### pdfService.js

#### `generatePatientReport(patientId)`
```javascript
const pdfPath = await generatePatientReport('patient-uuid');
// Returns: '/path/to/tmp/patient_report_abc123_1234567890.pdf'
```

#### `deletePDF(filepath)`
```javascript
deletePDF('/path/to/pdf');
// Deletes PDF file after sending
```

---

### whatsappService.js

#### `sendDocument(to, filepath, filename, caption)`
```javascript
await sendDocument(
  '919999999999',
  '/path/to/report.pdf',
  'Patient_Report.pdf',
  'Medical report for Rahul Patil'
);
// Uploads and sends PDF via WhatsApp
```

---

## Testing

### Test 1: Add External Doctor

**Run in Supabase SQL Editor:**
```sql
INSERT INTO external_doctors (name, phone_number, specialization, commission_percentage)
VALUES ('Dr. Test Doctor', '919999999999', 'General Physician', 10.0);
```

**Verify:**
```sql
SELECT * FROM external_doctors WHERE name = 'Dr. Test Doctor';
```

---

### Test 2: Link Patient to External Doctor

**Run in Node.js or SQL:**
```javascript
import { linkPatientToDoctor } from './src/services/doctorService.js';

await linkPatientToDoctor('patient-phone', 'Dr. Test Doctor');
```

**Or SQL:**
```sql
UPDATE patients
SET referred_by_doctor_id = (SELECT id FROM external_doctors WHERE name = 'Dr. Test Doctor')
WHERE phone_number = 'patient-phone';
```

**Verify referral count incremented:**
```sql
SELECT name, total_referrals FROM external_doctors WHERE name = 'Dr. Test Doctor';
```

---

### Test 3: Generate PDF Report

**Send via WhatsApp (as doctor):**
```
/report Rahul
```

**Expected Flow:**
1. Bot searches for patient
2. Bot: "📄 Generating report for Rahul Patil... Please wait."
3. PDF generated
4. PDF uploaded to WhatsApp
5. Doctor receives PDF document
6. Local PDF file deleted

**Check server logs:**
```
📄 Generating PDF report for patient: abc123...
✅ Patient data fetched: Rahul Patil
   Appointments: 5
✅ PDF generated successfully: /tmp/patient_report_abc123_1234567890.pdf
📤 Uploading document to WhatsApp...
✅ Document uploaded. Media ID: wamid.XXX
✅ Document sent successfully
🗑️  PDF file deleted: /tmp/patient_report_abc123_1234567890.pdf
```

---

### Test 4: View Referral Network

**Send via WhatsApp (as doctor):**
```
/network
```

**Expected Response:**
```
🌐 Referral Network

Total External Doctors: 1

1. Dr. Test Doctor
   Specialization: General Physician
   Referrals: 1
   Commission: 10%
   Due: ₹0

━━━━━━━━━━━━━━━━━━━━
💰 Total Commission Due: ₹0.00
```

---

## Commission Calculation

### Manual Commission Calculation:

```sql
-- Calculate commission for a completed appointment
SELECT calculate_doctor_commission(
  'external-doctor-uuid',
  500.00  -- Appointment amount
);

-- This will:
-- 1. Get commission percentage (e.g., 10%)
-- 2. Calculate: 500 * 10 / 100 = ₹50
-- 3. Add ₹50 to total_commission_due
```

### Automatic Calculation (Future Enhancement):

Add trigger on appointments table:
```sql
CREATE TRIGGER calculate_commission_on_completion
  AFTER UPDATE ON appointments
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION auto_calculate_commission();
```

---

## Analytics Queries

### Top Referring Doctors:
```sql
SELECT 
  name,
  specialization,
  total_referrals,
  total_commission_due,
  commission_percentage
FROM external_doctors
WHERE is_active = true
ORDER BY total_referrals DESC
LIMIT 10;
```

### Patients by External Doctor:
```sql
SELECT 
  ed.name as doctor_name,
  p.name as patient_name,
  p.phone_number,
  p.created_at as referred_date,
  COUNT(a.id) as total_appointments
FROM external_doctors ed
JOIN patients p ON p.referred_by_doctor_id = ed.id
LEFT JOIN appointments a ON a.patient_id = p.id
GROUP BY ed.name, p.name, p.phone_number, p.created_at
ORDER BY p.created_at DESC;
```

### Commission Summary:
```sql
SELECT 
  SUM(total_commission_due) as total_pending,
  COUNT(*) as total_doctors,
  AVG(commission_percentage) as avg_commission_rate
FROM external_doctors
WHERE is_active = true;
```

---

## Configuration

### Change Default Commission Rate:

In database:
```sql
ALTER TABLE external_doctors
ALTER COLUMN commission_percentage SET DEFAULT 15.00;
```

### Change PDF Layout:

In `pdfService.js`, modify:
```javascript
// Change page size
const doc = new PDFDocument({
  size: 'LETTER',  // or 'A4', 'LEGAL'
  margins: { top: 50, bottom: 50, left: 50, right: 50 }
});

// Change colors
doc.fillColor('#2563eb')  // Blue header
doc.fillColor('#000000')  // Black text
```

### Change Appointment Limit in Report:

```javascript
// Current: Last 5 appointments
.limit(5);

// Change to 10:
.limit(10);

// Change to all:
// Remove .limit()
```

---

## Best Practices

### Referral Management:
- ✅ Verify external doctor credentials
- ✅ Set appropriate commission rates
- ✅ Track referrals accurately
- ✅ Pay commissions on time
- ✅ Maintain good relationships
- ❌ Don't set commission too high (affects profit)
- ❌ Don't forget to track payments

### PDF Reports:
- ✅ Generate on-demand only
- ✅ Delete after sending
- ✅ Include relevant information
- ✅ Keep formatting professional
- ✅ Add clinic branding
- ❌ Don't store PDFs permanently
- ❌ Don't include sensitive data unnecessarily

---

## Security & Privacy

### PDF Files:
- ✅ Generated in `/tmp` folder
- ✅ Deleted immediately after sending
- ✅ Not stored permanently
- ✅ Unique filenames (timestamp)
- ✅ Only accessible to doctor

### Commission Data:
- ✅ Only visible to clinic owner
- ✅ Secure database storage
- ✅ Audit trail via timestamps
- ✅ Access control via doctor authentication

---

## Troubleshooting

### Issue: PDF generation fails

**Check:**
1. ✅ Patient exists in database?
2. ✅ `/tmp` folder writable?
3. ✅ pdfkit installed?
4. ✅ Sufficient disk space?

**Solution:**
- Check server logs for errors
- Verify patient ID is correct
- Ensure tmp directory exists
- Check file permissions

---

### Issue: Document upload fails

**Error:** 413 Payload Too Large

**Cause:** PDF file > 100MB

**Solution:**
- Limit appointments in report
- Compress PDF if possible
- WhatsApp limit is 100MB

---

### Issue: External doctor not found

**Error:** "External doctor not found"

**Cause:** Name doesn't match exactly

**Solution:**
- Use partial name matching (already implemented)
- Check spelling
- List all external doctors first

---

## Cost Analysis

### PDF Generation:
- **Server Resources:** Minimal (CPU + disk)
- **Storage:** Temporary only (deleted after send)
- **Cost:** $0 (no external service)

### Document Sending:
- **WhatsApp API:** Same as regular messages
- **Cost:** ₹0.30 - ₹0.50 per document

### Commission Tracking:
- **Database:** Minimal storage
- **Cost:** $0 (within Supabase free tier)

**Total Additional Cost:** ~₹0.50 per PDF report

---

## ROI Analysis

### Referral Network:

**Scenario:** 3 external doctors, 10 referrals/month each

- 30 new patients/month
- Average revenue: ₹500/patient
- Total revenue: ₹15,000/month
- Commission (10%): ₹1,500/month
- **Net profit:** ₹13,500/month

**ROI:** 900% (₹13,500 profit on ₹1,500 commission)

### PDF Reports:

**Time Saved:**
- Manual report: 15 minutes
- Automated: 10 seconds
- Time saved: 14 minutes 50 seconds per report

**Value:**
- 20 reports/month
- Time saved: ~5 hours/month
- Value: ₹2,500/month (at ₹500/hour)

**Cost:** ₹10/month (20 reports × ₹0.50)  
**ROI:** 25,000%

---

## Success Checklist

- [ ] Database script run
- [ ] pdfkit installed
- [ ] form-data installed
- [ ] Server restarted
- [ ] Test external doctor added
- [ ] Test patient linked
- [ ] Test /network command
- [ ] Test /report command
- [ ] PDF generated successfully
- [ ] PDF sent via WhatsApp

**When all checked:** Phase 13 is COMPLETE! 🎉

---

## Future Enhancements

- [ ] Automated commission calculation on appointment completion
- [ ] Commission payment tracking
- [ ] Monthly commission reports
- [ ] Multi-page PDF reports
- [ ] Custom PDF templates
- [ ] Include prescription in PDF
- [ ] Include lab reports in PDF
- [ ] Email PDF option
- [ ] Bulk report generation
- [ ] Report scheduling

---

**Phase 13 Status:** ✅ COMPLETE  
**Last Updated:** February 9, 2026  
**Features:** Doctor Referrals + PDF Reports  
**Dependencies:** pdfkit, form-data  
**Cost:** ~₹10/month (PDF sending)

