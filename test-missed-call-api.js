/**
 * Test Script for Missed Call API
 * Run this to test the /api/missed-call endpoint
 */

const testMissedCallAPI = async () => {
  const API_URL = 'http://localhost:3000/api/missed-call';
  
  const testData = {
    doctor_phone_number: '919876543210',  // Replace with actual doctor phone from DB
    patient_phone_number: '919999999999', // Replace with test patient phone
  };

  console.log('🧪 Testing Missed Call API');
  console.log('═══════════════════════════════════════');
  console.log('API URL:', API_URL);
  console.log('Test Data:', JSON.stringify(testData, null, 2));
  console.log('═══════════════════════════════════════\n');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const data = await response.json();

    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ TEST PASSED: Recovery message sent successfully');
    } else {
      console.log('\n⚠️  TEST RESULT: API returned error (expected if WhatsApp credentials not configured)');
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
  }
};

// Run the test
testMissedCallAPI();
