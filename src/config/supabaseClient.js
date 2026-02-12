/**
 * Supabase Client Configuration
 * Initializes and exports the Supabase client instance
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Validate Supabase environment variables
if (!process.env.SUPABASE_URL) {
  throw new Error('❌ SUPABASE_URL is not defined in .env file');
}

if (!process.env.SUPABASE_KEY) {
  throw new Error('❌ SUPABASE_KEY is not defined in .env file');
}

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    auth: {
      persistSession: false, // Server-side doesn't need session persistence
      autoRefreshToken: false,
    },
  }
);

console.log('✅ Supabase client initialized');

export default supabase;
