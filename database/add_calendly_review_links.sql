-- =====================================================
-- Add Calendly and Review Links to Clinic Config
-- =====================================================
-- Allows doctors to configure appointment booking and review links

-- Add new columns to clinic_config table
ALTER TABLE clinic_config 
ADD COLUMN IF NOT EXISTS calendly_link TEXT,
ADD COLUMN IF NOT EXISTS review_link TEXT;

-- Add comments
COMMENT ON COLUMN clinic_config.calendly_link IS 'Calendly appointment booking link for patients';
COMMENT ON COLUMN clinic_config.review_link IS 'Google Review or feedback link for patients';

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clinic_config' 
AND column_name IN ('calendly_link', 'review_link');

-- =====================================================
-- Sample Update (Optional)
-- =====================================================
-- Update Dr. Shubham's config with sample links
-- UPDATE clinic_config 
-- SET 
--   calendly_link = 'https://calendly.com/your-clinic/appointment',
--   review_link = 'https://g.page/r/YOUR_GOOGLE_PLACE_ID/review'
-- WHERE doctor_id = (SELECT id FROM doctors WHERE email = 'shubhamsolat36@gmail.com');
