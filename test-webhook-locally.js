/**
 * Test webhook locally to see if message processing works
 */

import axios from 'axios';

const webhookUrl = 'http://localhost:3000/webhook';

// Simulate a webhook payload from Meta
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
                  body: 'Hi'
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

async function testWebhook() {
  console.log('\n🧪 Testing webhook locally...\n');
  console.log('Webhook URL:', webhookUrl);
  console.log('Test payload:', JSON.stringify(testPayload, null, 2));
  console.log('\n📤 Sending POST request...\n');

  try {
    const response = await axios.post(webhookUrl, testPayload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Response Status:', response.status);
    console.log('✅ Response Data:', response.data);
    console.log('\n✅ Webhook test successful!');
    console.log('\nCheck your backend terminal for processing logs.');

  } catch (error) {
    console.error('❌ Error testing webhook:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received');
      console.error('Is the backend server running on port 3000?');
    } else {
      console.error(error.message);
    }
  }
}

testWebhook().then(() => {
  console.log('\n✅ Test complete\n');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
