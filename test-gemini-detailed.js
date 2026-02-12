/**
 * Detailed Gemini AI Test
 */

import dotenv from 'dotenv';
import { getHealthAdvice } from './src/services/aiService.js';

dotenv.config();

const testGeminiAPI = async () => {
  console.log('🤖 Testing Gemini AI API\n');
  console.log('═══════════════════════════════════════\n');

  // Check API Key
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('✅ API Key exists:', !!apiKey);
  console.log('✅ API Key length:', apiKey?.length || 0);
  console.log('✅ API Key preview:', apiKey?.substring(0, 20) + '...\n');

  // Test 1: Health Query
  console.log('Test 1: Health Query');
  console.log('─────────────────────');
  try {
    const response1 = await getHealthAdvice('I have a headache', 'Shubhstra Clinic');
    console.log('Query: "I have a headache"');
    console.log('Response:', response1);
    console.log('✅ Test 1 PASSED\n');
  } catch (error) {
    console.log('❌ Test 1 FAILED:', error.message, '\n');
  }

  // Test 2: Fever Query
  console.log('Test 2: Fever Query');
  console.log('─────────────────────');
  try {
    const response2 = await getHealthAdvice('My child has fever', 'Shubhstra Clinic');
    console.log('Query: "My child has fever"');
    console.log('Response:', response2);
    console.log('✅ Test 2 PASSED\n');
  } catch (error) {
    console.log('❌ Test 2 FAILED:', error.message, '\n');
  }

  // Test 3: Non-health Query
  console.log('Test 3: Non-health Query');
  console.log('─────────────────────');
  try {
    const response3 = await getHealthAdvice('Tell me a joke', 'Shubhstra Clinic');
    console.log('Query: "Tell me a joke"');
    console.log('Response:', response3);
    console.log('✅ Test 3 PASSED\n');
  } catch (error) {
    console.log('❌ Test 3 FAILED:', error.message, '\n');
  }

  // Test 4: Stomach Pain
  console.log('Test 4: Stomach Pain Query');
  console.log('─────────────────────');
  try {
    const response4 = await getHealthAdvice('I have stomach pain', 'Shubhstra Clinic');
    console.log('Query: "I have stomach pain"');
    console.log('Response:', response4);
    console.log('✅ Test 4 PASSED\n');
  } catch (error) {
    console.log('❌ Test 4 FAILED:', error.message, '\n');
  }

  console.log('═══════════════════════════════════════');
  console.log('🎉 All Gemini AI tests completed!\n');
};

testGeminiAPI();
