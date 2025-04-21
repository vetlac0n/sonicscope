import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

// ✅ Sicherstellen, dass Pfade korrekt sind!
const key = fs.readFileSync('./127.0.0.1-key.pem');
const cert = fs.readFileSync('./127.0.0.1.pem');

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('./127.0.0.1-key.pem'),
      cert: fs.readFileSync('./127.0.0.1.pem'),
    },
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://127.0.0.1:3001',
        changeOrigin: true,
        secure: false, // ➕ erlaubt self-signed SSL
      },
    },
  },
});
