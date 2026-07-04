import react from '@vitejs/plugin-react';
import path from 'node:path';

export default {
  root: path.resolve(process.cwd()),
  plugins: [react()],
  resolve: {
    preserveSymlinks: true
  },
  build: {
    target: ['chrome80', 'safari13'],
    cssTarget: 'chrome80',
    rollupOptions: {
      input: path.resolve(process.cwd(), 'index.html')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3300'
    }
  }
};
