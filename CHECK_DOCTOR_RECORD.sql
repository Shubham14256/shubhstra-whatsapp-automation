-- Check if doctor record exists for the new account
-- Replace 'your-email@example.com' with the email you used

SELECT 
  id,
  email,
  name,
  phone_number,
  clinic_name,
  is_active,
  created_at
FROM doctors
WHERE email = 'your-email@example.com';

-- If no results, the doctor record wasn't created
-- If results show, then the issue is with the Sidebar query

-- Also check all doctors to see what's in the database
SELECT 
  email,
  name,
  clinic_name,
  created_at
FROM doctors
ORDER BY created_at DESC;
