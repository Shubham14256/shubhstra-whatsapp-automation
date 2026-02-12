# Phase 2: Database Integration - Setup Guide

## Overview
Phase 2 integrates Supabase database to identify doctors based on their WhatsApp Business phone numbers.

## Changes Made

### 1. New Dependencies
- `@supabase/supabase-js` - Supabase client library

### 2. New Files Created
- `src/config/supabaseClient.js` - Supabase client initialization
- `src/services/doctorService.js` - Doctor database operations
- `database/create_doctors_table.sql` - SQL schema for doctors table

### 3. Updated Files
- `src/controllers/webhookController.js` - Now identifies doctors from incoming messages
- `.env` - Added Supabase configuration
- `package.json` - Added Supabase dependency

## Installation Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Update your `.env` file with your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
```

**Where to find these values:**
1. Go to your Supabase project dashboard
2. Click on "Settings" (gear icon)
3. Click on "API"
4. Copy:
   - `URL` → SUPABASE_URL
   - `anon/public` key → SUPABASE_KEY

### Step 3: Create Database Table
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `database/create_doctors_table.sql`
5. Paste it into the SQL Editor
6. Click "Run" or press `Ctrl+Enter`

### Step 4: Add Your Doctor Data
After creating the table, add your actual WhatsApp Business phone number:

```sql
INSERT INTO doctors (name, phone_number, email, specialization, clinic_name, is_active)
VALUES 
  ('Dr. Your Name', '919876543210', 'your.email@example.com', 'Your Specialization', 'Your Clinic', true);
```

**Important:** The `phone_number` must match the `display_phone_number` that Meta sends in the webhook metadata.

### Step 5: Start the Server
```bash
npm start
```

## How It Works

### Incoming Message Flow:
1. Patient sends a WhatsApp message to doctor's business number
2. Meta sends webhook POST request to `/webhook`
3. Server extracts `display_phone_number` from `metadata`
4. Server queries Supabase `doctors` table
5. If found: Logs "✅ Doctor Identified: Dr. [Name]"
6. If not found: Logs "❌ Unknown Doctor Number"

### Example Console Output:

**When Doctor is Found:**
```
📞 Display Phone Number (Doctor's Number): 919876543210
🔍 Searching for doctor with phone: 919876543210
✅ Doctor found: Dr. Rajesh Kumar (ID: abc-123-def)
✅ Doctor Identified: Dr. Rajesh Kumar
   Specialization: Cardiologist
   Email: rajesh.kumar@example.com
```

**When Doctor is NOT Found:**
```
📞 Display Phone Number (Doctor's Number): 919999999999
🔍 Searching for doctor with phone: 919999999999
ℹ️  No doctor found with phone: 919999999999
❌ Unknown Doctor Number
   Phone: 919999999999 is not registered in the system
```

## Database Schema

### doctors Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| name | VARCHAR(255) | Doctor's full name |
| phone_number | VARCHAR(20) | WhatsApp Business number (unique) |
| email | VARCHAR(255) | Email address |
| specialization | VARCHAR(255) | Medical specialization |
| clinic_name | VARCHAR(255) | Clinic/hospital name |
| clinic_address | TEXT | Physical address |
| is_active | BOOLEAN | Account status (default: true) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### Indexes
- `idx_doctors_phone_number` - Fast phone number lookups
- `idx_doctors_is_active` - Filter active doctors

## Testing

### Test Doctor Lookup Manually:
You can test the doctor service by creating a test script:

```javascript
// test-doctor-lookup.js
import { getDoctorByPhone } from './src/services/doctorService.js';

const testPhone = '919876543210'; // Replace with your test number
const doctor = await getDoctorByPhone(testPhone);
console.log('Result:', doctor);
```

Run: `node test-doctor-lookup.js`

## Troubleshooting

### Error: "SUPABASE_URL is not defined"
- Make sure `.env` file exists in the root directory
- Verify SUPABASE_URL is set correctly
- Restart the server after updating `.env`

### Error: "relation 'doctors' does not exist"
- Run the SQL script in Supabase SQL Editor
- Verify the table was created: `SELECT * FROM doctors;`

### Doctor Not Found (but should exist)
- Check phone number format in database matches exactly
- Phone numbers are cleaned (spaces/dashes removed) automatically
- Verify `is_active = true` in the database
- Check Supabase logs for any errors

## Next Steps (Phase 3)
- Patient identification and storage
- Message history tracking
- Automated responses
- Appointment scheduling

## Support
For issues, check:
1. Supabase dashboard logs
2. Server console output
3. Network tab in Meta App Dashboard
