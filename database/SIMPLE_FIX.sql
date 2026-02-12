-- =====================================================
-- SIMPLE FIX - Run this in Supabase SQL Editor
-- =====================================================

-- 1. Add welcome_message to doctors table
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS welcome_message TEXT;

-- 2. Add calendly_link to clinic_config table
ALTER TABLE clinic_config 
ADD COLUMN IF NOT EXISTS calendly_link TEXT;

-- 3. Add review_link to clinic_config table
ALTER TABLE clinic_config 
ADD COLUMN IF NOT EXISTS review_link TEXT;

-- 4. Set default welcome message
UPDATE doctors 
SET welcome_message = 'Welcome to our clinic! 👋 How can we help you today?'
WHERE (welcome_message IS NULL OR welcome_message = '') 
AND is_active = true;

-- 5. Check if it worked
SELECT 
  'doctors table' as table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'doctors' 
AND column_name = 'welcome_message'

UNION ALL

SELECT 
  'clinic_config table' as table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'clinic_config' 
AND column_name IN ('calendly_link', 'review_link')
ORDER BY table_name, column_name;
