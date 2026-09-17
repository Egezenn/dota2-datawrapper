import { defineConfig, type Plugin } from 'vite';
import path from 'path';
import fs from 'fs';

const BUILD_VERSION = `${Date.now()}`;

function serviceWorkerVersionPlugin(): Plugin {
  return {
    name: 'sw-version-plugin',
    closeBundle() {
      const distSwPath = path.resolve(__dirname, 'dist/sw.js');
      if (fs.existsSync(distSwPath)) {
        let content = fs.readFileSync(distSwPath, 'utf-8');
        content = content.replace('__BUILD_VERSION__', BUILD_VERSION);
        fs.writeFileSync(distSwPath, content);
      }
    }
  };
}

export default defineConfig({
  base: './',
  define: {
    __BUILD_VERSION__: JSON.stringify(BUILD_VERSION),
  },
  plugins: [serviceWorkerVersionPlugin()],
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, '../src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
