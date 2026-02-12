# 🔧 Fix: Test Number Webhook Not Working

## Problem
Messages sent to the test WhatsApp number weren't being received because the webhook couldn't find the doctor in the database.

## Root Cause
- Meta webhook sends `display_phone_number` in metadata (for test: `15551391349`)
- Database only had `phone_number` column with value `919545816728`
- Code was searching by wrong column → No doctor found → Messages ignored

## Solution Applied

### 1. Added `display_phone_number` Column
Created migration: `database/add_display_phone_number.sql`

### 2. Updated Doctor Service
Modified `getDoctorByPhone()` to search by `display_phone_number` instead of `phone_number`

### 3. Database Update Required
Run this SQL in Supabase:

```sql
-- Add the column
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS display_phone_number VARCHAR(20);

-- Add index
CREATE INDEX IF NOT EXISTS idx_doctors_display_phone_number 
ON doctors(display_phone_number);

-- Update Dr. Shubham with test number
UPDATE doctors 
SET display_phone_number = '15551391349'
WHERE phone_number = '919545816728';

-- Verify
SELECT name, phone_number, display_phone_number 
FROM doctors 
WHERE phone_number = '919545816728';
```

## How It Works Now

### Test Number Flow:
1. Patient messages test number → Meta webhook fires
2. Webhook metadata contains: `display_phone_number: "15551391349"`
3. Code searches: `WHERE display_phone_number = '15551391349'`
4. Finds Dr. Shubham ✅
5. Message processed correctly

### Production Flow (Real Numbers):
When you switch to real WhatsApp Business number:

```sql
UPDATE doctors 
SET display_phone_number = '919545816728'  -- Your real number
WHERE phone_number = '919545816728';
```

## Multi-Doctor Setup

For each new doctor:

```sql
INSERT INTO doctors (
  name, 
  email, 
  phone_number, 
  display_phone_number,  -- Same as their WhatsApp Business number
  whatsapp_phone_number_id,
  whatsapp_business_account_id,
  whatsapp_access_token
) VALUES (
  'Dr. Amit Patel',
  'amit@example.com',
  '919876543210',
  '919876543210',  -- Their real WhatsApp number
  'THEIR_PHONE_NUMBER_ID',
  'THEIR_BUSINESS_ACCOUNT_ID',
  'THEIR_ACCESS_TOKEN'
);
```

## Next Steps

1. ✅ Run the SQL migration in Supabase
2. ✅ Restart backend server
3. ✅ Test by sending message to test number
4. ✅ Check terminal logs for "Doctor found" message

## Testing

Send "Hi" to test number and check logs:
```
🔍 Searching for doctor with display_phone_number: 15551391349
✅ Doctor found: Dr. Shubham Solat (ID: xxx)
```

If you see this, webhook is working! 🎉
