-- =====================================================
-- Add Individual WhatsApp Credentials to Doctors Table
-- =====================================================
-- This allows each doctor to use their own WhatsApp Business Account
-- Each doctor gets their own 1000 free conversations per month

-- Add new columns for individual WhatsApp credentials
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS whatsapp_business_account_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_doctors_whatsapp_phone_number_id 
ON doctors(whatsapp_phone_number_id);

CREATE INDEX IF NOT EXISTS idx_doctors_whatsapp_business_account_id 
ON doctors(whatsapp_business_account_id);

-- Add comments
COMMENT ON COLUMN doctors.whatsapp_phone_number_id IS 'WhatsApp Phone Number ID from Meta Dashboard (unique per doctor)';
COMMENT ON COLUMN doctors.whatsapp_business_account_id IS 'WhatsApp Business Account ID from Meta Dashboard';
COMMENT ON COLUMN doctors.whatsapp_access_token IS 'Access token for WhatsApp Cloud API (doctor-specific)';
COMMENT ON COLUMN doctors.whatsapp_token_expires_at IS 'Expiration timestamp for the access token';

-- =====================================================
-- Sample: How to Add Doctor Credentials
-- =====================================================
-- Replace with actual values from Meta Dashboard

-- Example for Doctor 1:
UPDATE doctors 
SET 
  whatsapp_phone_number_id = '984043858130065',
  whatsapp_business_account_id = '1200553978900975',
  whatsapp_access_token = 'EAATpl9Ci1zUBQqNUmR60uwW4fSIo6ZBiE29qdL...',
  whatsapp_token_expires_at = NOW() + INTERVAL '60 days'
WHERE phone_number = '919545816728';

-- Verify the update
SELECT 
  id,
  name,
  phone_number,
  whatsapp_phone_number_id,
  whatsapp_business_account_id,
  SUBSTRING(whatsapp_access_token, 1, 20) || '...' as token_preview,
  whatsapp_token_expires_at
FROM doctors
WHERE phone_number = '919545816728';

-- =====================================================
-- Check which doctors have credentials configured
-- =====================================================
SELECT 
  name,
  phone_number,
  CASE 
    WHEN whatsapp_access_token IS NOT NULL THEN '✅ Configured'
    ELSE '❌ Missing'
  END as credentials_status,
  whatsapp_token_expires_at
FROM doctors
ORDER BY name;
