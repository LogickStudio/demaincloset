import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '', '');
  return {
    plugins: [react()],
    define: {
      // Per project guidelines, the app code uses process.env.API_KEY.
      // We map the VITE_API_KEY from the environment (e.g., Netlify UI, .env.local file)
      // to process.env.API_KEY for the application's client-side code.
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY),
    },
  };
});
