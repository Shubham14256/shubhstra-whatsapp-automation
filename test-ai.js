/**
 * Test AI Service
 * Quick test to verify Google Gemini AI is working
 */

import dotenv from 'dotenv';
import { getHealthAdvice, isHealthQuery, isGreetingOrMenu } from './src/services/aiService.js';

// Load environment variables
dotenv.config();

console.log('🔑 Checking API Key...');
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0);
console.log('');

console.log('🧪 Testing AI Service...\n');

// Test 1: Health Query Detection
console.log('Test 1: Health Query Detection');
console.log('================================');
console.log('Is "I have a headache" a health query?', isHealthQuery('I have a headache'));
console.log('Is "Tell me a joke" a health query?', isHealthQuery('Tell me a joke'));
console.log('Is "Hi" a greeting?', isGreetingOrMenu('Hi'));
console.log('');

// Test 2: AI Health Advice
console.log('Test 2: AI Health Advice');
console.log('================================');

const testQueries = [
  'I have a headache',
  'My child has fever',
  'Tell me a joke',
];

for (const query of testQueries) {
  console.log(`\nQuery: "${query}"`);
  console.log('Waiting for AI response...');
  
  try {
    const response = await getHealthAdvice(query, 'Dr. Sharma\'s Clinic');
    console.log('AI Response:', response);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

console.log('\n✅ AI Test Complete!');
process.exit(0);
