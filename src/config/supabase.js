
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase environment check:', {
  urlPresent: Boolean(supabaseUrl),
  serviceKeyPresent: Boolean(supabaseServiceKey),
});

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.'
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey
);
