-- =====================================================
-- QUICK MIGRATION - Copy and paste this into Supabase
-- =====================================================

-- Step 1: Add welcome_message to doctors table
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS welcome_message TEXT;

-- Step 2: Create clinic_config table if it doesn't exist
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

-- Step 3: Add calendly_link and review_link if table already existed
ALTER TABLE clinic_config 
ADD COLUMN IF NOT EXISTS calendly_link TEXT,
ADD COLUMN IF NOT EXISTS review_link TEXT;

-- Step 4: Create updated_at trigger if it doesn't exist
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

-- Step 5: Set default welcome message for existing doctors
UPDATE doctors 
SET welcome_message = 'Welcome to our clinic! 👋 How can we help you today?'
WHERE welcome_message IS NULL OR welcome_message = '';

-- Step 6: Verify everything worked
SELECT 
  '✅ Migration Complete!' as status,
  COUNT(*) as total_doctors,
  COUNT(welcome_message) as doctors_with_welcome_msg
FROM doctors 
WHERE is_active = true;
