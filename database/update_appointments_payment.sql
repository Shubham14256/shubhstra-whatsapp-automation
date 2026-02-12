-- =====================================================
-- Shubhstra Tech - Appointments Payment & Reminder Updates
-- =====================================================
-- Run this SQL in your Supabase SQL Editor

-- =====================================================
-- UPDATE APPOINTMENTS TABLE - Add Payment & Reminder Columns
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
-- SAMPLE DATA UPDATES
-- =====================================================

-- Update existing appointments with default payment status
UPDATE appointments
SET payment_status = 'pending',
    balance_amount = 500.00
WHERE payment_status IS NULL;

-- =====================================================
-- USEFUL QUERIES
-- =====================================================

-- Find appointments needing reminders (next 2 hours)
SELECT 
  a.id,
  p.name AS patient_name,
  p.phone_number,
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
  a.appointment_time,
  a.payment_status,
  a.balance_amount
FROM appointments a
JOIN patients p ON a.patient_id = p.id
WHERE a.payment_status = 'pending'
  AND a.appointment_time::date = CURRENT_DATE - INTERVAL '1 day'
  AND a.status = 'completed'
ORDER BY a.appointment_time;

-- Count appointments by payment status
SELECT 
  payment_status,
  COUNT(*) as count,
  SUM(balance_amount) as total_pending
FROM appointments
GROUP BY payment_status;

-- View appointments with reminders sent
SELECT 
  p.name,
  a.appointment_time,
  a.reminder_sent,
  a.status
FROM appointments a
JOIN patients p ON a.patient_id = p.id
WHERE a.reminder_sent = true
ORDER BY a.appointment_time DESC
LIMIT 10;
