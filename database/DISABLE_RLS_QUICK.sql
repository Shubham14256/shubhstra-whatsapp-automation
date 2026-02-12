-- =====================================================
-- QUICK FIX: Disable RLS for Testing
-- =====================================================
-- WARNING: Only use this for development/testing
-- For production, use FIX_RLS_PERMISSIONS.sql instead

-- Disable RLS on doctors table
ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;

-- Disable RLS on clinic_config table
ALTER TABLE clinic_config DISABLE ROW LEVEL SECURITY;

-- Disable RLS on other tables that might cause issues
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity = false THEN '✅ RLS DISABLED'
    ELSE '⚠️ RLS ENABLED'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('doctors', 'clinic_config', 'patients', 'appointments')
ORDER BY tablename;
