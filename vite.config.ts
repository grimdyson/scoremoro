import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@platform': resolve(__dirname, 'src/platform'),
      '@app': resolve(__dirname, 'src/app'),
    },
  },
  server: {
    port: 1420,
  },
});
