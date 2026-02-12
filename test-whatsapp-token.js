/**
 * Test WhatsApp Token Validity
 */

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const testToken = async () => {
  console.log('🔑 Testing WhatsApp Token...\n');

  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.PHONE_NUMBER_ID;

  console.log('Token exists:', !!token);
  console.log('Token length:', token?.length || 0);
  console.log('Phone Number ID:', phoneNumberId);
  console.log('Token preview:', token?.substring(0, 20) + '...\n');

  // Check for line breaks or spaces
  if (token?.includes('\n') || token?.includes('\r')) {
    console.log('❌ ERROR: Token contains line breaks!');
    console.log('   This will cause 401 errors.');
    console.log('   Please remove all line breaks from WHATSAPP_TOKEN in .env file\n');
    return;
  }

  if (token?.includes(' ')) {
    console.log('⚠️  WARNING: Token contains spaces');
    console.log('   This might cause issues\n');
  }

  // Test the token by making a simple API call
  try {
    console.log('📡 Testing token with WhatsApp API...');
    
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${phoneNumberId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: 10000,
      }
    );

    console.log('✅ Token is VALID!');
    console.log('Phone Number:', response.data.display_phone_number);
    console.log('Verified Name:', response.data.verified_name);
    console.log('\n🎉 Your WhatsApp token is working correctly!\n');

  } catch (error) {
    console.log('❌ Token is INVALID or EXPIRED\n');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.log('\n💡 Solution:');
        console.log('1. Go to: https://developers.facebook.com/apps');
        console.log('2. Select your app > WhatsApp > API Setup');
        console.log('3. Click "Generate Access Token"');
        console.log('4. Copy the NEW token');
        console.log('5. Replace WHATSAPP_TOKEN in .env file');
        console.log('6. Make sure token is on ONE LINE (no line breaks)');
        console.log('7. Restart the server\n');
      }
    } else {
      console.log('Error:', error.message);
    }
  }
};

testToken();
