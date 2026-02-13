-- Add UNIQUE constraint to doctors.email to prevent duplicates
-- This ensures each email can only exist once in the doctors table

-- First, check if there are any duplicate emails (should be none now)
SELECT email, COUNT(*) as count
FROM doctors
GROUP BY email
HAVING COUNT(*) > 1;

-- If no duplicates, add the UNIQUE constraint
ALTER TABLE doctors
ADD CONSTRAINT doctors_email_unique UNIQUE (email);

-- Verify the constraint was added
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'doctors'::regclass
  AND conname = 'doctors_email_unique';

-- Expected result: doctors_email_unique | u (u = unique constraint)
