import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    // Fixed, so the tests don't depend on what is in .env
    env: { VITE_API_URL: 'http://api.test/api' },
    restoreMocks: true,
    unstubGlobals: true,
  },
});
