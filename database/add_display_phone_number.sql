-- =====================================================
-- Add display_phone_number Column to Doctors Table
-- =====================================================
-- The display_phone_number is what Meta sends in webhook metadata
-- For test numbers: 15551391349
-- For real numbers: 919545816728 (your actual WhatsApp Business number)

-- Add display_phone_number column
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS display_phone_number VARCHAR(20);

-- Add index for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_doctors_display_phone_number 
ON doctors(display_phone_number);

-- Add comment
COMMENT ON COLUMN doctors.display_phone_number IS 'WhatsApp display phone number from Meta webhook metadata (used for doctor identification)';

-- =====================================================
-- Update Dr. Shubham with Test Number Display Phone
-- =====================================================
-- Test number display phone: 15551391349
UPDATE doctors 
SET display_phone_number = '15551391349'
WHERE phone_number = '919545816728';

-- Verify the update
SELECT 
  id,
  name,
  phone_number,
  display_phone_number,
  whatsapp_phone_number_id
FROM doctors
WHERE phone_number = '919545816728';

-- =====================================================
-- IMPORTANT: For Production with Real Numbers
-- =====================================================
-- When you switch to real WhatsApp Business numbers, update like this:
-- UPDATE doctors 
-- SET display_phone_number = '919545816728'  -- Your real number
-- WHERE phone_number = '919545816728';
