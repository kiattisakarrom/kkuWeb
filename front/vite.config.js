// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3001,
    https: false, // ให้ Nginx จัดการ HTTPS
    proxy: {
      '/api': {
        // target: 'http://localhost:3000',
        target: 'http://backend:3000',
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: ['phramcare.kkh.go.th'],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
