# Phase 8: Operations Upgrade - Setup Guide

## Overview
Phase 8 implements advanced operational features including clinic timings, patient search, queue management, and multi-language support (English & Marathi).

## Business Value

### Clinic Timings:
- **Automatic status** - Patients know if clinic is open/closed
- **Smart messaging** - Still allow bookings when closed
- **Holiday management** - Configure holidays in advance

### Patient Search (Doctor Command):
- **Quick lookup** - Find patients by name instantly
- **Last visit tracking** - See when patient last visited
- **Mini-CRM** - Manage patients via WhatsApp

### Queue Management:
- **Token system** - Patients get queue number
- **Wait time** - Estimated wait time calculation
- **Real-time status** - Check queue anytime

### Multi-Language Support:
- **Marathi support** - Serve local patients better
- **Auto-detection** - Remember patient's language
- **Seamless experience** - All messages translated

## Changes Made

### 1. New Database Table
- `clinic_config` - Stores clinic operational settings

### 2. Database Updates
- `patients` table - Added `preferred_language` column

### 3. New Files Created
- `src/services/queueService.js` - Queue management logic
- `database/create_clinic_config_table.sql` - Database schema

### 4. Updated Files
- `src/services/doctorService.js` - Added `isClinicOpen()` function
- `src/controllers/messageHandler.js` - Multi-language, search, queue logic

## Installation Steps

### Step 1: Create Database Table

Run in Supabase SQL Editor:
```sql
-- Copy entire contents of database/create_clinic_config_table.sql
```

This will:
- Create `clinic_config` table
- Add `preferred_language` column to `patients`
- Insert sample clinic config
- Create indexes

### Step 2: Configure Clinic Timings

Update clinic config in Supabase:
```sql
UPDATE clinic_config
SET 
  opening_time = '09:00:00',
  closing_time = '18:00:00',
  holidays = '["2026-01-26", "2026-08-15", "2026-10-02"]'::jsonb,
  average_consultation_time = 15
WHERE doctor_id = 'your-doctor-id';
```

### Step 3: Restart Server

```bash
npm start
```

No new dependencies needed!

## Features Breakdown

### 1. Clinic Timings Check

**How it works:**
```
Patient sends "Hi"
    ↓
Check clinic_config table
    ↓
Is current time between opening_time and closing_time?
    ↓
┌─────────────┴─────────────┐
│                           │
YES (Open)              NO (Closed)
│                           │
Send menu               Send "Closed" message
                        + Still show menu
```

**Example Messages:**

**When Closed:**
```
🔒 Clinic is Currently Closed

We open at 9:00 AM.

However, you can still book an appointment! 👇
```

**Marathi:**
```
🔒 क्लिनिक बंद आहे

आम्ही 9:00 AM वाजता उघडतो.

तरीही तुम्ही अपॉइंटमेंट बुक करू शकता! 👇
```

### 2. Patient Search (Doctor Command)

**Usage:** `/search <name>`

**Example:**
```
Doctor sends: /search Rahul

Bot replies:
🔍 Found 2 Patient(s):

1. Rahul Patil
   📱 989012...
   📅 Last Visit: 10 Jan 2026

2. Rahul Sharma
   📱 902134...
   📅 Last Visit: 2 Feb 2026
```

**Features:**
- Case-insensitive search
- Partial name matching
- Shows last visit date
- Masked phone numbers (privacy)
- Limited to 10 results

### 3. Queue Status

**Patient Request:**
Patient sends: "queue" or "token" or "wait"

**Bot Response:**
```
🎫 Your Token Number: #5

👥 People ahead of you: 2
⏱️ Approximate wait time: 30 minutes

Please try to arrive on time. Thank you! 🙏
```

**Marathi:**
```
🎫 तुमचा टोकन क्रमांक: #5

👥 तुमच्या आधी: 2 लोक
⏱️ अंदाजे प्रतीक्षा: 30 मिनिटे

कृपया वेळेवर येण्याचा प्रयत्न करा. धन्यवाद! 🙏
```

**Doctor Command:** `/queue`

**Bot Response:**
```
📋 Today's Queue (5 patients)

1. Rahul Patil
   ⏰ 10:00 AM
   📊 Confirmed

2. Priya Sharma
   ⏰ 10:30 AM
   📊 Pending

...
```

### 4. Multi-Language Support

**Supported Languages:**
- English (en) - Default
- Marathi (mr)

**How it works:**
1. Patient's language stored in `patients.preferred_language`
2. All messages check language preference
3. Appropriate translation sent

**Marathi Keywords:**
- नमस्कार (Hello)
- हॅलो (Hi)
- रांग (Queue)
- टोकन (Token)
- प्रतीक्षा (Wait)

## Database Schema

### clinic_config Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| doctor_id | UUID | Foreign key to doctors (unique) |
| opening_time | TIME | Clinic opening time (e.g., 09:00:00) |
| closing_time | TIME | Clinic closing time (e.g., 18:00:00) |
| holidays | JSONB | Array of holiday dates |
| welcome_message_marathi | TEXT | Custom Marathi welcome message |
| average_consultation_time | INTEGER | Minutes per patient (default: 15) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Example holidays JSON:**
```json
["2026-01-26", "2026-08-15", "2026-10-02", "2026-12-25"]
```

### patients Table (Updated)

**New Column:**
- `preferred_language` VARCHAR(10) DEFAULT 'en'

**Values:**
- 'en' - English
- 'mr' - Marathi
- 'hi' - Hindi (future)

## API Functions

### doctorService.js

