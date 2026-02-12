-- =====================================================
-- CREATE CLINIC_CONFIG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS clinic_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  opening_time TIME DEFAULT '09:00:00',
  closing_time TIME DEFAULT '18:00:00',
  welcome_message TEXT DEFAULT 'Welcome to our clinic! How can we help you today?',
  holidays TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one config per doctor
  UNIQUE(doctor_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clinic_config_doctor_id ON clinic_config(doctor_id);

-- Enable RLS
ALTER TABLE clinic_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Doctors can view own config" ON clinic_config;
DROP POLICY IF EXISTS "Doctors can insert own config" ON clinic_config;
DROP POLICY IF EXISTS "Doctors can update own config" ON clinic_config;

CREATE POLICY "Doctors can view own config" ON clinic_config
  FOR SELECT 
  USING (
    doctor_id IN (
      SELECT id FROM doctors 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Doctors can insert own config" ON clinic_config
  FOR INSERT 
  WITH CHECK (
    doctor_id IN (
      SELECT id FROM doctors 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Doctors can update own config" ON clinic_config
  FOR UPDATE 
  USING (
    doctor_id IN (
      SELECT id FROM doctors 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Grant permissions
GRANT ALL ON clinic_config TO authenticated;

-- Create trigger for updated_at
CREATE TRIGGER update_clinic_config_updated_at
  BEFORE UPDATE ON clinic_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify
SELECT * FROM clinic_config;
