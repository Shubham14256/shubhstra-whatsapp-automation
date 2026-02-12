-- =====================================================
-- Move Welcome Message to Doctors Table
-- =====================================================
-- This moves welcome_message from clinic_config to doctors table
-- So each doctor has their own welcome message

-- Step 1: Add welcome_message column to doctors table
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS welcome_message TEXT;

-- Add comment
COMMENT ON COLUMN doctors.welcome_message IS 'Welcome message sent to patients when they first contact the bot';

-- Step 2: Migrate existing welcome messages from clinic_config to doctors
UPDATE doctors d
SET welcome_message = cc.welcome_message
FROM clinic_config cc
WHERE d.id = cc.doctor_id
AND cc.welcome_message IS NOT NULL
AND cc.welcome_message != '';

-- Step 3: (Optional) Remove welcome_message from clinic_config
-- Uncomment if you want to remove it completely
-- ALTER TABLE clinic_config DROP COLUMN IF EXISTS welcome_message;

-- Verify the migration
SELECT 
  id,
  name,
  email,
  CASE 
    WHEN welcome_message IS NOT NULL THEN '✅ Has welcome message'
    ELSE '❌ No welcome message'
  END as status,
  LEFT(welcome_message, 50) as message_preview
FROM doctors
WHERE is_active = true;

-- =====================================================
-- Sample Update (Optional)
-- =====================================================
-- Set default welcome message for doctors without one
UPDATE doctors 
SET welcome_message = 'Welcome to our clinic! 👋 How can we help you today?'
WHERE welcome_message IS NULL OR welcome_message = '';
