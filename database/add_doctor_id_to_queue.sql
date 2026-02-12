-- =====================================================
-- Add doctor_id to queue table for multi-tenancy
-- =====================================================
-- Run this SQL in your Supabase SQL Editor

-- Add doctor_id column to queue table if it doesn't exist
ALTER TABLE queue 
ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_queue_doctor_id ON queue(doctor_id);

-- Add comment
COMMENT ON COLUMN queue.doctor_id IS 'Reference to the doctor who owns this queue entry';

-- Verification query
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'queue' 
  AND column_name = 'doctor_id';

-- =====================================================
-- IMPORTANT: Update existing queue records
-- =====================================================
-- If you have existing queue records without doctor_id,
-- you need to assign them to a doctor manually:

/*
-- Example: Assign all existing queue records to a specific doctor
UPDATE queue
SET doctor_id = (SELECT id FROM doctors WHERE email = 'your-doctor@example.com')
WHERE doctor_id IS NULL;
*/

-- =====================================================
-- Row Level Security (Optional but Recommended)
-- =====================================================

-- Enable RLS on queue table
ALTER TABLE queue ENABLE ROW LEVEL SECURITY;

-- Policy: Doctors can only view their own queue
CREATE POLICY "Doctors can only view their own queue"
ON queue
FOR SELECT
USING (
  doctor_id = (
    SELECT id FROM doctors 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Policy: Doctors can only insert into their own queue
CREATE POLICY "Doctors can only insert into their own queue"
ON queue
FOR INSERT
WITH CHECK (
  doctor_id = (
    SELECT id FROM doctors 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Policy: Doctors can only update their own queue
CREATE POLICY "Doctors can only update their own queue"
ON queue
FOR UPDATE
USING (
  doctor_id = (
    SELECT id FROM doctors 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Policy: Doctors can only delete from their own queue
CREATE POLICY "Doctors can only delete from their own queue"
ON queue
FOR DELETE
USING (
  doctor_id = (
    SELECT id FROM doctors 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- =====================================================
-- Verification
-- =====================================================

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'queue';

-- List all policies on queue table
SELECT * FROM pg_policies WHERE tablename = 'queue';

RAISE NOTICE '✅ Queue table updated with doctor_id column and RLS policies';
