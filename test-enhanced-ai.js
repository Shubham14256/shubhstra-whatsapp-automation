/**
 * Test Enhanced Gemini AI
 */

import dotenv from 'dotenv';
import { getHealthAdvice, isHealthQuery } from './src/services/aiService.js';

dotenv.config();

const testEnhancedAI = async () => {
  console.log('🤖 Testing Enhanced Gemini AI\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  const testQueries = [
    {
      query: 'I have a severe headache for 3 days',
      type: 'Common Symptom'
    },
    {
      query: 'My child has fever and is not eating',
      type: 'Child Health'
    },
    {
      query: 'I have diabetes, what foods should I avoid?',
      type: 'Chronic Condition'
    },
    {
      query: 'I am feeling very tired and weak all the time',
      type: 'General Wellness'
    },
    {
      query: 'What are the symptoms of thyroid problems?',
      type: 'Medical Information'
    },
    {
      query: 'Tell me a joke',
      type: 'Non-Health Query'
    }
  ];

  for (let i = 0; i < testQueries.length; i++) {
    const { query, type } = testQueries[i];
    
    console.log(`Test ${i + 1}: ${type}`);
    console.log('─────────────────────────────────────────────────────────');
    console.log(`Query: "${query}"`);
    console.log(`Is Health Query: ${isHealthQuery(query)}`);
    console.log('');

    try {
      const response = await getHealthAdvice(query, 'Shubhstra Clinic');
      console.log('AI Response:');
      console.log(response);
      console.log('');
      console.log(`✅ Test ${i + 1} PASSED`);
    } catch (error) {
      console.log(`❌ Test ${i + 1} FAILED:`, error.message);
    }
    
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Wait 2 seconds between requests to avoid rate limiting
    if (i < testQueries.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('🎉 All tests completed!\n');
};

testEnhancedAI();
