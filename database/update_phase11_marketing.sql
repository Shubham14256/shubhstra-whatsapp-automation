-- =====================================================
-- Shubhstra Tech - Phase 11: Marketing Suite
-- =====================================================
-- Run this SQL in your Supabase SQL Editor

-- =====================================================
-- UPDATE DOCTORS TABLE - Add Social Media Links
-- =====================================================

-- Add social_links column (JSONB for flexible social media URLs)
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN doctors.social_links IS 'Social media links: {instagram, youtube, website, facebook, twitter}';

-- Create index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_doctors_social_links 
ON doctors USING GIN (social_links);

-- =====================================================
-- UPDATE PATIENTS TABLE - Add Referral System
-- =====================================================

-- Add referral_code column (unique code for each patient)
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;

-- Add referred_by column (FK to patients who referred them)
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES patients(id) ON DELETE SET NULL;

-- Add referral_count column (track how many patients they referred)
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;

-- Add last_recall_sent column (track when last recall message was sent)
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS last_recall_sent TIMESTAMP WITH TIME ZONE;

-- Add comments
COMMENT ON COLUMN patients.referral_code IS 'Unique referral code for patient (e.g., RAH1234)';
COMMENT ON COLUMN patients.referred_by IS 'Patient ID who referred this patient';
COMMENT ON COLUMN patients.referral_count IS 'Number of patients referred by this patient';
COMMENT ON COLUMN patients.last_recall_sent IS 'Timestamp of last recall/re-targeting message sent';

-- Create indexes for referral queries
CREATE INDEX IF NOT EXISTS idx_patients_referral_code 
ON patients(referral_code);

CREATE INDEX IF NOT EXISTS idx_patients_referred_by 
ON patients(referred_by);

CREATE INDEX IF NOT EXISTS idx_patients_last_recall 
ON patients(last_recall_sent);

-- =====================================================
-- SAMPLE DATA UPDATES
-- =====================================================

-- Update existing doctors with sample social links (optional)
UPDATE doctors
SET social_links = jsonb_build_object(
  'instagram', 'https://instagram.com/yourclinic',
  'youtube', 'https://youtube.com/@yourclinic',
  'website', 'https://yourclinic.com'
)
WHERE social_links = '{}' OR social_links IS NULL;

-- =====================================================
-- FUNCTIONS FOR REFERRAL SYSTEM
-- =====================================================

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code(patient_name TEXT, phone_number TEXT)
RETURNS TEXT AS $$
DECLARE
  name_part TEXT;
  phone_part TEXT;
  referral_code TEXT;
  counter INTEGER := 0;
BEGIN
  -- Get first 3 letters of name (uppercase)
  name_part := UPPER(SUBSTRING(REGEXP_REPLACE(patient_name, '[^a-zA-Z]', '', 'g'), 1, 3));
  
  -- Get last 4 digits of phone
  phone_part := RIGHT(phone_number, 4);
  
  -- Combine to create code
  referral_code := name_part || phone_part;
  
  -- Check if code exists, if yes, add counter
  WHILE EXISTS (SELECT 1 FROM patients WHERE patients.referral_code = referral_code) LOOP
    counter := counter + 1;
    referral_code := name_part || phone_part || counter::TEXT;
  END LOOP;
  
  RETURN referral_code;
END;
$$ LANGUAGE plpgsql;

-- Function to increment referral count
CREATE OR REPLACE FUNCTION increment_referral_count()
RETURNS TRIGGER AS $$
BEGIN
  -- If patient was referred by someone, increment their referral count
  IF NEW.referred_by IS NOT NULL THEN
    UPDATE patients 
    SET referral_count = referral_count + 1 
    WHERE id = NEW.referred_by;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for referral count
DROP TRIGGER IF EXISTS trigger_increment_referral_count ON patients;
CREATE TRIGGER trigger_increment_referral_count
  AFTER INSERT ON patients
  FOR EACH ROW
  EXECUTE FUNCTION increment_referral_count();

-- =====================================================
-- USEFUL QUERIES
-- =====================================================

-- Get patients who need recall (6 months since last visit, no future appointments)
SELECT 
  p.id,
  p.name,
  p.phone_number,
  p.last_seen_at,
  p.last_recall_sent,
  p.preferred_language
