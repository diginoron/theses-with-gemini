import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // `loadEnv` loads environment variables from .env files.
  // The third argument '' ensures all environment variables (including those without the VITE_ prefix) are loaded.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // `define` tells Vite to globally replace these values during the build.
    // This ensures that `process.env.API_KEY` is accessible in the client-side bundle.
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // You can define other process.env variables needed by your application here.
      // Example: 'process.env.NODE_ENV': JSON.stringify(mode),
    },
  };
});
