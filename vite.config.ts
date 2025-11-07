import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load all environment variables (with or without VITE_ prefix)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Explicitly define process.env variables to ensure they are available
      // and replaced as string literals during build for browser usage.
      // We map VITE_API_KEY from .env to process.env.API_KEY as per guidelines for Gemini.
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY),
      // AVALAI_PROXY_URL is removed as it's not applicable for direct Gemini API calls.
    },
  };
});