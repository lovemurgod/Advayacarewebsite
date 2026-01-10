import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configure Vite for GitHub Pages project deployment under /Advayacarewebsite/
// Build output goes to the default /dist folder (used by CI deploy workflow).
export default defineConfig({
  base: '/Advayacarewebsite/',
  plugins: [react()],
  define: {
    'import.meta.env.VITE_RAZORPAY_KEY_ID': JSON.stringify(process.env.VITE_RAZORPAY_KEY_ID),
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
  },
});
