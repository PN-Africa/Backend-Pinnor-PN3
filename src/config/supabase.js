
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verify that required environment variables are available
console.log('Supabase environment check:', {
  urlPresent: Boolean(supabaseUrl),
  serviceKeyPresent: Boolean(supabaseServiceKey),
});

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.'
  );
}

// Initialize Supabase client
export const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey
);
