-- =====================================================
-- COMPLETE SETTINGS MIGRATION
-- =====================================================
-- Run this SQL in Supabase SQL Editor to add all missing columns

-- =====================================================
-- 1. Add welcome_message to doctors table
-- =====================================================
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS welcome_message TEXT;

COMMENT ON COLUMN doctors.welcome_message IS 'Welcome message sent to patients when they first contact the bot';

-- Set default welcome message for existing doctors
UPDATE doctors 
SET welcome_message = 'Welcome to our clinic! 👋 How can we help you today?'
WHERE welcome_message IS NULL OR welcome_message = '';

-- =====================================================
-- 2. Create/Update clinic_config table
-- =====================================================
-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS clinic_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  opening_time TIME DEFAULT '09:00:00',
  closing_time TIME DEFAULT '18:00:00',
  holidays TEXT[] DEFAULT '{}',
  calendly_link TEXT,
  review_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_id)
);

-- Add columns if table already existed
ALTER TABLE clinic_config 
ADD COLUMN IF NOT EXISTS calendly_link TEXT,
ADD COLUMN IF NOT EXISTS review_link TEXT;

COMMENT ON COLUMN clinic_config.calendly_link IS 'Calendly appointment booking link for patients';
COMMENT ON COLUMN clinic_config.review_link IS 'Google Review or feedback link for patients';

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_clinic_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_clinic_config_updated_at_trigger ON clinic_config;
CREATE TRIGGER update_clinic_config_updated_at_trigger
  BEFORE UPDATE ON clinic_config
  FOR EACH ROW
  EXECUTE FUNCTION update_clinic_config_updated_at();

-- =====================================================
-- 3. Verify all columns exist
-- =====================================================
-- Check doctors table
SELECT 
  'doctors' as table_name,
  column_name, 
  data_type,
  CASE WHEN column_name IN ('welcome_message') THEN '✅ NEW' ELSE '✓' END as status
FROM information_schema.columns 
WHERE table_name = 'doctors' 
AND column_name IN ('name', 'clinic_name', 'clinic_address', 'consultation_fee', 'welcome_message', 'phone_number', 'email')
ORDER BY column_name;

-- Check clinic_config table
SELECT 
  'clinic_config' as table_name,
  column_name, 
  data_type,
  CASE WHEN column_name IN ('calendly_link', 'review_link') THEN '✅ NEW' ELSE '✓' END as status
FROM information_schema.columns 
WHERE table_name = 'clinic_config' 
AND column_name IN ('opening_time', 'closing_time', 'holidays', 'calendly_link', 'review_link', 'doctor_id')
ORDER BY column_name;

-- =====================================================
-- 4. View current doctor settings
-- =====================================================
SELECT 
  d.id,
  d.name,
  d.email,
  d.clinic_name,
  d.consultation_fee,
  CASE 
    WHEN d.welcome_message IS NOT NULL THEN '✅ Set'
    ELSE '❌ Empty'
  END as welcome_msg_status,
  LEFT(d.welcome_message, 30) as welcome_preview
FROM doctors d
WHERE d.is_active = true
ORDER BY d.name;

-- =====================================================
-- 5. View current clinic config (if table has data)
-- =====================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM clinic_config LIMIT 1) THEN
    RAISE NOTICE 'Clinic Config Data:';
    PERFORM * FROM (
      SELECT 
        d.name as doctor_name,
        cc.opening_time,
        cc.closing_time,
        CASE 
          WHEN cc.calendly_link IS NOT NULL THEN '✅ Set'
          ELSE '❌ Empty'
        END as calendly_status,
        CASE 
          WHEN cc.review_link IS NOT NULL THEN '✅ Set'
          ELSE '❌ Empty'
        END as review_status
      FROM clinic_config cc
      JOIN doctors d ON cc.doctor_id = d.id
      WHERE d.is_active = true
      ORDER BY d.name
    ) AS config_data;
  ELSE
    RAISE NOTICE 'No clinic config data yet. Will be created when doctors save settings.';
  END IF;
END $$;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ ═══════════════════════════════════════════════════';
  RAISE NOTICE '✅ MIGRATION COMPLETE!';
  RAISE NOTICE '✅ ═══════════════════════════════════════════════════';
  RAISE NOTICE '✅ Added to doctors table:';
  RAISE NOTICE '   - welcome_message';
  RAISE NOTICE '✅ Added to clinic_config table:';
  RAISE NOTICE '   - calendly_link';
  RAISE NOTICE '   - review_link';
  RAISE NOTICE '✅ ═══════════════════════════════════════════════════';
  RAISE NOTICE '📋 Next Steps:';
  RAISE NOTICE '   1. Restart backend server';
  RAISE NOTICE '   2. Restart frontend server';
  RAISE NOTICE '   3. Login to dashboard → Settings';
  RAISE NOTICE '   4. Configure your links and welcome message';
  RAISE NOTICE '✅ ═══════════════════════════════════════════════════';
END $$;
