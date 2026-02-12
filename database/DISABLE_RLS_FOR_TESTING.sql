-- =====================================================
-- TEMPORARILY DISABLE RLS FOR TESTING
-- =====================================================
-- Run this to disable RLS and test if updates work
-- IMPORTANT: Re-enable RLS before going to production!

-- Disable RLS on all tables
ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

-- If clinic_config table exists
ALTER TABLE clinic_config DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('doctors', 'patients', 'appointments', 'clinic_config');

-- =====================================================
-- TO RE-ENABLE RLS LATER (before production):
-- =====================================================
-- ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE clinic_config ENABLE ROW LEVEL SECURITY;
