/**
 * Check if Gemini API Quota is Available
 */

import dotenv from 'dotenv';
import { getHealthAdvice } from './src/services/aiService.js';

dotenv.config();

const checkQuota = async () => {
  console.log('🔍 Checking Gemini API Quota...\n');

  try {
    const response = await getHealthAdvice('I have a headache', 'Test Clinic');
    
    if (response.includes("couldn't process")) {
      console.log('❌ Quota still exceeded');
      console.log('⏳ Please wait 1-2 minutes and try again\n');
      console.log('Response:', response);
    } else {
      console.log('✅ Quota is available!');
      console.log('🎉 AI is working!\n');
      console.log('Response Preview:');
      console.log(response.substring(0, 200) + '...\n');
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

checkQuota();
