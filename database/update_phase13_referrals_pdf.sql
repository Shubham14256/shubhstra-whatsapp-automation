-- =====================================================
-- Shubhstra Tech - Phase 13: Doctor Referrals & PDF Reports
-- =====================================================
-- Run this SQL in your Supabase SQL Editor

-- =====================================================
-- CREATE EXTERNAL_DOCTORS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS external_doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  specialization VARCHAR(255),
  commission_percentage NUMERIC(5, 2) DEFAULT 10.00,
  total_commission_due NUMERIC(10, 2) DEFAULT 0.00,
  total_referrals INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_commission CHECK (commission_percentage >= 0 AND commission_percentage <= 100)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_external_doctors_phone 
ON external_doctors(phone_number);

CREATE INDEX IF NOT EXISTS idx_external_doctors_active 
ON external_doctors(is_active);

-- Add comments
COMMENT ON TABLE external_doctors IS 'External doctors who refer patients to the clinic';
COMMENT ON COLUMN external_doctors.commission_percentage IS 'Commission percentage for referrals (default 10%)';
COMMENT ON COLUMN external_doctors.total_commission_due IS 'Total commission amount pending payment';
COMMENT ON COLUMN external_doctors.total_referrals IS 'Total number of patients referred';

-- =====================================================
-- UPDATE PATIENTS TABLE - Add External Doctor Reference
-- =====================================================

-- Add referred_by_doctor_id column
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS referred_by_doctor_id UUID REFERENCES external_doctors(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_patients_referred_by_doctor 
ON patients(referred_by_doctor_id);

-- Add comment
COMMENT ON COLUMN patients.referred_by_doctor_id IS 'External doctor who referred this patient';

-- =====================================================
-- TRIGGERS FOR COMMISSION TRACKING
-- =====================================================

-- Function to increment referral count when patient is linked
CREATE OR REPLACE FUNCTION increment_external_doctor_referrals()
RETURNS TRIGGER AS $$
BEGIN
  -- If patient was referred by an external doctor, increment their referral count
  IF NEW.referred_by_doctor_id IS NOT NULL THEN
    UPDATE external_doctors 
    SET total_referrals = total_referrals + 1,
        updated_at = NOW()
    WHERE id = NEW.referred_by_doctor_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_increment_external_doctor_referrals ON patients;
CREATE TRIGGER trigger_increment_external_doctor_referrals
  AFTER INSERT OR UPDATE OF referred_by_doctor_id ON patients
  FOR EACH ROW
  WHEN (NEW.referred_by_doctor_id IS NOT NULL)
  EXECUTE FUNCTION increment_external_doctor_referrals();

-- =====================================================
-- FUNCTION TO CALCULATE COMMISSION
-- =====================================================

-- Function to calculate commission for completed appointments
CREATE OR REPLACE FUNCTION calculate_doctor_commission(
  external_doctor_id UUID,
  appointment_amount NUMERIC
)
RETURNS NUMERIC AS $$
DECLARE
  commission_rate NUMERIC;
  commission_amount NUMERIC;
BEGIN
  -- Get commission percentage
  SELECT commission_percentage INTO commission_rate
  FROM external_doctors
  WHERE id = external_doctor_id;
  
  -- Calculate commission
  commission_amount := (appointment_amount * commission_rate) / 100;
  
  -- Update total commission due
  UPDATE external_doctors
  SET total_commission_due = total_commission_due + commission_amount,
      updated_at = NOW()
  WHERE id = external_doctor_id;
  
  RETURN commission_amount;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SAMPLE DATA (Optional)
-- =====================================================

-- Insert sample external doctors
INSERT INTO external_doctors (name, phone_number, specialization, commission_percentage)
VALUES 
  ('Dr. Rajesh Kumar', '919876543210', 'General Physician', 10.00),
  ('Dr. Priya Sharma', '919876543211', 'Pediatrician', 12.00),
  ('Dr. Amit Patel', '919876543212', 'Orthopedic', 15.00)
ON CONFLICT (phone_number) DO NOTHING;

-- =====================================================
-- USEFUL QUERIES
-- =====================================================

-- Get all external doctors with referral stats
SELECT 
  ed.id,
  ed.name,
  ed.phone_number,
  ed.specialization,
  ed.commission_percentage,
  ed.total_referrals,
  ed.total_commission_due,
  COUNT(p.id) as actual_patient_count
FROM external_doctors ed
LEFT JOIN patients p ON p.referred_by_doctor_id = ed.id
WHERE ed.is_active = true
GROUP BY ed.id, ed.name, ed.phone_number, ed.specialization, 
         ed.commission_percentage, ed.total_referrals, ed.total_commission_due
ORDER BY ed.total_referrals DESC;

-- Get patients referred by a specific external doctor
SELECT 
  p.name AS patient_name,
  p.phone_number,
  p.created_at AS referred_date,
  COUNT(a.id) as total_appointments,
  SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) as completed_appointments
