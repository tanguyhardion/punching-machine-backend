import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing environment variables: SUPABASE_URL and SUPABASE_KEY must be set.');
}

export function getSupabaseClient() {
  return createClient(supabaseUrl!, supabaseKey!, {
    auth: { persistSession: false },
  });
}
