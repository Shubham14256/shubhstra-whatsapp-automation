-- =====================================================
-- Shubhstra Tech - Doctors Table
-- =====================================================
-- This table stores information about doctors using the WhatsApp automation platform
-- Run this SQL in your Supabase SQL Editor

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255),
  specialization VARCHAR(255),
  clinic_name VARCHAR(255),
  clinic_address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on phone_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_doctors_phone_number ON doctors(phone_number);

-- Create index on is_active for filtering active doctors
CREATE INDEX IF NOT EXISTS idx_doctors_is_active ON doctors(is_active);

-- Add comment to table
COMMENT ON TABLE doctors IS 'Stores registered doctors using the WhatsApp automation platform';

-- Add comments to columns
COMMENT ON COLUMN doctors.id IS 'Unique identifier for the doctor';
COMMENT ON COLUMN doctors.name IS 'Full name of the doctor';
COMMENT ON COLUMN doctors.phone_number IS 'WhatsApp Business phone number (must match display_phone_number from Meta)';
COMMENT ON COLUMN doctors.email IS 'Email address of the doctor';
COMMENT ON COLUMN doctors.specialization IS 'Medical specialization (e.g., Cardiologist, Dermatologist)';
COMMENT ON COLUMN doctors.clinic_name IS 'Name of the clinic or hospital';
COMMENT ON COLUMN doctors.clinic_address IS 'Physical address of the clinic';
COMMENT ON COLUMN doctors.is_active IS 'Whether the doctor account is active';
COMMENT ON COLUMN doctors.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN doctors.updated_at IS 'Timestamp when the record was last updated';

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Sample Data (Optional - for testing)
-- =====================================================
-- Insert sample doctors for testing
-- Replace phone numbers with your actual WhatsApp Business numbers

INSERT INTO doctors (name, phone_number, email, specialization, clinic_name, clinic_address, is_active)
VALUES 
  ('Dr. Rajesh Kumar', '919876543210', 'rajesh.kumar@example.com', 'Cardiologist', 'Heart Care Clinic', 'Mumbai, Maharashtra', true),
  ('Dr. Priya Sharma', '919876543211', 'priya.sharma@example.com', 'Dermatologist', 'Skin & Beauty Clinic', 'Delhi, India', true),
  ('Dr. Amit Patel', '919876543212', 'amit.patel@example.com', 'General Physician', 'Family Health Center', 'Ahmedabad, Gujarat', true)
ON CONFLICT (phone_number) DO NOTHING;

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this to verify the table was created successfully
SELECT * FROM doctors;
