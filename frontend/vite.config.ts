import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// O frontend roda em http://localhost:5173 e conversa com a API através de
// um proxy relativo ("/api" -> backend na porta 3000). Isso mantém a base de
// URL configurável e evita chamadas a localhost direto do navegador.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Ambientes de preview (Arena/e2b) usam hosts dinâmicos.
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
