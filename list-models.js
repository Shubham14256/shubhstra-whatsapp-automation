/**
 * List Available Gemini Models
 */

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

console.log('🔍 Checking Available Models\n');

try {
  const response = await axios.get(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  );
  
  console.log('✅ API Key is VALID!\n');
  console.log('Available models:\n');
  
  response.data.models.forEach(model => {
    console.log(`📦 ${model.name}`);
    console.log(`   Display Name: ${model.displayName}`);
    console.log(`   Supported: ${model.supportedGenerationMethods.join(', ')}`);
    console.log('');
  });
  
  // Find the best model for text generation
  const textModels = response.data.models.filter(m => 
    m.supportedGenerationMethods.includes('generateContent')
  );
  
  if (textModels.length > 0) {
    console.log('✅ Recommended model for your use case:');
    console.log(`   ${textModels[0].name}\n`);
  }
  
} catch (error) {
  console.log('❌ Error:', error.response?.data || error.message);
  console.log('\nPossible issues:');
  console.log('1. API key not activated yet (wait 5 minutes)');
  console.log('2. Gemini API not enabled for this key');
  console.log('3. Need to enable API at: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
}
