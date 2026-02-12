/**
 * List Available Gemini Models
 */

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const listModels = async () => {
  console.log('📋 Listing Available Gemini Models\n');

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ GEMINI_API_KEY not found');
    return;
  }

  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
      {
        timeout: 10000,
      }
    );

    console.log('✅ Available Models:\n');
    
    const models = response.data.models || [];
    
    models.forEach((model, index) => {
      if (model.name.includes('gemini')) {
        console.log(`${index + 1}. ${model.name}`);
        console.log(`   Display Name: ${model.displayName}`);
        console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
        console.log('');
      }
    });

    console.log('─────────────────────────────────────');
    console.log(`Total Gemini models: ${models.filter(m => m.name.includes('gemini')).length}\n`);

  } catch (error) {
    console.log('❌ Error listing models:\n');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
};

listModels();