#### `isClinicOpen(doctorId)`
```javascript
const status = await isClinicOpen(doctorId);

// Returns:
{
  isOpen: true/false,
  reason: 'holiday' | 'outside_hours',
  message: 'Clinic is closed...',
  openingTime: '09:00:00',
  closingTime: '18:00:00'
}
```

### queueService.js

#### `getQueueStatus(patientId, appointmentId)`
```javascript
const queue = await getQueueStatus(patientId);

// Returns:
{
  hasAppointment: true,
  tokenNumber: 5,
  peopleAhead: 2,
  estimatedWaitMinutes: 30,
  appointmentTime: '2026-02-09T10:00:00Z',
  status: 'confirmed'
}
```

#### `getTodayQueue(doctorId)`
```javascript
const queue = await getTodayQueue(doctorId);

// Returns array of appointments with patient details
```

#### `formatQueueMessage(queueStatus, language)`
```javascript
const message = formatQueueMessage(queueStatus, 'mr');
// Returns formatted message in specified language
```

## Console Output Examples

### Clinic Timing Check:
```
🕐 Checking clinic hours for doctor: abc-123
✅ Clinic is open (09:00:00 - 18:00:00)
```

or

```
🕐 Checking clinic hours for doctor: abc-123
🔒 Clinic is closed (Opens at 09:00:00)
```

### Doctor Search:
```
👨‍⚕️ Message from doctor - checking for commands
🔍 Doctor searching for: "Rahul"
✅ Search results sent (2 patients)
```

### Queue Status:
```
📊 Calculating queue status for patient: xyz-789
✅ Queue status calculated:
   Token: #5
   People ahead: 2
   Estimated wait: 30 mins
```

## Testing

### Test Clinic Timings:

**Method 1: Change time in database**
```sql
-- Set clinic to close at 5 PM
UPDATE clinic_config
SET closing_time = '17:00:00'
WHERE doctor_id = 'your-doctor-id';
```

Then send "Hi" after 5 PM to test closed message.

**Method 2: Add today as holiday**
```sql
UPDATE clinic_config
SET holidays = holidays || '["2026-02-09"]'::jsonb
WHERE doctor_id = 'your-doctor-id';
```

### Test Patient Search:

1. Add test patients with similar names
2. Send from doctor's number: `/search Rahul`
3. Should see list of matching patients

### Test Queue:

1. Create multiple appointments for today
2. Send from patient's number: "queue"
3. Should see token number and wait time

### Test Multi-Language:

1. Update patient language:
```sql
UPDATE patients
SET preferred_language = 'mr'
WHERE phone_number = '919999999999';
```

2. Send "नमस्कार" from that number
3. Should receive Marathi responses

## Configuration

### Set Clinic Hours:
```sql
UPDATE clinic_config
SET 
  opening_time = '09:00:00',  -- 9 AM
  closing_time = '18:00:00'   -- 6 PM
WHERE doctor_id = 'your-doctor-id';
```

### Add Holidays:
```sql
UPDATE clinic_config
SET holidays = '[
  "2026-01-26",  -- Republic Day
  "2026-08-15",  -- Independence Day
  "2026-10-02",  -- Gandhi Jayanti
  "2026-12-25"   -- Christmas
]'::jsonb
WHERE doctor_id = 'your-doctor-id';
```

### Set Average Consultation Time:
```sql
UPDATE clinic_config
SET average_consultation_time = 20  -- 20 minutes per patient
WHERE doctor_id = 'your-doctor-id';
```

### Set Patient Language:
```sql
UPDATE patients
SET preferred_language = 'mr'  -- Marathi
WHERE phone_number = '919876543210';
```

## Doctor Commands Reference

### `/search <name>`
Search for patients by name

**Example:**
```
/search Rahul
/search Priya
/search Sharma
```

### `/queue`
View today's appointment queue

**Example:**
```
/queue
```

## Troubleshooting

### Clinic always shows as open
- Check `clinic_config` table exists
- Verify `opening_time` and `closing_time` are set
- Check server timezone matches your location

### Search not working
- Verify message is from doctor's phone number
- Check patient names are not null in database
- Ensure `/search` has space after it

### Queue shows wrong numbers
- Verify appointments have correct `appointment_time`
- Check `status` is 'confirmed' or 'pending'
- Ensure `doctor_id` matches

### Language not switching
- Check `preferred_language` column exists
- Verify patient record has language set
- Restart server after database changes

## Best Practices

### Clinic Timings:
- ✅ Set realistic hours
- ✅ Update holidays in advance
- ✅ Keep average consultation time accurate
- ❌ Don't set overlapping hours

### Patient Search:
- ✅ Use partial names for better results
- ✅ Keep patient names updated
- ✅ Respect patient privacy (masked phones)
- ❌ Don't share full phone numbers

### Queue Management:
- ✅ Update appointment status promptly
- ✅ Keep consultation time realistic
- ✅ Inform patients of delays
- ❌ Don't overbook time slots

### Multi-Language:
- ✅ Detect language from first interaction
- ✅ Keep translations accurate
- ✅ Test all messages in both languages
- ❌ Don't mix languages in same message

## Next Steps (Phase 9)

- [ ] Add more languages (Hindi, Gujarati)
- [ ] Automated appointment reminders
- [ ] SMS notifications
- [ ] Payment integration
- [ ] Prescription management
- [ ] Medical history tracking

## Support

For issues:
1. Check server logs for errors
2. Verify database tables exist
3. Test with sample data
4. Check Supabase connection

---

**Phase 8 Status:** ✅ Complete  
**Last Updated:** February 9, 2026  
**Features:** Timings, Search, Queue, Multi-Language  
