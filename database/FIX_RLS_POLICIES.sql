-- =====================================================
-- FIX RLS POLICIES FOR DASHBOARD UPDATES
-- =====================================================
-- The issue: auth.uid() returns the Supabase Auth user ID
-- but doctors.id is a different UUID
-- We need to link them via email

-- =====================================================
-- 1. DROP OLD POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Doctors can view own record" ON doctors;
DROP POLICY IF EXISTS "Doctors can update own record" ON doctors;
DROP POLICY IF EXISTS "Doctors can view own patients" ON patients;
DROP POLICY IF EXISTS "Doctors can insert own patients" ON patients;
DROP POLICY IF EXISTS "Doctors can update own patients" ON patients;
DROP POLICY IF EXISTS "Doctors can delete own patients" ON patients;
DROP POLICY IF EXISTS "Doctors can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can insert own appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can update own appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can delete own appointments" ON appointments;

-- =====================================================
-- 2. CREATE NEW POLICIES USING EMAIL MATCHING
-- =====================================================

-- DOCTORS TABLE POLICIES
-- Doctors can read and update their own record using email
CREATE POLICY "Doctors can view own record" ON doctors
  FOR SELECT 
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Doctors can update own record" ON doctors
  FOR UPDATE 
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- PATIENTS TABLE POLICIES
-- Doctors can view and manage their own patients
CREATE POLICY "Doctors can view own patients" ON patients
  FOR SELECT 
  USING (
    doctor_id IN (
      SELECT id FROM doctors 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Doctors can insert own patients" ON patients
  FOR INSERT 
  WITH CHECK (
    doctor_id IN (
      SELECT id FROM doctors 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Doctors can update own patients" ON patients
  FOR UPDATE 
  USING (
    doctor_id IN (
      SELECT id FROM doctors 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Doctors can delete own patients" ON patients
  FOR DELETE 
  USING (
    doctor_id IN (
      SELECT id FROM doctors 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- APPOINTMENTS TABLE POLICIES
-- Doctors can view and manage their own appointments
CREATE POLICY "Doctors can view own appointments" ON appointments
  FOR SELECT 
  USING (
    doctor_id IN (
      SELECT id FROM doctors 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Doctors can insert own appointments" ON appointments
  FOR INSERT 
  WITH CHECK (
    doctor_id IN (
      SELECT id FROM doctors 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Doctors can update own appointments" ON appointments
  FOR UPDATE 
  USING (
    doctor_id IN (
      SELECT id FROM doctors 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Doctors can delete own appointments" ON appointments
  FOR DELETE 
  USING (
    doctor_id IN (
      SELECT id FROM doctors 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- =====================================================
-- 3. FIX CLINIC_CONFIG TABLE (if it exists)
-- =====================================================

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Doctors can view own config" ON clinic_config;
DROP POLICY IF EXISTS "Doctors can insert own config" ON clinic_config;
DROP POLICY IF EXISTS "Doctors can update own config" ON clinic_config;

-- Create new policies
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

-- =====================================================
-- 4. ALTERNATIVE: DISABLE RLS TEMPORARILY (NOT RECOMMENDED FOR PRODUCTION)
-- =====================================================
-- If the above doesn't work, you can temporarily disable RLS for testing:
-- ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE clinic_config DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. VERIFICATION
-- =====================================================

-- Check policies are created
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('doctors', 'patients', 'appointments', 'clinic_config')
ORDER BY tablename, policyname;

-- Test query (run this after logging in to dashboard)
-- SELECT * FROM doctors WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid());
