/**
 * Test if ngrok webhook URL is accessible
 */

import axios from 'axios';

const ngrokUrl = 'https://marisha-unshort-jenae.ngrok-free.dev/webhook';

// Test payload
const testPayload = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '1200553978900975',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '15551391349',
              phone_number_id: '984043858130065'
            },
            contacts: [
              {
                profile: {
                  name: 'Test Patient'
                },
                wa_id: '919999999999'
              }
            ],
            messages: [
              {
                from: '919999999999',
                id: 'wamid.test123',
                timestamp: Math.floor(Date.now() / 1000).toString(),
                type: 'text',
                text: {
                  body: 'Hi from ngrok test'
                }
              }
            ]
          },
          field: 'messages'
        }
      ]
    }
  ]
};

async function testNgrokWebhook() {
  console.log('\n🧪 Testing ngrok webhook URL...\n');
  console.log('Ngrok URL:', ngrokUrl);
  console.log('\n📤 Sending POST request through ngrok...\n');

  try {
    const response = await axios.post(ngrokUrl, testPayload, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'  // Skip ngrok browser warning
      },
      timeout: 15000
    });

    console.log('✅ Response Status:', response.status);
    console.log('✅ Response Data:', response.data);
    console.log('\n✅ Ngrok webhook is working!');
    console.log('\nIf Meta is not sending messages, check:');
    console.log('1. Webhook URL in Meta Dashboard matches:', ngrokUrl);
    console.log('2. Verify token matches: shubhstra_secure_token_2024');
    console.log('3. Webhook is subscribed to "messages" field');

  } catch (error) {
    console.error('❌ Error testing ngrok webhook:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('\n⚠️  Ngrok might be showing a browser warning page');
    } else if (error.request) {
      console.error('No response received');
      console.error('⚠️  Possible issues:');
      console.error('   - Ngrok is not running');
      console.error('   - Ngrok URL has changed');
      console.error('   - Network/firewall blocking request');
    } else {
      console.error(error.message);
    }
  }
}

testNgrokWebhook().then(() => {
  console.log('\n✅ Test complete\n');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
