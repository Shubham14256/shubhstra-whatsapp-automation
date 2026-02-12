-- =====================================================
-- Shubhstra Tech - Patients & Appointments Tables
-- =====================================================
-- Run this SQL in your Supabase SQL Editor

-- =====================================================
-- PATIENTS TABLE
-- =====================================================
-- Stores patient information and tracks their interactions

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255),
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Additional fields for future use
  email VARCHAR(255),
  notes TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_patients_phone_number ON patients(phone_number);
CREATE INDEX IF NOT EXISTS idx_patients_doctor_id ON patients(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patients_last_seen ON patients(last_seen_at);

-- Add comments to table
COMMENT ON TABLE patients IS 'Stores patient information and tracks their interactions with doctors';

-- Add comments to columns
COMMENT ON COLUMN patients.id IS 'Unique identifier for the patient';
COMMENT ON COLUMN patients.phone_number IS 'Patient WhatsApp phone number (unique)';
COMMENT ON COLUMN patients.name IS 'Patient name from WhatsApp profile';
COMMENT ON COLUMN patients.doctor_id IS 'Reference to the doctor this patient is associated with';
COMMENT ON COLUMN patients.created_at IS 'Timestamp when patient first contacted';
COMMENT ON COLUMN patients.last_seen_at IS 'Timestamp of last interaction';

-- =====================================================
-- APPOINTMENTS TABLE
-- =====================================================
-- Stores appointment bookings and their status

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure valid status values
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show'))
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_time ON appointments(appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Add comments to table
COMMENT ON TABLE appointments IS 'Stores appointment bookings and their status';

-- Add comments to columns
COMMENT ON COLUMN appointments.id IS 'Unique identifier for the appointment';
COMMENT ON COLUMN appointments.patient_id IS 'Reference to the patient';
COMMENT ON COLUMN appointments.doctor_id IS 'Reference to the doctor';
COMMENT ON COLUMN appointments.appointment_time IS 'Scheduled appointment date and time';
COMMENT ON COLUMN appointments.status IS 'Appointment status: pending, confirmed, completed, cancelled, no_show';
COMMENT ON COLUMN appointments.notes IS 'Additional notes about the appointment';
COMMENT ON COLUMN appointments.created_at IS 'Timestamp when appointment was created';
COMMENT ON COLUMN appointments.updated_at IS 'Timestamp when appointment was last updated';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update patients.last_seen_at
CREATE OR REPLACE FUNCTION update_patient_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE patients 
  SET last_seen_at = NOW() 
  WHERE id = NEW.patient_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger on appointments insert
CREATE TRIGGER trigger_update_patient_last_seen
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_patient_last_seen();

-- Trigger to update appointments.updated_at
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Note: Make sure you have doctors in the doctors table first
-- Then you can insert sample patients

-- Example: Insert a sample patient (replace doctor_id with actual ID from your doctors table)
/*
INSERT INTO patients (phone_number, name, doctor_id)
VALUES 
  ('919999999999', 'Test Patient', (SELECT id FROM doctors LIMIT 1))
ON CONFLICT (phone_number) DO NOTHING;

-- Example: Insert a sample appointment
INSERT INTO appointments (patient_id, doctor_id, appointment_time, status)
VALUES (
  (SELECT id FROM patients WHERE phone_number = '919999999999'),
  (SELECT id FROM doctors LIMIT 1),
  NOW() + INTERVAL '1 day',
  'pending'
);
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created successfully
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('patients', 'appointments');

-- View all patients
SELECT * FROM patients;

-- View all appointments with patient and doctor names
SELECT 
  a.id,
  p.name AS patient_name,
  p.phone_number AS patient_phone,
  d.name AS doctor_name,
  a.appointment_time,
  a.status,
  a.created_at
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN doctors d ON a.doctor_id = d.id
ORDER BY a.appointment_time DESC;

-- =====================================================
-- USEFUL QUERIES FOR ANALYTICS
-- =====================================================

-- Count patients per doctor
SELECT 
  d.name AS doctor_name,
  COUNT(p.id) AS patient_count
FROM doctors d
LEFT JOIN patients p ON d.id = p.doctor_id
GROUP BY d.id, d.name
ORDER BY patient_count DESC;

-- Count appointments by status
SELECT 
  status,
  COUNT(*) AS count
FROM appointments
GROUP BY status
ORDER BY count DESC;

-- Recent patients (last 7 days)
SELECT 
  name,
  phone_number,
  last_seen_at
FROM patients
WHERE last_seen_at >= NOW() - INTERVAL '7 days'
ORDER BY last_seen_at DESC;

-- Upcoming appointments
SELECT 
  p.name AS patient_name,
  d.name AS doctor_name,
  a.appointment_time,
  a.status
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN doctors d ON a.doctor_id = d.id
WHERE a.appointment_time > NOW()
  AND a.status IN ('pending', 'confirmed')
ORDER BY a.appointment_time ASC;
