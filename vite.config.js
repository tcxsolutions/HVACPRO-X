import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom'],
          
          // Router
          'router': ['react-router-dom'],
          
          // UI and Animation
          'ui-vendor': ['framer-motion', 'react-hot-toast'],
          
          // Charts (heavy libraries)
          'charts': ['chart.js'],
          
          // Icons (can be large)
          'icons': ['react-icons'],
          
          // Forms
          'forms': ['react-hook-form'],
          
          // Supabase
          'supabase': ['@supabase/supabase-js']
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3000,
    host: true
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'react-hot-toast',
      'react-icons',
      '@supabase/supabase-js'
    ]
  }
});