-- =====================================================
-- FIX RLS PERMISSIONS FOR SETTINGS PAGE
-- =====================================================
-- This fixes the "permission denied" error when saving settings

-- =====================================================
-- Option 1: Disable RLS (Quick Fix for Development)
-- =====================================================
-- Uncomment these lines to disable RLS temporarily
-- ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE clinic_config DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- Option 2: Fix RLS Policies (Recommended for Production)
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Doctors can view own data" ON doctors;
DROP POLICY IF EXISTS "Doctors can update own data" ON doctors;
DROP POLICY IF EXISTS "Doctors can view own config" ON clinic_config;
DROP POLICY IF EXISTS "Doctors can insert own config" ON clinic_config;
DROP POLICY IF EXISTS "Doctors can update own config" ON clinic_config;

-- Enable RLS on both tables
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_config ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- DOCTORS TABLE POLICIES
-- =====================================================

-- Allow doctors to view their own data
CREATE POLICY "Doctors can view own data"
ON doctors
FOR SELECT
TO authenticated
USING (
  email = auth.jwt()->>'email'
);

-- Allow doctors to update their own data
CREATE POLICY "Doctors can update own data"
ON doctors
FOR UPDATE
TO authenticated
USING (
  email = auth.jwt()->>'email'
)
WITH CHECK (
  email = auth.jwt()->>'email'
);

-- =====================================================
-- CLINIC_CONFIG TABLE POLICIES
-- =====================================================

-- Allow doctors to view their own config
CREATE POLICY "Doctors can view own config"
ON clinic_config
FOR SELECT
TO authenticated
USING (
  doctor_id IN (
    SELECT id FROM doctors WHERE email = auth.jwt()->>'email'
  )
);

-- Allow doctors to insert their own config
CREATE POLICY "Doctors can insert own config"
ON clinic_config
FOR INSERT
TO authenticated
WITH CHECK (
  doctor_id IN (
    SELECT id FROM doctors WHERE email = auth.jwt()->>'email'
  )
);

-- Allow doctors to update their own config
CREATE POLICY "Doctors can update own config"
ON clinic_config
FOR UPDATE
TO authenticated
USING (
  doctor_id IN (
    SELECT id FROM doctors WHERE email = auth.jwt()->>'email'
  )
)
WITH CHECK (
  doctor_id IN (
    SELECT id FROM doctors WHERE email = auth.jwt()->>'email'
  )
);

-- =====================================================
-- VERIFY POLICIES
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('doctors', 'clinic_config')
ORDER BY tablename, policyname;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ RLS Policies Updated Successfully!';
  RAISE NOTICE '✅ Doctors can now:';
  RAISE NOTICE '   - View their own data';
  RAISE NOTICE '   - Update their own data';
  RAISE NOTICE '   - Insert/Update their clinic config';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next: Restart frontend and try saving settings again';
END $$;
