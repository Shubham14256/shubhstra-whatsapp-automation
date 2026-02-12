-- =====================================================
-- Add consultation_fee column to doctors table
-- =====================================================
-- Run this SQL in your Supabase SQL Editor

-- Add consultation_fee column to doctors table
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS consultation_fee NUMERIC(10, 2) DEFAULT 500.00;

-- Add comment
COMMENT ON COLUMN doctors.consultation_fee IS 'Default consultation fee for appointments (in INR)';

-- Add constraint to ensure positive values
ALTER TABLE doctors
DROP CONSTRAINT IF EXISTS valid_consultation_fee;

ALTER TABLE doctors
ADD CONSTRAINT valid_consultation_fee 
CHECK (consultation_fee IS NULL OR consultation_fee >= 0);

-- Verification query
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'doctors' 
  AND column_name = 'consultation_fee';

-- =====================================================
-- Optional: Update existing doctors with default fee
-- =====================================================

-- Set default consultation fee for existing doctors who don't have one
UPDATE doctors
SET consultation_fee = 500.00
WHERE consultation_fee IS NULL;

-- =====================================================
-- Verification
-- =====================================================

-- Check all doctors and their consultation fees
SELECT 
  id,
  name,
  clinic_name,
  consultation_fee
FROM doctors
ORDER BY name;

RAISE NOTICE '✅ consultation_fee column added to doctors table successfully';
