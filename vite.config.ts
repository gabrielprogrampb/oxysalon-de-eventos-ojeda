import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// NOTA DE SEGURIDAD:
// Solo las variables con prefijo VITE_ llegan al bundle del navegador.
// Nunca agregar claves privadas en `define`: quedan visibles en el JS público.
export default defineConfig({
  server: {
    port: 3000,
    host: 'localhost',
  },
  preview: {
    port: 4173,
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
});
