import { createClient } from '@supabase/supabase-js';

// Primary: use Vite env vars. Fallback: hardcoded test values for GitHub Pages.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uexezctcwupgaxqhgyeh.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVleGV6Y3Rjd3VwZ2F4cWhneWVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjAxNTIsImV4cCI6MjA3OTM5NjE1Mn0.kUMmVMZ8EOGXSJREYJLDc446tZmhxywV6MghBpVV7bM';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars are missing; using fallback test credentials.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
