/**
 * Full Gemini AI Response Test
 */

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const testGeminiDirect = async () => {
  console.log('🤖 Testing Gemini AI API Directly\n');

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ GEMINI_API_KEY not found in .env file');
    return;
  }

  console.log('✅ API Key found:', apiKey.substring(0, 20) + '...');
  console.log('✅ API Key length:', apiKey.length, '\n');

  const testQuery = 'I have a headache';
  
  const systemPrompt = `You are a helpful medical receptionist for Shubhstra Clinic.

STRICT RULES:
1. Answer general health queries briefly (maximum 50 words).
2. Suggest home remedies ONLY (rest, hydration, warm compress, etc.).
3. NEVER prescribe medicines or specific drugs.
4. NEVER diagnose serious conditions.
5. ALWAYS end with: "Please book an appointment for proper treatment."
6. If the query is not health-related (greetings, jokes, general chat), politely say: "I can only help with health-related questions. Type 'Hi' to see the menu."
7. Be empathetic and professional.
8. Use simple language.

Patient Query: ${testQuery}

Your Response:`;

  try {
    console.log('📡 Sending request to Gemini API...\n');
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 150,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log('✅ API Response received!\n');
    console.log('Full Response Object:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n─────────────────────────────────────\n');

    const aiText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (aiText) {
      console.log('🤖 AI Response Text:');
      console.log('─────────────────────────────────────');
      console.log(aiText);
      console.log('─────────────────────────────────────\n');
      console.log('✅ Gemini AI is working correctly! 🎉\n');
    } else {
      console.log('⚠️  No text found in response');
    }

  } catch (error) {
    console.log('❌ Error calling Gemini API:\n');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error Data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 400) {
        console.log('\n💡 Possible issues:');
        console.log('- Invalid API key');
        console.log('- API key not enabled for Gemini API');
        console.log('- Incorrect model name');
      }
    } else {
      console.log('Error:', error.message);
    }
  }
};

testGeminiDirect();