FROM patients p
LEFT JOIN appointments a ON a.patient_id = p.id
WHERE p.referred_by_doctor_id = 'external-doctor-uuid'
GROUP BY p.id, p.name, p.phone_number, p.created_at
ORDER BY p.created_at DESC;

-- Calculate total commission for an external doctor
SELECT 
  ed.name,
  ed.commission_percentage,
  COUNT(DISTINCT p.id) as total_patients,
  COUNT(a.id) as total_appointments,
  SUM(CASE WHEN a.status = 'completed' THEN 500 ELSE 0 END) as estimated_revenue,
  (SUM(CASE WHEN a.status = 'completed' THEN 500 ELSE 0 END) * ed.commission_percentage / 100) as calculated_commission,
  ed.total_commission_due as recorded_commission
FROM external_doctors ed
LEFT JOIN patients p ON p.referred_by_doctor_id = ed.id
LEFT JOIN appointments a ON a.patient_id = p.id
WHERE ed.id = 'external-doctor-uuid'
GROUP BY ed.id, ed.name, ed.commission_percentage, ed.total_commission_due;

-- Get top referring external doctors
SELECT 
  ed.name,
  ed.specialization,
  ed.total_referrals,
  ed.total_commission_due,
  ed.commission_percentage
FROM external_doctors ed
WHERE ed.is_active = true
ORDER BY ed.total_referrals DESC
LIMIT 10;

-- =====================================================
-- ANALYTICS VIEWS
-- =====================================================

-- Create view for external doctor analytics
CREATE OR REPLACE VIEW external_doctor_analytics AS
SELECT 
  ed.id,
  ed.name,
  ed.phone_number,
  ed.specialization,
  ed.commission_percentage,
  ed.total_referrals,
  ed.total_commission_due,
  COUNT(DISTINCT p.id) as actual_patients,
  COUNT(a.id) as total_appointments,
  SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) as completed_appointments,
  ed.created_at
FROM external_doctors ed
LEFT JOIN patients p ON p.referred_by_doctor_id = ed.id
LEFT JOIN appointments a ON a.patient_id = p.id
WHERE ed.is_active = true
GROUP BY ed.id, ed.name, ed.phone_number, ed.specialization, 
         ed.commission_percentage, ed.total_referrals, 
         ed.total_commission_due, ed.created_at
ORDER BY ed.total_referrals DESC;

-- =====================================================
-- COMMISSION PAYMENT TRACKING (Optional Enhancement)
-- =====================================================

-- Table to track commission payments
CREATE TABLE IF NOT EXISTS commission_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_doctor_id UUID NOT NULL REFERENCES external_doctors(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commission_payments_doctor 
ON commission_payments(external_doctor_id);

CREATE INDEX IF NOT EXISTS idx_commission_payments_date 
ON commission_payments(payment_date);

COMMENT ON TABLE commission_payments IS 'Track commission payments to external doctors';

-- =====================================================
-- CONSTRAINTS
-- =====================================================

-- Ensure phone number format
ALTER TABLE external_doctors
DROP CONSTRAINT IF EXISTS valid_phone_format;

ALTER TABLE external_doctors
ADD CONSTRAINT valid_phone_format 
CHECK (phone_number ~ '^[0-9]{10,15}$');

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Phase 13 Doctor Referrals database updates completed successfully!';
  RAISE NOTICE '✅ Created external_doctors table';
  RAISE NOTICE '✅ Added referred_by_doctor_id to patients table';
  RAISE NOTICE '✅ Created referral tracking triggers';
  RAISE NOTICE '✅ Created commission calculation function';
  RAISE NOTICE '✅ Created analytics views';
  RAISE NOTICE '✅ Created commission_payments table';
END $$;
