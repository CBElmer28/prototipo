import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' permite desplegar en Netlify, Vercel o GitHub Pages (subcarpeta) sin cambios.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'jsdom', globals: true, setupFiles: [] },
});
