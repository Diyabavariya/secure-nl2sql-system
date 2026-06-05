// vite.config.js — dev server + API proxy configuration.
//
// The proxy forwards /query and /auth requests to the FastAPI backend,
// bypassing browser CORS restrictions during development.
// In production, replace the proxy with the real API base URL in queryApi.js.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    proxy: {
      '/query': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/meta': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
