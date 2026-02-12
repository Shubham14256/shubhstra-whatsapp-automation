-- =====================================================
-- Shubhstra Tech - Phase 8 & Phase 9 Database Updates
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- This combines all missing columns from Phase 8 and Phase 9

-- =====================================================
-- PHASE 8 UPDATES - Patients Table
-- =====================================================

-- Add preferred_language column to patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en';

-- Add comment
COMMENT ON COLUMN patients.preferred_language IS 'Patient preferred language: en (English), mr (Marathi), hi (Hindi)';

-- Create index for language queries
CREATE INDEX IF NOT EXISTS idx_patients_language ON patients(preferred_language);

-- =====================================================
-- PHASE 9 UPDATES - Appointments Table (Payment & Reminders)
-- =====================================================

-- Add payment_status column
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending';

-- Add balance_amount column
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS balance_amount NUMERIC(10, 2) DEFAULT 0.00;

-- Add reminder_sent column
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

-- Add constraint for valid payment status
ALTER TABLE appointments
DROP CONSTRAINT IF EXISTS valid_payment_status;

ALTER TABLE appointments
ADD CONSTRAINT valid_payment_status 
CHECK (payment_status IN ('paid', 'pending', 'partial'));

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_payment_status 
ON appointments(payment_status);

CREATE INDEX IF NOT EXISTS idx_appointments_reminder_sent 
ON appointments(reminder_sent);

CREATE INDEX IF NOT EXISTS idx_appointments_time_reminder 
ON appointments(appointment_time, reminder_sent) 
WHERE reminder_sent = false;

-- Add comments
COMMENT ON COLUMN appointments.payment_status IS 'Payment status: paid, pending, partial';
COMMENT ON COLUMN appointments.balance_amount IS 'Outstanding balance amount';
COMMENT ON COLUMN appointments.reminder_sent IS 'Whether appointment reminder has been sent';

-- =====================================================
-- UPDATE EXISTING DATA
-- =====================================================

-- Set default language for existing patients
UPDATE patients
SET preferred_language = 'en'
WHERE preferred_language IS NULL;

-- Update existing appointments with default payment status
UPDATE appointments
SET payment_status = 'pending',
    balance_amount = 0.00,
    reminder_sent = false
WHERE payment_status IS NULL;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check patients table columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'patients'
ORDER BY ordinal_position;

-- Check appointments table columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;

-- =====================================================
-- USEFUL QUERIES FOR TESTING
-- =====================================================

-- Find appointments needing reminders (next 2 hours)
SELECT 
  a.id,
  p.name AS patient_name,
  p.phone_number,
  p.preferred_language,
  a.appointment_time,
  a.reminder_sent
FROM appointments a
JOIN patients p ON a.patient_id = p.id
WHERE a.appointment_time BETWEEN NOW() AND NOW() + INTERVAL '2 hours'
  AND a.reminder_sent = false
  AND a.status = 'confirmed'
ORDER BY a.appointment_time;

-- Find appointments with pending payments (yesterday)
SELECT 
  a.id,
  p.name AS patient_name,
  p.phone_number,
  p.preferred_language,
  a.appointment_time,
  a.payment_status,
  a.balance_amount
FROM appointments a
JOIN patients p ON a.patient_id = p.id
WHERE a.payment_status = 'pending'
  AND a.appointment_time::date = CURRENT_DATE - INTERVAL '1 day'
  AND a.status IN ('completed', 'confirmed')
ORDER BY a.appointment_time;

-- Count appointments by payment status
SELECT 
  payment_status,
  COUNT(*) as count,
  SUM(balance_amount) as total_pending
FROM appointments
GROUP BY payment_status;

-- View patients by language preference
SELECT 
  preferred_language,
  COUNT(*) as patient_count
FROM patients
GROUP BY preferred_language;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $
BEGIN
  RAISE NOTICE '✅ Phase 8 & Phase 9 database updates completed successfully!';
  RAISE NOTICE '✅ Added preferred_language to patients table';
  RAISE NOTICE '✅ Added payment_status, balance_amount, reminder_sent to appointments table';
  RAISE NOTICE '✅ Created indexes for performance';
  RAISE NOTICE '✅ Updated existing data with defaults';
END $;
