/**
 * client/vite.config.js
 *
 * CHANGED:
 *  - Added build.outDir = 'dist' (explicit, already the Vite default).
 *  - Added build.rollupOptions.output.manualChunks for vendor splitting:
 *      vendor        → react, react-dom, react-router-dom
 *      charts        → recharts
 *      animations    → framer-motion
 *      utils         → axios, socket.io-client, lucide-react
 *  - Proxy settings for development are unchanged.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // ─── Development server ────────────────────────────────────────────────────
  server: {
    port: 5173,
    proxy: {
      // Proxy all /api calls to the Express backend during local development
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Proxy Socket.IO WebSocket connections during local development
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    },
  },

  // ─── Production build ──────────────────────────────────────────────────────
  build: {
    // CHANGED: Explicit output directory (matches the copy-dist.js script)
    outDir: 'dist',

    // CHANGED: Manual chunk splitting to avoid a monolithic bundle
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Chart library (large; split so users only load it on chart pages)
          charts: ['recharts'],
          // Animation library
          animations: ['framer-motion'],
          // Networking / icon utilities
          utils: ['axios', 'socket.io-client', 'lucide-react'],
        },
      },
    },
  },
});
