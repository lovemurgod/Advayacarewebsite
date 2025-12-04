import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configure Vite for GitHub Pages project deployment under /Advayacarewebsite/
// and emit the built site into /docs so GitHub Pages can serve it directly.
export default defineConfig({
  base: '/Advayacarewebsite/',
  plugins: [react()],
  build: {
    outDir: 'docs',
  },
});
