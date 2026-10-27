import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Заявките към /api отиват към бекенда, затова няма нужда от пълен адрес
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