FROM patients p
WHERE p.last_seen_at <= NOW() - INTERVAL '6 months'
  AND (p.last_recall_sent IS NULL OR p.last_recall_sent <= NOW() - INTERVAL '6 months')
  AND NOT EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.patient_id = p.id 
      AND a.appointment_time > NOW()
      AND a.status IN ('pending', 'confirmed')
  )
ORDER BY p.last_seen_at ASC
LIMIT 50;

-- Get top referrers
SELECT 
  p.name,
  p.phone_number,
  p.referral_code,
  p.referral_count,
  COUNT(r.id) as actual_referrals
FROM patients p
LEFT JOIN patients r ON r.referred_by = p.id
WHERE p.referral_count > 0
GROUP BY p.id, p.name, p.phone_number, p.referral_code, p.referral_count
ORDER BY p.referral_count DESC
LIMIT 10;

-- Get patients referred by a specific code
SELECT 
  p.name,
  p.phone_number,
  p.created_at,
  ref.name as referred_by_name,
  ref.referral_code
FROM patients p
JOIN patients ref ON p.referred_by = ref.id
WHERE ref.referral_code = 'YOUR_CODE_HERE'
ORDER BY p.created_at DESC;

-- Get doctor's social media links
SELECT 
  d.name,
  d.clinic_name,
  d.social_links->>'instagram' as instagram,
  d.social_links->>'youtube' as youtube,
  d.social_links->>'website' as website,
  d.social_links->>'facebook' as facebook
FROM doctors d;

-- Count patients by referral status
SELECT 
  COUNT(*) FILTER (WHERE referred_by IS NOT NULL) as referred_patients,
  COUNT(*) FILTER (WHERE referred_by IS NULL) as direct_patients,
  COUNT(*) as total_patients,
  ROUND(100.0 * COUNT(*) FILTER (WHERE referred_by IS NOT NULL) / COUNT(*), 2) as referral_percentage
FROM patients;

-- =====================================================
-- ANALYTICS VIEWS
-- =====================================================

-- Create view for referral analytics
CREATE OR REPLACE VIEW referral_analytics AS
SELECT 
  p.id,
  p.name,
  p.phone_number,
  p.referral_code,
  p.referral_count,
  p.created_at,
  COUNT(r.id) as total_referrals,
  COUNT(a.id) as total_appointments_from_referrals
FROM patients p
LEFT JOIN patients r ON r.referred_by = p.id
LEFT JOIN appointments a ON a.patient_id = r.id
WHERE p.referral_count > 0
GROUP BY p.id, p.name, p.phone_number, p.referral_code, p.referral_count, p.created_at
ORDER BY p.referral_count DESC;

-- Create view for recall candidates
CREATE OR REPLACE VIEW recall_candidates AS
SELECT 
  p.id,
  p.name,
  p.phone_number,
  p.last_seen_at,
  p.last_recall_sent,
  p.preferred_language,
  EXTRACT(MONTH FROM AGE(NOW(), p.last_seen_at)) as months_since_visit,
  d.name as doctor_name,
  d.clinic_name
FROM patients p
JOIN doctors d ON p.doctor_id = d.id
WHERE p.last_seen_at <= NOW() - INTERVAL '6 months'
  AND (p.last_recall_sent IS NULL OR p.last_recall_sent <= NOW() - INTERVAL '6 months')
  AND NOT EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.patient_id = p.id 
      AND a.appointment_time > NOW()
      AND a.status IN ('pending', 'confirmed')
  )
ORDER BY p.last_seen_at ASC;

-- =====================================================
-- CONSTRAINTS
-- =====================================================

-- Ensure referral_code is uppercase and alphanumeric
ALTER TABLE patients
DROP CONSTRAINT IF EXISTS valid_referral_code;

ALTER TABLE patients
ADD CONSTRAINT valid_referral_code 
CHECK (referral_code ~ '^[A-Z0-9]+$' OR referral_code IS NULL);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Phase 11 Marketing Suite database updates completed successfully!';
  RAISE NOTICE '✅ Added social_links to doctors table';
  RAISE NOTICE '✅ Added referral_code, referred_by, referral_count to patients table';
  RAISE NOTICE '✅ Added last_recall_sent to patients table';
  RAISE NOTICE '✅ Created referral code generation function';
  RAISE NOTICE '✅ Created referral count trigger';
  RAISE NOTICE '✅ Created analytics views';
  RAISE NOTICE '✅ Created indexes for performance';
END $$;
