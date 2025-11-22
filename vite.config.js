import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configure Vite for GitHub Pages project deployment under /Advayacarewebsite/
export default defineConfig({
  base: '/Advayacarewebsite/',
  plugins: [react()]
});
