/**
 * Full AI Test with Complete Responses
 */

import dotenv from 'dotenv';
import { getHealthAdvice } from './src/services/aiService.js';

dotenv.config();

console.log('🧪 Full AI Response Test\n');
console.log('═══════════════════════════════════════════════════\n');

const testCases = [
  {
    query: 'I have a headache',
    expected: 'Health advice with home remedies'
  },
  {
    query: 'My child has fever',
    expected: 'Health advice for fever'
  },
  {
    query: 'I have stomach pain',
    expected: 'Health advice for stomach pain'
  },
  {
    query: 'Tell me a joke',
    expected: 'Redirect to menu (non-health query)'
  },
  {
    query: 'What is the weather today?',
    expected: 'Redirect to menu (non-health query)'
  },
];

for (const testCase of testCases) {
  console.log(`📝 Query: "${testCase.query}"`);
  console.log(`📋 Expected: ${testCase.expected}`);
  console.log('⏳ Waiting for AI...\n');
  
  try {
    const response = await getHealthAdvice(testCase.query, 'Dr. Sharma\'s Clinic');
    console.log('🤖 AI Response:');
    console.log('─'.repeat(50));
    console.log(response);
    console.log('─'.repeat(50));
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
  }
}

console.log('═══════════════════════════════════════════════════');
console.log('✅ All tests complete!\n');
process.exit(0);
