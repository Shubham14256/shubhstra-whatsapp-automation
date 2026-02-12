/**
 * Quick script to check doctor's phone number in database
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function checkDoctor() {
  console.log('\n🔍 Checking doctor records...\n');

  // Get all doctors
  const { data: doctors, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!doctors || doctors.length === 0) {
    console.log('❌ No active doctors found in database');
    return;
  }

  console.log(`Found ${doctors.length} active doctor(s):\n`);

  doctors.forEach((doc, index) => {
    console.log(`${index + 1}. ${doc.name}`);
    console.log(`   Email: ${doc.email || 'N/A'}`);
    console.log(`   Phone Number: ${doc.phone_number}`);
    console.log(`   WhatsApp Phone ID: ${doc.whatsapp_phone_number_id || 'N/A'}`);
    console.log(`   WhatsApp Business ID: ${doc.whatsapp_business_account_id || 'N/A'}`);
    console.log(`   Token: ${doc.whatsapp_access_token ? doc.whatsapp_access_token.substring(0, 20) + '...' : 'N/A'}`);
    console.log('');
  });

  // Test webhook lookup
  console.log('🧪 Testing webhook lookup with test number...\n');
  
  const testNumbers = ['15551391349', '+15551391349', '1 555-139-1349'];
  
  for (const testNum of testNumbers) {
    const cleaned = testNum.replace(/[\s\-\(\)\+]/g, '');
    console.log(`Testing: "${testNum}" → Cleaned: "${cleaned}"`);
    
    const { data: found, error: lookupError } = await supabase
      .from('doctors')
      .select('name, phone_number')
      .eq('phone_number', cleaned)
      .eq('is_active', true)
      .single();
    
    if (found) {
      console.log(`   ✅ FOUND: ${found.name}`);
    } else {
      console.log(`   ❌ NOT FOUND`);
    }
    console.log('');
  }
}

checkDoctor().then(() => {
  console.log('✅ Check complete\n');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
