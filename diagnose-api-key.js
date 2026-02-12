/**
 * Diagnose Gemini API Key Issues
 */

import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

console.log('🔍 Gemini API Key Diagnostics\n');
console.log('═══════════════════════════════════════\n');

// Check 1: API Key Exists
console.log('✓ Check 1: API Key Exists');
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.log('❌ GEMINI_API_KEY not found in .env file\n');
  process.exit(1);
}
console.log('✅ API key found in .env\n');

// Check 2: API Key Format
console.log('✓ Check 2: API Key Format');
console.log(`   Length: ${apiKey.length} characters`);
console.log(`   Starts with: ${apiKey.substring(0, 4)}`);
console.log(`   Format: ${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`);

if (!apiKey.startsWith('AIza')) {
  console.log('⚠️  Warning: API key should start with "AIza"\n');
} else {
  console.log('✅ API key format looks correct\n');
}

// Check 3: Try Simple API Call
console.log('✓ Check 3: Testing API Connection');
console.log('   Attempting to connect to Google Gemini...\n');

try {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  console.log('   Sending test prompt: "Hello"');
  
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: 'Say "Hello" in one word.' }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 10,
    },
  });
  
  const response = await result.response;
  const text = response.text();
  
  console.log(`   ✅ Response received: "${text}"\n`);
  console.log('═══════════════════════════════════════');
  console.log('🎉 SUCCESS! Your API key is working!\n');
  console.log('The AI is ready to use. You can now:');
  console.log('1. Send health queries via WhatsApp');
  console.log('2. AI will respond with advice');
  console.log('3. All responses end with appointment prompt\n');
  
} catch (error) {
  console.log(`   ❌ Error: ${error.message}\n`);
  console.log('═══════════════════════════════════════');
  console.log('🔴 API Key Issue Detected\n');
  
  if (error.message.includes('API key not valid')) {
    console.log('Problem: API key is not valid or not activated\n');
    console.log('Possible causes:');
    console.log('1. API key was just created (wait 2-5 minutes)');
    console.log('2. API key doesn\'t have Gemini API enabled');
    console.log('3. API key was deleted or revoked');
    console.log('4. Wrong API key copied\n');
    
    console.log('Solutions:');
    console.log('1. Wait 5 minutes and try again');
    console.log('2. Go to: https://aistudio.google.com/app/apikey');
    console.log('3. Check if your API key is listed and active');
    console.log('4. If not, create a NEW API key');
    console.log('5. Copy the NEW key to .env file');
    console.log('6. Restart server and test again\n');
    
  } else if (error.message.includes('quota')) {
    console.log('Problem: API quota exceeded\n');
    console.log('Solution: Wait for quota reset or upgrade plan\n');
    
  } else {
    console.log('Problem: Unknown error\n');
    console.log('Full error:', error.message, '\n');
  }
}

console.log('═══════════════════════════════════════\n');
