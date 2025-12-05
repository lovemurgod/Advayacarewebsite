import { createClient } from '@supabase/supabase-js';

// TEMP debug to verify env injection in production
// eslint-disable-next-line no-console
console.log('VITE_SUPABASE_URL at runtime:', import.meta.env.VITE_SUPABASE_URL);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars are missing. Check .env.local / GitHub secrets.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
