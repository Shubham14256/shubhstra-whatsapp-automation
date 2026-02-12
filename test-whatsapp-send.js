/**
 * Test WhatsApp Message Sending
 */

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const testSendMessage = async () => {
  console.log('📱 Testing WhatsApp Message Sending\n');

  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.PHONE_NUMBER_ID;
  const testRecipient = '918459542713'; // The number from the error log

  console.log('Token exists:', !!token);
  console.log('Phone Number ID:', phoneNumberId);
  console.log('Test Recipient:', testRecipient);
  console.log('');

  try {
    console.log('📡 Sending test message...\n');
    
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: testRecipient,
        type: 'text',
        text: {
          preview_url: false,
          body: 'Test message from Shubhstra Bot'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log('✅ Message sent successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ Error sending message:\n');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Status Text:', error.response.statusText);
      console.log('\nError Details:');
      console.log(JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 400) {
        console.log('\n💡 Common 400 Error Causes:');
        console.log('1. Recipient phone number not registered as test number');
        console.log('2. Phone number format is incorrect');
        console.log('3. Message template not approved (for non-test numbers)');
        console.log('4. Recipient has not initiated conversation (24-hour window)');
        console.log('\n📋 Solution:');
        console.log('- Make sure the recipient number is added as a Test Recipient in Meta Dashboard');
        console.log('- Or wait for the user to send a message first (to open 24-hour window)');
      }
      
      if (error.response.status === 401) {
        console.log('\n💡 Token expired - Generate a new one from Meta Dashboard');
      }
    } else {
      console.log('Error:', error.message);
    }
  }
};

testSendMessage();
