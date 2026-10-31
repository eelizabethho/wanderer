import { defineConfig } from 'vite';

// The Spotify bridge listens on 5174; proxying keeps the page same-origin (no CORS).
export default defineConfig({
  server: { proxy: { '/api': 'http://127.0.0.1:5174' } },
});
