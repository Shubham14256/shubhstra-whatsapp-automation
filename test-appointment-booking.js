/**
 * Test Script for Native Appointment Booking
 * Run this to verify the setup before testing with WhatsApp
 */

import * as appointmentService from './src/services/appointmentBookingService.js';

const { parseDateTime } = appointmentService;

console.log('🧪 Testing Native Appointment Booking Setup\n');

// Test 1: Date parsing
console.log('Test 1: Date Parsing');
console.log('='.repeat(50));

const testCases = [
  'tomorrow 3pm',
  'next monday 10am',
  'feb 15 at 2:30pm',
  'friday 4pm',
  'yesterday 3pm', // Should fail (past)
  'tomorrow 8pm',  // Should fail (outside hours)
  'invalid text',  // Should fail (no date)
];

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. Testing: "${testCase}"`);
  const result = parseDateTime(testCase);
  
  if (result) {
    console.log(`   ✅ Parsed: ${result.toLocaleString('en-IN')}`);
    
    // Check clinic hours
    const hour = result.getHours();
    if (hour < 9 || hour >= 18) {
      console.log(`   ⚠️  Outside clinic hours (${hour}:00)`);
    } else {
      console.log(`   ✅ Within clinic hours (${hour}:00)`);
    }
    
    // Check if future
    if (result < new Date()) {
      console.log(`   ⚠️  Date is in the past`);
    } else {
      console.log(`   ✅ Date is in the future`);
    }
  } else {
    console.log(`   ❌ Failed to parse`);
  }
});

console.log('\n' + '='.repeat(50));
console.log('\n✅ Setup test complete!');
console.log('\nNext steps:');
console.log('1. Run database migration in Supabase');
console.log('2. Start server: node server.js');
console.log('3. Test with WhatsApp bot');
console.log('\nSee LOCAL_TESTING_GUIDE.md for detailed instructions.\n');
